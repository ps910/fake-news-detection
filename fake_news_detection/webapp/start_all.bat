@echo off
echo ==========================================
echo  Fake News Detection - Starting Services
echo ==========================================
echo.

:: Start ML API
echo [1/3] Starting ML API on port 5000...
start "ML API" cmd /k "cd /d %~dp0\.. && python api/ml_api.py"
timeout /t 3 /nobreak >nul

:: Start Backend
echo [2/3] Starting Backend on port 3001...
start "Backend" cmd /k "cd /d %~dp0\backend && npm run dev"
timeout /t 3 /nobreak >nul

:: Start Frontend
echo [3/3] Starting Frontend on port 3000...
start "Frontend" cmd /k "cd /d %~dp0\frontend && npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo ==========================================
echo  All services started!
echo ==========================================
echo.
echo Services running:
echo   - ML API:    http://localhost:5000
echo   - Backend:   http://localhost:3001
echo   - Frontend:  http://localhost:3000
echo.
echo Opening application in browser...
timeout /t 2 /nobreak >nul
start http://localhost:3000
echo.
echo Press any key to stop all services...
pause >nul

:: Kill all processes
taskkill /FI "WINDOWTITLE eq ML API*" /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq Backend*" /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq Frontend*" /F >nul 2>nul
echo Services stopped.
