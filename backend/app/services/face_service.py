"""PulseGuard AI - Face Detection & Facial Landmark Tracking Service.

Integrates OpenCV and MediaPipe Tasks Vision to detect faces, track 478 3D landmarks,
extract bounding boxes, and locate forehead/cheek Regions of Interest (ROI).
"""
import os
import time
import logging
from typing import Dict, Any, List, Optional
import cv2
import numpy as np

import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

logger = logging.getLogger("pulseguard.face_service")

# Resolve model path relative to project
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_PATH = os.path.join(BASE_DIR, "models", "face_landmarker.task")


class FaceDetectionService:
    """Production face detection and landmark tracking service."""

    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path or MODEL_PATH
        self.detector: Optional[vision.FaceLandmarker] = None
        self.is_initialized: bool = False
        self.status: str = "initializing"

    def initialize(self) -> bool:
        """Initializes the MediaPipe FaceLandmarker model if not already loaded."""
        if self.is_initialized and self.detector is not None:
            return True

        if not os.path.exists(self.model_path):
            logger.error("MediaPipe FaceLandmarker model file not found at: %s", self.model_path)
            self.status = "model_missing"
            return False

        try:
            base_options = python.BaseOptions(model_asset_path=self.model_path)
            options = vision.FaceLandmarkerOptions(
                base_options=base_options,
                output_face_blendshapes=False,
                output_facial_transformation_matrixes=False,
                num_faces=4,
                min_face_detection_confidence=0.5,
                min_face_presence_confidence=0.5,
                min_tracking_confidence=0.5
            )
            self.detector = vision.FaceLandmarker.create_from_options(options)
            self.is_initialized = True
            self.status = "active"
            logger.info("MediaPipe FaceLandmarker initialized successfully from %s", self.model_path)
            return True
        except Exception as exc:
            logger.exception("Failed to initialize MediaPipe FaceLandmarker: %s", exc)
            self.status = "error"
            self.is_initialized = False
            return False

    def get_status(self) -> str:
        """Returns the current implementation status."""
        if not self.is_initialized:
            self.initialize()
        return self.status

    def detect_faces_from_image(self, image_np: np.ndarray, is_bgr: bool = True) -> Dict[str, Any]:
        """Detects faces and tracks landmarks on a numpy image array.
        
        Args:
            image_np: uint8 numpy array with shape (H, W, 3).
            is_bgr: True if image is in BGR format (standard cv2.imread / cv2.imdecode).
            
        Returns:
            Dict conforming to FaceDetectResponse schema.
        """
        if not self.is_initialized:
            if not self.initialize():
                return {
                    "status": "error",
                    "face_detected": False,
                    "face_count": 0,
                    "faces": [],
                    "message": "Face detection service is not initialized."
                }

        # 1. Validation
        if image_np is None or not isinstance(image_np, np.ndarray):
            return {
                "status": "error",
                "face_detected": False,
                "face_count": 0,
                "faces": [],
                "message": "Invalid frame data provided."
            }

        if image_np.size == 0 or len(image_np.shape) < 2:
            return {
                "status": "error",
                "face_detected": False,
                "face_count": 0,
                "faces": [],
                "message": "Empty or corrupt image array."
            }

        height, width = image_np.shape[:2]
        if height < 16 or width < 16:
            return {
                "status": "error",
                "face_detected": False,
                "face_count": 0,
                "faces": [],
                "message": f"Image dimensions too small ({width}x{height}). Minimum is 16x16."
            }

        # Convert to 3-channel RGB
        try:
            if len(image_np.shape) == 2:  # Grayscale
                rgb_frame = cv2.cvtColor(image_np, cv2.COLOR_GRAY2RGB)
            elif image_np.shape[2] == 4:  # BGRA
                rgb_frame = cv2.cvtColor(image_np, cv2.COLOR_BGRA2RGB)
            elif is_bgr:
                rgb_frame = cv2.cvtColor(image_np, cv2.COLOR_BGR2RGB)
            else:
                rgb_frame = image_np.copy()
        except Exception as exc:
            return {
                "status": "error",
                "face_detected": False,
                "face_count": 0,
                "faces": [],
                "message": f"Color conversion error: {str(exc)}"
            }

        # 2. Run MediaPipe Detection
        try:
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
            detection_result = self.detector.detect(mp_image)
        except Exception as exc:
            logger.exception("MediaPipe detection inference failed: %s", exc)
            return {
                "status": "error",
                "face_detected": False,
                "face_count": 0,
                "faces": [],
                "message": f"Inference error: {str(exc)}"
            }

        face_landmarks_list = detection_result.face_landmarks

        if not face_landmarks_list:
            return {
                "status": "success",
                "face_detected": False,
                "face_count": 0,
                "faces": [],
                "message": "No face detected in frame.",
                "timestamp": time.time()
            }

        faces: List[Dict[str, Any]] = []

        for face_lms in face_landmarks_list:
            xs = [lm.x for lm in face_lms]
            ys = [lm.y for lm in face_lms]

            min_x = max(0.0, float(min(xs)))
            max_x = min(1.0, float(max(xs)))
            min_y = max(0.0, float(min(ys)))
            max_y = min(1.0, float(max(ys)))

            box_w = max(0.0, float(max_x - min_x))
            box_h = max(0.0, float(max_y - min_y))

            # Store serialized landmark points
            landmarks_data = [
                {"x": round(float(lm.x), 4), "y": round(float(lm.y), 4), "z": round(float(lm.z), 4)}
                for lm in face_lms
            ]

            # Key regions for rPPG and liveness analysis
            # Landmark 10: Forehead center
            # Landmark 234: Left cheek
            # Landmark 454: Right cheek
            # Landmark 1: Nose tip
            key_regions = {}
            if len(face_lms) > 454:
                key_regions = {
                    "forehead": {"x": round(float(face_lms[10].x), 4), "y": round(float(face_lms[10].y), 4)},
                    "left_cheek": {"x": round(float(face_lms[234].x), 4), "y": round(float(face_lms[234].y), 4)},
                    "right_cheek": {"x": round(float(face_lms[454].x), 4), "y": round(float(face_lms[454].y), 4)},
                    "nose_tip": {"x": round(float(face_lms[1].x), 4), "y": round(float(face_lms[1].y), 4)}
                }

            faces.append({
                "bounding_box": {
                    "x": round(min_x, 4),
                    "y": round(min_y, 4),
                    "width": round(box_w, 4),
                    "height": round(box_h, 4)
                },
                "landmark_count": len(face_lms),
                "landmarks": landmarks_data,
                "key_regions": key_regions
            })

        return {
            "status": "success",
            "face_detected": True,
            "face_count": len(faces),
            "faces": faces,
            "message": f"Detected {len(faces)} face(s) with landmark tracking.",
            "timestamp": time.time()
        }

    def decode_image_bytes(self, image_bytes: bytes) -> Optional[np.ndarray]:
        """Safely decodes raw image bytes into a numpy BGR array."""
        if not image_bytes:
            return None
        try:
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            return img
        except Exception as exc:
            logger.warning("Failed to decode image bytes: %s", exc)
            return None

    def close(self):
        """Releases detector resources."""
        if self.detector:
            try:
                self.detector.close()
            except Exception:
                pass
            self.detector = None
            self.is_initialized = False
            self.status = "closed"
            logger.info("MediaPipe FaceLandmarker resources released.")


face_service = FaceDetectionService()
