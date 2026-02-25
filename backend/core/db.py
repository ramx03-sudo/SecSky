from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings

client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=5000)
db = client.secure_vault

async def get_db():
    return db
