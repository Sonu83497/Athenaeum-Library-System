"""
Fine calculation is intentionally isolated from the DB/ORM layer so the
business rule (overdue_days * daily_fine) can be unit tested in complete
isolation and is never duplicated in the frontend.
"""
from datetime import date


def calculate_overdue_days(due_date: date, return_date: date) -> int:
    """Days late. Returns 0 if returned on/before the due date."""
    delta = (return_date - due_date).days
    return max(delta, 0)


def calculate_fine_amount(overdue_days: int, daily_fine: float) -> float:
    if overdue_days <= 0:
        return 0.0
    return round(overdue_days * daily_fine, 2)
