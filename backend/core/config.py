from pydantic_settings import BaseSettings
from typing import Optional
import sys
import logging

class Settings(BaseSettings):
    MONGODB_URI: str = "mongodb://localhost:27017" # default for local dev
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    class Config:
        env_file = ".env"

try:
    settings = Settings()
except Exception as e:
    logging.critical(f"Startup Error: Missing required environment variables.\n{e}")
    sys.exit(1)
