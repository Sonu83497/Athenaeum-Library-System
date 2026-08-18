"""
Seed the database with demo users, members, authors, categories, and books.

Run from the backend/ directory after installing requirements and setting
up your .env:

    python -m app.utils.seed

Safe to re-run: skips creation if data already exists.
"""
from datetime import date

from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.models.catalog import Author, Book, Category
from app.models.enums import UserRole
from app.models.member import Member
from app.models.user import User

DEMO_CATALOG = [
    # (isbn, title, publisher, year, total_copies, authors, categories)
    ("9780132350884", "Clean Code", "Prentice Hall", 2008, 4, ["Robert C. Martin"], ["Programming"]),
    ("9781593279288", "Python Crash Course", "No Starch Press", 2019, 5, ["Eric Matthes"], ["Programming"]),
    ("9780134757599", "Refactoring", "Addison-Wesley", 2018, 3, ["Martin Fowler"], ["Programming"]),
    ("9780451524935", "1984", "Signet Classics", 1961, 6, ["George Orwell"], ["Fiction"]),
    ("9780061120084", "To Kill a Mockingbird", "Harper Perennial", 2006, 4, ["Harper Lee"], ["Fiction"]),
    ("9780345539434", "Cosmos", "Ballantine Books", 2013, 2, ["Carl Sagan"], ["Science"]),
    ("9780062316097", "Sapiens", "Harper", 2015, 5, ["Yuval Noah Harari"], ["Business"]),
    ("9781847941831", "Atomic Habits", "Avery", 2018, 6, ["James Clear"], ["Self-Help"]),
    ("9780553418026", "The Martian", "Crown", 2014, 3, ["Andy Weir"], ["Fiction"]),
    ("9780439708180", "Harry Potter and the Sorcerer's Stone", "Scholastic", 1998, 8, ["J.K. Rowling"], ["Fiction"]),
    ("9780596517748", "JavaScript: The Good Parts", "O'Reilly", 2008, 3, ["Douglas Crockford"], ["Programming"]),
    ("9781491904244", "You Don't Know JS: Scope & Closures", "O'Reilly", 2014, 2, ["Kyle Simpson"], ["Programming"]),
    ("9780132350889", "Clean Architecture", "Prentice Hall", 2017, 3, ["Robert C. Martin"], ["Programming"]),
    ("9781449331818", "Learning Python", "O'Reilly", 2013, 4, ["Eric Matthes"], ["Programming"]),
    ("9780321125217", "Domain-Driven Design", "Addison-Wesley", 2003, 2, ["Martin Fowler"], ["Programming"]),
    ("9780553380163", "A Brief History of Time", "Bantam", 1998, 3, ["Carl Sagan"], ["Science"]),
    ("9780743273565", "The Great Gatsby", "Scribner", 2004, 5, [], ["Fiction"]),
    ("9780857197689", "Thinking, Fast and Slow", "Farrar, Straus and Giroux", 2011, 3, [], ["Business"]),
    ("9780262033848", "Introduction to Algorithms", "MIT Press", 2009, 2, [], ["Programming"]),
    ("9780201633610", "Design Patterns", "Addison-Wesley", 1994, 2, [], ["Programming"]),
]

CATEGORY_NAMES = ["Programming", "Fiction", "Science", "Business", "Self-Help"]


def _get_or_create_category(db, name: str) -> Category:
    c = db.query(Category).filter(Category.name == name).first()
    if not c:
        c = Category(name=name)
        db.add(c)
        db.flush()
    return c


def _get_or_create_author(db, name: str) -> Author:
    a = db.query(Author).filter(Author.name == name).first()
    if not a:
        a = Author(name=name)
        db.add(a)
        db.flush()
    return a


def _create_user_and_member(db, full_name, email, password, role, membership_id):
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        return existing
    user = User(full_name=full_name, email=email, hashed_password=hash_password(password), role=role)
    db.add(user)
    db.flush()
    if role == UserRole.MEMBER:
        db.add(Member(user_id=user.id, membership_id=membership_id, join_date=date.today()))
    return user


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        for name in CATEGORY_NAMES:
            _get_or_create_category(db, name)
        db.flush()

        _create_user_and_member(db, "System Admin", "admin@library.local", "AdminPass123", UserRole.ADMIN, None)
        _create_user_and_member(db, "Head Librarian", "librarian@library.local", "LibrarianPass123", UserRole.LIBRARIAN, None)
        _create_user_and_member(db, "Alice Member", "alice@library.local", "MemberPass123", UserRole.MEMBER, "LIB100001")
        _create_user_and_member(db, "Bob Member", "bob@library.local", "MemberPass123", UserRole.MEMBER, "LIB100002")
        db.flush()

        for isbn, title, publisher, year, copies, authors, categories in DEMO_CATALOG:
            if db.query(Book).filter(Book.isbn == isbn).first():
                continue
            book = Book(
                isbn=isbn, title=title, publisher=publisher, publication_year=year,
                total_copies=copies, available_copies=copies,
            )
            book.authors = [_get_or_create_author(db, a) for a in authors]
            book.categories = [_get_or_create_category(db, c) for c in categories]
            db.add(book)

        db.commit()
        print("Seed complete.")
        print("Demo credentials:")
        print("  Admin:      admin@library.local / AdminPass123")
        print("  Librarian:  librarian@library.local / LibrarianPass123")
        print("  Member:     alice@library.local / MemberPass123")
        print("  Member:     bob@library.local / MemberPass123")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
