from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import hash_password, require_role
from app.models.application import Application
from app.models.offer import Offer
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserOut

router = APIRouter(prefix="/api/admin", tags=["Admin"])

_admin_only = require_role("admin")


@router.get("/users", response_model=List[UserOut])
def list_users(
    db: Session = Depends(get_db),
    _=Depends(_admin_only),
):
    return db.query(User).order_by(User.created_at.desc()).all()


@router.post("/users", response_model=UserOut, status_code=201)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    _=Depends(_admin_only),
):
    if payload.role == UserRole.candidate:
        raise HTTPException(status_code=400, detail="Les candidats s'inscrivent eux-mêmes")
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")

    user = User(
        name=payload.name,
        email=payload.email,
        password=hash_password(payload.password),
        role=payload.role,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.patch("/users/{user_id}/toggle", response_model=UserOut)
def toggle_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(_admin_only),
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas vous désactiver vous-même")
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return user


@router.get("/stats")
def dashboard_stats(
    db: Session = Depends(get_db),
    _=Depends(require_role("rh", "admin")),
):
    total_offers       = db.query(Offer).count()
    open_offers        = db.query(Offer).filter(Offer.status == "open").count()
    total_applications = db.query(Application).count()
    total_candidates   = db.query(User).filter(User.role == UserRole.candidate).count()
    hired              = db.query(Application).filter(Application.status == "hired").count()
    pending            = db.query(Application).filter(Application.status == "pending").count()

    return {
        "total_offers":       total_offers,
        "open_offers":        open_offers,
        "total_applications": total_applications,
        "total_candidates":   total_candidates,
        "hired":              hired,
        "pending":            pending,
    }
