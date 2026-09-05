from app.authentication_service.models import User, UserRole


def test_user_table_name():
    assert User.__tablename__ == "users"


def test_user_columns():
    columns = User.__table__.columns

    expected_columns = {
        "id",
        "email",
        "employee_id",
        "password_hash",
        "role",
        "is_active",
        "must_change_password",
        "created_at",
        "updated_at",
        "last_login_at",
    }

    assert set(columns.keys()) == expected_columns


def test_user_role_values():
    assert UserRole.HR.value == "HR"
    assert UserRole.EMPLOYEE.value == "EMPLOYEE"