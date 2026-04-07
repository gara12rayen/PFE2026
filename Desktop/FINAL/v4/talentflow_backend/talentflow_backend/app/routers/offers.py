from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.offer import Offer, OfferStatus
from app.models.application import Application
from app.models.user import User
from app.schemas.offer import OfferCreate, OfferUpdate, OfferOut

router = APIRouter(prefix="/api/offers", tags=["Offres"])


def _enrich(offer: Offer, db: Session) -> OfferOut:
    """Add computed fields to an Offer ORM object."""
    count = db.query(Application).filter(Application.offer_id == offer.id).count()
    out = OfferOut.model_validate(offer)
    out.applications_count = count
    out.created_by_name = offer.created_by_user.name if offer.created_by_user else None
    return out


# ── Public / candidate ────────────────────────────────────

@router.get("", response_model=List[OfferOut])
def list_offers(
    status: Optional[OfferStatus] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """List all offers. Candidates see only open offers by default."""
    q = db.query(Offer)
    if status:
        q = q.filter(Offer.status == status)
    if search:
        q = q.filter(Offer.title.ilike(f"%{search}%"))
    offers = q.order_by(Offer.created_at.desc()).all()
    return [_enrich(o, db) for o in offers]


@router.get("/{offer_id}", response_model=OfferOut)
def get_offer(
    offer_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    offer = db.get(Offer, offer_id)
    if not offer:
        raise HTTPException(status_code=404, detail="Offre introuvable")
    return _enrich(offer, db)


# ── RH / Admin only ───────────────────────────────────────

@router.post("", response_model=OfferOut, status_code=201)
def create_offer(
    payload: OfferCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("rh", "admin")),
):
    offer = Offer(**payload.model_dump(), created_by=current_user.id)
    db.add(offer)
    db.commit()
    db.refresh(offer)
    return _enrich(offer, db)


@router.patch("/{offer_id}", response_model=OfferOut)
def update_offer(
    offer_id: int,
    payload: OfferUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("rh", "admin")),
):
    offer = db.get(Offer, offer_id)
    if not offer:
        raise HTTPException(status_code=404, detail="Offre introuvable")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(offer, field, value)
    db.commit()
    db.refresh(offer)
    return _enrich(offer, db)


@router.delete("/{offer_id}", status_code=204)
def delete_offer(
    offer_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("rh", "admin")),
):
    offer = db.get(Offer, offer_id)
    if not offer:
        raise HTTPException(status_code=404, detail="Offre introuvable")
    db.delete(offer)
    db.commit()
