"""Tests for week calculator."""

from datetime import date, timedelta
from app.services.week_calculator import calculate_week


def test_exactly_40_weeks_out():
    due = date.today() + timedelta(days=280)
    week, progress = calculate_week(due)
    assert week == 0
    assert 0.0 <= progress < 0.1


def test_halfway():
    due = date.today() + timedelta(days=140)
    week, progress = calculate_week(due)
    assert week == 20
    assert abs(progress - 0.5) < 0.02


def test_past_due():
    past = date.today() - timedelta(days=10)
    week, progress = calculate_week(past)
    assert week == 40
    assert progress == 1.0
