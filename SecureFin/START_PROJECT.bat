@echo off
REM SecureFin Quick Start Script for Windows CMD
REM This script starts both backend and frontend servers

setlocal enabledelayedexpansion

echo.
echo ================================
echo SecureFin - Project Launcher
echo ================================
echo.

REM Check if Node.js is installed
echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
echo [OK] Node.js %NODE_VER% found
echo.

REM Start Backend
echo Starting Backend Server...
cd /d "c:\Users\hp\OneDrive\Desktop\void hack\SecureFin\backend"
if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install --silent
)

echo Launching backend in new window...
start "SecureFin Backend" cmd /k "cd /d "c:\Users\hp\OneDrive\Desktop\void hack\SecureFin\backend" && node server.js"
timeout /t 5 /nobreak

echo [OK] Backend started
echo Testing backend connectivity...
powershell -Command "try { Invoke-RestMethod -Uri 'http://localhost:5000/health' -TimeoutSec 3 -ErrorAction Stop | Out-Null; Write-Host '[OK] Backend is responding' } catch { Write-Host '[WARN] Backend still initializing...' }"

echo.
echo Starting Frontend Server...
cd /d "c:\Users\hp\OneDrive\Desktop\void hack\SecureFin\frontend"
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install --silent
)

echo Launching frontend in new window...
start "SecureFin Frontend" cmd /k "cd /d "c:\Users\hp\OneDrive\Desktop\void hack\SecureFin\frontend" && npm start"

echo.
echo ================================
echo [OK] PROJECT STARTED SUCCESSFULLY
echo ================================
echo.
echo URLS:
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:5000
echo.
echo TEST CREDENTIALS:
echo   Email:    testuser@example.com
echo   Password: Password123!
echo.
echo NEXT STEPS:
echo 1. Wait 10-15 seconds for React to compile
echo 2. Open http://localhost:3000 in your browser
echo 3. Click 'Register' to create a new account
echo 4. Or use test credentials to login if user exists
echo.
echo To stop servers: Close both terminal windows
echo.
pause
