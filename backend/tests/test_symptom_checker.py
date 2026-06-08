"""Tests for the symptom checker AI module."""

from app.ai.symptom_checker import assess_symptom, get_triage_action


def test_critical_symptom():
    result = assess_symptom("severe bleeding and unconscious")
    assert result["severity"] == "critical"
    assert get_triage_action("critical") == "call_emergency"


def test_warning_symptom():
    result = assess_symptom("I have a fever and headache")
    assert result["severity"] == "caution"
    assert get_triage_action("caution") == "monitor"


def test_warning_with_response():
    result = assess_symptom("pain and not responding")
    assert result["severity"] == "warning"
    assert get_triage_action("warning") == "contact_doctor"


def test_info():
    result = assess_symptom("I feel great today")
    assert result["severity"] == "info"


def test_empty():
    result = assess_symptom("")
    assert result["severity"] == "info"
