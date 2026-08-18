import logging

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import (
    auth,
    books,
    borrow,
    chat,
    feedback,
    fines,
    members,
    notifications,
    reports,
)
from app.core.config import settings
from app.core.database import Base, engine
from app import models  # noqa: F401 - ensures all models are registered on Base.metadata


# ============================================================
# Logging
# ============================================================

logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG
)

logger = logging.getLogger("library_api")


# ============================================================
# FastAPI Application
# ============================================================

app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "Library Management System API with an integrated "
        "AI Library Assistant."
    ),
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Global Error Handling
# ============================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(
    request: Request,
    exc: HTTPException,
):
    """
    Handles FastAPI HTTP exceptions and returns
    a consistent JSON response.
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": str(exc.detail),
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
):
    """
    Handles Pydantic/FastAPI validation errors.

    Pydantic validation errors can contain non-JSON-serializable
    objects such as ValueError inside the 'ctx' field. Therefore,
    we explicitly construct a safe JSON response instead of
    returning exc.errors() directly.
    """

    errors = []

    for error in exc.errors():
        error_data = {
            "loc": list(error.get("loc", [])),
            "msg": str(error.get("msg", "Validation error")),
            "type": str(error.get("type", "validation_error")),
        }

        errors.append(error_data)

    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "message": "Validation error",
            "errors": errors,
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(
    request: Request,
    exc: Exception,
):
    """
    Handles unexpected application errors.

    Detailed errors are returned only in development mode.
    Production responses hide internal implementation details.
    """

    logger.exception(
        "Unhandled error on %s %s",
        request.method,
        request.url.path,
    )

    detail = (
        str(exc)
        if settings.DEBUG
        else "An unexpected error occurred"
    )

    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": detail,
        },
    )


# ============================================================
# Startup
# ============================================================

@app.on_event("startup")
def on_startup():
    """
    For local/development convenience, automatically create
    SQLite tables.

    In production, Alembic migrations should be used instead.
    """

    if settings.DATABASE_URL.startswith("sqlite"):
        Base.metadata.create_all(bind=engine)


# ============================================================
# Health Check
# ============================================================

@app.get(
    "/api/health",
    tags=["health"],
)
def health_check():
    """
    Returns API health/status information.
    """

    return {
        "status": "ok",
        "env": settings.ENV,
    }


# ============================================================
# API Routers
# ============================================================

app.include_router(auth.router)
app.include_router(books.router)
app.include_router(members.router)
app.include_router(borrow.router)
app.include_router(fines.router)
app.include_router(reports.router)
app.include_router(feedback.router)
app.include_router(notifications.router)
app.include_router(chat.router)