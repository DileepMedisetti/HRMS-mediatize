from fastapi.testclient import TestClient

from app.authentication_service.models import User, UserRole
from app.core.security import hash_password
from app.main import app


client = TestClient(app)


def create_test_user(db, email, password, role):
    user = User(
        email=email,
        employee_id=None,
        password_hash=hash_password(password),
        role=role,
        is_active=True,
        must_change_password=False,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def test_get_me_with_valid_token(db_session):
    user = create_test_user(
        db_session,
        "me_test@example.com",
        "password123",
        UserRole.EMPLOYEE,
    )

    login_response = client.post(
        "/auth/login",
        json={
            "email": "me_test@example.com",
            "role": "EMPLOYEE",
            "password": "password123",
        },
    )

    assert login_response.status_code == 200

    token = login_response.json()["access_token"]

    response = client.get(
        "/auth/me",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == user.id
    assert data["email"] == "me_test@example.com"
    assert data["role"] == "EMPLOYEE"
    assert data["is_active"] is True
    assert data["must_change_password"] is False


def test_get_me_without_token():
    response = client.get("/auth/me")

    assert response.status_code == 401


def test_get_me_with_invalid_token():
    response = client.get(
        "/auth/me",
        headers={
            "Authorization": "Bearer invalid-token",
        },
    )

    assert response.status_code == 401


def test_get_me_for_hr(db_session):
    create_test_user(
        db_session,
        "hr_me_test@example.com",
        "password123",
        UserRole.HR,
    )

    login_response = client.post(
        "/auth/login",
        json={
            "email": "hr_me_test@example.com",
            "role": "HR",
            "password": "password123",
        },
    )

    assert login_response.status_code == 200

    token = login_response.json()["access_token"]

    response = client.get(
        "/auth/me",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["email"] == "hr_me_test@example.com"
    assert data["role"] == "HR"
