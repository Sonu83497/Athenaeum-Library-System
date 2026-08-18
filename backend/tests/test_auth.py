def test_register_creates_member_account(client):
    resp = client.post("/api/auth/register", json={
        "full_name": "Jane Doe", "email": "jane@example.com", "password": "Password123",
    })
    assert resp.status_code == 201
    body = resp.json()
    assert body["role"] == "member"
    assert body["membership_id"].startswith("LIB")


def test_register_duplicate_email_rejected(client):
    payload = {"full_name": "Jane Doe", "email": "dup@example.com", "password": "Password123"}
    client.post("/api/auth/register", json=payload)
    resp = client.post("/api/auth/register", json=payload)
    assert resp.status_code == 409


def test_register_weak_password_rejected(client):
    resp = client.post("/api/auth/register", json={
        "full_name": "Jane Doe", "email": "weak@example.com", "password": "alllettersnodigits",
    })
    assert resp.status_code == 422


def test_login_success_returns_token(client):
    client.post("/api/auth/register", json={
        "full_name": "Jane Doe", "email": "login@example.com", "password": "Password123",
    })
    resp = client.post("/api/auth/login", json={"email": "login@example.com", "password": "Password123"})
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_login_wrong_password_rejected(client):
    client.post("/api/auth/register", json={
        "full_name": "Jane Doe", "email": "wrongpw@example.com", "password": "Password123",
    })
    resp = client.post("/api/auth/login", json={"email": "wrongpw@example.com", "password": "WrongPass1"})
    assert resp.status_code == 401


def test_me_requires_authentication(client):
    resp = client.get("/api/auth/me")
    assert resp.status_code == 401


def test_me_returns_current_user(client):
    from tests.conftest import register_and_login
    headers = register_and_login(client, email="me@example.com")
    resp = client.get("/api/auth/me", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["email"] == "me@example.com"


def test_member_cannot_access_admin_only_book_create(client):
    from tests.conftest import register_and_login
    headers = register_and_login(client, email="notadmin@example.com")
    resp = client.post("/api/books", json={
        "isbn": "1234567890", "title": "Some Book", "total_copies": 1,
    }, headers=headers)
    assert resp.status_code == 403
