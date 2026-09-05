from email.message import EmailMessage
from pathlib import Path
import smtplib

from app.core.config import settings


TEMPLATE_DIR = Path(__file__).resolve().parent / "templates"


def load_template(template_name: str) -> str:
    """
    Load an HTML email template from the templates directory.
    """
    template_path = TEMPLATE_DIR / template_name

    if not template_path.exists():
        raise FileNotFoundError(
            f"Email template not found: {template_path}"
        )

    return template_path.read_text(encoding="utf-8")


def send_email(
    recipient_email: str,
    subject: str,
    html_content: str,
    plain_text_content: str,
) -> None:
    """
    Send an email using the configured SMTP server.

    The email contains both:
    - Plain-text version
    - HTML version

    The HTML version will be preferred by email clients
    that support HTML emails.
    """

    message = EmailMessage()

    message["From"] = (
        f"{settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM}>"
    )
    message["To"] = recipient_email
    message["Subject"] = subject

    # Plain-text fallback
    message.set_content(plain_text_content)

    # HTML version
    message.add_alternative(
        html_content,
        subtype="html",
    )

    # Connect to SMTP server
    with smtplib.SMTP(
        settings.SMTP_HOST,
        settings.SMTP_PORT,
        timeout=30,
    ) as smtp:

        # Identify ourselves to the SMTP server
        smtp.ehlo()

        # Upgrade connection to TLS
        smtp.starttls()

        # Identify ourselves again after TLS
        smtp.ehlo()

        # Authenticate with SMTP credentials
        smtp.login(
            settings.SMTP_USERNAME,
            settings.SMTP_PASSWORD,
        )

        # Send the email
        smtp.send_message(message)


def send_password_reset_email(
    recipient_email: str,
    temporary_password: str,
    login_url: str,
) -> None:
    """
    Send a professional HTML password-reset email
    containing the temporary password.
    """

    # Load HTML template
    template = load_template("password_reset.html")

    # Replace template placeholders
    html_content = (
        template
        .replace(
            "{{ employee_email }}",
            recipient_email,
        )
        .replace(
            "{{ temporary_password }}",
            temporary_password,
        )
        .replace(
            "{{ login_url }}",
            login_url,
        )
    )

    # Plain-text fallback
    plain_text_content = f"""
Hello,

Your Mediatize Tech HRMS password reset request has been approved by HR.

Account:
{recipient_email}

Temporary Password:
{temporary_password}

Please log in to HRMS using the temporary password and change your password immediately.

If you did not request a password reset, please contact your HR administrator.

Regards,
Mediatize Tech HRMS
Mediatize Tech Pvt. Ltd.
""".strip()

    # Send email
    send_email(
        recipient_email=recipient_email,
        subject="Your Mediatize HRMS Password Reset",
        html_content=html_content,
        plain_text_content=plain_text_content,
    )


def send_employee_welcome_email(
    recipient_email: str,
    employee_name: str,
    temporary_password: str,
    login_url: str,
    employee_code: str = "",
) -> None:
    """
    Send a professional HTML welcome email to a newly created employee.
    """

    template = load_template("employee_welcome.html")

    clean_name = employee_name.strip() if employee_name and employee_name.strip() else "Employee"

    html_content = (
        template
        .replace("{{ employee_name }}", clean_name)
        .replace("{{ employee_email }}", recipient_email)
        .replace("{{ temporary_password }}", temporary_password)
        .replace("{{ login_url }}", login_url)
        .replace("{{ employee_code }}", employee_code or "N/A")
    )

    plain_text_content = f"""
Welcome to Mediatize Tech!

Hello {clean_name},

Your employee account has been successfully created.

You can use the credentials below to sign in to the Mediatize Tech HRMS portal.

LOGIN CREDENTIALS

Employee Code:
{employee_code or "N/A"}

Email:
{recipient_email}

Temporary Password:
{temporary_password}

Login to HRMS:
{login_url}

For security reasons, please change your temporary password after signing in for the first time.

If you did not expect this account, please contact HR.

Regards,
Mediatize Tech HRMS
Mediatize Tech Pvt. Ltd.
""".strip()

    send_email(
        recipient_email=recipient_email,
        subject="Welcome to Mediatize Tech HRMS — Your Account Details",
        html_content=html_content,
        plain_text_content=plain_text_content,
    )