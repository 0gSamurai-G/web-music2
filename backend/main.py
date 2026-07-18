import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from starlette.responses import Response

from api import router as api_router, MEDIA_DIR

class CacheControlledStaticFiles(StaticFiles):
    def file_response(self, *args, **kwargs) -> Response:
        response = super().file_response(*args, **kwargs)
        response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
        return response

app = FastAPI(title="VoidFrequencies API", version="1.0.0")

# CORS setup
origins_env = os.getenv("ALLOWED_ORIGINS")
if origins_env:
    origins = [o.strip() for o in origins_env.split(",")]
else:
    origins = [
        "http://localhost:4028",
        "http://127.0.0.1:4028",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
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
app.mount("/api/media", CacheControlledStaticFiles(directory=MEDIA_DIR), name="media")

@app.get("/")
def read_root():
    return {"message": "Welcome to the VoidFrequencies Cosmic Music API"}
