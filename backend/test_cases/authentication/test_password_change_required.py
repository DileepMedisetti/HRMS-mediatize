import pytest
from fastapi import HTTPException

from app.authentication_service.dependencies import (
    get_current_user_with_password_check,
)
from app.authentication_service.models import User, UserRole


def create_user(
    must_change_password: bool,
) -> User:
    return User(
        id=1,
        email="test@example.com",
        employee_id="TEST001",
        password_hash="dummy_hash",
        role=UserRole.EMPLOYEE,
        is_active=True,
        must_change_password=must_change_password,
    )


def test_user_with_password_change_required_is_blocked():
    user = create_user(
        must_change_password=True
    )

    with pytest.raises(HTTPException) as exc_info:
        get_current_user_with_password_check(
            current_user=user
        )

    assert exc_info.value.status_code == 403

    assert (
        exc_info.value.detail
        == "Password change required before accessing this resource"
    )


def test_user_with_changed_password_is_allowed():
    user = create_user(
        must_change_password=False
    )

    result = get_current_user_with_password_check(
        current_user=user
    )

    assert result is user