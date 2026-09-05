from fastapi.testclient import TestClient

from app.authentication_service.models import User, UserRole
from app.core.security import hash_password, verify_password
from app.main import app


client = TestClient(app)


def create_test_user(
    db,
    email,
    password,
    role=UserRole.EMPLOYEE,
    must_change_password=False,
):
    user = User(
        email=email,
        employee_id=None,
        password_hash=hash_password(password),
        role=role,
        is_active=True,
        must_change_password=must_change_password,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def login_user(email, role, password):
    response = client.post(
        "/auth/login",
        json={
            "email": email,
            "role": role.value,
            "password": password,
        },
    )

    assert response.status_code == 200

    return response.json()["access_token"]


def test_change_password_success(db_session):
    user = create_test_user(
        db_session,
        "change_password@example.com",
        "oldpassword",
    )

    token = login_user(
        user.email,
        user.role,
        "oldpassword",
    )

    response = client.post(
        "/auth/change-password",
        headers={
            "Authorization": f"Bearer {token}",
        },
        json={
            "current_password": "oldpassword",
            "new_password": "newpassword",
            "confirm_password": "newpassword",
        },
    )

    assert response.status_code == 200
    assert response.json()["message"] == "Password changed successfully"

    db_session.refresh(user)

    assert user.must_change_password is False
    assert verify_password(
        "newpassword",
        user.password_hash,
    )
    assert not verify_password(
        "oldpassword",
        user.password_hash,
    )


def test_change_password_wrong_current_password(db_session):
    user = create_test_user(
        db_session,
        "wrong_current@example.com",
        "oldpassword",
    )

    token = login_user(
        user.email,
        user.role,
        "oldpassword",
    )

    response = client.post(
        "/auth/change-password",
        headers={
            "Authorization": f"Bearer {token}",
        },
        json={
            "current_password": "wrongpassword",
            "new_password": "newpassword",
            "confirm_password": "newpassword",
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Current password is incorrect"


def test_change_password_same_as_current(db_session):
    user = create_test_user(
        db_session,
        "same_password@example.com",
        "oldpassword",
    )

    token = login_user(
        user.email,
        user.role,
        "oldpassword",
    )

    response = client.post(
        "/auth/change-password",
        headers={
            "Authorization": f"Bearer {token}",
        },
        json={
            "current_password": "oldpassword",
            "new_password": "oldpassword",
            "confirm_password": "oldpassword",
        },
    )

    assert response.status_code == 400
    assert (
        response.json()["detail"]
        == "New password must be different from current password"
    )


def test_change_password_confirmation_mismatch(db_session):
    user = create_test_user(
        db_session,
        "mismatch@example.com",
        "oldpassword",
    )

    token = login_user(
        user.email,
        user.role,
        "oldpassword",
    )

    response = client.post(
        "/auth/change-password",
        headers={
            "Authorization": f"Bearer {token}",
        },
        json={
            "current_password": "oldpassword",
            "new_password": "newpassword",
            "confirm_password": "differentpassword",
        },
    )

    assert response.status_code == 400
    assert (
        response.json()["detail"]
        == "New password and confirmation password do not match"
    )


def test_change_password_requires_authentication():
    response = client.post(
        "/auth/change-password",
        json={
            "current_password": "oldpassword",
            "new_password": "newpassword",
            "confirm_password": "newpassword",
        },
    )

    assert response.status_code == 401


def test_change_password_clears_must_change_password(db_session):
    user = create_test_user(
        db_session,
        "must_change@example.com",
        "oldpassword",
        must_change_password=True,
    )

    token = login_user(
        user.email,
        user.role,
        "oldpassword",
    )

    response = client.post(
        "/auth/change-password",
        headers={
            "Authorization": f"Bearer {token}",
        },
        json={
            "current_password": "oldpassword",
            "new_password": "newpassword",
            "confirm_password": "newpassword",
        },
    )

    assert response.status_code == 200

    db_session.refresh(user)

    assert user.must_change_password is False
