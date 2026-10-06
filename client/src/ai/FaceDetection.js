/**
 * PulseGuard AI — Face Detection Module (Stub)
 *
 * This module will be implemented in Phase 2.
 * It is responsible for detecting and tracking faces within a video frame.
 *
 * Expected Input:
 *   - videoElement: HTMLVideoElement — the live video stream element
 *   - canvas: HTMLCanvasElement — optional canvas for drawing
 *
 * Expected Output:
 *   {
 *     detected: boolean,
 *     faceCount: number,
 *     boundingBox: { x, y, width, height } | null,
 *     confidence: number,       // 0.0 – 1.0
 *     landmarks: Array<{x, y}> | null
 *   }
 *
 * Integration Point:
 *   Import and call `detectFace(videoElement)` inside the call screen
 *   after the remote stream is received and stable.
 */

export async function detectFace(videoElement) {
  // TODO: Phase 2 — Implement using MediaPipe Face Detection or TensorFlow.js BlazeFace
  return {
    detected: false,
    faceCount: 0,
    boundingBox: null,
    confidence: 0,
    landmarks: null,
    status: 'not_initialized'
  };
}

export function isFaceDetectionSupported() {
  // TODO: Check for WebGL / WASM support
  return false;
}
