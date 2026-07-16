import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from api import router as api_router, MEDIA_DIR

app = FastAPI(title="VoidFrequencies API", version="1.0.0")

# CORS setup
origins_env = os.getenv("ALLOWED_ORIGINS")
if origins_env:
    origins = [o.strip() for o in origins_env.split(",")]
else:
    origins = [
        "http://localhost:4028",
        "http://localhost:3000",
        "http://localhost:5173",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

# Serve media files locally
app.mount("/api/media", StaticFiles(directory=MEDIA_DIR), name="media")

@app.get("/")
def read_root():
    return {"message": "Welcome to the VoidFrequencies Cosmic Music API"}
