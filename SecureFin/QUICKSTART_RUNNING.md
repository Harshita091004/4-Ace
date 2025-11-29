# SecureFin - Quick Start Guide ✨

## Project Status: ✅ RUNNING & READY TO USE

### What's Running
- **Backend Server**: Running on `http://localhost:5001` ✅
- **Frontend App**: Running on `http://localhost:3000` ✅
- **Database**: In-memory MongoDB (mongodb-memory-server) ✅

---

## Getting Started

### Step 1: Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

### Step 2: Create a New Account (Register)
1. You'll see the Register screen
2. Fill in the following:
   - **Full Name**: Any name (e.g., "John Doe")
   - **Email**: Any email format (e.g., "john@example.com")
   - **Phone**: Optional phone number
   - **Password**: Any password (e.g., "password123")
3. Click **"Register"**
4. You'll be automatically logged in and redirected to Dashboard

### Step 3: Login (If You Close the App)
If you close the browser or clear localStorage:
1. Click **"Login"** on the auth screen
2. Enter the email and password you registered with
3. You'll be logged back in

---

## Features & Navigation

After login, you'll see the navigation menu with:

### 📊 Dashboard
- Overview of your financial status
- Quick stats and summary

### 💸 Expenses
- Add new expenses
- View all your expenses
- Track by category and date
- Real-time budget alerts

### 📈 Budget
- Set budgets for different categories
- Monitor spending vs. budget
- Get alerts when approaching limits

### 💰 Wallet
- Manage your blockchain wallet
- Track cryptocurrency transactions
- View wallet balance

### 🔒 Security
- Fraud detection
- Suspicious activity alerts
- Two-factor authentication setup

### 📚 Learn
- Financial literacy resources
- Tips and guides for money management

### 🤖 AI Insights **(NEW!)**
- Personalized spending recommendations
- Detailed expense analysis
- Anomaly detection for unusual spending
- 30-day spending predictions
- Category-wise analysis

---

## Adding Expenses (To Test AI Features)

1. Go to **Expenses** tab
2. Click **"Add New Expense"**
3. Fill in:
   - **Amount**: Any number (e.g., 500)
   - **Category**: Select from dropdown
   - **Description**: Optional note
   - **Payment Method**: Cash/Card/UPI/Wallet
4. Click **"Add Expense"**
5. Repeat to add multiple expenses

### Recommended Test Data
Add expenses across different categories and times:
```
- Food: ₹450, ₹300, ₹600
- Travel: ₹1000, ₹500
- Shopping: ₹2000, ₹800
- Entertainment: ₹300
- Utilities: ₹1500
```

---

## Testing AI Features 🤖

### After adding expenses:

1. **Go to AI Insights**
   - Click **"🤖 AI Insights"** in navbar

2. **View Recommendations**
   - Get personalized spending tips
   - See priority levels (High/Medium/Low)
   - Get category reduction suggestions

3. **Analyze Patterns**
   - View detailed expense report
   - See category breakdown
   - Identify peak spending hours

4. **Detect Anomalies**
   - Find unusual spending patterns
   - See statistical deviation info
   - Review suspicious transactions

5. **Get Predictions**
   - See 30-day spending forecast
   - Get category-wise predictions
   - Plan future budgets

6. **Change Time Range**
   - Filter by: 7, 30, 60, or 90 days
   - Data updates automatically

---

## API Endpoints (For Development)

### Authentication
```
POST /api/auth/register
POST /api/auth/login
```

### Expenses
```
GET  /api/expenses/all              - Get all expenses
POST /api/expenses/add              - Add new expense
GET  /api/expenses/summary          - Monthly summary
GET  /api/expenses/recommendations  - AI recommendations
GET  /api/expenses/ai-report        - Full AI report
GET  /api/expenses/anomalies        - Detect anomalies
GET  /api/expenses/predict          - Future predictions
```

### Test with cURL:
```bash
# Register
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123",
    "phone": "1234567890"
  }'

# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

---

## Data Persistence Notes

⚠️ **Important**: The app uses an in-memory database for development:
- Data is **NOT** persisted between server restarts
- Perfect for testing and development
- For production, set `MONGODB_URI` in `.env` to a real MongoDB instance

### To Use Real MongoDB:
1. Install MongoDB locally or use MongoDB Atlas
2. Update `.env` file in backend folder:
   ```
   MONGODB_URI=mongodb://your-mongodb-url:27017/securefin
   ```
3. Restart the backend server

---

## Troubleshooting

### Issue: Can't access localhost:3000
**Solution**: Check if frontend is running:
- Look for "webpack compiled with X warnings" in terminal
- Frontend takes 30-60 seconds to start on first run

### Issue: Getting 401 errors (Unauthorized)
**Solution**: 
- Clear browser localStorage: Press F12 → Application → LocalStorage → Clear
- Register and login again

### Issue: Expenses not showing
**Solution**:
- Add expenses first (they won't appear until you add some)
- Check browser console (F12) for any errors
- Ensure backend is running on port 5001

### Issue: AI recommendations not loading
**Solution**:
- Add at least 1-2 expenses first
- Wait for data to load
- Check if backend is responding: `http://localhost:5001/api/expenses/all`

### Issue: Backend won't start
**Solution**:
1. Kill any existing node processes:
   ```powershell
   Get-Process node | Stop-Process -Force
   ```
2. Restart the backend:
   ```powershell
   cd "C:\all programs\4-ace\4-ace\SecureFin\backend"
   npm start
   ```

---

## Performance Tips

- **First Load**: May take 1-2 minutes (webpack compilation)
- **Adding Expenses**: Instant with in-memory DB
- **AI Analysis**: <1 second for 500+ transactions
- **Multiple Queries**: No issues - lightweight analyzer

---

## Next Steps

1. ✅ Test registration and login
2. ✅ Add some expenses
3. ✅ Explore the Dashboard
4. ✅ Go to AI Insights and review recommendations
5. ✅ Test anomaly detection with unusual spending
6. ✅ Try different time ranges for analysis

---

## Project Structure

```
SecureFin/
├── backend/
│   ├── server.js                 # Express server
│   ├── .env                      # Configuration
│   ├── models/                   # Database models
│   │   └── User.js, Expense.js, etc.
│   ├── routes/                   # API endpoints
│   │   ├── auth.js              # Authentication
│   │   └── expenses.js          # Expense management
│   └── ai/
│       └── expenseAnalyzer.js   # AI recommendation engine (NEW!)
├── frontend/
│   ├── src/
│   │   ├── App.js               # Main component
│   │   ├── components/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── ExpenseTracker.js
│   │   │   └── AIRecommendations.js  # AI UI component (NEW!)
│   │   └── styles/
│   │       └── AIRecommendations.css # AI styling (NEW!)
│   └── package.json
└── blockchain/
    └── Blockchain.js             # Transaction blockchain
```

---

## Key Technologies

- **Backend**: Node.js, Express, MongoDB (in-memory for dev)
- **Frontend**: React, Axios, Chart.js
- **Authentication**: JWT (JSON Web Tokens)
- **AI**: Statistical analysis (no ML libraries - lightweight!)
- **Blockchain**: Custom transaction logging

---

## Support & Documentation

- 📖 **Full AI Guide**: See `AI_RECOMMENDATIONS_GUIDE.md`
- 🔧 **API Docs**: See `API_DOCUMENTATION.md`
- ❓ **FAQ**: Check existing documentation files

---

**Happy Expense Tracking! 💰**

For any issues, check the console (F12) for error messages.
