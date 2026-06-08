"""
Symptom checker — rule-based severity triage (mirrors src/ai/symptomChecker.js).

For production, replace with a fine-tuned model or an LLM API call.
"""

from typing import Optional

# Keywords grouped by severity
CRITICAL_KEYWORDS = {
    "severe bleeding", "unconscious", "not breathing", "chest pain",
    "seizure", "stroke", "head injury", "no movement",
}
WARNING_KEYWORDS = {
    "bleeding", "pain", "contraction", "fever", "vomiting",
    "dizziness", "blurred vision", "swelling", "headache",
    "decreased movement",
}
RESPONSE_KEYWORDS = {
    "no", "none", "stopped", "can't feel", "not moving",
    "not responding",
}


def assess_symptom(text: str) -> dict:
    """Assess symptom severity based on keyword matching."""
    lower = text.lower()
    has_critical = any(kw in lower for kw in CRITICAL_KEYWORDS)
    has_warning = any(kw in lower for kw in WARNING_KEYWORDS)
    has_response = any(kw in lower for kw in RESPONSE_KEYWORDS)

    if has_critical:
        return {"severity": "critical", "message": "Seek emergency care immediately."}
    if has_warning and has_response:
        return {"severity": "warning", "message": "Contact your healthcare provider."}
    if has_warning:
        return {"severity": "caution", "message": "Monitor symptoms. Contact doctor if they worsen."}

    return {"severity": "info", "message": "No urgent concerns detected."}


def get_triage_action(severity: str) -> Optional[str]:
    actions = {
        "critical": "call_emergency",
        "warning": "contact_doctor",
        "caution": "monitor",
    }
    return actions.get(severity)
