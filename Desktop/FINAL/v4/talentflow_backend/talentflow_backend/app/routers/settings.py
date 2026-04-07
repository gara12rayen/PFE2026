from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_role, get_current_user
from app.models.settings import PlatformSettings
from app.schemas.settings import SettingsUpdate, SettingsOut

router = APIRouter(prefix="/api/settings", tags=["Paramètres"])


def _get_or_create(db: Session) -> PlatformSettings:
    s = db.query(PlatformSettings).first()
    if not s:
        s = PlatformSettings()
        db.add(s)
        db.commit()
        db.refresh(s)
    return s


@router.get("", response_model=SettingsOut)
def get_settings(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return _get_or_create(db)


@router.patch("", response_model=SettingsOut)
def update_settings(
    payload: SettingsUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_role("rh", "admin")),
):
    s = _get_or_create(db)
    if payload.calendly_link is not None:
        s.calendly_link = payload.calendly_link or None
    if payload.cal_api_key is not None:
        s.cal_api_key = payload.cal_api_key or None
    db.commit()
    db.refresh(s)
    return s
