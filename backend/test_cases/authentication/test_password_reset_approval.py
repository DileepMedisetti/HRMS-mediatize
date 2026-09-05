from unittest.mock import patch

from app.authentication_service.models import (
    PasswordResetRequest,
    PasswordResetStatus,
    User,
    UserRole,
)
from app.authentication_service.service import (
    approve_password_reset_request,
    reject_password_reset_request,
)
from app.core.security import hash_password, verify_password


def create_test_user(db_session):
    user = User(
        email="reset_test@example.com",
        employee_id="RESET001",
        password_hash=hash_password("oldpassword"),
        role=UserRole.EMPLOYEE,
        is_active=True,
        must_change_password=False,
    )

    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    return user


def create_pending_request(db_session, user):
    reset_request = PasswordResetRequest(
        user_id=user.id,
        status=PasswordResetStatus.PENDING,
    )

    db_session.add(reset_request)
    db_session.commit()
    db_session.refresh(reset_request)

    return reset_request


# ============================================================
# Approve Password Reset
# ============================================================

@patch(
    "app.authentication_service.service.send_password_reset_email"
)
def test_approve_password_reset_request(
    mock_send_email,
    db_session,
):
    user = create_test_user(db_session)
    reset_request = create_pending_request(
        db_session,
        user,
    )

    approve_password_reset_request(
        db=db_session,
        request_id=reset_request.id,
    )

    db_session.refresh(user)
    db_session.refresh(reset_request)

    # Reset request should be approved.
    assert reset_request.status == PasswordResetStatus.APPROVED

    # Review time should be recorded.
    assert reset_request.reviewed_at is not None

    # User must change password after login.
    assert user.must_change_password is True

    # Password hash should have changed.
    assert user.password_hash != "oldpassword"

    # Email service should have been called exactly once.
    mock_send_email.assert_called_once()

    # Get the arguments passed to the email service.
    call_kwargs = mock_send_email.call_args.kwargs

    # Verify recipient.
    assert call_kwargs["recipient_email"] == user.email

    # Verify login URL.
    assert call_kwargs["login_url"] == "http://localhost:5173/login"

    # Temporary password should exist.
    temporary_password = call_kwargs["temporary_password"]

    assert temporary_password is not None
    assert len(temporary_password) >= 8

    # Temporary password must match the stored Argon2 hash.
    assert verify_password(
        temporary_password,
        user.password_hash,
    )


# ============================================================
# Reject Password Reset
# ============================================================

def test_reject_password_reset_request(db_session):
    user = create_test_user(db_session)

    reset_request = create_pending_request(
        db_session,
        user,
    )

    old_hash = user.password_hash

    reject_password_reset_request(
        db=db_session,
        request_id=reset_request.id,
    )

    db_session.refresh(user)
    db_session.refresh(reset_request)

    # Reset request should be rejected.
    assert reset_request.status == PasswordResetStatus.REJECTED

    # Review time should be recorded.
    assert reset_request.reviewed_at is not None

    # Password must remain unchanged.
    assert user.password_hash == old_hash

    # User should not be forced to change password.
    assert user.must_change_password is False


# ============================================================
# Nonexistent Request
# ============================================================

def test_approve_nonexistent_request(db_session):
    try:
        approve_password_reset_request(
            db=db_session,
            request_id=999999,
        )
        assert False
    except Exception as exc:
        assert getattr(exc, "status_code", None) == 404


def test_reject_nonexistent_request(db_session):
    try:
        reject_password_reset_request(
            db=db_session,
            request_id=999999,
        )
        assert False
    except Exception as exc:
        assert getattr(exc, "status_code", None) == 404


# ============================================================
# Already Rejected Request
# ============================================================

def test_cannot_approve_already_rejected_request(
    db_session,
):
    user = create_test_user(db_session)

    reset_request = create_pending_request(
        db_session,
        user,
    )

    reject_password_reset_request(
        db=db_session,
        request_id=reset_request.id,
    )

    try:
        approve_password_reset_request(
            db=db_session,
            request_id=reset_request.id,
        )
        assert False
    except Exception as exc:
        assert getattr(exc, "status_code", None) == 400


# ============================================================
# Already Approved Request
# ============================================================

@patch(
    "app.authentication_service.service.send_password_reset_email"
)
def test_cannot_reject_already_approved_request(
    mock_send_email,
    db_session,
):
    user = create_test_user(db_session)

    reset_request = create_pending_request(
        db_session,
        user,
    )

    approve_password_reset_request(
        db=db_session,
        request_id=reset_request.id,
    )

    try:
        reject_password_reset_request(
            db=db_session,
            request_id=reset_request.id,
        )
        assert False
    except Exception as exc:
        assert getattr(exc, "status_code", None) == 400

    # Approval should have sent exactly one email.
    mock_send_email.assert_called_once()