from datetime import date

from app.services.fine_rules import calculate_fine_amount, calculate_overdue_days


def test_on_time_return_has_no_overdue_days():
    assert calculate_overdue_days(date(2026, 1, 10), date(2026, 1, 10)) == 0


def test_early_return_has_no_overdue_days():
    assert calculate_overdue_days(date(2026, 1, 10), date(2026, 1, 5)) == 0


def test_late_return_counts_days():
    assert calculate_overdue_days(date(2026, 1, 10), date(2026, 1, 15)) == 5


def test_zero_overdue_days_means_no_fine():
    assert calculate_fine_amount(0, 5.0) == 0.0


def test_fine_scales_with_overdue_days():
    assert calculate_fine_amount(5, 5.0) == 25.0


def test_fine_supports_fractional_daily_rate():
    assert calculate_fine_amount(3, 2.5) == 7.5
