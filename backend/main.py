from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, files, activity, folders
from core.db import db
import warnings

warnings.filterwarnings("ignore", category=FutureWarning)

app = FastAPI(title="SecSky API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://sec-sky.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Content-Security-Policy"] = "default-src 'self'; connect-src 'self' https://sec-sky.vercel.app http://localhost:5173 http://localhost:3000;"
    return response

app.include_router(auth.router)
app.include_router(files.router)
app.include_router(activity.router)
app.include_router(folders.router)

@app.on_event("startup")
async def startup_db_indexes():
    await db.folders.create_index([("user_id", 1), ("parent_id", 1)])
    await db.files.create_index([("user_id", 1), ("folder_id", 1)])

@app.get("/health")
async def health_check():
    return {"status": "ok"}
