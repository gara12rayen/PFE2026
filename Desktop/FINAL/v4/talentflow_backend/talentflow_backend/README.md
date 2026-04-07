# TalentFlow ATS — Backend (FastAPI + MySQL)

## Structure des fichiers

```
talentflow_backend/
├── .env                        ← Variables d'environnement (à configurer)
├── requirements.txt            ← Dépendances Python
├── seed.py                     ← Script de données de démonstration
└── app/
    ├── main.py                 ← Point d'entrée FastAPI
    ├── core/
    │   ├── config.py           ← Paramètres (lit .env)
    │   ├── database.py         ← SQLAlchemy engine + session
    │   └── security.py         ← JWT + bcrypt + dépendances rôles
    ├── models/
    │   ├── user.py             ← Table users
    │   ├── offer.py            ← Table offers
    │   ├── application.py      ← Table applications
    │   └── notification.py     ← Table notifications
    ├── schemas/
    │   ├── user.py             ← Schémas Pydantic User
    │   ├── offer.py            ← Schémas Pydantic Offer
    │   ├── application.py      ← Schémas Pydantic Application
    │   └── notification.py     ← Schémas Pydantic Notification
    ├── routers/
    │   ├── auth.py             ← /api/auth/*
    │   ├── offers.py           ← /api/offers/*
    │   ├── applications.py     ← /api/applications/*
    │   ├── notifications.py    ← /api/notifications/*
    │   └── admin.py            ← /api/admin/*
    └── uploads/                ← CVs PDF sauvegardés ici
```

---

## Installation

### 1. Créer la base de données MySQL (XAMPP)

Ouvrez phpMyAdmin ou la console MySQL et exécutez :

```sql
CREATE DATABASE PFE2026 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Configurer `.env`

Ouvrez le fichier `.env` et ajustez si besoin :

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=          # laisser vide si pas de mot de passe XAMPP
DB_NAME=PFE2026
SECRET_KEY=changez_cette_valeur_en_production
```

### 3. Installer les dépendances Python

```bash
# Créer un environnement virtuel (recommandé)
python -m venv venv

# Activer l'environnement
# Windows :
venv\Scripts\activate
# macOS/Linux :
source venv/bin/activate

# Installer les packages
pip install -r requirements.txt
pip install pydantic-settings   # requis pour la config
```

### 4. Lancer le serveur

```bash
uvicorn app.main:app --reload --port 8000
```

Les tables sont créées **automatiquement** au premier démarrage.

### 5. Injecter les données de démonstration

```bash
python seed.py
```

---

## Comptes de démonstration

| Rôle       | Email                 | Mot de passe |
|------------|-----------------------|--------------|
| Candidat   | candidate@demo.com    | demo123      |
| RH Manager | rh@demo.com           | demo123      |
| Admin      | admin@demo.com        | demo123      |

---

## Documentation API interactive

Une fois le serveur lancé, ouvrez :

- **Swagger UI** → http://localhost:8000/docs
- **ReDoc**       → http://localhost:8000/redoc

---

## Endpoints principaux

| Méthode | URL                              | Rôle requis      | Description                        |
|---------|----------------------------------|------------------|------------------------------------|
| POST    | /api/auth/register               | Public           | Inscription candidat               |
| POST    | /api/auth/login                  | Public           | Connexion                          |
| GET     | /api/auth/me                     | Connecté         | Profil de l'utilisateur connecté   |
| PATCH   | /api/auth/me                     | Connecté         | Modifier son profil                |
| GET     | /api/offers                      | Connecté         | Liste des offres                   |
| POST    | /api/offers                      | RH / Admin       | Créer une offre                    |
| PATCH   | /api/offers/{id}                 | RH / Admin       | Modifier une offre                 |
| DELETE  | /api/offers/{id}                 | RH / Admin       | Supprimer une offre                |
| POST    | /api/applications                | Candidat         | Postuler (avec CV PDF)             |
| GET     | /api/applications/mine           | Candidat         | Mes candidatures                   |
| GET     | /api/applications                | RH / Admin       | Toutes les candidatures            |
| PATCH   | /api/applications/{id}/status    | RH / Admin       | Changer le statut                  |
| PATCH   | /api/applications/{id}/respond   | Candidat         | Confirmer/refuser un entretien     |
| GET     | /api/applications/{id}/cv        | Connecté         | Télécharger le CV PDF              |
| GET     | /api/notifications               | Connecté         | Mes notifications                  |
| PATCH   | /api/notifications/{id}/read     | Connecté         | Marquer comme lue                  |
| GET     | /api/admin/users                 | Admin            | Liste de tous les utilisateurs     |
| POST    | /api/admin/users                 | Admin            | Créer un compte RH/Admin           |
| PATCH   | /api/admin/users/{id}/toggle     | Admin            | Activer / désactiver un compte     |
| GET     | /api/admin/stats                 | RH / Admin       | Statistiques du tableau de bord    |
