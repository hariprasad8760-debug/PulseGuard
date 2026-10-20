"""Health check response schemas."""
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Schema for /api/health endpoint."""
    status: str = Field(default="ok", description="Health status of the API")
    application: str = Field(default="PulseGuard AI", description="Application name")
    version: str = Field(default="1.0.0", description="Application version")
    backend: str = Field(default="fastapi", description="Backend framework identifier")
