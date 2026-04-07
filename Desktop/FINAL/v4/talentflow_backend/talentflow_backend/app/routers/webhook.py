"""
Cal.com Webhook — receives booking events and updates applications.

Setup in Cal.com:
  Settings → Developer → Webhooks → Add webhook
  URL: http://your-server:8000/api/webhook/cal
  Events: BOOKING_CREATED, BOOKING_RESCHEDULED, BOOKING_CANCELLED
"""
import hmac
import hashlib
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.core.database import get_db
from app.core.config import get_settings
from app.models.application import Application, ApplicationStatus
from app.models.user import User

router  = APIRouter(prefix="/api/webhook", tags=["Webhook"])
logger  = logging.getLogger(__name__)
settings = get_settings()


def _find_application(db: Session, email: str) -> Optional[Application]:
    """Find the most recent selected application for a candidate by email."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    return (
        db.query(Application)
        .filter(
            Application.user_id == user.id,
            Application.status  == ApplicationStatus.selected,
        )
        .order_by(Application.applied_at.desc())
        .first()
    )


@router.post("/cal")
async def cal_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Receive Cal.com webhook events.
    Supports: BOOKING_CREATED, BOOKING_RESCHEDULED, BOOKING_CANCELLED
    """
    body = await request.json()

    trigger_event = body.get("triggerEvent", "")
    payload       = body.get("payload", {})

    logger.info(f"Cal.com webhook received: {trigger_event}")

    # ── Extract candidate email ────────────────────────────
    attendees = payload.get("attendees", [])
    if not attendees:
        return {"status": "ignored", "reason": "no attendees"}

    # First attendee is always the candidate (organizer is the RH)
    candidate_email = attendees[0].get("email", "").strip().lower()
    if not candidate_email:
        return {"status": "ignored", "reason": "no email"}

    # ── Extract date/time and Meet link ────────────────────
    start_time  = payload.get("startTime")   # ISO string e.g. "2025-05-10T10:00:00Z"
    meet_url    = None

    # Cal.com puts the Meet link in location or metadata
    location = payload.get("location", "")
    if location and location.startswith("https://"):
        meet_url = location

    # Also check videoCallData
    video_data = payload.get("videoCallData", {})
    if video_data and video_data.get("url"):
        meet_url = video_data["url"]

    # ── Handle event types ─────────────────────────────────
    if trigger_event in ("BOOKING_CREATED", "BOOKING_RESCHEDULED"):
        app = _find_application(db, candidate_email)
        if not app:
            logger.warning(f"No selected application found for {candidate_email}")
            return {"status": "ignored", "reason": "no matching application"}

        if start_time:
            try:
                # Parse ISO datetime
                dt = datetime.fromisoformat(start_time.replace("Z", "+00:00"))
                app.interview_booked_at = dt
            except ValueError:
                logger.error(f"Could not parse date: {start_time}")

        if meet_url:
            app.interview_meet_link = meet_url

        db.commit()
        logger.info(f"Updated application {app.id} with interview date {start_time}")
        return {"status": "ok", "application_id": app.id}

    elif trigger_event == "BOOKING_CANCELLED":
        app = _find_application(db, candidate_email)
        if app:
            app.interview_booked_at = None
            app.interview_meet_link = None
            db.commit()
            logger.info(f"Cleared interview for application {app.id}")
        return {"status": "ok", "action": "cleared"}

    return {"status": "ignored", "trigger": trigger_event}
