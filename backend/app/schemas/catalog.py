from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator


class AuthorOut(BaseModel):
    id: int
    name: str
    bio: Optional[str] = None
    model_config = {"from_attributes": True}


class CategoryOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    model_config = {"from_attributes": True}


class BookCreate(BaseModel):
    isbn: str = Field(min_length=8, max_length=20)
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    publisher: Optional[str] = None
    publication_year: Optional[int] = Field(default=None, ge=1000, le=2100)
    language: str = "English"
    edition: Optional[str] = None
    shelf_location: Optional[str] = None
    total_copies: int = Field(default=1, ge=0)
    cover_image_url: Optional[str] = None
    author_names: List[str] = Field(default_factory=list)
    category_names: List[str] = Field(default_factory=list)

    @field_validator("isbn")
    @classmethod
    def isbn_digits_only(cls, v: str) -> str:
        cleaned = v.replace("-", "").replace(" ", "")
        if not cleaned.isdigit() or len(cleaned) not in (10, 13):
            raise ValueError("ISBN must be a valid 10 or 13 digit number")
        return v


class BookUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    publisher: Optional[str] = None
    publication_year: Optional[int] = Field(default=None, ge=1000, le=2100)
    language: Optional[str] = None
    edition: Optional[str] = None
    shelf_location: Optional[str] = None
    total_copies: Optional[int] = Field(default=None, ge=0)
    cover_image_url: Optional[str] = None
    author_names: Optional[List[str]] = None
    category_names: Optional[List[str]] = None


class BookOut(BaseModel):
    id: int
    isbn: str
    title: str
    description: Optional[str] = None
    publisher: Optional[str] = None
    publication_year: Optional[int] = None
    language: str
    edition: Optional[str] = None
    shelf_location: Optional[str] = None
    total_copies: int
    available_copies: int
    cover_image_url: Optional[str] = None
    authors: List[AuthorOut] = []
    categories: List[CategoryOut] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PaginatedBooks(BaseModel):
    items: List[BookOut]
    total: int
    page: int
    page_size: int
    total_pages: int
