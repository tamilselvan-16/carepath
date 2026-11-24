# CarePath AI - PowerShell All-In-One Service Launcher
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "🏥 Starting CarePath AI (All Services)" -ForegroundColor Cyan
Write-Host "===================================================================" -ForegroundColor Cyan

$root = $PSScriptRoot

Write-Host "`n[1/3] Launching Python ML Service on Port 8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", "cd '$root\ml-service'; & '$root\.venv\Scripts\python.exe' -m uvicorn main:app --port 8000 --host 127.0.0.1"

Start-Sleep -Seconds 2

Write-Host "[2/3] Launching Node.js Backend Server on Port 5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", "cd '$root\server'; npm.cmd run dev"

Start-Sleep -Seconds 2

Write-Host "[3/3] Launching React Vite Frontend Client on Port 3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", "cd '$root\client'; npm.cmd run dev"

Start-Sleep -Seconds 3

Write-Host "`n===================================================================" -ForegroundColor Green
Write-Host "✅ All 3 CarePath AI services have been launched successfully!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "⚙️ Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "🧠 ML:       http://127.0.0.1:8000" -ForegroundColor White
Write-Host "===================================================================" -ForegroundColor Green

Start-Process "http://localhost:3000"
