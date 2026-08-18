from datetime import date, timedelta

from tests.conftest import create_staff_and_login, register_and_login
from app.models.enums import UserRole


def _setup_book_and_member(client, db_session, total_copies=1):
    admin_headers, admin_user = create_staff_and_login(client, db_session, UserRole.ADMIN, "admin2@example.com")
    book_resp = client.post("/api/books", json={
        "isbn": "5555555555", "title": "Borrow Test Book", "total_copies": total_copies,
    }, headers=admin_headers)
    book_id = book_resp.json()["id"]

    register_and_login(client, email="borrower@example.com")
    member_resp = client.get("/api/members", headers=admin_headers)
    member_id = member_resp.json()[0]["id"]

    return admin_headers, book_id, member_id


def test_issue_book_success(client, db_session):
    headers, book_id, member_id = _setup_book_and_member(client, db_session)
    resp = client.post("/api/borrow", json={"member_id": member_id, "book_id": book_id}, headers=headers)
    assert resp.status_code == 201
    assert resp.json()["status"] == "active"

    book = client.get(f"/api/books/{book_id}").json()
    assert book["available_copies"] == 0


def test_borrow_unavailable_book_rejected(client, db_session):
    headers, book_id, member_id = _setup_book_and_member(client, db_session, total_copies=1)
    client.post("/api/borrow", json={"member_id": member_id, "book_id": book_id}, headers=headers)

    register_and_login(client, email="second_borrower@example.com")
    second_member_resp = client.get("/api/members", headers=headers)
    second_member = [m for m in second_member_resp.json() if m["email"] == "second_borrower@example.com"][0]

    resp = client.post("/api/borrow", json={"member_id": second_member["id"], "book_id": book_id}, headers=headers)
    assert resp.status_code == 400
    assert "unavailable" in resp.json()["message"].lower()


def test_zero_available_copies_blocks_issue(client, db_session):
    headers, book_id, member_id = _setup_book_and_member(client, db_session, total_copies=0)
    resp = client.post("/api/borrow", json={"member_id": member_id, "book_id": book_id}, headers=headers)
    assert resp.status_code == 400


def test_return_already_returned_book_rejected(client, db_session):
    headers, book_id, member_id = _setup_book_and_member(client, db_session)
    issue_resp = client.post("/api/borrow", json={"member_id": member_id, "book_id": book_id}, headers=headers)
    txn_id = issue_resp.json()["id"]

    first = client.post(f"/api/borrow/{txn_id}/return", headers=headers)
    assert first.status_code == 200

    second = client.post(f"/api/borrow/{txn_id}/return", headers=headers)
    assert second.status_code == 400


def test_return_increments_available_copies(client, db_session):
    headers, book_id, member_id = _setup_book_and_member(client, db_session)
    issue_resp = client.post("/api/borrow", json={"member_id": member_id, "book_id": book_id}, headers=headers)
    txn_id = issue_resp.json()["id"]

    assert client.get(f"/api/books/{book_id}").json()["available_copies"] == 0
    client.post(f"/api/borrow/{txn_id}/return", headers=headers)
    assert client.get(f"/api/books/{book_id}").json()["available_copies"] == 1


def test_invalid_book_id_on_issue(client, db_session):
    headers, _book_id, member_id = _setup_book_and_member(client, db_session)
    resp = client.post("/api/borrow", json={"member_id": member_id, "book_id": 999999}, headers=headers)
    assert resp.status_code == 404


def test_invalid_member_id_on_issue(client, db_session):
    headers, book_id, _member_id = _setup_book_and_member(client, db_session)
    resp = client.post("/api/borrow", json={"member_id": 999999, "book_id": book_id}, headers=headers)
    assert resp.status_code == 404


def test_unauthorized_member_cannot_issue_books(client, db_session):
    headers, book_id, member_id = _setup_book_and_member(client, db_session)
    member_headers = register_and_login(client, email="not_staff@example.com")
    resp = client.post("/api/borrow", json={"member_id": member_id, "book_id": book_id}, headers=member_headers)
    assert resp.status_code == 403


def test_overdue_return_generates_fine(client, db_session, monkeypatch):
    """Simulate an overdue return by directly backdating the transaction's due_date."""
    headers, book_id, member_id = _setup_book_and_member(client, db_session)
    issue_resp = client.post("/api/borrow", json={"member_id": member_id, "book_id": book_id}, headers=headers)
    txn_id = issue_resp.json()["id"]

    from app.models.borrowing import BorrowTransaction
    txn = db_session.query(BorrowTransaction).filter(BorrowTransaction.id == txn_id).first()
    txn.due_date = date.today() - timedelta(days=3)
    db_session.commit()

    return_resp = client.post(f"/api/borrow/{txn_id}/return", headers=headers)
    assert return_resp.status_code == 200

    fines_resp = client.get("/api/fines", headers=headers)
    fines = fines_resp.json()
    assert len(fines) == 1
    assert fines[0]["overdue_days"] == 3
    assert fines[0]["amount"] == 15.0  # 3 days * default 5.0/day
    assert fines[0]["status"] == "unpaid"
