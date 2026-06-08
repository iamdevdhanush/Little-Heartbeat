"""Tests for the rule-based prescription parser."""

from app.services.prescription_parser import parse_prescription_text


def test_parse_simple():
    text = """Amoxicillin
500 mg
Take twice a day
With food"""
    result = parse_prescription_text(text)
    assert len(result) >= 1
    entry = result[0]
    assert entry["name"] == "Amoxicillin"
    assert entry["dosage"] == "500 mg"
    assert entry["frequency"] is not None


def test_parse_multiple():
    text = """Metformin
500 mg
Twice daily

Lisinopril
10 mg
Once daily
Before breakfast"""
    result = parse_prescription_text(text)
    assert len(result) == 2
    assert result[0]["name"] == "Metformin"
    assert result[1]["name"] == "Lisinopril"


def test_empty():
    assert parse_prescription_text("") == []
