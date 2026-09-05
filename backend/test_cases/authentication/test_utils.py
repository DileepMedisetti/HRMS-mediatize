from app.authentication_service.utils import generate_temporary_password


def test_generate_temporary_password_default_length():
    password = generate_temporary_password()

    assert len(password) == 12


def test_generate_temporary_password_custom_length():
    password = generate_temporary_password(16)

    assert len(password) == 16


def test_generate_temporary_password_contains_required_characters():
    password = generate_temporary_password()

    assert any(char.isupper() for char in password)
    assert any(char.islower() for char in password)
    assert any(char.isdigit() for char in password)
    assert any(char in "!@#$%^&*" for char in password)


def test_generate_temporary_password_is_different():
    password1 = generate_temporary_password()
    password2 = generate_temporary_password()

    assert password1 != password2


def test_generate_temporary_password_rejects_short_length():
    try:
        generate_temporary_password(7)
        assert False
    except ValueError as exc:
        assert str(exc) == "Temporary password length must be at least 8"