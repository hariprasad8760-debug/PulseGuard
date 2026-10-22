"""PulseGuard AI - FastAPI Backend Main Application.

Real-Time Deepfake and Liveness Detection Platform.
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.routes import api_router

# Configure structured logging
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("pulseguard.backend")


from app.services.face_service import face_service
from app.services.rppg_service import rppg_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle management."""
    logger.info("Starting %s v%s in %s mode...", settings.APP_NAME, settings.APP_VERSION, settings.ENVIRONMENT)
    logger.info("Allowed CORS origins: %s", settings.CORS_ORIGINS)
    logger.info("Configured Node.js signaling URL: %s", settings.NODE_SIGNALING_URL)
    
    # Initialize MediaPipe Face Detection
    try:
        face_service.initialize()
    except Exception as exc:
        logger.warning("MediaPipe Face Detection deferred initialization: %s", exc)

    # Initialize PhysNet rPPG Model
    try:
        rppg_service.initialize()
    except Exception as exc:
        logger.warning("PhysNet rPPG model deferred initialization: %s", exc)
        
    yield
    logger.info("Shutting down %s...", settings.APP_NAME)
    face_service.close()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Backend API services for PulseGuard AI - Real-Time Deepfake and Liveness Detection for Secure Video Calls.",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global unhandled exception handler to prevent leaking internal traces
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception at %s %s: %s", request.method, request.url, str(exc), exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "status": "error",
            "message": "An unexpected internal server error occurred. Please contact system administrator."
        }
    )

# Include API router (/api/health, /api/status, /api/analyze)
app.include_router(api_router)


@app.get("/", tags=["Root"])
async def root():
    """Root redirect / sanity message."""
    return {
        "application": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/api/health",
        "status": "/api/status"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
