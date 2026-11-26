@echo off
title CarePath AI - All Services Launcher
echo ===================================================================
echo 🏥 Starting CarePath AI (All Services)
echo ===================================================================
echo.

cd /d "%~dp0"

echo [1/3] Launching Python ML Service on Port 8000...
start "CarePath - ML Service (Port 8000)" cmd /k "cd /d %~dp0ml-service && python -m uvicorn main:app --port 8000 --host 127.0.0.1"

timeout /t 2 /nobreak >nul

echo [2/3] Launching Node.js Backend Server on Port 5000...
start "CarePath - Backend Server (Port 5000)" cmd /k "cd /d %~dp0server && npm run dev"

timeout /t 2 /nobreak >nul

echo [3/3] Launching React Vite Frontend Client on Port 3000...
start "CarePath - Frontend Client (Port 3000)" cmd /k "cd /d %~dp0client && npm run dev -- --host"

timeout /t 3 /nobreak >nul

echo.
echo ===================================================================
echo ✅ All 3 CarePath AI services have been started in separate windows!
echo.
echo 🌐 Frontend Client:  http://localhost:3000
echo ⚙️ Backend API:      http://localhost:5000
echo 🧠 ML Engine:        http://127.0.0.1:8000
echo ===================================================================
echo.
echo Opening browser to http://localhost:3000...
start http://localhost:3000
