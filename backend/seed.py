from sqlalchemy import select

from app.authentication_service.models import User, UserRole
from app.core.database import SessionLocal
from app.core.security import hash_password


DEFAULT_USERS = [
    {
        "email": "hr@mediatize.com",
        "employee_id": "HR001",
        "password": "hr1234",
        "role": UserRole.HR,
    },
    {
        "email": "employee1@mediatize.com",
        "employee_id": "EMP001",
        "password": "employee123",
        "role": UserRole.EMPLOYEE,
    },
    {
        "email": "employee2@mediatize.com",
        "employee_id": "EMP002",
        "password": "employee123",
        "role": UserRole.EMPLOYEE,
    },
    {
        "email": "employee3@mediatize.com",
        "employee_id": "EMP003",
        "password": "employee123",
        "role": UserRole.EMPLOYEE,
    },
    {
        "email": "xifito9683@mediseat.com",
        "employee_id": "EMP004",
        "password": "employee123",
        "role": UserRole.EMPLOYEE,
    },
    {
        "email": "yohove1597@slotbeer.com",
        "employee_id": "EMP005",
        "password": "employee123",
        "role": UserRole.EMPLOYEE,
    },
]


def seed_users():
    db = SessionLocal()

    try:
        for user_data in DEFAULT_USERS:
            statement = select(User).where(
                User.email == user_data["email"]
            )

            existing_user = db.scalar(statement)

            if existing_user:
                print(
                    f"User already exists: "
                    f"{user_data['email']}"
                )
                continue

            user = User(
                email=user_data["email"],
                employee_id=user_data["employee_id"],
                password_hash=hash_password(
                    user_data["password"]
                ),
                role=user_data["role"],
                is_active=True,
                must_change_password=False,
            )

            db.add(user)

            print(
                f"Created user: "
                f"{user_data['email']}"
            )

        db.commit()

        print("Default users seeded successfully.")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_users()