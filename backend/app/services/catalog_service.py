import math
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.catalog import Author, Book, Category
from app.schemas.catalog import BookCreate, BookUpdate


def _get_or_create_authors(db: Session, names: list[str]) -> list[Author]:
    authors = []
    for name in names:
        name = name.strip()
        if not name:
            continue
        author = db.query(Author).filter(Author.name == name).first()
        if not author:
            author = Author(name=name)
            db.add(author)
            db.flush()
        authors.append(author)
    return authors


def _get_or_create_categories(db: Session, names: list[str]) -> list[Category]:
    categories = []
    for name in names:
        name = name.strip()
        if not name:
            continue
        category = db.query(Category).filter(Category.name == name).first()
        if not category:
            category = Category(name=name)
            db.add(category)
            db.flush()
        categories.append(category)
    return categories


def create_book(db: Session, payload: BookCreate) -> Book:
    existing = db.query(Book).filter(Book.isbn == payload.isbn).first()
    if existing:
        raise HTTPException(status.HTTP_409_CONFLICT, "A book with this ISBN already exists")

    book = Book(
        isbn=payload.isbn,
        title=payload.title,
        description=payload.description,
        publisher=payload.publisher,
        publication_year=payload.publication_year,
        language=payload.language,
        edition=payload.edition,
        shelf_location=payload.shelf_location,
        total_copies=payload.total_copies,
        available_copies=payload.total_copies,
        cover_image_url=payload.cover_image_url,
    )
    book.authors = _get_or_create_authors(db, payload.author_names)
    book.categories = _get_or_create_categories(db, payload.category_names)

    db.add(book)
    db.commit()
    db.refresh(book)
    return book


def update_book(db: Session, book_id: int, payload: BookUpdate) -> Book:
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Book not found")

    data = payload.model_dump(exclude_unset=True, exclude={"author_names", "category_names"})
    for field, value in data.items():
        setattr(book, field, value)

    if payload.total_copies is not None:
        # Keep available_copies consistent: shift by the delta so active loans aren't lost.
        issued = book.total_copies - book.available_copies if book.total_copies else 0
        book.available_copies = max(payload.total_copies - issued, 0)

    if payload.author_names is not None:
        book.authors = _get_or_create_authors(db, payload.author_names)
    if payload.category_names is not None:
        book.categories = _get_or_create_categories(db, payload.category_names)

    db.commit()
    db.refresh(book)
    return book


def delete_book(db: Session, book_id: int) -> None:
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Book not found")
    db.delete(book)
    db.commit()


def get_book(db: Session, book_id: int) -> Book:
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Book not found")
    return book


def search_books(
    db: Session,
    query: Optional[str] = None,
    category: Optional[str] = None,
    author: Optional[str] = None,
    publisher: Optional[str] = None,
    availability: Optional[str] = None,  # "available" | "unavailable"
    publication_year: Optional[int] = None,
    sort_by: str = "title",
    page: int = 1,
    page_size: int = 20,
):
    q = db.query(Book).distinct()

    if query:
        like = f"%{query}%"
        q = q.filter(or_(Book.title.ilike(like), Book.isbn.ilike(like)))
    if category:
        q = q.join(Book.categories).filter(Category.name.ilike(f"%{category}%"))
    if author:
        q = q.join(Book.authors).filter(Author.name.ilike(f"%{author}%"))
    if publisher:
        q = q.filter(Book.publisher.ilike(f"%{publisher}%"))
    if publication_year:
        q = q.filter(Book.publication_year == publication_year)
    if availability == "available":
        q = q.filter(Book.available_copies > 0)
    elif availability == "unavailable":
        q = q.filter(Book.available_copies == 0)

    sort_map = {
        "title": Book.title.asc(),
        "newest": Book.publication_year.desc(),
        "availability": Book.available_copies.desc(),
    }
    q = q.order_by(sort_map.get(sort_by, Book.title.asc()))

    total = q.count()
    page = max(page, 1)
    page_size = max(min(page_size, 100), 1)
    items = q.offset((page - 1) * page_size).limit(page_size).all()
    total_pages = max(math.ceil(total / page_size), 1)

    return items, total, page, page_size, total_pages
