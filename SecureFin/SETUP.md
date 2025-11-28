# SecureFin - Setup & Deployment Guide

## Quick Start (5 minutes)

### Option 1: Using npm scripts

#### Terminal 1 - Backend
```bash
cd SecureFin/backend
npm install
npm start
```

#### Terminal 2 - Frontend
```bash
cd SecureFin/frontend
npm install
npm start
```

### Option 2: Docker (if available)

```bash
docker-compose up
```

---

## Detailed Setup Instructions

### 1. MongoDB Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB Community Edition
# Then run:
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `.env` with connection string

### 2. Backend Installation

```bash
cd SecureFin/backend

# Install dependencies
npm install

# Create .env file
echo "PORT=5000" > .env
echo "MONGODB_URI=mongodb://localhost:27017/securefin" >> .env
echo "JWT_SECRET=securefin_jwt_secret_key_2024" >> .env
echo "NODE_ENV=development" >> .env

# Start server
npm start
```

**Expected Output:**
```
SecureFin Backend running on port 5000
Connected to MongoDB
```

### 3. Frontend Installation

```bash
cd SecureFin/frontend

# Install dependencies
npm install

# Start development server
npm start
```

**Expected Output:**
```
Compiled successfully!
You can now view securefin-frontend in the browser.
  Local: http://localhost:3000
```

---

## Testing the Application

### 1. Create an Account
1. Go to `http://localhost:3000`
2. Click "Register"
3. Fill in details:
   - Name: Test User
   - Email: test@securefin.com
   - Phone: 9999999999
   - Password: Test@1234

### 2. Test Features

**Dashboard**
- View expense summary
- Check wallet balance
- See recent transactions

**Expense Tracker**
- Add expense: ₹500 for Food
- Add expense: ₹1000 for Education
- View expenses in table

**Budget Manager**
- Set Food budget: ₹2000
- Set Education budget: ₹5000
- View budget status and suggestions

**Wallet**
- Click "Create Wallet"
- Copy wallet address
- Transfer funds to test P2P

**Fraud Detection**
- System analyzes transactions
- View suspicious activity alerts
- See security recommendations

**Financial Literacy**
- Take "Basics of Mutual Funds" quiz
- Read learning articles
- Check progress

---

## Environment Variables

### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/securefin

# Authentication
JWT_SECRET=your_secret_key_here
JWT_EXPIRY=7d

# Blockchain
BLOCKCHAIN_NETWORK=localhost
ETHEREUM_RPC_URL=http://localhost:8545

# Wallet
WALLET_INITIAL_BALANCE=1000
```

---

## Troubleshooting

### Port Already in Use
```bash
# Windows - Find process using port 5000
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F

# Or use different port
PORT=5001 npm start
```

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Ensure MongoDB is running
```bash
# Windows
mongod

# Mac
brew services start mongodb-community
```

### CORS Error
**Solution**: Backend CORS is configured. Ensure frontend URL is correct in headers.

### Blank Frontend Page
**Solution**: Check browser console (F12) for errors. Ensure backend is running on port 5000.

---

## API Testing with Postman

### 1. Import Endpoints
Create a Postman collection with:

**Register User**
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@securefin.com",
  "password": "Test@1234",
  "phone": "9999999999"
}
```

**Login**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@securefin.com",
  "password": "Test@1234"
}
```

**Add Expense** (with token from login response)
```
POST http://localhost:5000/api/expenses/add
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "amount": 500,
  "category": "food",
  "description": "Lunch expense",
  "paymentMethod": "cash"
}
```

---

## Production Deployment

### Backend Deployment (Heroku)

```bash
# Install Heroku CLI
# Then:
heroku login
heroku create securefin-backend
heroku addons:create mongolab:sandbox
git push heroku main
```

### Frontend Deployment (Vercel/Netlify)

```bash
npm run build
# Upload 'build' folder to Vercel or Netlify
```

---

## Performance Optimization

### Database Indexing
Indexes are already created in models:
- `User`: email (unique)
- `Expense`: userId, category, date
- `Transaction`: fromUserId, blockchainHash
- `Wallet`: userId, walletAddress

### Caching Strategy
Implement Redis caching for:
- User profiles
- Expense summaries
- Budget data

---

## Monitoring & Logs

### Backend Logs
```bash
# View with timestamp
npm start 2>&1 | tee server.log
```

### Frontend Debugging
Open DevTools (F12) and check:
- Network tab for API calls
- Console for errors
- Storage for JWT tokens

---

## Security Checklist

- [ ] Change JWT_SECRET to strong random string
- [ ] Enable HTTPS in production
- [ ] Set MongoDB connection string to Atlas (not local)
- [ ] Enable 2FA for user accounts
- [ ] Rate limit API endpoints
- [ ] Add request validation
- [ ] Enable CORS only for trusted domains
- [ ] Encrypt private keys in wallet

---

## Support & Help

For detailed information:
- See README.md for feature documentation
- Check individual component files for code comments
- Review API endpoints in route files

---

**Ready to launch SecureFin!** 🚀
