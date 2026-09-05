from unittest.mock import patch

from app.email_service.service import send_password_reset_email


@patch("app.email_service.service.send_email")
def test_send_password_reset_email(mock_send_email):
    recipient_email = "abc123@gmail.com"
    temporary_password = "Test@12345"
    login_url = "http://localhost:5173/login"

    send_password_reset_email(
        recipient_email=recipient_email,
        temporary_password=temporary_password,
        login_url=login_url,
    )

    mock_send_email.assert_called_once()

    call_kwargs = mock_send_email.call_args.kwargs

    # Verify recipient and subject
    assert call_kwargs["recipient_email"] == recipient_email
    assert call_kwargs["subject"] == (
        "Your Mediatize HRMS Password Reset"
    )

    # Verify HTML email contains required information
    html_content = call_kwargs["html_content"]

    assert recipient_email in html_content
    assert temporary_password in html_content
    assert login_url in html_content

    # Verify plain-text fallback contains required information
    plain_text_content = call_kwargs["plain_text_content"]

    assert recipient_email in plain_text_content
    assert temporary_password in plain_text_content
    assert login_url not in plain_text_content