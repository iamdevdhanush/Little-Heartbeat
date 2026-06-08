"""Tests for weekly insights generator."""

from app.ai.weekly_insights import get_insight


def test_known_week():
    insight = get_insight(20)
    assert insight is not None
    assert insight["week"] == 20
    assert "Halfway" in insight["title"]


def test_unknown_week():
    insight = get_insight(3)
    assert insight is None


def test_extreme_week():
    insight = get_insight(42)
    assert insight is None
