from sqlalchemy import delete, select
from fastapi import HTTPException

from app.audit_service.models import AuditAction, AuditLog
from app.authentication_service.models import User, UserRole
from app.authentication_service.service import change_password
from app.core.security import hash_password, verify_password


TEST_EMAIL = "password-audit@example.com"
TEST_EMPLOYEE_ID = "PASSAUDIT001"
CURRENT_PASSWORD = "password123"
NEW_PASSWORD = "newpassword123"


def cleanup_user(db_session):
    user = db_session.scalar(
        select(User).where(User.email == TEST_EMAIL)
    )

    if user:
        db_session.execute(
            delete(AuditLog).where(AuditLog.user_id == user.id)
        )
        db_session.delete(user)
        db_session.commit()


def create_test_user(db_session):
    cleanup_user(db_session)

    user = User(
        email=TEST_EMAIL,
        employee_id=TEST_EMPLOYEE_ID,
        password_hash=hash_password(CURRENT_PASSWORD),
        role=UserRole.EMPLOYEE,
        is_active=True,
    )

    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    return user


def test_successful_password_change_creates_audit_log(db_session):
    user = create_test_user(db_session)

    change_password(
        db=db_session,
        user=user,
        current_password=CURRENT_PASSWORD,
        new_password=NEW_PASSWORD,
        confirm_password=NEW_PASSWORD,
    )

    audit_log = db_session.scalar(
        select(AuditLog)
        .where(AuditLog.user_id == user.id)
        .where(AuditLog.action == AuditAction.PASSWORD_CHANGE)
        .order_by(AuditLog.id.desc())
    )

    assert audit_log is not None
    assert audit_log.user_id == user.id
    assert audit_log.action == AuditAction.PASSWORD_CHANGE

    db_session.refresh(user)

    assert verify_password(
        NEW_PASSWORD,
        user.password_hash,
    )

    assert user.must_change_password is False


def test_failed_password_change_does_not_create_audit_log(db_session):
    user = create_test_user(db_session)

    try:
        change_password(
            db=db_session,
            user=user,
            current_password="wrong-password",
            new_password=NEW_PASSWORD,
            confirm_password=NEW_PASSWORD,
        )
    except HTTPException:
        pass
    else:
        assert False, "Expected password change to fail"

    audit_log = db_session.scalar(
        select(AuditLog)
        .where(AuditLog.user_id == user.id)
        .where(AuditLog.action == AuditAction.PASSWORD_CHANGE)
    )

    assert audit_log is None


def test_password_change_with_mismatched_confirmation_does_not_audit(
    db_session,
):
    user = create_test_user(db_session)

    try:
        change_password(
            db=db_session,
            user=user,
            current_password=CURRENT_PASSWORD,
            new_password=NEW_PASSWORD,
            confirm_password="different-password",
        )
    except HTTPException:
        pass
    else:
        assert False, "Expected password change to fail"

    audit_log = db_session.scalar(
        select(AuditLog)
        .where(AuditLog.user_id == user.id)
        .where(AuditLog.action == AuditAction.PASSWORD_CHANGE)
    )

    assert audit_log is None


def test_password_change_does_not_store_password_in_audit_log(
    db_session,
):
    user = create_test_user(db_session)

    change_password(
        db=db_session,
        user=user,
        current_password=CURRENT_PASSWORD,
        new_password=NEW_PASSWORD,
        confirm_password=NEW_PASSWORD,
    )

    audit_log = db_session.scalar(
        select(AuditLog)
        .where(AuditLog.user_id == user.id)
        .where(AuditLog.action == AuditAction.PASSWORD_CHANGE)
        .order_by(AuditLog.id.desc())
    )

    assert audit_log is not None

    audit_values = vars(audit_log)

    assert CURRENT_PASSWORD not in str(audit_values)
    assert NEW_PASSWORD not in str(audit_values)