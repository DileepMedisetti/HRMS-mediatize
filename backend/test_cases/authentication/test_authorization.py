import pytest
from fastapi import HTTPException
from sqlalchemy import delete

from app.authentication_service.dependencies import (
    get_current_hr,
    get_current_user,
)
from app.authentication_service.models import User, UserRole
from app.core.database import SessionLocal
from app.core.security import create_access_token, hash_password


@pytest.fixture
def db():
    session = SessionLocal()

    yield session

    session.close()


@pytest.fixture
def users(db):
    # Clean test users
    db.execute(
        delete(User).where(
            User.email.in_(
                [
                    "dependency-hr@mediatize.com",
                    "dependency-employee@mediatize.com",
                    "dependency-inactive@mediatize.com",
                ]
            )
        )
    )
    db.commit()

    hr = User(
        email="dependency-hr@mediatize.com",
        employee_id="DEP-HR-001",
        password_hash=hash_password("test123"),
        role=UserRole.HR,
        is_active=True,
        must_change_password=False,
    )

    employee = User(
        email="dependency-employee@mediatize.com",
        employee_id="DEP-EMP-001",
        password_hash=hash_password("test123"),
        role=UserRole.EMPLOYEE,
        is_active=True,
        must_change_password=False,
    )

    inactive_employee = User(
        email="dependency-inactive@mediatize.com",
        employee_id="DEP-EMP-002",
        password_hash=hash_password("test123"),
        role=UserRole.EMPLOYEE,
        is_active=False,
        must_change_password=False,
    )

    db.add_all(
        [
            hr,
            employee,
            inactive_employee,
        ]
    )

    db.commit()

    db.refresh(hr)
    db.refresh(employee)
    db.refresh(inactive_employee)

    yield {
        "hr": hr,
        "employee": employee,
        "inactive": inactive_employee,
    }

    db.execute(
        delete(User).where(
            User.email.in_(
                [
                    "dependency-hr@mediatize.com",
                    "dependency-employee@mediatize.com",
                    "dependency-inactive@mediatize.com",
                ]
            )
        )
    )
    db.commit()


def make_credentials(token):
    from fastapi.security import HTTPAuthorizationCredentials

    return HTTPAuthorizationCredentials(
        scheme="Bearer",
        credentials=token,
    )


def test_valid_hr_token_returns_user(db, users):
    token = create_access_token(
        user_id=users["hr"].id,
        role="HR",
    )

    credentials = make_credentials(token)

    current_user = get_current_user(
        credentials=credentials,
        db=db,
    )

    assert current_user.id == users["hr"].id
    assert current_user.role == UserRole.HR


def test_valid_employee_token_returns_user(db, users):
    token = create_access_token(
        user_id=users["employee"].id,
        role="EMPLOYEE",
    )

    credentials = make_credentials(token)

    current_user = get_current_user(
        credentials=credentials,
        db=db,
    )

    assert current_user.id == users["employee"].id
    assert current_user.role == UserRole.EMPLOYEE


def test_invalid_token_is_rejected(db):
    credentials = make_credentials(
        "invalid.jwt.token"
    )

    with pytest.raises(HTTPException) as exc_info:
        get_current_user(
            credentials=credentials,
            db=db,
        )

    assert exc_info.value.status_code == 401


def test_nonexistent_user_is_rejected(db):
    token = create_access_token(
        user_id=999999,
        role="EMPLOYEE",
    )

    credentials = make_credentials(token)

    with pytest.raises(HTTPException) as exc_info:
        get_current_user(
            credentials=credentials,
            db=db,
        )

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "User not found"


def test_inactive_user_is_rejected(db, users):
    token = create_access_token(
        user_id=users["inactive"].id,
        role="EMPLOYEE",
    )

    credentials = make_credentials(token)

    with pytest.raises(HTTPException) as exc_info:
        get_current_user(
            credentials=credentials,
            db=db,
        )

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "User account is inactive"


def test_hr_can_access_hr_dependency(users):
    current_user = users["hr"]

    result = get_current_hr(
        current_user=current_user,
    )

    assert result.id == current_user.id
    assert result.role == UserRole.HR


def test_employee_cannot_access_hr_dependency(users):
    current_user = users["employee"]

    with pytest.raises(HTTPException) as exc_info:
        get_current_hr(
            current_user=current_user,
        )

    assert exc_info.value.status_code == 403
    assert exc_info.value.detail == "HR access required"