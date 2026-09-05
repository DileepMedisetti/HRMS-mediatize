from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session
import jwt

from app.authentication_service.models import User, UserRole
from app.core.database import get_db
from app.core.security import decode_access_token


security = HTTPBearer()


# ============================================================
# Current User
# ============================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """
    Get the currently authenticated user from the JWT.
    """

    token = credentials.credentials

    # --------------------------------------------------------
    # Decode and verify JWT
    # --------------------------------------------------------
    try:
        payload = decode_access_token(token)

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # --------------------------------------------------------
    # Get user ID from JWT
    # --------------------------------------------------------
    user_id = payload.get("sub")

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # --------------------------------------------------------
    # Validate user ID
    # --------------------------------------------------------
    try:
        user_id = int(user_id)

    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # --------------------------------------------------------
    # Find user in database
    # --------------------------------------------------------
    statement = select(User).where(
        User.id == user_id
    )

    user = db.scalar(statement)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # --------------------------------------------------------
    # Check account status
    # --------------------------------------------------------
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


# ============================================================
# Password Change Required
# ============================================================

def get_current_user_with_password_check(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Get the currently authenticated user and ensure that
    the user has completed any required password change.

    Users with must_change_password=True are blocked from
    normal protected HRMS endpoints.
    """

    if current_user.must_change_password:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Password change required before accessing this resource",
        )

    return current_user


# ============================================================
# Current HR
# ============================================================

def get_current_hr(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Allow access only to HR users.
    """

    if current_user.role != UserRole.HR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="HR access required",
        )

    return current_user