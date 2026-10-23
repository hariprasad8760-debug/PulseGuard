"""PulseGuard AI - Remote Photoplethysmography (rPPG) Pulse Service.

Integrates the pretrained PhysNet 3D-CNN model (UBFC-rPPG checkpoint) for
extracting blood volume pulse waveforms from facial video sequences.

Scientific Principles:
- Extracts blood volume pulse (BVP) fluctuations across temporal facial frames.
- Re-samples sequences to the model's required 128 frames at spatial crop 64x64.
- Runs FFT spectral analysis in the physiological human heart rate band [0.7 - 3.0 Hz] (42 - 180 BPM).
- Computes Signal-to-Noise Ratio (SNR) and spectral peak prominence.
- Returns 'unavailable' or 'insufficient_data' if frames are insufficient or signal is noisy.
- Strictly adheres to scientific boundaries: rPPG is supporting evidence only,
  never sole proof of authenticity or deepfake manipulation.
"""
import os
import sys
import logging
import base64
from typing import List, Dict, Any, Optional, Tuple
import numpy as np
import cv2
import torch

from app.models.physnet import PhysNet, hr_from_wave

logger = logging.getLogger("pulseguard.rppg_service")

# Model configurations
MODEL_WIDTH = 32
TARGET_FRAMES = 128
CROP_SIZE = 64
MIN_REQUIRED_FRAMES = 16  # Minimum frames needed before attempting temporal interpolation to 128
MIN_CONFIDENCE_THRESHOLD = 0.35  # Minimum spectral peak prominence for reporting BPM
PHYSIOLOGICAL_MIN_BPM = 42.0
PHYSIOLOGICAL_MAX_BPM = 180.0


class RPPGService:
    """Production service for PhysNet rPPG pulse estimation."""

    def __init__(self):
        self.model: Optional[PhysNet] = None
        self.device = torch.device("cpu")
        self.is_initialized = False
        self.model_metadata: Dict[str, Any] = {}
        self.status = "uninitialized"

    def initialize(self, checkpoint_path: Optional[str] = None) -> bool:
        """Loads the pretrained PhysNet checkpoint once during startup."""
        if self.is_initialized and self.model is not None:
            return True

        if checkpoint_path is None:
            backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
            # Check standard locations
            candidate_paths = [
                os.path.join(backend_dir, "app", "models", "rppg_physnet_ubfc.pth"),
                os.path.join(backend_dir, "app", "models", "rppg_physnet_ubfc.pt"),
                os.path.join(backend_dir, "models", "rppg_physnet_ubfc.pth"),
                os.path.join(backend_dir, "models", "rppg_physnet_ubfc.pt"),
            ]
            for p in candidate_paths:
                if os.path.exists(p):
                    checkpoint_path = p
                    break

        if not checkpoint_path or not os.path.exists(checkpoint_path):
            logger.error("PhysNet checkpoint not found at expected paths.")
            self.status = "missing_weights"
            return False

        try:
            logger.info("Loading PhysNet weights from: %s", checkpoint_path)
            # Use weights_only=False because PyTorch saved a full state dict container
            ckpt = torch.load(checkpoint_path, map_location=self.device, weights_only=False)

            width = MODEL_WIDTH
            if isinstance(ckpt, dict):
                width = ckpt.get("width", MODEL_WIDTH)
                self.model_metadata = {
                    "width": width,
                    "clip_frames": ckpt.get("clip_frames", TARGET_FRAMES),
                    "clip_seconds": ckpt.get("clip_seconds", 20.0),
                    "best_mae": ckpt.get("best_mae"),
                    "finetune": ckpt.get("finetune"),
                }
                state_dict = ckpt.get("state_dict", ckpt)
            else:
                state_dict = ckpt

            model = PhysNet(width=width)
            model.load_state_dict(state_dict, strict=True)
            model.to(self.device)
            model.eval()

            self.model = model
            self.is_initialized = True
            self.status = "ready"
            logger.info("PhysNet rPPG model successfully loaded and ready for inference.")
            return True
        except Exception as exc:
            logger.error("Failed to initialize PhysNet model: %s", exc, exc_info=True)
            self.status = "error"
            self.is_initialized = False
            return False

    def get_status(self) -> str:
        return self.status

    def decode_and_crop_frame(
        self, frame_b64: str, bounding_box: Optional[Dict[str, float]] = None
    ) -> Optional[np.ndarray]:
        """Decodes base64 image and crops/resizes the facial region to (64, 64) in RGB [0, 1]."""
        try:
            if "," in frame_b64:
                frame_b64 = frame_b64.split(",", 1)[1]
            raw_bytes = base64.b64decode(frame_b64)
            np_arr = np.frombuffer(raw_bytes, np.uint8)
            img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            if img is None:
                return None

            # Convert BGR to RGB
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            h, w = img_rgb.shape[:2]

            # If a detected face bounding box is provided, crop specifically around the face
            if bounding_box and all(k in bounding_box for k in ("x", "y", "width", "height")):
                bx = max(0.0, min(1.0, float(bounding_box["x"])))
                by = max(0.0, min(1.0, float(bounding_box["y"])))
                bw = max(0.0, min(1.0, float(bounding_box["width"])))
                bh = max(0.0, min(1.0, float(bounding_box["height"])))

                # Add 10% context padding around the face box
                pad_w = bw * 0.1
                pad_h = bh * 0.1
                x1 = int(max(0, (bx - pad_w) * w))
                y1 = int(max(0, (by - pad_h) * h))
                x2 = int(min(w, (bx + bw + pad_w) * w))
                y2 = int(min(h, (by + bh + pad_h) * h))

                if (x2 - x1) > 10 and (y2 - y1) > 10:
                    cropped = img_rgb[y1:y2, x1:x2]
                else:
                    cropped = img_rgb
            else:
                # Central crop fallback
                min_dim = min(h, w)
                start_y = (h - min_dim) // 2
                start_x = (w - min_dim) // 2
                cropped = img_rgb[start_y:start_y + min_dim, start_x:start_x + min_dim]

            resized = cv2.resize(cropped, (CROP_SIZE, CROP_SIZE), interpolation=cv2.INTER_AREA)
            # Normalize to float32 [0, 1]
            norm_frame = resized.astype(np.float32) / 255.0
            return norm_frame
        except Exception as exc:
            logger.warning("Error decoding/preprocessing frame: %s", exc)
            return None

    def calculate_snr_and_confidence(
        self, waveform: np.ndarray, fs: float, peak_bpm: float
    ) -> Tuple[float, float, str]:
        """Calculates Signal-to-Noise Ratio (SNR in dB) and confidence metric around the peak heart rate frequency."""
        n = len(waveform)
        if n < 8 or np.isnan(peak_bpm) or peak_bpm < PHYSIOLOGICAL_MIN_BPM or peak_bpm > PHYSIOLOGICAL_MAX_BPM:
            return -20.0, 0.0, "unavailable"

        w = waveform - np.mean(waveform)
        freqs = np.fft.rfftfreq(n, d=1.0 / fs)
        ps = np.abs(np.fft.rfft(w * np.hanning(n))) ** 2

        # Fundamental HR frequency (Hz)
        f_hr = peak_bpm / 60.0

        # Physiological band: 0.7 - 3.0 Hz
        band_mask = (freqs >= 0.7) & (freqs <= 3.0)
        total_band_power = np.sum(ps[band_mask])
        if total_band_power <= 1e-9:
            return -20.0, 0.0, "unavailable"

        # Signal power: within +/- 0.15 Hz of fundamental and first harmonic (2 * f_hr)
        sig_mask_fund = (freqs >= f_hr - 0.15) & (freqs <= f_hr + 0.15)
        sig_mask_harm = (freqs >= 2 * f_hr - 0.15) & (freqs <= 2 * f_hr + 0.15)
        sig_mask = (sig_mask_fund | sig_mask_harm) & band_mask

        signal_power = np.sum(ps[sig_mask])
        noise_power = total_band_power - signal_power

        if noise_power <= 1e-9:
            snr_db = 15.0
            confidence = 0.95
        else:
            snr_db = float(10.0 * np.log10((signal_power + 1e-8) / (noise_power + 1e-8)))
            # Confidence based on proportion of band power in the pulse peaks
            confidence = float(np.clip(signal_power / total_band_power, 0.0, 1.0))

        # Qualitative classification
        if snr_db > 4.0 and confidence >= 0.55:
            quality = "high"
        elif snr_db > -1.0 and confidence >= 0.35:
            quality = "medium"
        elif snr_db > -6.0:
            quality = "low"
        else:
            quality = "unavailable"

        return round(snr_db, 2), round(confidence, 3), quality

    def analyze_sequence(
        self,
        frame_base64_list: List[str],
        client_fps: Optional[float] = None,
        timestamps_ms: Optional[List[float]] = None,
        bounding_boxes: Optional[List[Optional[Dict[str, float]]]] = None
    ) -> Dict[str, Any]:
        """Processes a sequence of facial frames using the real PhysNet 3D-CNN model."""
        # Ensure model is initialized
        if not self.is_initialized or self.model is None:
            init_ok = self.initialize()
            if not init_ok:
                return {
                    "status": "error",
                    "signal_available": False,
                    "heart_rate_bpm": None,
                    "signal_quality": "unavailable",
                    "snr_db": None,
                    "confidence": None,
                    "waveform": None,
                    "frames_processed": 0,
                    "effective_fps": 0.0,
                    "message": "rPPG model weights are unavailable or failed to initialize."
                }

        # 1. Decode valid frames with bounding box ROIs if available
        valid_frames: List[np.ndarray] = []
        valid_timestamps: List[float] = []

        for idx, b64_str in enumerate(frame_base64_list):
            bbox = bounding_boxes[idx] if (bounding_boxes and idx < len(bounding_boxes)) else None
            frame_arr = self.decode_and_crop_frame(b64_str, bounding_box=bbox)
            if frame_arr is not None:
                valid_frames.append(frame_arr)
                if timestamps_ms and idx < len(timestamps_ms):
                    valid_timestamps.append(timestamps_ms[idx])

        count = len(valid_frames)
        if count < MIN_REQUIRED_FRAMES:
            return {
                "status": "insufficient_data",
                "signal_available": False,
                "heart_rate_bpm": None,
                "signal_quality": "unavailable",
                "snr_db": None,
                "confidence": None,
                "waveform": None,
                "frames_processed": count,
                "effective_fps": 0.0,
                "message": f"Insufficient frames collected ({count}/{MIN_REQUIRED_FRAMES} required). Continue collecting."
            }

        # 2. Estimate effective frame rate
        # PhysNet trained at 6.4 - 30 FPS. Standard webcam capture runs at 10-30 FPS.
        effective_fps = 15.0  # sensible fallback
        if len(valid_timestamps) >= 2:
            duration_sec = (valid_timestamps[-1] - valid_timestamps[0]) / 1000.0
            if duration_sec > 0.3:
                calc_fps = (len(valid_timestamps) - 1) / duration_sec
                if 4.0 <= calc_fps <= 60.0:
                    effective_fps = calc_fps
                else:
                    logger.debug("Calculated FPS %s out of standard bounds [4, 60], using duration.", calc_fps)
        elif client_fps is not None and 4.0 <= client_fps <= 60.0:
            effective_fps = client_fps

        # 3. Stack frames into (T, H, W, 3)
        raw_clip = np.stack(valid_frames, axis=0)  # (N, 64, 64, 3)

        # 4. Temporal resampling to TARGET_FRAMES (128) if necessary
        if count == TARGET_FRAMES:
            clip_resampled = raw_clip
        else:
            # Interpolate temporally from count -> 128
            orig_indices = np.linspace(0, count - 1, count)
            target_indices = np.linspace(0, count - 1, TARGET_FRAMES)
            clip_resampled = np.zeros((TARGET_FRAMES, CROP_SIZE, CROP_SIZE, 3), dtype=np.float32)
            for c in range(3):
                for h in range(CROP_SIZE):
                    for w in range(CROP_SIZE):
                        clip_resampled[:, h, w, c] = np.interp(target_indices, orig_indices, raw_clip[:, h, w, c])

        # Adjust effective sampling rate post-resampling:
        # The 128 resampled frames span the duration of the original clip:
        duration_sec = count / max(effective_fps, 1.0)
        resampled_fs = TARGET_FRAMES / max(duration_sec, 0.5)

        # 5. Format tensor: (B, 3, T, H, W)
        tensor_in = np.transpose(clip_resampled, (3, 0, 1, 2))  # (3, 128, 64, 64)
        tensor_in = np.expand_dims(tensor_in, axis=0)           # (1, 3, 128, 64, 64)
        torch_tensor = torch.from_numpy(tensor_in).to(self.device, dtype=torch.float32)

        # 6. Execute Model Inference
        try:
            with torch.no_grad():
                output_wave = self.model(torch_tensor)  # (1, 128)
            waveform_np = output_wave[0].cpu().numpy()  # (128,)
        except Exception as exc:
            logger.error("Error during PhysNet model forward pass: %s", exc)
            return {
                "status": "error",
                "signal_available": False,
                "heart_rate_bpm": None,
                "signal_quality": "unavailable",
                "snr_db": None,
                "confidence": None,
                "waveform": None,
                "frames_processed": count,
                "effective_fps": round(effective_fps, 2),
                "message": f"Model inference error: {str(exc)}"
            }

        # 7. Extract Heart Rate (BPM) from waveform power spectrum
        raw_bpm = hr_from_wave(waveform_np, fs=resampled_fs, lo_hz=0.7, hi_hz=3.0)

        # 8. Compute SNR and spectral confidence
        snr_db, confidence, quality = self.calculate_snr_and_confidence(waveform_np, fs=resampled_fs, peak_bpm=raw_bpm)

        # Determine if BPM should be reported
        valid_bpm: Optional[float] = None
        signal_available = False

        if not np.isnan(raw_bpm) and PHYSIOLOGICAL_MIN_BPM <= raw_bpm <= PHYSIOLOGICAL_MAX_BPM:
            if confidence >= MIN_CONFIDENCE_THRESHOLD and quality in ("high", "medium"):
                valid_bpm = round(float(raw_bpm), 1)
                signal_available = True
                message = f"Valid pulse detected with {quality} signal quality ({valid_bpm} BPM)."
            elif quality == "low":
                signal_available = True
                valid_bpm = round(float(raw_bpm), 1)
                message = f"Weak pulse signal detected ({valid_bpm} BPM); stability check in progress."
            else:
                signal_available = False
                message = "Facial signal extracted but spectral confidence is below threshold; heart rate is not yet reliable."
        else:
            signal_available = False
            message = "No prominent pulse peak detected in the physiological band."

        # Subsample waveform to 32 points for lightweight UI visualization
        step = max(1, len(waveform_np) // 32)
        norm_wave = (waveform_np - np.mean(waveform_np)) / (np.std(waveform_np) + 1e-6)
        display_wave = [round(float(v), 3) for v in norm_wave[::step][:32]]

        return {
            "status": "success",
            "signal_available": signal_available,
            "heart_rate_bpm": valid_bpm,
            "signal_quality": quality,
            "snr_db": snr_db,
            "confidence": confidence,
            "waveform": display_wave,
            "frames_processed": count,
            "effective_fps": round(effective_fps, 2),
            "message": message
        }


# Global singleton instance
rppg_service = RPPGService()
