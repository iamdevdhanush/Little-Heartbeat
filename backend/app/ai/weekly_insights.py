"""
Weekly pregnancy insights generator (mirrors src/ai/weeklyInsights.js).

Pulls context from the database and returns structured advice for the current week.
"""

from dataclasses import dataclass


@dataclass
class WeeklyInsight:
    week: int
    title: str
    description: str
    tip: str
    emoji: str


_INSIGHTS: dict[int, WeeklyInsight] = {}


def _build_insights():
    if _INSIGHTS:
        return
    data = [
        (4, " implantation", "Your baby is implanting in the uterus.", "Start taking prenatal vitamins with folic acid.", "🌟"),
        (8, "Heartbeat Begins", "Your baby's heart is now beating!", "Schedule your first ultrasound.", "💓"),
        (12, "Tiny Features", "Fingers, toes, and facial features are forming.", "Stay hydrated and eat nutrient-rich foods.", "👶"),
        (16, "Movement Time", "You may start feeling flutters — quickening!", "Track movement patterns.", "🦋"),
        (20, "Halfway There", "Anatomy scan is usually done this week.", "Ask your doctor about the anatomy scan.", "🎉"),
        (24, "Growing Rapidly", "Baby is now over a pound!", "Sleep on your side, not your back.", "🌙"),
        (28, "Third Trimester", "Welcome to the final stretch!", "Start preparing your hospital bag.", "🧳"),
        (32, "Practice Breathing", "Baby practices breathing movements.", "Monitor kick counts daily.", "🫁"),
        (36, "Dropping", "Baby may drop into the pelvis.", "Watch for signs of labor.", "⬇️"),
        (40, "Full Term", "Your baby is full term and ready!", "Stay calm, rest, and call your doctor at first sign of labor.", "🎊"),
    ]
    for w, t, d, tip, emoji in data:
        _INSIGHTS[w] = WeeklyInsight(week=w, title=t, description=d, tip=tip, emoji=emoji)


def get_insight(week: int) -> dict | None:
    _build_insights()
    insight = _INSIGHTS.get(week)
    if not insight:
        return None
    return {
        "week": insight.week,
        "title": insight.title,
        "description": insight.description,
        "tip": insight.tip,
        "emoji": insight.emoji,
    }
