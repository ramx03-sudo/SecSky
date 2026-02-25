from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, files
import warnings

warnings.filterwarnings("ignore", category=FutureWarning)

app = FastAPI(title="SecSky API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
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
    response.headers["Content-Security-Policy"] = "default-src 'self'; connect-src 'self' http://localhost:5173 http://localhost:5174;"
    return response

app.include_router(auth.router)
app.include_router(files.router)

@app.get("/health")
async def health_check():
    return {"status": "ok"}
