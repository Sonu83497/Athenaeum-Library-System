"""
Controlled tool functions exposed to the AI assistant.

DESIGN RULE: the LLM never sees a database connection or writes SQL.
It can only call these Python functions, each of which:
  1. Takes a member_id derived from the AUTHENTICATED user's JWT
     (never from the LLM's own generated arguments), so a member can
     never query another member's private data.
  2. Returns a small, pre-shaped JSON-safe dict.
  3. Uses read-only queries.

`search_books`, `get_book_details`, `search_authors`, `search_categories`,
and `get_library_statistics` are public/non-personal and safe to expose to
any authenticated user. `get_my_borrowed_books`, `get_my_due_dates`, and
`get_my_fines` are always scoped to the current member_id passed in from
the request context, never a member_id supplied by the model.
"""
from datetime import date

from sqlalchemy.orm import Session

from app.models.borrowing import BorrowTransaction, Fine
from app.models.catalog import Author, Book, Category
from app.models.enums import BorrowStatus, FineStatus
from app.services import report_service


def search_books(db: Session, query: str = "", category: str = "", author: str = "",
                  availability_only: bool = False, limit: int = 10) -> dict:
    q = db.query(Book)
    if query:
        like = f"%{query}%"
        q = q.filter(Book.title.ilike(like) | Book.isbn.ilike(like))
    if category:
        q = q.join(Book.categories).filter(Category.name.ilike(f"%{category}%"))
    if author:
        q = q.join(Book.authors).filter(Author.name.ilike(f"%{author}%"))
    if availability_only:
        q = q.filter(Book.available_copies > 0)

    limit = max(1, min(limit, 25))
    books = q.limit(limit).all()

    return {
        "results": [
            {
                "id": b.id,
                "title": b.title,
                "isbn": b.isbn,
                "authors": [a.name for a in b.authors],
                "categories": [c.name for c in b.categories],
                "available_copies": b.available_copies,
                "total_copies": b.total_copies,
                "publication_year": b.publication_year,
            }
            for b in books
        ],
        "count": len(books),
    }


def get_book_details(db: Session, book_id: int) -> dict:
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        return {"error": "Book not found"}
    return {
        "id": book.id,
        "title": book.title,
        "isbn": book.isbn,
        "description": book.description,
        "publisher": book.publisher,
        "publication_year": book.publication_year,
        "authors": [a.name for a in book.authors],
        "categories": [c.name for c in book.categories],
        "available_copies": book.available_copies,
        "total_copies": book.total_copies,
        "shelf_location": book.shelf_location,
    }


def check_book_availability(db: Session, book_id: int) -> dict:
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        return {"error": "Book not found"}
    return {
        "id": book.id,
        "title": book.title,
        "available_copies": book.available_copies,
        "is_available": book.available_copies > 0,
    }


def search_authors(db: Session, query: str, limit: int = 10) -> dict:
    limit = max(1, min(limit, 25))
    authors = db.query(Author).filter(Author.name.ilike(f"%{query}%")).limit(limit).all()
    return {"results": [{"id": a.id, "name": a.name} for a in authors]}


def search_categories(db: Session, query: str = "", limit: int = 25) -> dict:
    limit = max(1, min(limit, 50))
    q = db.query(Category)
    if query:
        q = q.filter(Category.name.ilike(f"%{query}%"))
    categories = q.limit(limit).all()
    return {"results": [{"id": c.id, "name": c.name} for c in categories]}


def get_my_borrowed_books(db: Session, member_id: int) -> dict:
    """member_id MUST come from the authenticated request context, never the model."""
    rows = (
        db.query(BorrowTransaction)
        .filter(
            BorrowTransaction.member_id == member_id,
            BorrowTransaction.status.in_([BorrowStatus.ACTIVE, BorrowStatus.OVERDUE]),
        )
        .all()
    )
    return {
        "borrowed_books": [
            {
                "transaction_id": t.id,
                "book_title": t.book.title,
                "issue_date": t.issue_date.isoformat(),
                "due_date": t.due_date.isoformat(),
                "status": t.status.value,
                "is_overdue": t.due_date < date.today(),
            }
            for t in rows
        ]
    }


def get_my_due_dates(db: Session, member_id: int) -> dict:
    rows = (
        db.query(BorrowTransaction)
        .filter(
            BorrowTransaction.member_id == member_id,
            BorrowTransaction.status.in_([BorrowStatus.ACTIVE, BorrowStatus.OVERDUE]),
        )
        .order_by(BorrowTransaction.due_date.asc())
        .all()
    )
    return {
        "due_dates": [
            {"book_title": t.book.title, "due_date": t.due_date.isoformat()}
            for t in rows
        ]
    }


def get_my_fines(db: Session, member_id: int) -> dict:
    rows = db.query(Fine).filter(Fine.member_id == member_id).all()
    unpaid_total = sum(f.amount for f in rows if f.status == FineStatus.UNPAID)
    return {
        "fines": [
            {
                "fine_id": f.id,
                "amount": f.amount,
                "overdue_days": f.overdue_days,
                "status": f.status.value,
            }
            for f in rows
        ],
        "unpaid_total": round(unpaid_total, 2),
    }


def get_library_statistics(db: Session) -> dict:
    """Non-personal aggregate stats — safe for any authenticated user."""
    stats = report_service.get_dashboard_stats(db)
    return {
        "total_books": stats.total_books,
        "available_books": stats.available_books,
        "issued_books": stats.issued_books,
        "total_members": stats.total_members,
    }


# Tool registry: name -> (callable, whether it needs the caller's member_id injected)
TOOL_REGISTRY = {
    "search_books": (search_books, False),
    "get_book_details": (get_book_details, False),
    "check_book_availability": (check_book_availability, False),
    "search_authors": (search_authors, False),
    "search_categories": (search_categories, False),
    "get_my_borrowed_books": (get_my_borrowed_books, True),
    "get_my_due_dates": (get_my_due_dates, True),
    "get_my_fines": (get_my_fines, True),
    "get_library_statistics": (get_library_statistics, False),
}
