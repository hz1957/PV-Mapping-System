from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .database import engine
from .api.v1.api import api_router

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="PV Mapping API")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins
    allow_credentials=False, # Wildcard origin cannot be used with credentials
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to PV Mapping API"}

# Include API Router
app.include_router(api_router, prefix="/api/v1")


