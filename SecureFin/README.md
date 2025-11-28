# SecureFin - Blockchain-Powered Personal Finance Tracker

A comprehensive FinTech application designed for underserved communities in India, empowering users with secure financial management tools powered by blockchain technology.

## 🌟 Features

### Core Features Implemented

1. **Expense Tracking**
   - Categorized expense management (Food, Education, Travel, Entertainment, Utilities, Health, Shopping, Other)
   - Real-time expense recording
   - Monthly expense summaries
   - Blockchain-backed transaction logging for immutability

2. **Budgeting Tools**
   - Category-wise budget setting
   - AI-driven spending alerts
   - Budget vs. actual spending tracking
   - Visual progress indicators
   - Smart recommendations based on spending patterns

3. **Blockchain-Based Wallet**
   - Secure digital wallet with unique addresses
   - Peer-to-peer fund transfers
   - Mock cryptocurrency support
   - Immutable transaction history
   - SHA-256 hashing for transaction integrity

4. **Fraud Detection**
   - Anomaly detection using Z-score statistical analysis
   - Real-time suspicious activity alerts
   - Transaction flagging system
   - User-reported fraud management
   - Security recommendations

5. **Financial Literacy**
   - Interactive quizzes on Indian financial concepts
   - Mutual funds and investment basics
   - Government schemes (PM-KISAN, Sukanya Samriddhi)
   - Educational articles with Indian context
   - Progress tracking and badge system

6. **Security Features**
   - JWT authentication
   - Password encryption with bcryptjs
   - Two-factor authentication support
   - Secure wallet address generation
   - Private key management

### Technical Stack

**Backend:**
- Node.js & Express.js
- MongoDB for user data storage
- JWT for authentication
- Blockchain: Custom SHA-256 based blockchain implementation
- Encryption: bcryptjs for password hashing

**Frontend:**
- React 18
- React Router for navigation
- Axios for API calls
- Chart.js for data visualization
- Responsive design with CSS Grid/Flexbox

**Blockchain:**
- Custom Proof-of-Work implementation
- Immutable transaction logging
- Block mining with difficulty adjustment
- Chain validation and verification

## 📁 Project Structure

```
SecureFin/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Expense.js
│   │   ├── Budget.js
│   │   ├── Transaction.js
│   │   ├── Wallet.js
│   │   └── FinancialLiteracy.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── expenses.js
│   │   ├── budget.js
│   │   ├── wallet.js
│   │   ├── fraud.js
│   │   ├── blockchain.js
│   │   └── literacy.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── styles/
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   ├── package.json
│   └── .gitignore
└── blockchain/
    └── Blockchain.js
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MongoDB (local or Atlas)

### Backend Setup

1. Navigate to backend directory:
```bash
cd SecureFin/backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/securefin
JWT_SECRET=your_jwt_secret_key_change_this
NODE_ENV=development
```

4. Start the backend server:
```bash
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd SecureFin/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/enable-2fa` - Enable two-factor authentication

### Expenses
- `POST /api/expenses/add` - Add new expense
- `GET /api/expenses/all` - Get all expenses
- `GET /api/expenses/summary` - Get expense summary by category

### Budget
- `POST /api/budget/set` - Set budget for category
- `GET /api/budget/all` - Get all budgets

### Wallet
- `POST /api/wallet/create` - Create blockchain wallet
- `GET /api/wallet/info` - Get wallet information
- `POST /api/wallet/transfer` - Transfer funds P2P

### Fraud Detection
- `GET /api/fraud/alerts` - Get fraud alerts
- `POST /api/fraud/report` - Report fraudulent transaction

### Blockchain
- `GET /api/blockchain/ledger` - Get transaction ledger
- `GET /api/blockchain/info` - Get blockchain information
- `POST /api/blockchain/record-transaction` - Record transaction on blockchain

### Financial Literacy
- `GET /api/literacy/quizzes` - Get available quizzes
- `GET /api/literacy/quizzes/:quizId` - Get quiz questions
- `POST /api/literacy/quizzes/:quizId/submit` - Submit quiz
- `GET /api/literacy/articles` - Get articles
- `GET /api/literacy/progress` - Get user progress

## 🔒 Security Considerations

1. **Password Security**
   - Passwords hashed with bcryptjs (salt rounds: 10)
   - Never stored in plain text

2. **API Security**
   - JWT token-based authentication
   - Bearer token required in Authorization header
   - Token expiry: 7 days

3. **Blockchain Security**
   - SHA-256 hashing for transaction integrity
   - Proof-of-Work prevents tampering
   - Immutable transaction records

4. **Data Privacy**
   - Private keys never exposed in API responses
   - Sensitive data excluded from public queries
   - MongoDB indexing for efficient queries

## 🧪 Sample Data

### Test User
- Email: `user@securefin.com`
- Password: `SecurePassword123`

### Demo Expenses
- Food: ₹500
- Education: ₹1000
- Travel: ₹300

## 💡 Usage Scenarios

### For Students
- Track scholarship and part-time job income
- Manage education-related expenses
- Learn about investment basics
- Get alerts for unusual spending

### For Young Professionals
- Monitor multiple income sources
- Budget across various categories
- Peer-to-peer fund transfers with accountability
- Secure blockchain-backed transactions

### For Financial Inclusion
- Simple, intuitive interface
- Minimal technical knowledge required
- Educational content in Indian context
- Low-cost transactions

## 🎯 Hackathon Highlights

✅ **Blockchain Integration**: Custom SHA-256 blockchain with immutable transaction logging
✅ **Fraud Detection**: Z-score anomaly detection for unusual spending patterns
✅ **Security**: JWT authentication, password encryption, two-factor authentication
✅ **Financial Literacy**: Interactive quizzes and articles tailored to Indian users
✅ **User-Centric Design**: Responsive, intuitive interface for non-technical users
✅ **Scalability**: Designed for 50-100 users with proper indexing and optimization
✅ **Real-World Impact**: Addresses pain points of underserved communities

## 🔄 Blockchain Implementation

### Key Components
- **Block**: Contains transactions, timestamp, previous hash
- **Proof-of-Work**: Difficulty-adjusted mining algorithm
- **Chain Validation**: Verifies hash integrity and chain continuity
- **Transaction Hashing**: SHA-256 for transaction immutability

### Example Transaction Flow
1. User initiates transfer
2. Transaction hashed and stored
3. Block mined with proof-of-work
4. Added to immutable chain
5. Fraud detection analysis
6. User notified of completion

## 📊 Data Visualization

- **Pie Charts**: Expense breakdown by category
- **Bar Charts**: Spending trends over time
- **Progress Indicators**: Budget utilization
- **Tables**: Transaction history

## 🌐 Indian Context Features

- Multi-language support ready (Hindi, Tamil, Telugu, Kannada)
- UPI-like payment system
- Government scheme information
- Mutual fund guidance
- Regional currency support (₹ INR)

## 🐛 Future Enhancements

1. Voice-assisted inputs for low-literacy users
2. SMS notifications for transactions
3. Real UPI integration
4. ML-based spending predictions
5. Family/group expense splitting
6. Investment portfolio tracking
7. Credit score simulation
8. Real cryptocurrency integration (Testnet)

## 📝 License

MIT License - See LICENSE.md

## 👥 Team

Built for the Hackathon: SecureFin Challenge
Duration: 24 Hours

## 📞 Support

For issues, questions, or suggestions, please open an issue in the repository.

---

**SecureFin**: Empowering Financial Inclusion through Blockchain Technology 🚀
