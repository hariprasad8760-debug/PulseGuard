"""Face detection API route."""
import base64
import logging
from typing import Optional
from fastapi import APIRouter, Request, HTTPException, status
import cv2
import numpy as np

from app.schemas.face import FaceDetectResponse
from app.services.face_service import face_service

logger = logging.getLogger("pulseguard.routes.face")

router = APIRouter(prefix="/face", tags=["Face Detection"])

MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "image/bmp"}


@router.post(
    "/detect",
    response_model=FaceDetectResponse,
    status_code=status.HTTP_200_OK,
    summary="Detect Face and Facial Landmarks",
    description="Analyzes an uploaded image (multipart/form-data) or base64 frame (application/json) using OpenCV and MediaPipe. Returns 3D landmark coordinates and bounding boxes."
)
async def detect_face(request: Request) -> FaceDetectResponse:
    """Performs real-time face and landmark detection.
    
    Accepts either multipart/form-data file upload or application/json payload with frame_base64.
    Validates file format, size, and decoding. Does NOT store frames to disk.
    """
    content_type = request.headers.get("content-type", "").lower()
    image_bytes: Optional[bytes] = None

    if "multipart/form-data" in content_type:
        form = await request.form()
        file = form.get("file")
        if not file or not hasattr(file, "read"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No 'file' field found in multipart form data."
            )

        if file.content_type and file.content_type.lower() not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=f"Unsupported file format '{file.content_type}'. Allowed types: JPEG, PNG, WEBP, BMP."
            )

        contents = await file.read()
        if len(contents) > MAX_IMAGE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_CONTENT_TOO_LARGE,
                detail="Uploaded file exceeds 5MB limit."
            )
        image_bytes = contents

    elif "application/json" in content_type:
        try:
            body = await request.json()
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid JSON payload."
            )

        raw_b64 = body.get("frame_base64")
        if not raw_b64:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing 'frame_base64' in JSON body."
            )

        if len(raw_b64) > MAX_IMAGE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_CONTENT_TOO_LARGE,
                detail="Payload exceeds 5MB limit."
            )

        if "," in raw_b64:
            raw_b64 = raw_b64.split(",", 1)[1]

        try:
            decoded = base64.b64decode(raw_b64)
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid base64 encoding: {str(exc)}"
            )

        if len(decoded) > MAX_IMAGE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_CONTENT_TOO_LARGE,
                detail="Decoded image exceeds 5MB limit."
            )
        image_bytes = decoded

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported Content-Type. Please use multipart/form-data or application/json."
        )

    # 2. Decode image with OpenCV
    img_np = face_service.decode_image_bytes(image_bytes)
    if img_np is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not decode image. Corrupted or invalid image data."
        )

    # 3. Run Face Landmark Detection
    result = face_service.detect_faces_from_image(img_np, is_bgr=True)

    if result.get("status") == "error":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("message", "Face detection failed.")
        )

    return FaceDetectResponse(**result)
