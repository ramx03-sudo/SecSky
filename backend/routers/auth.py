from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from core.db import get_db
from models.schemas import UserCreate, UserLogin, UserResponse, ChangeLoginPassword, ChangeMasterPassword
from security.auth import get_password_hash, verify_password, create_access_token
from bson import ObjectId
import uuid

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate, response: Response, db=Depends(get_db)):
    try:
        existing_user = await db.users.find_one({"email": user.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")

        user_dict = user.model_dump()
        user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
        user_dict["_id"] = str(uuid.uuid4()) # use uuid strings for easier mapping than objectid

        await db.users.insert_one(user_dict)
        
        # Auto-login after registration
        access_token = create_access_token(data={"sub": user_dict["email"], "id": user_dict["_id"]})
        response.set_cookie(
            key="access_token",
            value=f"Bearer {access_token}",
            httponly=True,
            secure=True,  # Set to True for added security, requires HTTPS in prod
            samesite="none", # Must be none for cross-origin (Vercel -> Render) requests
            max_age=60 * 60 * 24 * 30  # 30 days
        )
        
        return UserResponse(id=user_dict["_id"], email=user_dict["email"])
    except HTTPException:
        raise
    except Exception as e:
        import logging
        logging.error(f"Internal server error during registration: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail={"error": "Internal Server Error", "message": "An unexpected error occurred during user registration."})

@router.post("/login")
async def login(user: UserLogin, response: Response, db=Depends(get_db)):
    db_user = await db.users.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": db_user["email"], "id": db_user["_id"]})
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        secure=True, # Set to True in production with HTTPS
        samesite="none", # Must be none for cross-origin requests
        max_age=60 * 60 * 24 * 30  # 30 days
    )
    return {
        "message": "Logged in successfully",
        "user_id": db_user["_id"],
        "salt": db_user.get("salt"),
        "vault_metadata": db_user.get("vault_metadata")
    }

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", httponly=True, secure=True, samesite="none")
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(request: Request, db=Depends(get_db)):
    from jose import jwt, JWTError
    from core.config import settings
    
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
        
    try:
        scheme, _, token_value = token.partition(" ")
        payload = jwt.decode(token_value, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id: str = payload.get("id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid auth credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid auth credentials")
        
    user = await db.users.find_one({"_id": user_id})
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
        
    return UserResponse(
        id=user["_id"],
        email=user["email"],
        salt=user.get("salt"),
        vault_metadata=user.get("vault_metadata")
    )

from routers.files import get_current_user

@router.put("/login-password")
async def change_login_password(request_data: ChangeLoginPassword, user=Depends(get_current_user), db=Depends(get_db)):
    if not verify_password(request_data.old_password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect old password")
    
    hashed_password = get_password_hash(request_data.new_password)
    await db.users.update_one({"_id": user["_id"]}, {"$set": {"hashed_password": hashed_password}})
    return {"message": "Login password updated successfully"}

@router.put("/master-password")
async def change_master_password(request_data: ChangeMasterPassword, user=Depends(get_current_user), db=Depends(get_db)):
    # 1. Update User's salt and vault_metadata
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"salt": request_data.salt, "vault_metadata": request_data.vault_metadata}}
    )
    
    # 2. Update all file keys
    # To be efficient, we can do bulk update
    from pymongo import UpdateOne
    if request_data.file_updates:
        bulk_ops = [
            UpdateOne(
                {"_id": update.file_id, "user_id": user["_id"]},
                {"$set": {
                    "encrypted_file_key": update.encrypted_file_key,
                    "key_wrap_iv": update.key_wrap_iv,
                    "filename": update.encrypted_filename,
                    "filename_iv": update.filename_iv
                }}
            )
            for update in request_data.file_updates
        ]
        if bulk_ops:
            await db.files.bulk_write(bulk_ops)
            
    return {"message": "Master password and keys updated successfully"}
