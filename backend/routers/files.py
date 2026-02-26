from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request, Response
from pydantic import BaseModel
from core.db import get_db
import uuid
import datetime
from jose import jwt, JWTError
from core.config import settings
from pathlib import Path

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

router = APIRouter(prefix="/api/files", tags=["Files"])

async def get_current_user(request: Request, db=Depends(get_db)):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        scheme, _, token_value = token.partition(" ")
        payload = jwt.decode(token_value, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id: str = payload.get("id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.get("/")
async def list_files(user=Depends(get_current_user), db=Depends(get_db)):
    files = await db.files.find(
        {"user_id": user["_id"]},
        {"encrypted_blob": 0}
    ).to_list(length=1000)
    for f in files:
        f["id"] = f.pop("_id")
    return files

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    encrypted_file_key: str = Form(...),
    file_iv: str = Form(...),
    key_wrap_iv: str = Form(...),
    encrypted_filename: str = Form(...),
    filename_iv: str = Form(...),
    requires_file_password: bool = Form(...),
    password_salt: str = Form(None),
    password_iv: str = Form(None),
    folder_id: str = Form(None),
    original_size: int = Form(...),
    user=Depends(get_current_user),
    db=Depends(get_db)
):
    MAX_FILE_SIZE = 15 * 1024 * 1024 # 15 MB to fit in Mongo BSON limit and Render memory limit
    
    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 15MB.")
        
    file_id = str(uuid.uuid4())
        
    doc = {
        "_id": file_id,
        "user_id": user["_id"],
        "filename": encrypted_filename,
        "filename_iv": filename_iv,
        "file_size": original_size,
        "file_id": file_id,
        "encrypted_file_key": encrypted_file_key,
        "file_iv": file_iv,
        "key_wrap_iv": key_wrap_iv,
        "password_protected": requires_file_password,
        "password_salt": password_salt,
        "password_iv": password_iv,
        "folder_id": folder_id,
        "encrypted_blob": file_bytes,
        "created_at": datetime.datetime.utcnow()
    }
    
    await db.files.insert_one(doc)
    
    # Log upload activity
    activity_doc = {
        "_id": str(uuid.uuid4()),
        "user_id": user["_id"],
        "type": "UPLOAD",
        "file_id": file_id,
        "filename": encrypted_filename,
        "timestamp": datetime.datetime.utcnow(),
        "password_added": requires_file_password
    }
    await db.activity_logs.insert_one(activity_doc)
    
    return {
        "message": "File stored in MongoDB",
        "file_id": file_id,
        "id": file_id
    }

@router.get("/{file_id}/download")
async def download_file(file_id: str, user=Depends(get_current_user), db=Depends(get_db)):
    doc = await db.files.find_one({"_id": file_id, "user_id": user["_id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="File not found")
        
    if "encrypted_blob" not in doc:
        # Backward compatibility attempt if it was locally stored but we wiped the server
        raise HTTPException(status_code=404, detail="File content not found in database")
        
    return Response(
        content=doc["encrypted_blob"],
        media_type="application/octet-stream",
        headers={"Content-Disposition": f"attachment; filename=\"{doc.get('filename', 'encrypted_file.bin')}\""}
    )

@router.get("/{file_id}")
async def get_file_metadata(file_id: str, user=Depends(get_current_user), db=Depends(get_db)):
    doc = await db.files.find_one(
        {"_id": file_id, "user_id": user["_id"]},
        {"encrypted_blob": 0}
    )
    if not doc:
        raise HTTPException(status_code=404, detail="File not found")
    doc["id"] = doc.pop("_id")
    return doc

@router.delete("/{file_id}")
async def delete_file(file_id: str, user=Depends(get_current_user), db=Depends(get_db)):
    doc = await db.files.find_one({"_id": file_id, "user_id": user["_id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="File not found")
        
    await db.files.delete_one({"_id": file_id})
    
    # Log delete activity
    activity_doc = {
        "_id": str(uuid.uuid4()),
        "user_id": user["_id"],
        "type": "DELETE",
        "file_id": file_id,
        "filename": doc.get("filename", "encrypted_file.bin"),
        "timestamp": datetime.datetime.utcnow()
    }
    await db.activity_logs.insert_one(activity_doc)
    
    return {"message": "File deleted"}

class FileMove(BaseModel):
    folder_id: str | None = None

@router.put("/{file_id}/move")
async def move_file(file_id: str, data: FileMove, user=Depends(get_current_user), db=Depends(get_db)):
    doc = await db.files.find_one({"_id": file_id, "user_id": user["_id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="File not found")

    await db.files.update_one(
        {"_id": file_id},
        {"$set": {"folder_id": data.folder_id}}
    )
    
    # Log activity
    activity_doc = {
        "_id": str(uuid.uuid4()),
        "user_id": user["_id"],
        "type": "MOVE",
        "file_id": file_id,
        "filename": doc.get("filename", "encrypted_file.bin"),
        "timestamp": datetime.datetime.utcnow()
    }
    await db.activity_logs.insert_one(activity_doc)
    
    return {"message": "File moved"}
