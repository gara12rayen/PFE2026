"""
seed.py — Run once to populate the database with demo data.
Usage:
    python seed.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import SessionLocal, engine, Base
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.models.offer import Offer, OfferStatus
from app.models.application import Application, ApplicationStatus
from app.models.notification import Notification, NotificationType
from app.models.settings import PlatformSettings
from datetime import date

Base.metadata.create_all(bind=engine)
db = SessionLocal()

def seed():
    if db.query(User).count() > 0:
        print("⚠️  La base de données contient déjà des données. Seed annulé.")
        db.close()
        return

    print("🌱 Démarrage du seed...")

    # Users
    c1 = User(name="Amira Ben Salah",  email="candidate@demo.com",  password=hash_password("demo123"), role=UserRole.candidate, phone="+216 55 123 456", is_active=True)
    c2 = User(name="Yassine Chaabane", email="candidate2@demo.com", password=hash_password("demo123"), role=UserRole.candidate, phone="+216 99 876 543", is_active=True)
    c3 = User(name="Rania Gharbi",     email="candidate3@demo.com", password=hash_password("demo123"), role=UserRole.candidate, phone="+216 52 345 678", is_active=True)
    rh = User(name="Karim Mansouri",   email="rh@demo.com",         password=hash_password("demo123"), role=UserRole.rh,        phone="+216 71 234 567", department="Ressources Humaines", is_active=True)
    ad = User(name="Sonia Trabelsi",   email="admin@demo.com",      password=hash_password("demo123"), role=UserRole.admin,     is_active=True)
    db.add_all([c1, c2, c3, rh, ad])
    db.flush()

    # Offers
    o1 = Offer(title="Développeur Full Stack",   description="Rejoignez notre équipe tech pour développer des applications web modernes avec React et Node.js.", skills=["React","Node.js","MySQL","Docker"],          date_start=date(2025,1,15), date_close=date(2025,4,30), status=OfferStatus.open,   created_by=rh.id)
    o2 = Offer(title="Analyste Data Senior",     description="Nous cherchons un analyste data passionné pour transformer nos données en insights stratégiques.",  skills=["Python","SQL","Power BI","Tableau"],         date_start=date(2025,2,1),  date_close=date(2025,4,15), status=OfferStatus.open,   created_by=rh.id)
    o3 = Offer(title="Designer UX/UI",           description="Concevez des expériences utilisateur exceptionnelles pour nos produits SaaS.",                      skills=["Figma","UX Research","Prototyping","CSS"],   date_start=date(2025,1,20), date_close=date(2025,3,31), status=OfferStatus.closed, created_by=rh.id)
    o4 = Offer(title="Chef de Projet Digital",   description="Pilotez des projets de transformation digitale pour nos clients grands comptes.",                    skills=["Agile/Scrum","JIRA","Communication"],        date_start=date(2025,3,1),  date_close=date(2025,5,20), status=OfferStatus.open,   created_by=rh.id)
    db.add_all([o1, o2, o3, o4])
    db.flush()

    # Applications
    a1 = Application(offer_id=o1.id, user_id=c1.id, motivation="Je suis très motivé(e) par ce poste. J'ai 3 ans d'expérience en React et Node.js.",              status=ApplicationStatus.selected, score=88)
    a2 = Application(offer_id=o1.id, user_id=c2.id, motivation="Passionné par le développement web, je souhaite intégrer votre équipe.",                         status=ApplicationStatus.reviewed,  score=72)
    a3 = Application(offer_id=o1.id, user_id=c3.id, motivation="Junior motivée avec un fort potentiel d'apprentissage.",                                          status=ApplicationStatus.pending,   score=None)
    a4 = Application(offer_id=o2.id, user_id=c1.id, motivation="Data analyst de formation avec une solide expérience en Python et SQL.",                          status=ApplicationStatus.pending,   score=None)
    db.add_all([a1, a2, a3, a4])
    db.flush()

    # Platform settings (empty — RH will fill in)
    db.add(PlatformSettings())

    # Notifications
    db.add(Notification(user_id=c1.id, type=NotificationType.status_update, message="Votre candidature pour « Développeur Full Stack » a été examinée.",           application_id=a1.id, is_read=True))
    db.add(Notification(user_id=c1.id, type=NotificationType.interview,     message="🎉 Félicitations ! Vous avez été sélectionné(e) pour « Développeur Full Stack ».\n📅 Le RH configurera bientôt les liens d'entretien.", application_id=a1.id, is_read=False))

    db.commit()

    print("✅ Seed terminé avec succès !")
    print()
    print("  ┌──────────────────────────────────────────────────────┐")
    print("  │ Rôle        Email                   Mot de passe     │")
    print("  ├──────────────────────────────────────────────────────┤")
    print("  │ Candidat    candidate@demo.com       demo123         │")
    print("  │ RH Manager  rh@demo.com              demo123         │")
    print("  │ Admin        admin@demo.com           demo123         │")
    print("  └──────────────────────────────────────────────────────┘")
    db.close()

if __name__ == "__main__":
    seed()
