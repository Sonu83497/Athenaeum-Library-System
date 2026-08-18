import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base, get_db
from app.main import app


@pytest.fixture()
def db_session():
    engine = create_engine(
        "sqlite:///:memory:", connect_args={"check_same_thread": False}
    )
    TestingSessionLocal = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def client(db_session):
    def _override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def register_and_login(client, email="test@example.com", password="Password123", name="Test User"):
    client.post("/api/auth/register", json={
        "full_name": name, "email": email, "password": password,
    })
    resp = client.post("/api/auth/login", json={"email": email, "password": password})
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def create_staff_and_login(client, db_session, role, email, password="Password123", name="Staff User"):
    """Creates a user with an elevated role directly via the DB session (registration
    always creates plain members), then logs in through the real API to get a token."""
    from app.core.security import hash_password
    from app.models.user import User

    user = User(full_name=name, email=email, hashed_password=hash_password(password), role=role)
    db_session.add(user)
    db_session.commit()

    resp = client.post("/api/auth/login", json={"email": email, "password": password})
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}, user
