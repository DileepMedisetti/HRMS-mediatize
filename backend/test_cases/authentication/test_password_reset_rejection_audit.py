import pytest
from fastapi import HTTPException
from sqlalchemy import delete, select

from app.audit_service.models import AuditAction, AuditLog
from app.authentication_service.models import (
    PasswordResetRequest,
    PasswordResetStatus,
    User,
    UserRole,
)
from app.authentication_service.service import reject_password_reset_request
from app.core.security import hash_password, verify_password


TEST_EMAIL = "rejection-audit@example.com"
TEST_EMPLOYEE_ID = "REJECTION001"
TEST_PASSWORD = "password123"


def cleanup_user(db_session):
    user = db_session.scalar(
        select(User).where(User.email == TEST_EMAIL)
    )

    if user:
        db_session.execute(
            delete(AuditLog).where(AuditLog.user_id == user.id)
        )
        db_session.execute(
            delete(PasswordResetRequest).where(
                PasswordResetRequest.user_id == user.id
            )
        )
        db_session.delete(user)
        db_session.commit()


def create_test_user(db_session):
    cleanup_user(db_session)

    user = User(
        email=TEST_EMAIL,
        employee_id=TEST_EMPLOYEE_ID,
        password_hash=hash_password(TEST_PASSWORD),
        role=UserRole.EMPLOYEE,
        is_active=True,
        must_change_password=False,
    )

    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    return user


def create_pending_reset_request(db_session, user):
    reset_request = PasswordResetRequest(
        user_id=user.id,
        status=PasswordResetStatus.PENDING,
    )

    db_session.add(reset_request)
    db_session.commit()
    db_session.refresh(reset_request)

    return reset_request


def test_successful_rejection_creates_audit_log(db_session):
    user = create_test_user(db_session)
    reset_request = create_pending_reset_request(db_session, user)

    reject_password_reset_request(
        db=db_session,
        request_id=reset_request.id,
    )

    audit_log = db_session.scalar(
        select(AuditLog)
        .where(AuditLog.user_id == user.id)
        .where(
            AuditLog.action == AuditAction.PASSWORD_RESET_REJECTED
        )
        .order_by(AuditLog.id.desc())
    )

    assert audit_log is not None
    assert audit_log.user_id == user.id
    assert audit_log.action == AuditAction.PASSWORD_RESET_REJECTED


def test_rejection_changes_request_status(db_session):
    user = create_test_user(db_session)
    reset_request = create_pending_reset_request(db_session, user)

    reject_password_reset_request(
        db=db_session,
        request_id=reset_request.id,
    )

    db_session.refresh(reset_request)

    assert reset_request.status == PasswordResetStatus.REJECTED
    assert reset_request.reviewed_at is not None


def test_rejection_does_not_change_password(db_session):
    user = create_test_user(db_session)
    original_hash = user.password_hash

    reset_request = create_pending_reset_request(db_session, user)

    reject_password_reset_request(
        db=db_session,
        request_id=reset_request.id,
    )

    db_session.refresh(user)

    assert user.password_hash == original_hash
    assert verify_password(TEST_PASSWORD, user.password_hash)


def test_non_pending_request_cannot_be_rejected(db_session):
    user = create_test_user(db_session)

    reset_request = PasswordResetRequest(
        user_id=user.id,
        status=PasswordResetStatus.APPROVED,
    )

    db_session.add(reset_request)
    db_session.commit()
    db_session.refresh(reset_request)

    with pytest.raises(HTTPException) as exc_info:
        reject_password_reset_request(
            db=db_session,
            request_id=reset_request.id,
        )

    assert exc_info.value.status_code == 400

    audit_log = db_session.scalar(
        select(AuditLog)
        .where(AuditLog.user_id == user.id)
        .where(
            AuditLog.action == AuditAction.PASSWORD_RESET_REJECTED
        )
    )

    assert audit_log is None


def test_nonexistent_request_cannot_be_rejected(db_session):
    with pytest.raises(HTTPException) as exc_info:
        reject_password_reset_request(
            db=db_session,
            request_id=999999,
        )

    assert exc_info.value.status_code == 404


def test_rejection_audit_does_not_store_sensitive_data(db_session):
    user = create_test_user(db_session)
    reset_request = create_pending_reset_request(db_session, user)

    reject_password_reset_request(
        db=db_session,
        request_id=reset_request.id,
    )

    audit_log = db_session.scalar(
        select(AuditLog)
        .where(AuditLog.user_id == user.id)
        .where(
            AuditLog.action == AuditAction.PASSWORD_RESET_REJECTED
        )
        .order_by(AuditLog.id.desc())
    )

    assert audit_log is not None

    audit_values = vars(audit_log)

    assert TEST_PASSWORD not in str(audit_values)
    assert TEST_EMAIL not in str(audit_values)
