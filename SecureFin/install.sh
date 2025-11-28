#!/bin/bash

# SecureFin Installation Script
# This script sets up the entire application with one command

echo "🏦 SecureFin - Blockchain-Powered Personal Finance Tracker"
echo "========================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v14+"
    exit 1
fi

echo "✅ Node.js is installed: $(node --version)"
echo ""

# Create directories if they don't exist
echo "📁 Setting up directories..."
mkdir -p SecureFin/backend
mkdir -p SecureFin/frontend/src/{components,styles}
mkdir -p SecureFin/blockchain

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd SecureFin/backend
npm install

# Create .env file
echo "🔧 Creating backend configuration..."
cat > .env << EOF
PORT=5000
MONGODB_URI=mongodb://localhost:27017/securefin
JWT_SECRET=securefin_jwt_secret_key_2024
NODE_ENV=development
BLOCKCHAIN_NETWORK=localhost
ETHEREUM_RPC_URL=http://localhost:8545
EOF

echo "✅ Backend configured"
echo ""

# Go back to root
cd ../

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

echo "✅ Frontend configured"
echo ""

# Back to root
cd ../../

# Display next steps
echo ""
echo "🎉 Installation Complete!"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1️⃣  Start MongoDB (if using local):"
echo "   mongod"
echo ""
echo "2️⃣  Start Backend (Terminal 1):"
echo "   cd SecureFin/backend && npm start"
echo ""
echo "3️⃣  Start Frontend (Terminal 2):"
echo "   cd SecureFin/frontend && npm start"
echo ""
echo "4️⃣  Open Browser:"
echo "   http://localhost:3000"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Feature overview"
echo "   - QUICKSTART.md - Quick start guide"
echo "   - SETUP.md - Detailed setup instructions"
echo "   - API_DOCUMENTATION.md - API reference"
echo "   - BLOCKCHAIN_DETAILS.md - Blockchain explanation"
echo ""
echo "🚀 Ready to launch SecureFin!"
echo ""
