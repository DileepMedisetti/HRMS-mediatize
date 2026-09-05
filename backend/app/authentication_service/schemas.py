from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.authentication_service.models import UserRole


class LoginRequest(BaseModel):
    """
    Data required to authenticate a user.
    """

    email: EmailStr

    role: UserRole

    password: str = Field(
        min_length=6,
        max_length=128,
    )


class TokenResponse(BaseModel):
    """
    Response returned after successful authentication.
    """

    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    """
    Public user information.
    """

    id: int
    email: EmailStr
    employee_id: str | None
    role: str
    is_active: bool
    must_change_password: bool


class ChangePasswordRequest(BaseModel):
    """
    Data required to change the current password.
    """

    current_password: str = Field(
        min_length=6,
        max_length=128,
    )

    new_password: str = Field(
        min_length=6,
        max_length=128,
    )

    confirm_password: str = Field(
        min_length=6,
        max_length=128,
    )


class ForgotPasswordRequest(BaseModel):
    """
    Data required to request a password reset.
    """

    email: EmailStr


class PasswordResetActionResponse(BaseModel):
    """
    Response for password reset operations.
    """

    message: str


class PasswordResetRequestResponse(BaseModel):
    """
    Password reset request information visible to HR.
    """

    id: int
    user_id: int
    email: EmailStr
    status: str
    requested_at: datetime
    reviewed_at: datetime | None