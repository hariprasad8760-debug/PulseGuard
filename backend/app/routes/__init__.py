"""Routes package initialization and router aggregation."""
from fastapi import APIRouter
from app.routes.health import router as health_router
from app.routes.status import router as status_router
from app.routes.analysis import router as analysis_router
from app.routes.face import router as face_router

api_router = APIRouter(prefix="/api")
api_router.include_router(health_router)
api_router.include_router(status_router)
api_router.include_router(analysis_router)
api_router.include_router(face_router)

__all__ = ["api_router"]
