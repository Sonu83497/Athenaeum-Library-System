from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.enums import UserRole
from app.models.user import User


LIBRARIAN_NAME = "Library Librarian"
LIBRARIAN_EMAIL = "librarian@library.com"
LIBRARIAN_PHONE = "9876543211"
LIBRARIAN_PASSWORD = "Library@123"


def create_librarian():
    db = SessionLocal()

    try:
        user = (
            db.query(User)
            .filter(User.email == LIBRARIAN_EMAIL)
            .first()
        )

        if user:
            print("⚠️ Librarian account already exists.")

            # Development/testing convenience:
            # ensure this account has librarian permissions.
            user.role = UserRole.LIBRARIAN
            user.is_active = True

            db.commit()
            db.refresh(user)

            print("✅ Existing account updated.")
            print(f"   ID: {user.id}")
            print(f"   Email: {user.email}")
            print(f"   Role: {user.role.value}")

            return

        user = User(
            full_name=LIBRARIAN_NAME,
            email=LIBRARIAN_EMAIL,
            phone=LIBRARIAN_PHONE,
            hashed_password=hash_password(LIBRARIAN_PASSWORD),
            role=UserRole.LIBRARIAN,
            is_active=True,
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        print()
        print("=" * 50)
        print("✅ LIBRARIAN ACCOUNT CREATED")
        print("=" * 50)
        print(f"ID       : {user.id}")
        print(f"Name     : {user.full_name}")
        print(f"Email    : {user.email}")
        print(f"Password : {LIBRARIAN_PASSWORD}")
        print(f"Role     : {user.role.value}")
        print("=" * 50)
        print()

    except Exception as exc:
        db.rollback()
        print("❌ Failed to create librarian account.")
        print(f"Error: {exc}")

    finally:
        db.close()


if __name__ == "__main__":
    create_librarian()