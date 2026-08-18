import enum


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    LIBRARIAN = "librarian"
    MEMBER = "member"


class MemberStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"


class BorrowStatus(str, enum.Enum):
    ACTIVE = "active"
    RETURNED = "returned"
    OVERDUE = "overdue"


class FineStatus(str, enum.Enum):
    UNPAID = "unpaid"
    PAID = "paid"
    WAIVED = "waived"


class NotificationType(str, enum.Enum):
    BOOK_ISSUED = "book_issued"
    BOOK_RETURNED = "book_returned"
    DUE_SOON = "due_soon"
    OVERDUE = "overdue"
    FINE_GENERATED = "fine_generated"
    GENERAL = "general"
