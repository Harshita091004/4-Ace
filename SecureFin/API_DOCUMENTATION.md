# SecureFin API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require Bearer token in Authorization header:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Authentication Endpoints

### Register User
```
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "phone": "9999999999"
}

Response: 201
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Login User
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123"
}

Response: 200
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

## User Endpoints

### Get User Profile
```
GET /users/profile
Authorization: Bearer <TOKEN>

Response: 200
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9999999999",
  "monthlyBudget": 10000,
  "preferredLanguage": "en",
  "twoFactorEnabled": false,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Update User Profile
```
PUT /users/profile
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "name": "John Updated",
  "phone": "8888888888",
  "monthlyBudget": 15000,
  "preferredLanguage": "hi"
}

Response: 200
{ updated user object }
```

### Enable Two-Factor Authentication
```
POST /users/enable-2fa
Authorization: Bearer <TOKEN>

Response: 200
{
  "message": "2FA enabled",
  "secret": "random_secret_code"
}
```

---

## Expense Endpoints

### Add Expense
```
POST /expenses/add
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "amount": 500,
  "category": "food",
  "description": "Lunch at restaurant",
  "paymentMethod": "card",
  "isRecurring": false,
  "recurringFrequency": "monthly"
}

Categories: food, education, travel, entertainment, utilities, health, shopping, other
Payment Methods: cash, card, upi, wallet

Response: 201
{
  "_id": "expense_id",
  "userId": "user_id",
  "amount": 500,
  "category": "food",
  "description": "Lunch at restaurant",
  "date": "2024-01-15T10:30:00Z",
  "paymentMethod": "card",
  "blockchainHash": "0x1a2b3c...",
  "isRecurring": false
}
```

### Get All Expenses
```
GET /expenses/all
Authorization: Bearer <TOKEN>

Query Parameters (optional):
- month: number (1-12)
- year: number
- category: string

Response: 200
[
  { expense_1 },
  { expense_2 },
  ...
]
```

### Get Expense Summary
```
GET /expenses/summary
Authorization: Bearer <TOKEN>

Query Parameters:
- month: number (required)
- year: number (required)

Response: 200
[
  {
    "_id": "food",
    "total": 2500,
    "count": 5
  },
  {
    "_id": "travel",
    "total": 1000,
    "count": 2
  }
]
```

---

## Budget Endpoints

### Set Budget
```
POST /budget/set
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "category": "food",
  "limit": 3000,
  "month": 1,
  "year": 2024
}

Response: 201
{
  "_id": "budget_id",
  "userId": "user_id",
  "category": "food",
  "limit": 3000,
  "spent": 0,
  "month": 1,
  "year": 2024,
  "suggestions": []
}
```

### Get All Budgets
```
GET /budget/all
Authorization: Bearer <TOKEN>

Response: 200
[
  {
    "_id": "budget_id",
    "userId": "user_id",
    "category": "food",
    "limit": 3000,
    "spent": 1500,
    "month": 1,
    "year": 2024,
    "suggestions": [
      {
        "title": "Food spending alert",
        "description": "You've spent 50% of your food budget",
        "potentialSavings": 0
      }
    ]
  }
]
```

---

## Wallet Endpoints

### Create Wallet
```
POST /wallet/create
Authorization: Bearer <TOKEN>

Response: 201
{
  "walletAddress": "0x1a2b3c4d5e6f...",
  "balance": 1000
}
```

### Get Wallet Info
```
GET /wallet/info
Authorization: Bearer <TOKEN>

Response: 200
{
  "_id": "wallet_id",
  "userId": "user_id",
  "balance": 1000,
  "walletAddress": "0x1a2b3c4d5e6f...",
  "publicKey": "public_key",
  "transactionHistory": [
    {
      "transactionId": "tx_id",
      "amount": 100,
      "type": "transfer",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Transfer Funds
```
POST /wallet/transfer
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "toWalletAddress": "0xrecipient_address",
  "amount": 100,
  "description": "Payment for services"
}

Response: 201
{
  "transactionId": "tx_id",
  "status": "Transfer successful"
}
```

---

## Fraud Detection Endpoints

### Get Fraud Alerts
```
GET /fraud/alerts
Authorization: Bearer <TOKEN>

Response: 200
{
  "suspiciousTransactions": [
    {
      "transactionIndex": 0,
      "transactionId": "tx_id",
      "amount": 5000,
      "zScore": 3.5,
      "fraudScore": 0.85
    }
  ],
  "flaggedTransactions": [
    {
      "_id": "tx_id",
      "amount": 5000,
      "type": "transfer",
      "status": "confirmed",
      "isFlaggedAsFraud": true
    }
  ]
}
```

### Report Fraud
```
POST /fraud/report
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "transactionId": "tx_id",
  "reason": "Unauthorized transaction"
}

Response: 200
{
  "message": "Fraud reported successfully",
  "transactionId": "tx_id"
}
```

---

## Blockchain Endpoints

### Get Blockchain Ledger
```
GET /blockchain/ledger
Authorization: Bearer <TOKEN>

Response: 200
{
  "transactions": [
    {
      "_id": "tx_id",
      "fromUserId": "user_id",
      "toUserId": "recipient_id",
      "amount": 100,
      "type": "transfer",
      "blockchainHash": "0x...",
      "blockchainTimestamp": "2024-01-15T10:30:00Z",
      "status": "confirmed"
    }
  ],
  "blockchainValid": true
}
```

### Get Blockchain Info
```
GET /blockchain/info

Response: 200
{
  "chainLength": 5,
  "difficulty": 2,
  "isValid": true,
  "networkStatus": "Simulated Local Testnet"
}
```

### Record Transaction on Blockchain
```
POST /blockchain/record-transaction
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "toUserId": "recipient_user_id",
  "amount": 250,
  "description": "Payment for goods"
}

Response: 201
{
  "transactionId": "tx_id",
  "blockchainHash": "0x1a2b3c...",
  "message": "Transaction recorded on blockchain"
}
```

---

## Financial Literacy Endpoints

### Get Available Quizzes
```
GET /literacy/quizzes
Authorization: Bearer <TOKEN>

Response: 200
[
  {
    "id": "quiz-1",
    "title": "Basics of Mutual Funds",
    "questionCount": 2
  },
  {
    "id": "quiz-2",
    "title": "Government Schemes for Youth",
    "questionCount": 1
  }
]
```

### Get Quiz Questions
```
GET /literacy/quizzes/quiz-1
Authorization: Bearer <TOKEN>

Response: 200
{
  "id": "quiz-1",
  "title": "Basics of Mutual Funds",
  "questions": [
    {
      "id": "q1",
      "text": "What is a mutual fund?",
      "options": [
        "A pool of money managed by professionals",
        "A loan from the bank",
        "A type of insurance",
        "A savings account"
      ]
    }
  ]
}
```

### Submit Quiz Answers
```
POST /literacy/quizzes/quiz-1/submit
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "answers": [0, 0]  // Array of selected option indices
}

Response: 200
{
  "score": "100.0",
  "passStatus": "Passed",
  "answers": [
    {
      "questionId": "q1",
      "selectedOption": "A pool of money managed by professionals",
      "correct": true
    }
  ]
}
```

### Get Learning Articles
```
GET /literacy/articles
Authorization: Bearer <TOKEN>

Response: 200
[
  {
    "id": "article-1",
    "title": "5 Simple Steps to Start Budgeting",
    "content": "Learn how to create a budget that works for you...",
    "category": "budgeting"
  }
]
```

### Get User Progress
```
GET /literacy/progress
Authorization: Bearer <TOKEN>

Response: 200
{
  "quizzesCompleted": 2,
  "articlesRead": 1,
  "totalScore": 195,
  "badges": [
    {
      "name": "Quiz Master",
      "description": "Complete 5 quizzes",
      "awardedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Amount and category are required"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "error": "Invalid token"
}
```

### 404 Not Found
```json
{
  "error": "User not found"
}
```

### 500 Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

Currently not implemented. In production, add:
- 100 requests per minute per user
- 10 sensitive operations per minute
- 1000 requests per hour per IP

---

## Pagination

Current implementation uses limit/offset:
```
GET /expenses/all?limit=10&offset=0
```

---

**Version**: 1.0.0
**Last Updated**: January 2024
