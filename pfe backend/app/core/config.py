from pydantic_settings import BaseSettings #read env
from functools import lru_cache


class Settings(BaseSettings):

    #Base de données 
    #configuration XAMPP standard
    #Remplacer par .env 
    DB_HOST:     str = "localhost"
    DB_PORT:     int = 3306
    DB_USER:     str = "root"
    DB_PASSWORD: str = ""
    DB_NAME:     str = "upgradeDB"

    # token configuration 
    SECRET_KEY:               str
    ALGORITHM:                str = "HS256"
    ACCESS_TOKEN_EXPIRE_DAYS: int = 7

    #Fichiers uploadés 
    UPLOAD_DIR:    str = "app/uploads"
    MAX_UPLOAD_MB: int = 5

    #Groq API (scoring IA)
    GROQ_API_KEY: str = ""

    # Email Gmail SMTP 
    # Optionnel — les emails sont désactivés si vide
    # Mot de passe d'application Gmail (16 caractères, pas le vrai mdp)
    MAIL_USER:      str = ""
    MAIL_PASS:      str = ""
    MAIL_FROM_NAME: str = "3LM Solutions"

    # ── URL de connexion construite automatiquement ───────────
    @property
    def DATABASE_URL(self) -> str:
        return (
            f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?charset=utf8mb4"
        )
    #read env from .env file and ignore unknown variables
    model_config = {
        "env_file":  ".env",
        "extra":     "ignore", 
    }

# make sure settings are cached and loaded only once
@lru_cache
def get_settings() -> Settings:
    return Settings()
