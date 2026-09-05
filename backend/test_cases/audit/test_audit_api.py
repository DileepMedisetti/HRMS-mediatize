from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
import pytest

from app.audit_service.models import AuditAction, AuditLog
from app.audit_service.service import create_audit_log
from app.authentication_service.models import User, UserRole
from app.core.security import hash_password
from app.main import app

client = TestClient(app)


def test_unauthenticated_audit_logs_returns_401():
    response = client.get("/audit-logs")
    assert response.status_code == 401


def test_employee_accessing_audit_logs_returns_403(db_session):
    emp = User(
        email="emp_audit_test@example.com",
        password_hash=hash_password("password123"),
        role=UserRole.EMPLOYEE,
        is_active=True,
        must_change_password=False,
    )
    db_session.add(emp)
    db_session.commit()

    login_resp = client.post(
        "/auth/login",
        json={
            "email": "emp_audit_test@example.com",
            "role": "EMPLOYEE",
            "password": "password123",
        },
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]

    response = client.get(
        "/audit-logs",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403
    assert response.json()["detail"] == "HR access required"


def test_hr_accessing_audit_logs_returns_200(db_session):
    hr = User(
        email="hr_audit_test@example.com",
        password_hash=hash_password("hr1234"),
        role=UserRole.HR,
        is_active=True,
        must_change_password=False,
    )
    db_session.add(hr)
    db_session.commit()

    # Create a couple of audit logs
    create_audit_log(db_session, action=AuditAction.LOGIN_SUCCESS, user_id=hr.id, ip_address="127.0.0.1")
    db_session.commit()

    login_resp = client.post(
        "/auth/login",
        json={
            "email": "hr_audit_test@example.com",
            "role": "HR",
            "password": "hr1234",
        },
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]

    response = client.get(
        "/audit-logs",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "page" in data
    assert "limit" in data
    assert "total" in data
    assert "total_pages" in data
    assert isinstance(data["items"], list)
    assert data["total"] >= 1


def test_audit_logs_pagination_and_filtering(db_session):
    hr = User(
        email="hr_audit_filter@example.com",
        password_hash=hash_password("hr1234"),
        role=UserRole.HR,
        is_active=True,
        must_change_password=False,
    )
    db_session.add(hr)
    db_session.commit()

    # Create distinct logs
    log1 = create_audit_log(db_session, action=AuditAction.LOGIN_SUCCESS, user_id=hr.id, ip_address="192.168.1.1")
    log2 = create_audit_log(db_session, action=AuditAction.PASSWORD_CHANGE, user_id=hr.id, ip_address="192.168.1.2")
    db_session.commit()

    login_resp = client.post(
        "/auth/login",
        json={
            "email": "hr_audit_filter@example.com",
            "role": "HR",
            "password": "hr1234",
        },
    )
    token = login_resp.json()["access_token"]

    # Action filter test
    response = client.get(
        "/audit-logs?action=PASSWORD_CHANGE",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    items = response.json()["items"]
    assert len(items) >= 1
    assert all(item["action"] == "PASSWORD_CHANGE" for item in items)

    # Search filter test
    response = client.get(
        "/audit-logs?search=hr_audit_filter",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["total"] >= 2

    # User ID filter test
    response = client.get(
        f"/audit-logs?user_id={hr.id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["total"] >= 2


def test_audit_logs_ordering_newest_first(db_session):
    hr = User(
        email="hr_audit_order@example.com",
        password_hash=hash_password("hr1234"),
        role=UserRole.HR,
        is_active=True,
        must_change_password=False,
    )
    db_session.add(hr)
    db_session.commit()

    login_resp = client.post(
        "/auth/login",
        json={
            "email": "hr_audit_order@example.com",
            "role": "HR",
            "password": "hr1234",
        },
    )
    token = login_resp.json()["access_token"]

    response = client.get(
        "/audit-logs?limit=50",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    items = response.json()["items"]
    if len(items) > 1:
        for i in range(len(items) - 1):
            t1 = datetime.fromisoformat(items[i]["created_at"])
            t2 = datetime.fromisoformat(items[i + 1]["created_at"])
            assert t1 >= t2


def test_audit_logs_immutability_no_write_endpoints(db_session):
    hr = User(
        email="hr_audit_immutable@example.com",
        password_hash=hash_password("hr1234"),
        role=UserRole.HR,
        is_active=True,
        must_change_password=False,
    )
    db_session.add(hr)
    db_session.commit()

    login_resp = client.post(
        "/auth/login",
        json={
            "email": "hr_audit_immutable@example.com",
            "role": "HR",
            "password": "hr1234",
        },
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # POST, PUT, PATCH, DELETE must return 404 or 405 (no write/edit/delete route exists)
    assert client.post("/audit-logs", headers=headers, json={}).status_code in (404, 405)
    assert client.put("/audit-logs/1", headers=headers, json={}).status_code in (404, 405)
    assert client.patch("/audit-logs/1", headers=headers, json={}).status_code in (404, 405)
    assert client.delete("/audit-logs/1", headers=headers).status_code in (404, 405)


def test_audit_logs_sensitive_data_protection(db_session):
    hr = User(
        email="hr_audit_sec@example.com",
        password_hash=hash_password("hr1234"),
        role=UserRole.HR,
        is_active=True,
        must_change_password=False,
    )
    db_session.add(hr)
    db_session.commit()

    login_resp = client.post(
        "/auth/login",
        json={
            "email": "hr_audit_sec@example.com",
            "role": "HR",
            "password": "hr1234",
        },
    )
    token = login_resp.json()["access_token"]

    response = client.get(
        "/audit-logs",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    res_str = response.text.lower()
    for sensitive in ["password_hash", "jwt_secret", "cloudinary_api_secret", "smtp_password"]:
        assert sensitive not in res_str
