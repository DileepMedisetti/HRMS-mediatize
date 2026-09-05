from fastapi.testclient import TestClient
import pytest

from app.attendance_service.models import Attendance, AttendanceStatus
from app.attendance_service.service import check_in_employee
from app.authentication_service.models import User, UserRole
from app.core.security import hash_password
from app.employee_service.models import Employee, EmploymentStatus
from app.main import app

client = TestClient(app)


def test_employee_cannot_access_hr_attendance(db_session):
    user = User(
        email="emp_no_hr_att@example.com",
        password_hash=hash_password("password123"),
        role=UserRole.EMPLOYEE,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()

    login = client.post("/auth/login", json={"email": "emp_no_hr_att@example.com", "role": "EMPLOYEE", "password": "password123"})
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/attendance", headers=headers)
    assert res.status_code == 403


def test_unauthenticated_requests_rejected():
    assert client.post("/attendance/check-in").status_code == 401
    assert client.post("/attendance/check-out").status_code == 401
    assert client.get("/attendance/me/today").status_code == 401
    assert client.get("/attendance/me").status_code == 401
    assert client.get("/attendance").status_code == 401


def test_idor_protection_employee_cannot_access_other_employee_attendance(db_session):
    # Create Employee A
    user_a = User(email="emp_a_att@example.com", password_hash=hash_password("pass123"), role=UserRole.EMPLOYEE, is_active=True)
    # Create Employee B
    user_b = User(email="emp_b_att@example.com", password_hash=hash_password("pass123"), role=UserRole.EMPLOYEE, is_active=True)
    # Create HR User
    user_hr = User(email="hr_idor_att@example.com", password_hash=hash_password("pass123"), role=UserRole.HR, is_active=True)

    db_session.add_all([user_a, user_b, user_hr])
    db_session.commit()

    emp_a = Employee(user_id=user_a.id, employee_code="EMPA001", first_name="A", last_name="User", employment_status=EmploymentStatus.ACTIVE)
    emp_b = Employee(user_id=user_b.id, employee_code="EMPB001", first_name="B", last_name="User", employment_status=EmploymentStatus.ACTIVE)
    emp_hr = Employee(user_id=user_hr.id, employee_code="HR0001", first_name="HR", last_name="User", employment_status=EmploymentStatus.ACTIVE)
    db_session.add_all([emp_a, emp_b, emp_hr])
    db_session.commit()

    # Employee B checks in
    att_b_dict = check_in_employee(db_session, user_b)
    att_b_id = att_b_dict["id"]

    # Login Employee A
    login_a = client.post("/auth/login", json={"email": "emp_a_att@example.com", "role": "EMPLOYEE", "password": "pass123"})
    token_a = login_a.json()["access_token"]

    # Login HR
    login_hr = client.post("/auth/login", json={"email": "hr_idor_att@example.com", "role": "HR", "password": "pass123"})
    token_hr = login_hr.json()["access_token"]

    # 1. Employee A tries to fetch Employee B's attendance by ID -> 403 Forbidden!
    res_idor = client.get(f"/attendance/{att_b_id}", headers={"Authorization": f"Bearer {token_a}"})
    assert res_idor.status_code == 403

    # 2. HR tries to fetch Employee B's attendance by ID -> 200 OK!
    res_hr = client.get(f"/attendance/{att_b_id}", headers={"Authorization": f"Bearer {token_hr}"})
    assert res_hr.status_code == 200
    assert res_hr.json()["id"] == att_b_id
