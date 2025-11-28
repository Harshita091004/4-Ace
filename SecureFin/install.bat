@echo off
REM SecureFin Installation Script for Windows
REM This script sets up the entire application

echo.
echo 🏦 SecureFin - Blockchain-Powered Personal Finance Tracker
echo =========================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js v14+
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js is installed: %NODE_VERSION%
echo.

REM Create directories
echo 📁 Setting up directories...
if not exist SecureFin mkdir SecureFin
if not exist SecureFin\backend mkdir SecureFin\backend
if not exist SecureFin\frontend mkdir SecureFin\frontend
if not exist SecureFin\frontend\src mkdir SecureFin\frontend\src
if not exist SecureFin\blockchain mkdir SecureFin\blockchain

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd SecureFin\backend
call npm install

REM Create .env file
echo 🔧 Creating backend configuration...
(
echo PORT=5000
echo MONGODB_URI=mongodb://localhost:27017/securefin
echo JWT_SECRET=securefin_jwt_secret_key_2024
echo NODE_ENV=development
echo BLOCKCHAIN_NETWORK=localhost
echo ETHEREUM_RPC_URL=http://localhost:8545
) > .env

echo ✅ Backend configured
echo.

REM Go back to root
cd ..\..\

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd SecureFin\frontend
call npm install

echo ✅ Frontend configured
echo.

REM Back to root
cd ..\..\

REM Display next steps
echo.
echo 🎉 Installation Complete!
echo.
echo 📝 Next Steps:
echo.
echo 1️⃣  Start MongoDB (if using local^):
echo    mongod
echo.
echo 2️⃣  Start Backend (Command Prompt 1^):
echo    cd SecureFin\backend ^&^& npm start
echo.
echo 3️⃣  Start Frontend (Command Prompt 2^):
echo    cd SecureFin\frontend ^&^& npm start
echo.
echo 4️⃣  Open Browser:
echo    http://localhost:3000
echo.
echo 📚 Documentation:
echo    - README.md - Feature overview
echo    - QUICKSTART.md - Quick start guide
echo    - SETUP.md - Detailed setup instructions
echo    - API_DOCUMENTATION.md - API reference
echo    - BLOCKCHAIN_DETAILS.md - Blockchain explanation
echo.
echo 🚀 Ready to launch SecureFin!
echo.
pause
