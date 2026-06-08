"""Rule-based prescription text parser (mirrors src/utils/prescriptionParser.js)."""

import re
from typing import Optional


_SKIP_NAMES = {
    "take", "takes", "taking", "taken",
    "once", "twice", "three", "four", "five",
    "daily", "weekly", "monthly",
    "before", "after", "with", "without",
    "morning", "evening", "night", "bedtime",
    "by mouth", "orally", "topically",
    "dr.", "doctor", "patient", "refills",
    "dispense", "quantity", "generic", "label",
    "breakfast", "lunch", "dinner", "meal",
}

_FREQUENCY_PATTERNS = [
    re.compile(r, re.IGNORECASE)
    for r in (
        r"\d+\s*(times?\s*)?(a|per)\s*day",
        r"(daily|bid|tid|q[dh]|every\s+\d+)",
        r"(twice|three\s*times|four\s*times)\s*(a\s*)?day",
    )
]


def parse_prescription_text(raw: str) -> list[dict]:
    lines = [l.strip() for l in raw.split("\n") if l.strip()]
    medications = []
    current = {}

    for line in lines:
        lower = line.lower().strip()

        if "mg" in lower or "mcg" in lower or "ml" in lower:
            current["dosage"] = line
        elif not line[0].isalpha():
            continue
        elif _is_frequency(lower):
            current["frequency"] = _normalize_frequency(line)
        elif _is_timing(lower):
            current["timing"] = line
        elif re.match(r"(take|directions|instruction)", lower):
            current["instructions"] = line
        elif line[0].isupper() and lower.split()[0] not in _SKIP_NAMES:
            if current.get("name"):
                medications.append(_finalize(current))
            current = {"name": line}

    if current.get("name"):
        medications.append(_finalize(current))

    return medications


def _is_frequency(lower: str) -> bool:
    return any(p.search(lower) for p in _FREQUENCY_PATTERNS)


def _is_timing(lower: str) -> bool:
    tokens = set(lower.split())
    timing_words = {"before", "after", "with", "without", "hour", "hours", "accompany"}
    return bool(tokens & timing_words)


def _normalize_frequency(text: str) -> str:
    text = text.lower().strip()
    mapping = {
        "qd": "Once daily", "bid": "Twice daily", "tid": "Three times daily",
        "qid": "Four times daily", "daily": "Once daily",
    }
    return mapping.get(text, text)


def _finalize(entry: dict) -> dict:
    return {
        "name": entry.get("name", "Unknown"),
        "dosage": entry.get("dosage"),
        "frequency": entry.get("frequency"),
        "timing": entry.get("timing"),
        "instructions": entry.get("instructions"),
    }
