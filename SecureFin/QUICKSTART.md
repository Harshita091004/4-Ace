# SecureFin - Quick Start Guide (5 Minutes)

## 🚀 Start the Application

### Prerequisites
- Node.js v14+ installed
- MongoDB running locally or MongoDB Atlas connection string

### Step 1: Start Backend (Terminal 1)
```bash
cd SecureFin/backend
npm install
npm start
```

**Expected Output:**
```
SecureFin Backend running on port 5000
Connected to MongoDB
```

### Step 2: Start Frontend (Terminal 2)
```bash
cd SecureFin/frontend
npm install
npm start
```

**Expected Output:**
```
Compiled successfully!
Local: http://localhost:3000
```

### Step 3: Open Application
- Open browser to `http://localhost:3000`
- You're ready to go! 🎉

---

## 📝 Test Credentials

### Option A: Create New Account
1. Click "Register"
2. Fill in your details
3. Click "Register"

### Option B: Use Sample Data (if imported)
```
Email: test@securefin.com
Password: Test@1234
```

---

## ✅ Quick Feature Testing

### 1. Dashboard
- **What to see**: Expense summary, wallet balance, recent transactions
- **Chart types**: Pie chart (categories), Bar chart (trends)

### 2. Add Expense
- **Go to**: Expenses tab
- **Try**: Add ₹500 for "Food"
- **Result**: Expense appears in table and dashboard

### 3. Set Budget
- **Go to**: Budget tab
- **Try**: Set ₹2000 limit for "Food"
- **Result**: Budget card shows usage status

### 4. Create Wallet
- **Go to**: Wallet tab
- **Click**: "Create Wallet"
- **Get**: Wallet address with initial ₹1000 balance

### 5. Check Fraud Alerts
- **Go to**: Security tab
- **See**: System analyzes transactions
- **Add unusual expense** for testing anomaly detection

### 6. Learn Finance
- **Go to**: Learn tab
- **Take**: "Basics of Mutual Funds" quiz
- **Read**: Financial literacy articles
- **Track**: Your progress

---

## 🔧 Troubleshooting

### Issue: Backend won't start
```bash
# Check if MongoDB is running
# If using local MongoDB:
mongod

# Or update .env to use MongoDB Atlas connection string
```

### Issue: Frontend blank page
```bash
# Open DevTools (F12)
# Check Console tab for errors
# Ensure backend is running on port 5000
```

### Issue: Port 3000 or 5000 already in use
```bash
# Kill process using port
# Windows: 
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port
PORT=3001 npm start  # in frontend
PORT=5001 npm start  # in backend
```

### Issue: Dependencies won't install
```bash
# Clear cache and reinstall
npm cache clean --force
npm install
```

---

## 📚 Key Files to Understand

### Backend
- `server.js` - Main server file
- `routes/auth.js` - Authentication endpoints
- `routes/expenses.js` - Expense tracking
- `routes/blockchain.js` - Blockchain integration
- `blockchain/Blockchain.js` - Custom blockchain implementation

### Frontend
- `src/App.js` - Main app component
- `src/components/Dashboard.js` - Dashboard page
- `src/components/ExpenseTracker.js` - Expense management
- `src/components/BudgetManager.js` - Budget management
- `src/components/FinancialLiteracy.js` - Learning module

---

## 🎯 Key Features Overview

| Feature | Implementation |
|---------|-----------------|
| **Authentication** | JWT tokens, password hashing |
| **Expense Tracking** | MongoDB storage, categorization |
| **Budgeting** | AI suggestions, spending alerts |
| **Blockchain Wallet** | SHA-256 hashing, P2P transfers |
| **Fraud Detection** | Z-score anomaly detection |
| **Financial Literacy** | Interactive quizzes, articles |
| **Visualizations** | Pie charts, bar charts |
| **Security** | 2FA support, encryption |

---

## 📊 API Quick Reference

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"Pass123"}'

# Add Expense
curl -X POST http://localhost:5000/api/expenses/add \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount":500,"category":"food","description":"Lunch"}'
```

---

## 🎓 Learning Objectives

After using SecureFin, you'll understand:
1. How to track personal finances
2. Blockchain's role in immutable transactions
3. Fraud detection using anomaly analysis
4. Budget management with AI recommendations
5. Financial literacy for underserved communities

---

## 🌟 Hackathon Highlights

✨ **Blockchain**: Custom SHA-256 implementation
✨ **Fraud Detection**: Machine learning anomaly detection
✨ **User-Friendly**: Intuitive interface for non-technical users
✨ **Indian Context**: Relevant financial products and schemes
✨ **Security**: Multiple layers of data protection
✨ **Real-Time**: Live updates and alerts

---

## 💡 Pro Tips

1. **Test Fraud Detection**: Add many expenses, then add one very different amount
2. **Explore Charts**: Pie chart shows category breakdown, bar chart shows trends
3. **Check Blockchain**: Every transaction gets a blockchain hash
4. **Take Quizzes**: Earn points and badges on the learning module
5. **Two-Factor Auth**: Enable 2FA in user profile settings

---

## 📞 Need Help?

1. Check `README.md` for detailed feature documentation
2. See `SETUP.md` for installation troubleshooting
3. Review `API_DOCUMENTATION.md` for API endpoint details
4. Read `BLOCKCHAIN_DETAILS.md` for blockchain explanation

---

## 🚀 Ready to Launch!

Your SecureFin application is now running. Enjoy exploring the future of personal finance! 💰🔐

**Version**: 1.0.0  
**Status**: Production Ready for Hackathon  
**Last Updated**: January 2024
