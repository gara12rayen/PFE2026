from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.models.user import UserRole


class UserOut(BaseModel):
    id:          int
    nom:         str
    email:       str
    role:        UserRole
    is_active:   bool
    cree_le:     Optional[datetime] = None
    # Candidat uniquement
    telephone:   Optional[str] = None
    # RH uniquement
    departement: Optional[str] = None
    cal_link:    Optional[str] = None
    cal_api_key: Optional[str] = None

    model_config = {"from_attributes": True}


class UserRegister(BaseModel):
    nom:          str
    email:        EmailStr
    mot_de_passe: str


class UserLogin(BaseModel):
    email:        EmailStr
    mot_de_passe: str


class TokenOut(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    user:         UserOut


class UserCreate(BaseModel):
    nom:          str
    email:        EmailStr
    mot_de_passe: str
    role:         UserRole = UserRole.rh
    departement:  Optional[str] = None


class UserUpdate(BaseModel):
    nom:         Optional[str] = None
    telephone:   Optional[str] = None
    departement: Optional[str] = None


class PasswordChange(BaseModel):
    mot_de_passe_actuel:  str
    nouveau_mot_de_passe: str


class RHSettings(BaseModel):
    cal_link:    Optional[str] = None
    cal_api_key: Optional[str] = None
