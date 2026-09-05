from sqlalchemy import delete, func, select

from app.audit_service.models import AuditAction, AuditLog
from app.authentication_service.models import (
    PasswordResetRequest,
    PasswordResetStatus,
    User,
    UserRole,
)
from app.authentication_service.service import (
    create_password_reset_request,
)
from app.core.security import hash_password


TEST_EMAIL = "reset-audit@example.com"
TEST_EMPLOYEE_ID = "RESETAUDIT001"
TEST_PASSWORD = "password123"


def cleanup_user(db_session):
    user = db_session.scalar(
        select(User).where(User.email == TEST_EMAIL)
    )

    if user:
        db_session.execute(
            delete(AuditLog).where(
                AuditLog.user_id == user.id
            )
        )

        db_session.execute(
            delete(PasswordResetRequest).where(
                PasswordResetRequest.user_id == user.id
            )
        )

        db_session.delete(user)
        db_session.commit()


def create_test_user(db_session, is_active=True):
    cleanup_user(db_session)

    user = User(
        email=TEST_EMAIL,
        employee_id=TEST_EMPLOYEE_ID,
        password_hash=hash_password(TEST_PASSWORD),
        role=UserRole.EMPLOYEE,
        is_active=is_active,
    )

    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    return user


def test_new_reset_request_creates_audit_log(db_session):
    user = create_test_user(db_session)

    create_password_reset_request(
        db=db_session,
        email=TEST_EMAIL,
    )

    audit_log = db_session.scalar(
        select(AuditLog)
        .where(AuditLog.user_id == user.id)
        .where(
            AuditLog.action
            == AuditAction.PASSWORD_RESET_REQUESTED
        )
        .order_by(AuditLog.id.desc())
    )

    assert audit_log is not None
    assert audit_log.user_id == user.id
    assert (
        audit_log.action
        == AuditAction.PASSWORD_RESET_REQUESTED
    )


def test_reset_request_is_created_as_pending(db_session):
    user = create_test_user(db_session)

    create_password_reset_request(
        db=db_session,
        email=TEST_EMAIL,
    )

    reset_request = db_session.scalar(
        select(PasswordResetRequest)
        .where(
            PasswordResetRequest.user_id == user.id
        )
        .order_by(PasswordResetRequest.id.desc())
    )

    assert reset_request is not None
    assert (
        reset_request.status
        == PasswordResetStatus.PENDING
    )


def test_unknown_email_does_not_create_audit_log(
    db_session,
):
    # Count existing PASSWORD_RESET_REQUESTED audit logs
    # before submitting the unknown email.
    before_count = db_session.scalar(
        select(func.count())
        .select_from(AuditLog)
        .where(
            AuditLog.action
            == AuditAction.PASSWORD_RESET_REQUESTED
        )
    )

    unknown_email = "unknown-reset@example.com"

    create_password_reset_request(
        db=db_session,
        email=unknown_email,
    )

    # Count PASSWORD_RESET_REQUESTED audit logs again.
    after_count = db_session.scalar(
        select(func.count())
        .select_from(AuditLog)
        .where(
            AuditLog.action
            == AuditAction.PASSWORD_RESET_REQUESTED
        )
    )

    # Unknown emails must not create a new audit event.
    assert after_count == before_count


def test_inactive_user_does_not_create_audit_log(
    db_session,
):
    user = create_test_user(
        db_session,
        is_active=False,
    )

    create_password_reset_request(
        db=db_session,
        email=TEST_EMAIL,
    )

    audit_log = db_session.scalar(
        select(AuditLog)
        .where(AuditLog.user_id == user.id)
        .where(
            AuditLog.action
            == AuditAction.PASSWORD_RESET_REQUESTED
        )
    )

    assert audit_log is None


def test_duplicate_pending_request_does_not_create_duplicate_audit(
    db_session,
):
    user = create_test_user(db_session)

    # First request
    create_password_reset_request(
        db=db_session,
        email=TEST_EMAIL,
    )

    # Second request
    create_password_reset_request(
        db=db_session,
        email=TEST_EMAIL,
    )

    audit_logs = db_session.scalars(
        select(AuditLog)
        .where(AuditLog.user_id == user.id)
        .where(
            AuditLog.action
            == AuditAction.PASSWORD_RESET_REQUESTED
        )
    ).all()

    assert len(audit_logs) == 1


def test_reset_audit_does_not_store_sensitive_data(
    db_session,
):
    user = create_test_user(db_session)

    create_password_reset_request(
        db=db_session,
        email=TEST_EMAIL,
    )

    audit_log = db_session.scalar(
        select(AuditLog)
        .where(AuditLog.user_id == user.id)
        .where(
            AuditLog.action
            == AuditAction.PASSWORD_RESET_REQUESTED
        )
        .order_by(AuditLog.id.desc())
    )

    assert audit_log is not None

    audit_values = vars(audit_log)

    assert TEST_EMAIL not in str(audit_values)
    assert TEST_PASSWORD not in str(audit_values)