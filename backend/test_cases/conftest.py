import pytest

from sqlalchemy import delete, select

from app.authentication_service.models import (
    PasswordResetRequest,
    User,
)
from app.audit_service.models import AuditLog
from app.core.database import SessionLocal


@pytest.fixture
def db_session():
    db = SessionLocal()

    def cleanup_test_data():
        cleanup_db = SessionLocal()
        try:
            # Find test users
            test_user_ids = cleanup_db.scalars(
                select(User.id).where(
                    User.email.like("%@example.com")
                )
            ).all()

            if test_user_ids:
                # Delete password reset requests first
                cleanup_db.execute(
                    delete(PasswordResetRequest).where(
                        PasswordResetRequest.user_id.in_(test_user_ids)
                    )
                )

                # Delete audit logs next
                cleanup_db.execute(
                    delete(AuditLog).where(
                        AuditLog.user_id.in_(test_user_ids)
                    )
                )

                # Delete notifications next
                from app.notification_service.models import Notification
                cleanup_db.execute(
                    delete(Notification).where(
                        Notification.user_id.in_(test_user_ids)
                    )
                )

                # Delete employee profiles, attendance, leave balances, leave requests
                from app.attendance_service.models import Attendance
                from app.employee_service.models import Employee
                from app.leave_service.models import LeaveAttachment, LeaveBalance, LeaveRequest, LeaveType
                from app.work_report_service.models import DailyWorkReport

                emp_ids = cleanup_db.scalars(
                    select(Employee.id).where(Employee.user_id.in_(test_user_ids))
                ).all()
                if emp_ids:
                    cleanup_db.execute(
                        delete(DailyWorkReport).where(DailyWorkReport.employee_id.in_(emp_ids))
                    )
                    cleanup_db.execute(
                        delete(Attendance).where(Attendance.employee_id.in_(emp_ids))
                    )
                    
                    req_ids = cleanup_db.scalars(
                        select(LeaveRequest.id).where(LeaveRequest.employee_id.in_(emp_ids))
                    ).all()
                    if req_ids:
                        cleanup_db.execute(
                            delete(LeaveAttachment).where(LeaveAttachment.leave_request_id.in_(req_ids))
                        )
                    
                    cleanup_db.execute(
                        delete(LeaveRequest).where(LeaveRequest.employee_id.in_(emp_ids))
                    )
                    cleanup_db.execute(
                        delete(LeaveBalance).where(LeaveBalance.employee_id.in_(emp_ids))
                    )

                # Delete announcements and announcement_reads
                from app.announcement_service.models import Announcement, AnnouncementRead
                from app.project_service.models import Project, ProjectAssignment, ProjectRole

                cleanup_db.execute(
                    delete(AnnouncementRead).where(
                        (AnnouncementRead.employee_id.in_(emp_ids)) if emp_ids else False
                    )
                )
                cleanup_db.execute(
                    delete(Announcement).where(
                        (Announcement.created_by.in_(test_user_ids))
                    )
                )

                if emp_ids:
                    cleanup_db.execute(
                        delete(ProjectAssignment).where(ProjectAssignment.employee_id.in_(emp_ids))
                    )

                cleanup_db.execute(
                    delete(LeaveType).where(
                        (LeaveType.name.like("%Test%")) | (LeaveType.name.like("%API%"))
                    )
                )

                cleanup_db.execute(
                    delete(Employee).where(
                        Employee.user_id.in_(test_user_ids)
                    )
                )

                cleanup_db.commit()

                # Delete test users
                cleanup_db.execute(
                    delete(User).where(
                        User.id.in_(test_user_ids)
                    )
                )

                cleanup_db.commit()
        except Exception as e:
            cleanup_db.rollback()
        finally:
            cleanup_db.close()

    # Clean old test data before the test
    cleanup_test_data()

    try:
        yield db
    finally:
        try:
            db.close()
        except Exception:
            pass
        cleanup_test_data()