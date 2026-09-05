from unittest.mock import patch

from app.authentication_service.models import (
    PasswordResetRequest,
    PasswordResetStatus,
    User,
    UserRole,
)
from app.authentication_service.service import (
    approve_password_reset_request,
    authenticate_user,
    change_password,
)
from app.core.security import hash_password, verify_password


def create_test_user(db_session):
    user = User(
        email="temporary_password@example.com",
        employee_id="TEMP001",
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


@patch(
    "app.authentication_service.service.send_password_reset_email"
)
def test_temporary_password_can_login_and_change_password(
    mock_send_email,
    db_session,
):
    # --------------------------------------------------------
    # 1. Create employee
    # --------------------------------------------------------

    user = create_test_user(db_session)

    # --------------------------------------------------------
    # 2. Create password reset request
    # --------------------------------------------------------

    reset_request = create_pending_request(
        db_session,
        user,
    )

    # --------------------------------------------------------
    # 3. HR approves the request
    # --------------------------------------------------------

    approve_password_reset_request(
        db=db_session,
        request_id=reset_request.id,
    )

    db_session.refresh(user)

    # --------------------------------------------------------
    # 4. Get temporary password from mocked email call
    # --------------------------------------------------------

    mock_send_email.assert_called_once()

    email_arguments = mock_send_email.call_args.kwargs

    temporary_password = email_arguments[
        "temporary_password"
    ]

    # --------------------------------------------------------
    # 5. Verify temporary password was hashed
    # --------------------------------------------------------

    assert user.password_hash != temporary_password

    assert verify_password(
        temporary_password,
        user.password_hash,
    )

    # --------------------------------------------------------
    # 6. User must change password
    # --------------------------------------------------------

    assert user.must_change_password is True

    # --------------------------------------------------------
    # 7. Login using temporary password
    # --------------------------------------------------------

    access_token = authenticate_user(
        db=db_session,
        email=user.email,
        role=UserRole.EMPLOYEE,
        password=temporary_password,
    )

    assert access_token is not None
    assert isinstance(access_token, str)
    assert len(access_token) > 0

    # --------------------------------------------------------
    # 8. Change temporary password to permanent password
    # --------------------------------------------------------

    change_password(
        db=db_session,
        user=user,
        current_password=temporary_password,
        new_password="NewPassword@123",
        confirm_password="NewPassword@123",
    )

    db_session.refresh(user)

    # --------------------------------------------------------
    # 9. Verify password-change state
    # --------------------------------------------------------

    assert user.must_change_password is False

    # --------------------------------------------------------
    # 10. Verify new password works
    # --------------------------------------------------------

    assert verify_password(
        "NewPassword@123",
        user.password_hash,
    )

    # --------------------------------------------------------
    # 11. Verify old temporary password no longer works
    # --------------------------------------------------------

    assert not verify_password(
        temporary_password,
        user.password_hash,
    )

    # --------------------------------------------------------
    # 12. Verify new password can login
    # --------------------------------------------------------

    new_access_token = authenticate_user(
        db=db_session,
        email=user.email,
        role=UserRole.EMPLOYEE,
        password="NewPassword@123",
    )

    assert new_access_token is not None
    assert isinstance(new_access_token, str)