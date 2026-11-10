@echo off
title PulseGuard AI - Full Stack Launcher
echo ======================================================================
echo           Starting PulseGuard AI - All Services Launcher              
echo ======================================================================
echo  1. Node.js WebRTC Signaling Server (Port 3001)
echo  2. Vite React Frontend (Port 3000) -^> http://localhost:3000
echo  3. Python FastAPI + PhysNet rPPG AI Backend (Port 8000)
echo ======================================================================
echo.

:: Automatically clear any stale processes on ports 3000, 3001, 8000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1

npm run dev
