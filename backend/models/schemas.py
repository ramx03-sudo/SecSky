from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    salt: str
    vault_metadata: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str

class Token(BaseModel):
    access_token: str
    token_type: str

class ChangeLoginPassword(BaseModel):
    old_password: str
    new_password: str

class FileKeyUpdate(BaseModel):
    file_id: str
    encrypted_file_key: str
    key_wrap_iv: str
    encrypted_filename: str
    filename_iv: str

class ChangeMasterPassword(BaseModel):
    salt: str
    vault_metadata: str
    file_updates: list[FileKeyUpdate]
