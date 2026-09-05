from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_hr_login_success():
    response = client.post(
        "/auth/login",
        json={
            "email": "hr@mediatize.com",
            "role": "HR",
            "password": "hr1234",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_employee_login_success():
    response = client.post(
        "/auth/login",
        json={
            "email": "employee1@mediatize.com",
            "role": "EMPLOYEE",
            "password": "employee123",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password():
    response = client.post(
        "/auth/login",
        json={
            "email": "hr@mediatize.com",
            "role": "HR",
            "password": "wrongpassword",
        },
    )

    assert response.status_code == 401
    assert response.json()["detail"] == (
        "Invalid email, role, or password"
    )


def test_login_wrong_role():
    response = client.post(
        "/auth/login",
        json={
            "email": "employee1@mediatize.com",
            "role": "HR",
            "password": "employee123",
        },
    )

    assert response.status_code == 401
    assert response.json()["detail"] == (
        "Invalid email, role, or password"
    )


def test_login_nonexistent_user():
    response = client.post(
        "/auth/login",
        json={
            "email": "unknown@mediatize.com",
            "role": "EMPLOYEE",
            "password": "password123",
        },
    )

    assert response.status_code == 401
    assert response.json()["detail"] == (
        "Invalid email, role, or password"
    )


def test_login_invalid_role():
    response = client.post(
        "/auth/login",
        json={
            "email": "hr@mediatize.com",
            "role": "ADMIN",
            "password": "hr1234",
        },
    )

    assert response.status_code == 422