/**
 * PulseGuard AI — Python FastAPI Backend Client Service
 *
 * Provides communication with the Python FastAPI service on port 8000.
 * Completely separate from Node.js WebRTC signaling on port 3001.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Checks connectivity with the Python FastAPI health endpoint.
 *
 * @returns {Promise<{ available: boolean, data?: object, error?: string }>}
 */
export async function checkBackendHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        available: false,
        error: `HTTP ${response.status}: ${response.statusText}`
      };
    }

    const data = await response.json();
    if (data && data.status === 'ok') {
      return {
        available: true,
        data
      };
    }

    return {
      available: false,
      error: 'Invalid response format from backend'
    };
  } catch (err) {
    return {
      available: false,
      error: err.name === 'AbortError' ? 'Connection timed out' : 'Backend unavailable'
    };
  }
}

/**
 * Retrieves the implementation status of all backend AI modules.
 *
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
export async function getBackendStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/status`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Validates analysis contract against the backend.
 *
 * @param {object} payload
 * @returns {Promise<{ status: string, message: string }>}
 */
export async function requestAnalysis(payload) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return {
      statusCode: response.status,
      ...data
    };
  } catch (err) {
    return {
      statusCode: 503,
      status: 'error',
      message: 'Failed to reach AI analysis service.'
    };
  }
}

export { API_BASE_URL };

/**
 * Sends a captured webcam frame to the OpenCV & MediaPipe face detection API.
 *
 * @param {string} frameBase64 - Base64 encoded JPEG or PNG image
 * @param {string} [roomCode] - Optional room session identifier
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
export async function detectFaceFromFrame(frameBase64, roomCode = null) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${API_BASE_URL}/api/face/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        frame_base64: frameBase64,
        room_code: roomCode
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errData.detail || `HTTP ${response.status}: ${response.statusText}`
      };
    }

    const data = await response.json();
    return {
      success: true,
      data
    };
  } catch (err) {
    return {
      success: false,
      error: err.name === 'AbortError' ? 'Analysis timed out' : 'Backend unavailable'
    };
  }
}

