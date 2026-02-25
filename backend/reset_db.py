import asyncio
from core.db import client
from core.config import settings

async def reset_db():
    print(f"Connecting to MongoDB at {settings.MONGODB_URI}...")
    await client.drop_database('secure_vault')
    print("Successfully dropped the 'secure_vault' database. All users and files are cleared.")

if __name__ == "__main__":
    asyncio.run(reset_db())
