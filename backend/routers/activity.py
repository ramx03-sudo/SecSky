from fastapi import APIRouter, Depends
from core.db import get_db
from routers.files import get_current_user

router = APIRouter(prefix="/api/activity", tags=["Activity"])

@router.get("/recent")
async def get_recent_activity(user=Depends(get_current_user), db=Depends(get_db)):
    logs = await db.activity_logs.find({"user_id": user["_id"]}).sort("timestamp", -1).limit(10).to_list(length=10)
    for log in logs:
        log["id"] = log.pop("_id")
    return logs
