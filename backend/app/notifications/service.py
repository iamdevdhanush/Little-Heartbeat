"""
Notification service stub.

For MVP, this logs reminders. For production, integrate:
- firebase-admin for FCM push notifications
- smtplib / sendgrid for email reminders
- twilio for SMS
"""

import logging
from datetime import datetime, timezone
from typing import Optional

logger = logging.getLogger(__name__)


def send_medication_reminder(
    user_id: str,
    medication_name: str,
    scheduled_time: Optional[datetime] = None,
):
    now = scheduled_time or datetime.now(timezone.utc)
    logger.info(
        "[REMINDER] user=%s medication=%s scheduled=%s",
        user_id, medication_name, now.isoformat(),
    )
    # TODO: dispatch via FCM / email / SMS


def send_emergency_alert(user_id: str, contact_name: str, contact_phone: str):
    logger.warning(
        "[EMERGENCY] user=%s contact=%s phone=%s",
        user_id, contact_name, contact_phone,
    )
    # TODO: dispatch SMS or push notification
