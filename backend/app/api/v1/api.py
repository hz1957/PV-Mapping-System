from fastapi import APIRouter
from .endpoints import datasets, frameworks, mappings, change_logs

api_router = APIRouter()
api_router.include_router(datasets.router, prefix="/datasets", tags=["datasets"])
api_router.include_router(frameworks.router, prefix="/frameworks", tags=["frameworks"])
api_router.include_router(mappings.router, prefix="/mappings", tags=["mappings"])
api_router.include_router(change_logs.router, prefix="/change-logs", tags=["change-logs"])
