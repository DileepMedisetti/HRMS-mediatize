from app.core.security import hash_password, verify_password


def test_password_is_hashed():
    password = "hr1234"

    hashed_password = hash_password(password)

    assert hashed_password != password
    assert len(hashed_password) > 0


def test_correct_password_is_verified():
    password = "hr1234"

    hashed_password = hash_password(password)

    assert verify_password(
        password,
        hashed_password,
    ) is True


def test_wrong_password_is_rejected():
    password = "hr1234"
    wrong_password = "wrongpassword"

    hashed_password = hash_password(password)

    assert verify_password(
        wrong_password,
        hashed_password,
    ) is False


def test_same_password_generates_different_hashes():
    password = "hr1234"

    hash_1 = hash_password(password)
    hash_2 = hash_password(password)

    assert hash_1 != hash_2

    assert verify_password(password, hash_1) is True
    assert verify_password(password, hash_2) is True