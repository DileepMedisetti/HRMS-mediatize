from datetime import datetime

import pytest
from fastapi import HTTPException
from sqlalchemy import delete

from app.authentication_service.models import User, UserRole
from app.authentication_service.service import authenticate_user
from app.core.database import SessionLocal
from app.core.security import hash_password


TEST_EMAIL = "service-test@mediatize.com"


@pytest.fixture
def db():
    session = SessionLocal()

    # Remove previous test user
    session.execute(
        delete(User).where(User.email == TEST_EMAIL)
    )
    session.commit()

    yield session

    # Clean up after test
    session.execute(
        delete(User).where(User.email == TEST_EMAIL)
    )
    session.commit()
    session.close()


@pytest.fixture
def test_user(db):
    user = User(
        email=TEST_EMAIL,
        employee_id="TEST001",
        password_hash=hash_password("test123"),
        role=UserRole.EMPLOYEE,
        is_active=True,
        must_change_password=False,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def test_authenticate_user_success(db, test_user):
    token = authenticate_user(
        db=db,
        email=TEST_EMAIL,
        role=UserRole.EMPLOYEE,
        password="test123",
    )

    assert isinstance(token, str)
    assert len(token) > 0


def test_invalid_password_is_rejected(db, test_user):
    with pytest.raises(HTTPException) as exc_info:
        authenticate_user(
            db=db,
            email=TEST_EMAIL,
            role=UserRole.EMPLOYEE,
            password="wrongpassword",
        )

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Invalid email, role, or password"


def test_nonexistent_user_is_rejected(db):
    with pytest.raises(HTTPException) as exc_info:
        authenticate_user(
            db=db,
            email="doesnotexist@mediatize.com",
            role=UserRole.EMPLOYEE,
            password="test123",
        )

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Invalid email, role, or password"


def test_inactive_user_is_rejected(db):
    user = User(
        email=TEST_EMAIL,
        employee_id="TEST001",
        password_hash=hash_password("test123"),
        role=UserRole.EMPLOYEE,
        is_active=False,
        must_change_password=False,
    )

    db.add(user)
    db.commit()

    with pytest.raises(HTTPException) as exc_info:
        authenticate_user(
            db=db,
            email=TEST_EMAIL,
            role=UserRole.EMPLOYEE,
            password="test123",
        )

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Invalid email, role, or password"


def test_wrong_role_is_rejected(db, test_user):
    with pytest.raises(HTTPException) as exc_info:
        authenticate_user(
            db=db,
            email=TEST_EMAIL,
            role=UserRole.HR,
            password="test123",
        )

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Invalid email, role, or password"


def test_last_login_is_updated(db, test_user):
    assert test_user.last_login_at is None

    authenticate_user(
        db=db,
        email=TEST_EMAIL,
        role=UserRole.EMPLOYEE,
        password="test123",
    )

    db.refresh(test_user)

    assert test_user.last_login_at is not None
    assert isinstance(
        test_user.last_login_at,
        datetime,
    )


def test_employee_authentication(db, test_user):
    token = authenticate_user(
        db=db,
        email=TEST_EMAIL,
        role=UserRole.EMPLOYEE,
        password="test123",
    )

    assert token
    assert test_user.role == UserRole.EMPLOYEE