from fastapi.testclient import TestClient
import pytest

from app.authentication_service.models import User, UserRole
from app.core.security import hash_password
from app.main import app

client = TestClient(app)


def test_employee_cannot_access_hr_endpoints(db_session):
    emp_user = User(
        email="regular_employee@example.com",
        password_hash=hash_password("password123"),
        role=UserRole.EMPLOYEE,
        is_active=True,
        must_change_password=False,
    )
    db_session.add(emp_user)
    db_session.commit()

    # Login to get real token
    login_resp = client.post(
        "/auth/login",
        json={
            "email": "regular_employee@example.com",
            "role": "EMPLOYEE",
            "password": "password123",
        },
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]

    # 1. Employee trying to create an employee -> 403 Forbidden
    resp = client.post(
        "/employees",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "first_name": "Hack",
            "last_name": "Attempt",
            "email": "hacker@example.com",
        },
    )
    assert resp.status_code == 403

    # 2. Employee trying to list all employees -> 403 Forbidden
    resp = client.get(
        "/employees",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 403

    # 3. Employee trying to activate an employee -> 403 Forbidden
    resp = client.patch(
        "/employees/1/activate",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 403


def test_unauthenticated_requests_rejected():
    resp = client.get("/employees")
    assert resp.status_code == 401

    resp = client.get("/employees/me")
    assert resp.status_code == 401
