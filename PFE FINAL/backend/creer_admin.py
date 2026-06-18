"""
Script pour créer le premier compte administrateur ATS.
À exécuter UNE SEULE FOIS depuis le dossier combined_backend/.

Sans Docker :
    python creer_admin.py

Avec Docker (conteneur en cours d'exécution) :
    docker exec -it 3lm_backend python creer_admin.py
"""

import os, sys

# Charger les variables d'environnement depuis .env si présent
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.user import User, Admin


def main():
    print("\n=== Création du compte Administrateur ATS ===\n")

    email = input("Email de l'admin    : ").strip()
    nom   = input("Nom complet         : ").strip()
    mdp   = input("Mot de passe        : ").strip()

    if not email or not nom or not mdp:
        print("Erreur — tous les champs sont requis.")
        sys.exit(1)

    db = SessionLocal()
    try:
        if db.query(User).filter(User.email == email).first():
            print(f"\nErreur — l'email '{email}' est déjà utilisé.")
            sys.exit(1)

        admin = Admin(
            nom=nom,
            email=email,
            mot_de_passe=hash_password(mdp),
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)

        print(f"\nCompte créé avec succès !")
        print(f"  ID    : {admin.id}")
        print(f"  Nom   : {admin.nom}")
        print(f"  Email : {admin.email}")
        print(f"  Rôle  : administrateur\n")

    except Exception as e:
        db.rollback()
        print(f"\nErreur base de données : {e}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
