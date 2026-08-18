from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_staff
from app.models.user import User
from app.schemas.catalog import BookCreate, BookOut, BookUpdate, PaginatedBooks
from app.services import catalog_service

router = APIRouter(prefix="/api/books", tags=["books"])


@router.get("", response_model=PaginatedBooks)
def list_books(
    q: Optional[str] = Query(default=None, description="Search title or ISBN"),
    category: Optional[str] = None,
    author: Optional[str] = None,
    publisher: Optional[str] = None,
    availability: Optional[str] = Query(default=None, pattern="^(available|unavailable)$"),
    publication_year: Optional[int] = None,
    sort_by: str = Query(default="title", pattern="^(title|newest|availability)$"),
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
):
    items, total, page, page_size, total_pages = catalog_service.search_books(
        db, query=q, category=category, author=author, publisher=publisher,
        availability=availability, publication_year=publication_year,
        sort_by=sort_by, page=page, page_size=page_size,
    )
    return PaginatedBooks(
        items=[BookOut.model_validate(b) for b in items],
        total=total, page=page, page_size=page_size, total_pages=total_pages,
    )


@router.get("/{book_id}", response_model=BookOut)
def get_book(book_id: int, db: Session = Depends(get_db)):
    return catalog_service.get_book(db, book_id)


@router.post("", response_model=BookOut, status_code=201)
def create_book(payload: BookCreate, db: Session = Depends(get_db), _staff: User = Depends(require_staff)):
    return catalog_service.create_book(db, payload)


@router.put("/{book_id}", response_model=BookOut)
def update_book(book_id: int, payload: BookUpdate, db: Session = Depends(get_db), _staff: User = Depends(require_staff)):
    return catalog_service.update_book(db, book_id, payload)


@router.delete("/{book_id}", status_code=204)
def delete_book(book_id: int, db: Session = Depends(get_db), _staff: User = Depends(require_staff)):
    catalog_service.delete_book(db, book_id)
