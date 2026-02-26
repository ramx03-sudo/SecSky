from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from core.db import get_db
from routers.files import get_current_user
import uuid
import datetime

router = APIRouter(prefix="/api/folders", tags=["Folders"])

class FolderCreate(BaseModel):
    name_encrypted: str
    name_iv: str
    parent_id: Optional[str] = None

class FolderMove(BaseModel):
    parent_id: Optional[str] = None

class FolderRename(BaseModel):
    name_encrypted: str
    name_iv: str

@router.get("/")
async def list_folders(user=Depends(get_current_user), db=Depends(get_db)):
    folders = await db.folders.find({"user_id": user["_id"]}).to_list(length=1000)
    for f in folders:
        f["id"] = f.pop("_id")
    return folders

@router.post("/")
async def create_folder(folder: FolderCreate, user=Depends(get_current_user), db=Depends(get_db)):
    folder_id = str(uuid.uuid4())
    doc = {
        "_id": folder_id,
        "user_id": user["_id"],
        "name_encrypted": folder.name_encrypted,
        "name_iv": folder.name_iv,
        "parent_id": folder.parent_id,
        "created_at": datetime.datetime.utcnow()
    }
    await db.folders.insert_one(doc)
    
    # Log activity
    await db.activity_logs.insert_one({
        "_id": str(uuid.uuid4()),
        "user_id": user["_id"],
        "type": "CREATE_FOLDER",
        "folder_id": folder_id,
        "timestamp": datetime.datetime.utcnow()
    })
    
    doc["id"] = doc.pop("_id")
    return doc

@router.put("/{folder_id}/move")
async def move_folder(folder_id: str, data: FolderMove, user=Depends(get_current_user), db=Depends(get_db)):
    result = await db.folders.update_one(
        {"_id": folder_id, "user_id": user["_id"]},
        {"$set": {"parent_id": data.parent_id}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    return {"message": "Folder moved"}

@router.put("/{folder_id}/rename")
async def rename_folder(folder_id: str, data: FolderRename, user=Depends(get_current_user), db=Depends(get_db)):
    result = await db.folders.update_one(
        {"_id": folder_id, "user_id": user["_id"]},
        {"$set": {"name_encrypted": data.name_encrypted, "name_iv": data.name_iv}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    # Log activity
    await db.activity_logs.insert_one({
        "_id": str(uuid.uuid4()),
        "user_id": user["_id"],
        "type": "RENAME_FOLDER",
        "folder_id": folder_id,
        "timestamp": datetime.datetime.utcnow()
    })
    
    return {"message": "Folder renamed"}

@router.delete("/{folder_id}")
async def delete_folder(folder_id: str, user=Depends(get_current_user), db=Depends(get_db)):
    # To properly delete a folder, one should delete all contents or just throw error if not empty
    # MVP: just delete the folder record. Frontend can block deleting non-empty folders.
    
    # Check if folder has children (files or folders)
    has_files = await db.files.find_one({"folder_id": folder_id, "user_id": user["_id"]})
    has_subfolders = await db.folders.find_one({"parent_id": folder_id, "user_id": user["_id"]})
    
    if has_files or has_subfolders:
        raise HTTPException(status_code=400, detail="Folder is not empty")

    result = await db.folders.delete_one({"_id": folder_id, "user_id": user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Folder not found")

    return {"message": "Folder deleted"}
