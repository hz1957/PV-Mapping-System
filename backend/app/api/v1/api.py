from fastapi import APIRouter
from .endpoints import datasets, frameworks, mappings

api_router = APIRouter()
api_router.include_router(datasets.router, prefix="/datasets", tags=["datasets"])
api_router.include_router(frameworks.router, prefix="/frameworks", tags=["frameworks"])
api_router.include_router(mappings.router, prefix="/mappings", tags=["mappings"])
