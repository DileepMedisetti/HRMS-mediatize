from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.authentication_service.models import (
    PasswordResetRequest,
    PasswordResetStatus,
    User,
    UserRole,
)
from app.audit_service.models import AuditAction
from app.audit_service.service import create_audit_log
from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.email_service.service import send_password_reset_email
from app.employee_service.models import Employee
from app.notification_service.enums import NotificationType
from app.notification_service.service import notify_all_hr



# ============================================================
# Login
# ============================================================

def authenticate_user(
    db: Session,
    email: str,
    role: UserRole,
    password: str,
) -> str:
    """
    Authenticate a user using email, role, and password,
    then return a JWT access token.
    """

    statement = select(User).where(User.email == email)
    user = db.scalar(statement)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email, role, or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email, role, or password",
        )

    if user.role != role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email, role, or password",
        )

    if not verify_password(
        password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email, role, or password",
        )

    user.last_login_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(user)

    access_token = create_access_token(
        user_id=user.id,
        role=user.role.value,
    )

    return access_token


# ============================================================
# Change Password
# ============================================================

def change_password(
    db: Session,
    user: User,
    current_password: str,
    new_password: str,
    confirm_password: str,
) -> None:
    """
    Change the authenticated user's password.

    The password change and PASSWORD_CHANGE audit event
    are committed in the same database transaction.
    """

    if not verify_password(
        current_password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    if current_password == new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from current password",
        )

    if new_password != confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password and confirmation password do not match",
        )

    if len(new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long",
        )

    user.password_hash = hash_password(new_password)
    user.must_change_password = False

    create_audit_log(
        db=db,
        action=AuditAction.PASSWORD_CHANGE,
        user_id=user.id,
        ip_address=None,
    )

    db.commit()
    db.refresh(user)


# ============================================================
# Forgot Password
# ============================================================

def create_password_reset_request(
    db: Session,
    email: str,
) -> None:
    """
    Create a password reset request for an active user.

    Unknown and inactive users are silently ignored to prevent
    account/email enumeration.

    The reset request and PASSWORD_RESET_REQUESTED audit event
    are committed in the same database transaction.
    """

    statement = select(User).where(User.email == email)
    user = db.scalar(statement)

    if user is None:
        return

    if not user.is_active:
        return

    pending_statement = select(PasswordResetRequest).where(
        PasswordResetRequest.user_id == user.id,
        PasswordResetRequest.status == PasswordResetStatus.PENDING,
    )

    existing_request = db.scalar(pending_statement)

    if existing_request is not None:
        return

    reset_request = PasswordResetRequest(
        user_id=user.id,
        status=PasswordResetStatus.PENDING,
    )

    db.add(reset_request)

    create_audit_log(
        db=db,
        action=AuditAction.PASSWORD_RESET_REQUESTED,
        user_id=user.id,
        ip_address=None,
    )

    # Fetch employee profile for recipient display name
    emp = db.scalar(select(Employee).where(Employee.user_id == user.id))
    emp_name = f"{emp.first_name} {emp.last_name}".strip() if (emp and emp.first_name) else user.email

    # Notify all active HR users
    notify_all_hr(
        db=db,
        title="Password Reset Request",
        message=f"{emp_name} has requested a password reset.",
        notification_type=NotificationType.PASSWORD_RESET_REQUEST,
        reference_id=str(reset_request.id),
        reference_type="PASSWORD_RESET",
    )

    db.commit()
    db.refresh(reset_request)


# ============================================================
# HR - Get Password Reset Requests
# ============================================================

def get_password_reset_requests(
    db: Session,
) -> list[tuple[PasswordResetRequest, User]]:
    """
    Retrieve password reset requests along with their users.
    """

    statement = (
        select(PasswordResetRequest, User)
        .join(
            User,
            PasswordResetRequest.user_id == User.id,
        )
        .order_by(
            PasswordResetRequest.requested_at.desc()
        )
    )

    results = db.execute(statement).all()

    return list(results)


# ============================================================
# HR - Approve Password Reset
# ============================================================

def approve_password_reset_request(
    db: Session,
    request_id: int,
    login_url: str = "http://localhost:5173/login",
) -> None:
    """
    Approve a pending password reset request.

    Generates a temporary password, stores only its Argon2 hash,
    forces the user to change the password after login, sends
    the temporary password by email, and records an audit event.

    The temporary password is never returned by the API.

    Database changes and the approval audit event are committed
    together only after the email has been successfully sent.
    """

    from app.authentication_service.utils import (
        generate_temporary_password,
    )

    statement = select(PasswordResetRequest).where(
        PasswordResetRequest.id == request_id
    )

    reset_request = db.scalar(statement)

    if reset_request is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Password reset request not found",
        )

    if reset_request.status != PasswordResetStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password reset request is not pending",
        )

    user_statement = select(User).where(
        User.id == reset_request.user_id
    )

    user = db.scalar(user_statement)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated user not found",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is inactive",
        )

    temporary_password = generate_temporary_password()

    user.password_hash = hash_password(
        temporary_password
    )

    user.must_change_password = True

    reset_request.status = PasswordResetStatus.APPROVED
    reset_request.reviewed_at = datetime.now(timezone.utc)

    try:
        send_password_reset_email(
            recipient_email=user.email,
            temporary_password=temporary_password,
            login_url=login_url,
        )

        create_audit_log(
            db=db,
            action=AuditAction.PASSWORD_RESET_APPROVED,
            user_id=user.id,
            ip_address=None,
        )

        db.commit()
        db.refresh(reset_request)

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Unable to send password reset email. "
                "Password reset was not completed."
            ),
        )


# ============================================================
# HR - Reject Password Reset
# ============================================================

def reject_password_reset_request(
    db: Session,
    request_id: int,
) -> None:
    """
    Reject a pending password reset request.

    The user's password is not changed.

    The rejection and PASSWORD_RESET_REJECTED audit event
    are committed in the same database transaction.
    """

    statement = select(PasswordResetRequest).where(
        PasswordResetRequest.id == request_id
    )

    reset_request = db.scalar(statement)

    if reset_request is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Password reset request not found",
        )

    if reset_request.status != PasswordResetStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password reset request is not pending",
        )

    user_statement = select(User).where(
        User.id == reset_request.user_id
    )

    user = db.scalar(user_statement)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated user not found",
        )

    reset_request.status = PasswordResetStatus.REJECTED
    reset_request.reviewed_at = datetime.now(timezone.utc)

    create_audit_log(
        db=db,
        action=AuditAction.PASSWORD_RESET_REJECTED,
        user_id=user.id,
        ip_address=None,
    )

    db.commit()
    db.refresh(reset_request)