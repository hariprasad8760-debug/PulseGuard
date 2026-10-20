# PulseGuard AI — Python FastAPI Backend

FastAPI backend service for **PulseGuard AI** (Real-Time Deepfake and Liveness Detection for Secure Video Calls).

---

## 🚀 Overview

This backend service provides:
1. **Health Check API** (`GET /api/health`): Real-time verification of backend availability and framework information.
2. **Status API** (`GET /api/status`): Live implementation readiness report for all AI security modules.
3. **Analysis Contract API** (`POST /api/analyze`): Pydantic-validated request contract prepared for subsequent AI detection pipeline stages.
4. **Integration Points**: Service interfaces for OpenCV/MediaPipe face detection, PhysNet rPPG pulse extraction, CNN deepfake detection, temporal analysis, and multi-signal ensemble risk scoring.

---

## 🛠️ Prerequisites

- Python 3.10+ (or Python 3.14+)
- Virtual environment (`venv`)

---

## 💻 Local Setup & Execution

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Activate the virtual environment**:
   - **Windows (PowerShell)**:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS**:
     ```bash
     source venv/bin/activate
     ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```

5. **Run the FastAPI development server**:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

6. **Interactive Documentation**:
   - Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
   - ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 🧪 Running Automated Tests

Run the full test suite with `pytest`:
```bash
pytest -v
```

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description | Status Code |
|---|---|---|---|
| `GET` | `/api/health` | Verified application health check | `200 OK` |
| `GET` | `/api/status` | Current availability & AI module status | `200 OK` |
| `POST` | `/api/analyze` | Video frame analysis contract (Step 1 not-ready) | `503 Service Unavailable` |
