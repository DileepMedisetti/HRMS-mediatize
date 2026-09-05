from sqlalchemy import delete, select

from app.audit_service.models import AuditAction, AuditLog
from app.authentication_service.models import User, UserRole
from app.authentication_service.service import authenticate_user
from app.core.security import hash_password


TEST_EMAIL = "login-audit@example.com"
TEST_EMPLOYEE_ID = "LOGIN001"
TEST_PASSWORD = "password123"


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
        password_hash=hash_password(TEST_PASSWORD),
        role=UserRole.EMPLOYEE,
        is_active=True,
    )

    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    return user


def test_successful_login_creates_success_audit(db_session):
    user = create_test_user(db_session)

    from app.audit_service.service import create_audit_log

    access_token = authenticate_user(
        db=db_session,
        email=TEST_EMAIL,
        role="EMPLOYEE",
        password=TEST_PASSWORD,
    )

    create_audit_log(
        db=db_session,
        action=AuditAction.LOGIN_SUCCESS,
        user_id=user.id,
        ip_address="127.0.0.1",
    )

    assert access_token is not None
    assert access_token != ""

    audit_log = db_session.scalar(
        select(AuditLog)
        .where(AuditLog.user_id == user.id)
        .where(AuditLog.action == AuditAction.LOGIN_SUCCESS)
        .order_by(AuditLog.id.desc())
    )

    assert audit_log is not None
    assert audit_log.user_id == user.id
    assert audit_log.ip_address == "127.0.0.1"


def test_failed_login_creates_failure_audit(db_session):
    user = create_test_user(db_session)

    from fastapi import HTTPException
    from app.audit_service.service import create_audit_log

    try:
        authenticate_user(
            db=db_session,
            email=TEST_EMAIL,
            role="EMPLOYEE",
            password="wrong-password",
        )
    except HTTPException:
        pass
    else:
        assert False, "Expected login to fail"

    create_audit_log(
        db=db_session,
        action=AuditAction.LOGIN_FAILURE,
        user_id=user.id,
        ip_address="127.0.0.1",
    )

    audit_log = db_session.scalar(
        select(AuditLog)
        .where(AuditLog.user_id == user.id)
        .where(AuditLog.action == AuditAction.LOGIN_FAILURE)
        .order_by(AuditLog.id.desc())
    )

    assert audit_log is not None
    assert audit_log.user_id == user.id
    assert audit_log.ip_address == "127.0.0.1"


def test_wrong_role_creates_failure_audit(db_session):
    user = create_test_user(db_session)

    from fastapi import HTTPException
    from app.audit_service.service import create_audit_log

    try:
        authenticate_user(
            db=db_session,
            email=TEST_EMAIL,
            role="HR",
            password=TEST_PASSWORD,
        )
    except HTTPException:
        pass
    else:
        assert False, "Expected login to fail for wrong role"

    create_audit_log(
        db=db_session,
        action=AuditAction.LOGIN_FAILURE,
        user_id=user.id,
        ip_address="127.0.0.1",
    )

    audit_log = db_session.scalar(
        select(AuditLog)
        .where(AuditLog.user_id == user.id)
        .where(AuditLog.action == AuditAction.LOGIN_FAILURE)
        .order_by(AuditLog.id.desc())
    )

    assert audit_log is not None
    assert audit_log.user_id == user.id


def test_unknown_email_failure_can_have_no_user_id(db_session):
    from app.audit_service.service import create_audit_log

    unknown_email = "unknown-login@example.com"

    from fastapi import HTTPException

    try:
        authenticate_user(
            db=db_session,
            email=unknown_email,
            role="EMPLOYEE",
            password="wrong-password",
        )
    except HTTPException:
        pass
    else:
        assert False, "Expected login to fail"

    audit_log = create_audit_log(
        db=db_session,
        action=AuditAction.LOGIN_FAILURE,
        user_id=None,
        ip_address="127.0.0.1",
    )

    assert audit_log.user_id is None
    assert audit_log.action == AuditAction.LOGIN_FAILURE
    assert audit_log.ip_address == "127.0.0.1"


def test_audit_log_does_not_store_password_or_token(db_session):
    user = create_test_user(db_session)

    from app.audit_service.service import create_audit_log

    secret_password = "SuperSecretPassword123!"
    fake_token = "eyJ.fake.jwt.token"

    audit_log = create_audit_log(
        db=db_session,
        action=AuditAction.LOGIN_SUCCESS,
        user_id=user.id,
        ip_address="127.0.0.1",
    )

    assert audit_log.user_id == user.id

    stored_values = vars(audit_log)

    assert secret_password not in str(stored_values)
    assert fake_token not in str(stored_values)