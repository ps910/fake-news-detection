@echo off
echo ==========================================
echo  Fake News Detection - Setup Script
echo ==========================================
echo.

:: Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

:: Check for Python
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed. Please install Python 3.8+ first.
    echo Download from: https://www.python.org/
    pause
    exit /b 1
)

echo [OK] Node.js found
echo [OK] Python found
echo.

:: Setup ML API
echo ==========================================
echo  Setting up ML API...
echo ==========================================
cd /d "%~dp0\.."
pip install flask flask-cors --quiet
echo [OK] ML API dependencies installed
echo.

:: Setup Backend
echo ==========================================
echo  Setting up Backend...
echo ==========================================
cd /d "%~dp0\backend"
call npm install
if not exist ".env" (
    copy .env.example .env
    echo [INFO] Created .env file from template. Please update with your settings.
)
echo [OK] Backend dependencies installed
echo.

:: Setup Frontend
echo ==========================================
echo  Setting up Frontend...
echo ==========================================
cd /d "%~dp0\frontend"
call npm install
echo [OK] Frontend dependencies installed
echo.

echo ==========================================
echo  Setup Complete!
echo ==========================================
echo.
echo Next steps:
echo 1. Update webapp/backend/.env with your MongoDB URI and JWT secret
echo 2. Make sure MongoDB is running
echo 3. Run: start_all.bat to start all services
echo.
pause
