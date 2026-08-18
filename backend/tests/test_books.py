from tests.conftest import create_staff_and_login
from app.models.enums import UserRole


def _admin_headers(client, db_session):
    headers, _ = create_staff_and_login(client, db_session, UserRole.ADMIN, "admin1@example.com")
    return headers


def test_create_book(client, db_session):
    headers = _admin_headers(client, db_session)
    resp = client.post("/api/books", json={
        "isbn": "9780132350884", "title": "Clean Code", "total_copies": 3,
        "author_names": ["Robert C. Martin"], "category_names": ["Programming"],
    }, headers=headers)
    assert resp.status_code == 201
    body = resp.json()
    assert body["available_copies"] == 3
    assert body["authors"][0]["name"] == "Robert C. Martin"


def test_create_book_duplicate_isbn_rejected(client, db_session):
    headers = _admin_headers(client, db_session)
    payload = {"isbn": "9780132350884", "title": "Clean Code", "total_copies": 1}
    client.post("/api/books", json=payload, headers=headers)
    resp = client.post("/api/books", json=payload, headers=headers)
    assert resp.status_code == 409


def test_create_book_invalid_isbn_rejected(client, db_session):
    headers = _admin_headers(client, db_session)
    resp = client.post("/api/books", json={
        "isbn": "not-an-isbn", "title": "Bad Book", "total_copies": 1,
    }, headers=headers)
    assert resp.status_code == 422


def test_search_books_by_title(client, db_session):
    headers = _admin_headers(client, db_session)
    client.post("/api/books", json={"isbn": "1111111111", "title": "Python Basics", "total_copies": 2}, headers=headers)
    client.post("/api/books", json={"isbn": "2222222222", "title": "Java Basics", "total_copies": 2}, headers=headers)

    resp = client.get("/api/books", params={"q": "Python"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["total"] == 1
    assert body["items"][0]["title"] == "Python Basics"


def test_delete_book(client, db_session):
    headers = _admin_headers(client, db_session)
    create_resp = client.post("/api/books", json={"isbn": "3333333333", "title": "Temp Book", "total_copies": 1}, headers=headers)
    book_id = create_resp.json()["id"]

    del_resp = client.delete(f"/api/books/{book_id}", headers=headers)
    assert del_resp.status_code == 204

    get_resp = client.get(f"/api/books/{book_id}")
    assert get_resp.status_code == 404


def test_pagination(client, db_session):
    headers = _admin_headers(client, db_session)
    for i in range(15):
        client.post("/api/books", json={"isbn": f"{9000000000 + i}", "title": f"Book {i}", "total_copies": 1}, headers=headers)

    resp = client.get("/api/books", params={"page": 1, "page_size": 10})
    body = resp.json()
    assert len(body["items"]) == 10
    assert body["total"] == 15
    assert body["total_pages"] == 2
