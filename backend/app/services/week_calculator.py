"""Week-of-pregnancy calculator (mirrors src/utils/weekCalculator.js)."""

from datetime import date, datetime


def calculate_week(due_date: date, reference: date | None = None) -> tuple[int, float]:
    ref = reference or date.today()
    days_remaining = (due_date - ref).days
    total_days = 280  # 40 weeks
    days_elapsed = total_days - days_remaining
    week = max(0, min(40, int(days_elapsed // 7)))
    progress = max(0.0, min(1.0, days_elapsed / total_days))
    return week, progress
