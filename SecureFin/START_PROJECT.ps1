# SecureFin Quick Start Script for Windows PowerShell
# This script starts both backend and frontend servers

Write-Host "================================" -ForegroundColor Cyan
Write-Host "SecureFin - Project Launcher" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Node.js $nodeVersion found" -ForegroundColor Green
Write-Host ""

# Start Backend in background
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
$backendPath = "c:\Users\hp\OneDrive\Desktop\void hack\SecureFin\backend"
Set-Location $backendPath

if (!(Test-Path "node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    npm install --silent
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Backend npm install failed" -ForegroundColor Red
        exit 1
    }
}

# Start backend in a separate PowerShell window
$backendScript = @"
`$ErrorActionPreference = 'Continue'
Set-Location "$backendPath"
node server.js
"@

$args = @("-NoExit", "-Command", $backendScript)
Start-Process powershell -ArgumentList $args -WindowStyle Normal

Write-Host "✓ Backend started in new window" -ForegroundColor Green
Write-Host "  Waiting 5 seconds for backend to initialize..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Test backend health
Write-Host "Testing backend connectivity..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri 'http://localhost:5000/health' -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✓ Backend is running and responding" -ForegroundColor Green
} catch {
    Write-Host "⚠ Backend may still be initializing, continuing anyway..." -ForegroundColor Yellow
}
Write-Host ""

# Start Frontend in background
Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
$frontendPath = "c:\Users\hp\OneDrive\Desktop\void hack\SecureFin\frontend"
Set-Location $frontendPath

if (!(Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install --silent
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Frontend npm install failed" -ForegroundColor Red
        exit 1
    }
}

# Start frontend in a separate PowerShell window
$frontendScript = @"
`$ErrorActionPreference = 'Continue'
Set-Location "$frontendPath"
npm start
"@

$args = @("-NoExit", "-Command", $frontendScript)
Start-Process powershell -ArgumentList $args -WindowStyle Normal

Write-Host "✓ Frontend started in new window" -ForegroundColor Green
Write-Host ""

Write-Host "================================" -ForegroundColor Cyan
Write-Host "✓ PROJECT STARTED SUCCESSFULLY" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "URLS:" -ForegroundColor Yellow
Write-Host "  Frontend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Backend:   http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "TEST CREDENTIALS:" -ForegroundColor Yellow
Write-Host "  Email:    testuser@example.com" -ForegroundColor Cyan
Write-Host "  Password: Password123!" -ForegroundColor Cyan
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Wait 10-15 seconds for React to compile" -ForegroundColor White
Write-Host "2. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "3. Click 'Register' to create a new account" -ForegroundColor White
Write-Host "4. Or use test credentials to login if user exists" -ForegroundColor White
Write-Host ""
Write-Host "To stop servers: Close both terminal windows" -ForegroundColor Yellow
Write-Host ""
