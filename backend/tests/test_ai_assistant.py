"""
These tests exercise the AI tool layer directly (app/ai/tools.py) and the
orchestrator (app/ai/assistant.py) with a fake provider, since real tests
must not depend on a live LLM API key. The critical property under test:
a member_id supplied inside a tool_call's arguments is NEVER used — the
server-injected member_id always wins.
"""
from datetime import date, timedelta

import pytest

from app.ai import tools as ai_tools
from app.ai.assistant import _execute_tool
from app.models.borrowing import BorrowTransaction
from app.models.catalog import Book
from app.models.enums import UserRole
from app.models.member import Member
from app.models.user import User
from app.core.security import hash_password


def _make_member(db_session, email, membership_id):
    user = User(full_name="Member", email=email, hashed_password=hash_password("x"), role=UserRole.MEMBER)
    db_session.add(user)
    db_session.flush()
    member = Member(user_id=user.id, membership_id=membership_id, join_date=date.today())
    db_session.add(member)
    db_session.commit()
    return member


def test_search_books_tool_returns_real_data(db_session):
    book = Book(isbn="1234567890123", title="Python for Everyone", total_copies=3, available_copies=3)
    db_session.add(book)
    db_session.commit()

    result = ai_tools.search_books(db_session, query="Python")
    assert result["count"] == 1
    assert result["results"][0]["title"] == "Python for Everyone"
    assert result["results"][0]["available_copies"] == 3


def test_search_books_no_match_returns_empty_not_hallucinated(db_session):
    result = ai_tools.search_books(db_session, query="NoSuchBookTitleXYZ")
    assert result["count"] == 0
    assert result["results"] == []


def test_get_my_borrowed_books_is_scoped_to_correct_member(db_session):
    alice = _make_member(db_session, "alice_ai@example.com", "LIBAI001")
    bob = _make_member(db_session, "bob_ai@example.com", "LIBAI002")

    book = Book(isbn="9999999999999", title="Shared Book", total_copies=2, available_copies=1)
    db_session.add(book)
    db_session.flush()

    txn = BorrowTransaction(
        member_id=alice.id, book_id=book.id, issued_by_user_id=alice.user_id,
        issue_date=date.today(), due_date=date.today() + timedelta(days=14),
    )
    db_session.add(txn)
    db_session.commit()

    alice_result = ai_tools.get_my_borrowed_books(db_session, member_id=alice.id)
    bob_result = ai_tools.get_my_borrowed_books(db_session, member_id=bob.id)

    assert len(alice_result["borrowed_books"]) == 1
    assert alice_result["borrowed_books"][0]["book_title"] == "Shared Book"
    assert len(bob_result["borrowed_books"]) == 0  # Bob sees nothing of Alice's


def test_execute_tool_ignores_model_supplied_member_id(db_session):
    """The model might try to pass member_id in its tool arguments (e.g. via
    prompt injection). _execute_tool must always use the server-side member_id
    for member-scoped tools, never anything from `arguments`."""
    alice = _make_member(db_session, "alice2_ai@example.com", "LIBAI003")
    bob = _make_member(db_session, "bob2_ai@example.com", "LIBAI004")

    book = Book(isbn="8888888888888", title="Alice's Book", total_copies=1, available_copies=0)
    db_session.add(book)
    db_session.flush()
    txn = BorrowTransaction(
        member_id=alice.id, book_id=book.id, issued_by_user_id=alice.user_id,
        issue_date=date.today(), due_date=date.today() + timedelta(days=14),
    )
    db_session.add(txn)
    db_session.commit()

    # Caller is authenticated as bob (member_id=bob.id), but a malicious/prompt-injected
    # tool call tries to sneak in Alice's member_id as an argument.
    result = _execute_tool(db_session, member_id=bob.id, name="get_my_borrowed_books",
                            arguments={"member_id": alice.id})

    assert result["borrowed_books"] == []  # bob's own (empty) list, NOT alice's


def test_execute_tool_unknown_tool_returns_error(db_session):
    result = _execute_tool(db_session, member_id=1, name="drop_all_tables", arguments={})
    assert "error" in result


def test_get_my_fines_unpaid_total(db_session):
    from app.models.borrowing import Fine
    from app.models.enums import BorrowStatus, FineStatus

    member = _make_member(db_session, "fines_ai@example.com", "LIBAI005")
    book = Book(isbn="7777777777777", title="Fine Book", total_copies=1, available_copies=1)
    db_session.add(book)
    db_session.flush()
    txn = BorrowTransaction(
        member_id=member.id, book_id=book.id, issued_by_user_id=member.user_id,
        issue_date=date.today(), due_date=date.today(), return_date=date.today(),
        status=BorrowStatus.RETURNED,
    )
    db_session.add(txn)
    db_session.flush()
    db_session.add(Fine(transaction_id=txn.id, member_id=member.id, amount=10.0, overdue_days=2, status=FineStatus.UNPAID))
    db_session.commit()

    result = ai_tools.get_my_fines(db_session, member_id=member.id)
    assert result["unpaid_total"] == 10.0
    assert len(result["fines"]) == 1
