from unittest.mock import patch

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
from app.authentication_service.service import (
    approve_password_reset_request,
)
from app.core.security import hash_password, verify_password


TEST_EMAIL = "approval-audit@example.com"
TEST_EMPLOYEE_ID = "APPROVAL001"
TEST_PASSWORD = "password123"
TEMPORARY_PASSWORD = "TempPassword123!"


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


def test_successful_approval_creates_audit_log(db_session):
    user = create_test_user(db_session)

    reset_request = create_pending_reset_request(
        db_session,
        user,
    )

    with patch(
        "app.authentication_service.service.send_password_reset_email"
    ):
        with patch(
            "app.authentication_service.utils.generate_temporary_password",
            return_value=TEMPORARY_PASSWORD,
        ):
            approve_password_reset_request(
                db=db_session,
                request_id=reset_request.id,
            )

    audit_log = db_session.scalar(
        select(AuditLog)
        .where(AuditLog.user_id == user.id)
        .where(
            AuditLog.action
            == AuditAction.PASSWORD_RESET_APPROVED
        )
        .order_by(AuditLog.id.desc())
    )

    assert audit_log is not None
    assert audit_log.user_id == user.id
    assert (
        audit_log.action
        == AuditAction.PASSWORD_RESET_APPROVED
    )


def test_approval_changes_request_status(db_session):
    user = create_test_user(db_session)

    reset_request = create_pending_reset_request(
        db_session,
        user,
    )

    with patch(
        "app.authentication_service.service.send_password_reset_email"
    ):
        with patch(
            "app.authentication_service.utils.generate_temporary_password",
            return_value=TEMPORARY_PASSWORD,
        ):
            approve_password_reset_request(
                db=db_session,
                request_id=reset_request.id,
            )

    db_session.refresh(reset_request)

    assert (
        reset_request.status
        == PasswordResetStatus.APPROVED
    )

    assert reset_request.reviewed_at is not None


def test_approval_sets_must_change_password(db_session):
    user = create_test_user(db_session)

    reset_request = create_pending_reset_request(
        db_session,
        user,
    )

    with patch(
        "app.authentication_service.service.send_password_reset_email"
    ):
        with patch(
            "app.authentication_service.utils.generate_temporary_password",
            return_value=TEMPORARY_PASSWORD,
        ):
            approve_password_reset_request(
                db=db_session,
                request_id=reset_request.id,
            )

    db_session.refresh(user)

    assert user.must_change_password is True


def test_temporary_password_is_hashed(db_session):
    user = create_test_user(db_session)

    reset_request = create_pending_reset_request(
        db_session,
        user,
    )

    with patch(
        "app.authentication_service.service.send_password_reset_email"
    ):
        with patch(
            "app.authentication_service.utils.generate_temporary_password",
            return_value=TEMPORARY_PASSWORD,
        ):
            approve_password_reset_request(
                db=db_session,
                request_id=reset_request.id,
            )

    db_session.refresh(user)

    assert user.password_hash != TEMPORARY_PASSWORD

    assert verify_password(
        TEMPORARY_PASSWORD,
        user.password_hash,
    )


def test_temporary_password_is_not_stored_in_audit_log(
    db_session,
):
    user = create_test_user(db_session)

    reset_request = create_pending_reset_request(
        db_session,
        user,
    )

    with patch(
        "app.authentication_service.service.send_password_reset_email"
    ):
        with patch(
            "app.authentication_service.utils.generate_temporary_password",
            return_value=TEMPORARY_PASSWORD,
        ):
            approve_password_reset_request(
                db=db_session,
                request_id=reset_request.id,
            )

    audit_log = db_session.scalar(
        select(AuditLog)
        .where(AuditLog.user_id == user.id)
        .where(
            AuditLog.action
            == AuditAction.PASSWORD_RESET_APPROVED
        )
        .order_by(AuditLog.id.desc())
    )

    assert audit_log is not None

    audit_values = vars(audit_log)

    assert TEMPORARY_PASSWORD not in str(audit_values)
    assert TEST_EMAIL not in str(audit_values)


def test_failed_email_does_not_create_approval_audit(
    db_session,
):
    user = create_test_user(db_session)

    reset_request = create_pending_reset_request(
        db_session,
        user,
    )

    with patch(
        "app.authentication_service.service.send_password_reset_email",
        side_effect=Exception("SMTP failure"),
    ):
        with patch(
            "app.authentication_service.utils.generate_temporary_password",
            return_value=TEMPORARY_PASSWORD,
        ):
            with pytest.raises(HTTPException) as exc_info:
                approve_password_reset_request(
                    db=db_session,
                    request_id=reset_request.id,
                )

    assert exc_info.value.status_code == 503

    audit_log = db_session.scalar(
        select(AuditLog)
        .where(AuditLog.user_id == user.id)
        .where(
            AuditLog.action
            == AuditAction.PASSWORD_RESET_APPROVED
        )
    )

    assert audit_log is None


def test_non_pending_request_cannot_be_approved(
    db_session,
):
    user = create_test_user(db_session)

    reset_request = PasswordResetRequest(
        user_id=user.id,
        status=PasswordResetStatus.REJECTED,
    )

    db_session.add(reset_request)
    db_session.commit()
    db_session.refresh(reset_request)

    with pytest.raises(HTTPException) as exc_info:
        approve_password_reset_request(
            db=db_session,
            request_id=reset_request.id,
        )

    assert exc_info.value.status_code == 400

    audit_log = db_session.scalar(
        select(AuditLog)
        .where(AuditLog.user_id == user.id)
        .where(
            AuditLog.action
            == AuditAction.PASSWORD_RESET_APPROVED
        )
    )

    assert audit_log is None


def test_nonexistent_request_cannot_be_approved(
    db_session,
):
    with pytest.raises(HTTPException) as exc_info:
        approve_password_reset_request(
            db=db_session,
            request_id=999999,
        )

    assert exc_info.value.status_code == 404