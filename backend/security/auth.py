from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import hashlib
from passlib.context import CryptContext
from core.config import settings

# Explicit cost configuration for bcrypt to guarantee safe defaults
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)

def verify_password(plain_password, hashed_password):
    pre_hashed = hashlib.sha256(plain_password.encode("utf-8")).hexdigest()
    return pwd_context.verify(pre_hashed, hashed_password)

def get_password_hash(password):
    pre_hashed = hashlib.sha256(password.encode("utf-8")).hexdigest()
    return pwd_context.hash(pre_hashed)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        ACCESS_TOKEN_EXPIRE_DAYS = 30
        expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt
