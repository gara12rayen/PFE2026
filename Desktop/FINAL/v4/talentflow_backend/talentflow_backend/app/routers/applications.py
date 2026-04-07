import os
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.application import Application, ApplicationStatus
from app.models.notification import Notification, NotificationType
from app.models.offer import Offer
from app.models.settings import PlatformSettings
from app.models.user import User
from app.schemas.application import ApplicationOut, ApplicationStatusUpdate

router = APIRouter(prefix="/api/applications", tags=["Candidatures"])
settings = get_settings()

STATUS_LABELS = {
    "pending":  "En attente",
    "reviewed": "Examinée",
    "selected": "Sélectionné(e)",
    "rejected": "Refusée",
    "hired":    "Embauché(e)",
}


def _enrich(app: Application) -> ApplicationOut:
    out = ApplicationOut.model_validate(app)
    if app.candidate:
        out.candidate_name  = app.candidate.name
        out.candidate_email = app.candidate.email
        out.candidate_phone = app.candidate.phone
    if app.offer:
        out.offer_title = app.offer.title
    return out


def _get_platform_settings(db: Session) -> PlatformSettings:
    s = db.query(PlatformSettings).first()
    if not s:
        s = PlatformSettings()
        db.add(s)
        db.commit()
        db.refresh(s)
    return s


def _notify(db: Session, user_id: int, message: str, app_id: int,
            type_: NotificationType = NotificationType.status_update):
    db.add(Notification(user_id=user_id, type=type_, message=message, application_id=app_id))


# ── Candidate: apply ──────────────────────────────────────

@router.post("", response_model=ApplicationOut, status_code=201)
async def apply(
    offer_id:     int                  = Form(...),
    motivation:   str                  = Form(...),
    cv:           Optional[UploadFile] = File(None),
    db:           Session              = Depends(get_db),
    current_user: User                 = Depends(require_role("candidate")),
):
    offer = db.get(Offer, offer_id)
    if not offer:
        raise HTTPException(status_code=404, detail="Offre introuvable")
    if offer.status != "open":
        raise HTTPException(status_code=400, detail="Cette offre est fermée")

    existing = db.query(Application).filter(
        Application.offer_id == offer_id,
        Application.user_id  == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Vous avez déjà postulé à cette offre")

    cv_filename = None
    if cv:
        if cv.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="Le CV doit être un fichier PDF")
        content = await cv.read()
        if len(content) > settings.MAX_UPLOAD_MB * 1024 * 1024:
            raise HTTPException(status_code=400, detail=f"Le CV ne doit pas dépasser {settings.MAX_UPLOAD_MB} Mo")
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        cv_filename = f"{uuid.uuid4().hex}_{cv.filename}"
        with open(os.path.join(settings.UPLOAD_DIR, cv_filename), "wb") as f:
            f.write(content)

    application = Application(
        offer_id=offer_id,
        user_id=current_user.id,
        motivation=motivation.strip(),
        cv_filename=cv_filename,
    )
    db.add(application)
    db.flush()

    _notify(db, current_user.id,
            f"Votre candidature pour « {offer.title} » a bien été envoyée.",
            application.id)
    db.commit()
    db.refresh(application)
    return _enrich(application)


# ── Candidate: my applications ────────────────────────────

@router.get("/mine", response_model=List[ApplicationOut])
def my_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("candidate")),
):
    apps = (
        db.query(Application)
        .filter(Application.user_id == current_user.id)
        .order_by(Application.applied_at.desc())
        .all()
    )
    return [_enrich(a) for a in apps]


# ── RH / Admin: list ─────────────────────────────────────

@router.get("", response_model=List[ApplicationOut])
def list_applications(
    offer_id: Optional[int]               = Query(None),
    status:   Optional[ApplicationStatus] = Query(None),
    db:       Session = Depends(get_db),
    _:        User    = Depends(require_role("rh", "admin")),
):
    q = db.query(Application)
    if offer_id: q = q.filter(Application.offer_id == offer_id)
    if status:   q = q.filter(Application.status   == status)
    return [_enrich(a) for a in q.order_by(Application.applied_at.desc()).all()]


@router.get("/{app_id}", response_model=ApplicationOut)
def get_application(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    app = db.get(Application, app_id)
    if not app:
        raise HTTPException(status_code=404, detail="Candidature introuvable")
    if current_user.role == "candidate" and app.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Accès refusé")
    return _enrich(app)


# ── RH / Admin: update status ─────────────────────────────

@router.patch("/{app_id}/status", response_model=ApplicationOut)
def update_status(
    app_id:  int,
    payload: ApplicationStatusUpdate,
    db:      Session = Depends(get_db),
    _:       User    = Depends(require_role("rh", "admin")),
):
    app = db.get(Application, app_id)
    if not app:
        raise HTTPException(status_code=404, detail="Candidature introuvable")

    old_status = app.status
    app.status = payload.status
    if payload.score is not None:
        app.score = payload.score

    if old_status != payload.status:
        offer_title = app.offer.title if app.offer else "une offre"
        label = STATUS_LABELS.get(payload.status.value, payload.status.value)

        if payload.status == ApplicationStatus.selected:
            platform     = _get_platform_settings(db)
            calendly_part = f"\n📅 Réservez votre créneau : {platform.calendly_link}" if platform.calendly_link else ""
            meet_part     = f"\n📹 Lien Google Meet : {platform.google_meet_link}"     if platform.google_meet_link else ""
            message = (
                f"🎉 Félicitations ! Vous avez été sélectionné(e) pour « {offer_title} »."
                f"{calendly_part}{meet_part}"
            )
            _notify(db, app.user_id, message, app.id, NotificationType.interview)
        else:
            _notify(db, app.user_id,
                    f"Le statut de votre candidature pour « {offer_title} » a changé : {label}.",
                    app.id)

    db.commit()
    db.refresh(app)
    return _enrich(app)


# ── CV download ───────────────────────────────────────────

@router.get("/{app_id}/cv")
def download_cv(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    app = db.get(Application, app_id)
    if not app:
        raise HTTPException(status_code=404, detail="Candidature introuvable")
    if current_user.role == "candidate" and app.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Accès refusé")
    if not app.cv_filename:
        raise HTTPException(status_code=404, detail="Aucun CV joint")
    filepath = os.path.join(settings.UPLOAD_DIR, app.cv_filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Fichier introuvable sur le serveur")
    return FileResponse(filepath, media_type="application/pdf", filename=app.cv_filename)
