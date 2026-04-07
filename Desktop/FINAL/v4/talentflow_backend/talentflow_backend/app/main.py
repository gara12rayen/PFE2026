from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import engine, Base
from app.routers import auth, offers, applications, notifications, admin, settings, webhook, cal

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TalentFlow ATS",
    description="API de gestion des candidatures — PFE 2026",
    version="4.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(offers.router)
app.include_router(applications.router)
app.include_router(notifications.router)
app.include_router(admin.router)
app.include_router(settings.router)
app.include_router(webhook.router)
app.include_router(cal.router)


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "TalentFlow ATS API v4 is running"}
