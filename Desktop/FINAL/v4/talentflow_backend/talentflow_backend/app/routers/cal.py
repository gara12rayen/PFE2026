"""
Cal.com API proxy — fetches bookings server-side to avoid CORS.
"""
import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_role
from app.models.settings import PlatformSettings

router = APIRouter(prefix="/api/cal", tags=["Cal.com"])

CAL_API_BASE = "https://api.cal.com/v1"


def _get_settings(db: Session) -> PlatformSettings:
    s = db.query(PlatformSettings).first()
    if not s or not s.cal_api_key:
        raise HTTPException(
            status_code=400,
            detail="Clé API Cal.com non configurée. Allez dans Paramètres."
        )
    return s


@router.get("/bookings")
def get_bookings(
    db: Session = Depends(get_db),
    _=Depends(require_role("rh", "admin")),
):
    """Fetch all upcoming bookings from Cal.com API."""
    s = _get_settings(db)

    try:
        with httpx.Client(timeout=10) as client:
            resp = client.get(
                f"{CAL_API_BASE}/bookings",
                params={
                    "apiKey": s.cal_api_key,
                    "status": "upcoming",
                },
            )
            resp.raise_for_status()
            data = resp.json()
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Erreur Cal.com API: {e.response.status_code}"
        )
    except httpx.RequestError:
        raise HTTPException(
            status_code=502,
            detail="Impossible de contacter Cal.com. Vérifiez votre connexion."
        )

    # Normalize bookings to a clean format
    bookings = []
    for b in data.get("bookings", []):
        attendees = b.get("attendees", [])
        candidate = attendees[0] if attendees else {}
        bookings.append({
            "id":           b.get("id"),
            "title":        b.get("title", "Entretien"),
            "start":        b.get("startTime"),
            "end":          b.get("endTime"),
            "status":       b.get("status"),
            "candidate_name":  candidate.get("name", "—"),
            "candidate_email": candidate.get("email", "—"),
            "meet_url":     b.get("location") or b.get("videoCallUrl") or b.get("metadata", {}).get("videoCallUrl"),
        })

    return {"bookings": bookings, "total": len(bookings)}
