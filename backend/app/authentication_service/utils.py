import secrets
import string


def generate_temporary_password(length: int = 12) -> str:
    """
    Generate a secure temporary password.

    The password contains at least:
    - one uppercase letter
    - one lowercase letter
    - one digit
    - one special character
    """

    if length < 8:
        raise ValueError("Temporary password length must be at least 8")

    uppercase = string.ascii_uppercase
    lowercase = string.ascii_lowercase
    digits = string.digits
    special = "!@#$%^&*"

    # Guarantee at least one character from each required category.
    password_characters = [
        secrets.choice(uppercase),
        secrets.choice(lowercase),
        secrets.choice(digits),
        secrets.choice(special),
    ]

    all_characters = uppercase + lowercase + digits + special

    # Fill the remaining length.
    password_characters.extend(
        secrets.choice(all_characters)
        for _ in range(length - 4)
    )

    # Shuffle securely so the required characters aren't always
    # in predictable positions.
    secrets.SystemRandom().shuffle(password_characters)

    return "".join(password_characters)
