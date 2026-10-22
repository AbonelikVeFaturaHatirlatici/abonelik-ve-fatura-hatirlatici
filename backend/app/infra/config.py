import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", "postgresql://abonelik:abonelik@localhost:5432/abonelik"
    )
    JWT_SECRET: str = os.getenv("JWT_SECRET", "degistir-beni-uzun-rastgele-bir-deger")
    JWT_EXPIRE_MINUTES: int = int(os.getenv("JWT_EXPIRE_MINUTES", "1440"))
    TZ: str = os.getenv("TZ", "Europe/Istanbul")


settings = Settings()
