from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.authentication_service.dependencies import (
    get_current_hr,
    get_current_user,
)
from app.authentication_service.models import User
from app.authentication_service.schemas import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    PasswordResetActionResponse,
    PasswordResetRequestResponse,
    TokenResponse,
    UserResponse,
)
from app.authentication_service.service import (
    approve_password_reset_request,
    authenticate_user,
    change_password,
    create_password_reset_request,
    get_password_reset_requests,
    reject_password_reset_request,
)
from app.audit_service.models import AuditAction
from app.audit_service.service import create_audit_log
from app.core.database import get_db


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


# ============================================================
# Login API
# ============================================================

@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    login_data: LoginRequest,
    request: Request,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """
    Authenticate a user using email, role, and password.

    Audit events are recorded for both successful and
    failed login attempts.
    """

    ip_address = request.client.host if request.client else None

    # Find the user by email for audit purposes.
    # The password and other sensitive authentication
    # information are never stored in the audit log.
    statement = select(User).where(
        User.email == login_data.email
    )

    attempted_user = db.scalar(statement)

    try:
        access_token = authenticate_user(
            db=db,
            email=login_data.email,
            role=login_data.role,
            password=login_data.password,
        )

    except HTTPException:
        # Record failed authentication attempt.
        create_audit_log(
            db=db,
            action=AuditAction.LOGIN_FAILURE,
            user_id=(
                attempted_user.id
                if attempted_user
                else None
            ),
            ip_address=ip_address,
        )

        # Persist the failed-login audit record.
        db.commit()

        raise

    # Record successful login.
    create_audit_log(
        db=db,
        action=AuditAction.LOGIN_SUCCESS,
        user_id=attempted_user.id,
        ip_address=ip_address,
    )

    # Persist the successful-login audit record.
    db.commit()

    return TokenResponse(
        access_token=access_token,
    )


# ============================================================
# Current User API
# ============================================================

@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """
    Return the currently authenticated user's information.
    """

    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        employee_id=current_user.employee_id,
        role=current_user.role.value,
        is_active=current_user.is_active,
        must_change_password=current_user.must_change_password,
    )


# ============================================================
# Change Password API
# ============================================================

@router.post("/change-password")
def change_user_password(
    password_data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Change the authenticated user's password.
    """

    change_password(
        db=db,
        user=current_user,
        current_password=password_data.current_password,
        new_password=password_data.new_password,
        confirm_password=password_data.confirm_password,
    )

    return {
        "message": "Password changed successfully",
    }


# ============================================================
# Forgot Password API
# ============================================================

@router.post(
    "/forgot-password",
    response_model=PasswordResetActionResponse,
)
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db),
) -> PasswordResetActionResponse:
    """
    Create a password reset request.

    A generic response is returned regardless of whether
    the email exists, preventing user/email enumeration.
    """

    create_password_reset_request(
        db=db,
        email=request.email,
    )

    return PasswordResetActionResponse(
        message=(
            "If the account exists, a password reset request "
            "has been submitted."
        ),
    )


# ============================================================
# HR - Get Password Reset Requests
# ============================================================

@router.get(
    "/password-reset-requests",
    response_model=list[PasswordResetRequestResponse],
)
def get_reset_requests(
    current_hr: User = Depends(get_current_hr),
    db: Session = Depends(get_db),
) -> list[PasswordResetRequestResponse]:
    """
    Return password reset requests for HR users only.
    """

    results = get_password_reset_requests(db)

    return [
        PasswordResetRequestResponse(
            id=reset_request.id,
            user_id=user.id,
            email=user.email,
            status=reset_request.status.value,
            requested_at=reset_request.requested_at,
            reviewed_at=reset_request.reviewed_at,
        )
        for reset_request, user in results
    ]


# ============================================================
# HR - Approve Password Reset
# ============================================================

@router.post(
    "/password-reset-requests/{request_id}/approve",
    response_model=PasswordResetActionResponse,
)
def approve_reset_request(
    request_id: int,
    current_hr: User = Depends(get_current_hr),
    db: Session = Depends(get_db),
) -> PasswordResetActionResponse:
    """
    Approve a pending password reset request.

    Only HR users can approve password reset requests.
    """

    approve_password_reset_request(
        db=db,
        request_id=request_id,
    )

    return PasswordResetActionResponse(
        message="Password reset request approved successfully",
    )


# ============================================================
# HR - Reject Password Reset
# ============================================================

@router.post(
    "/password-reset-requests/{request_id}/reject",
    response_model=PasswordResetActionResponse,
)
def reject_reset_request(
    request_id: int,
    current_hr: User = Depends(get_current_hr),
    db: Session = Depends(get_db),
) -> PasswordResetActionResponse:
    """
    Reject a pending password reset request.

    Only HR users can reject password reset requests.
    """

    reject_password_reset_request(
        db=db,
        request_id=request_id,
    )

    return PasswordResetActionResponse(
        message="Password reset request rejected successfully",
    )