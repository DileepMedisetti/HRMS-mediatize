import pytest
from pydantic import ValidationError

from app.authentication_service.models import UserRole
from app.authentication_service.schemas import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    TokenResponse,
)


def test_valid_login_request():
    request = LoginRequest(
        email="hr@mediatize.com",
        role="HR",
        password="hr1234",
    )

    assert request.email == "hr@mediatize.com"
    assert request.role == UserRole.HR
    assert request.password == "hr1234"


def test_employee_login_request():
    request = LoginRequest(
        email="employee1@mediatize.com",
        role="EMPLOYEE",
        password="employee123",
    )

    assert request.email == "employee1@mediatize.com"
    assert request.role == UserRole.EMPLOYEE
    assert request.password == "employee123"


def test_invalid_email_is_rejected():
    with pytest.raises(ValidationError):
        LoginRequest(
            email="invalid-email",
            role="HR",
            password="hr1234",
        )


def test_short_password_is_rejected():
    with pytest.raises(ValidationError):
        LoginRequest(
            email="hr@mediatize.com",
            role="HR",
            password="12345",
        )


def test_invalid_role_is_rejected():
    with pytest.raises(ValidationError):
        LoginRequest(
            email="hr@mediatize.com",
            role="INVALID_ROLE",
            password="hr1234",
        )


def test_token_response():
    response = TokenResponse(
        access_token="test-token",
    )

    assert response.access_token == "test-token"
    assert response.token_type == "bearer"


def test_valid_change_password_request():
    request = ChangePasswordRequest(
        current_password="oldpass",
        new_password="newpass",
        confirm_password="newpass",
    )

    assert request.new_password == "newpass"
    assert request.confirm_password == "newpass"


def test_change_password_short_password_is_rejected():
    with pytest.raises(ValidationError):
        ChangePasswordRequest(
            current_password="oldpass",
            new_password="123",
            confirm_password="123",
        )


def test_valid_forgot_password_request():
    request = ForgotPasswordRequest(
        email="employee1@mediatize.com",
    )

    assert request.email == "employee1@mediatize.com"


def test_invalid_forgot_password_email_is_rejected():
    with pytest.raises(ValidationError):
        ForgotPasswordRequest(
            email="invalid-email",
        )