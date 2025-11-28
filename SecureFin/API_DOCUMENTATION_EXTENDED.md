# SecureFin API Documentation - Extended

## Base URL
```
http://localhost:5001/api
```

---

## Income Management API

### Add Income Source
```
POST /income/add
```
**Headers**: `user-id: <userId>`

**Request Body**:
```json
{
  "sourceType": "scholarship|part-time-job|freelance|internship|business|other",
  "sourceName": "Monthly Scholarship",
  "monthlyAmount": 5000,
  "frequency": "monthly|quarterly|annually|irregular",
  "nextPaymentDate": "2024-02-01"
}
```

**Response** (201):
```json
{
  "message": "Income source added successfully",
  "income": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "user123",
    "sourceType": "scholarship",
    "sourceName": "Monthly Scholarship",
    "monthlyAmount": 5000,
    "frequency": "monthly",
    "nextPaymentDate": "2024-02-01",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### List Income Sources
```
GET /income/list
```

**Response** (200):
```json
{
  "totalMonthlyIncome": 15000,
  "totalIncomeStreams": 3,
  "incomes": [
    { income objects }
  ]
}
```

### Get Income Analytics
```
GET /income/analytics/summary
```

**Response**:
```json
{
  "totalMonthlyIncome": 15000,
  "totalQuarterlyIncome": 5000,
  "incomeStreams": {
    "scholarship": 1,
    "part-time-job": 2,
    "freelance": 0,
    "internship": 0,
    "business": 0,
    "other": 0
  },
  "upcomingPayments": [
    { income objects sorted by date }
  ]
}
```

---

## Debt Management API

### Add Debt
```
POST /debt/add
```

**Request Body**:
```json
{
  "creditorName": "Education Loan",
  "debtType": "education-loan|personal-loan|credit-card|other",
  "totalAmount": 100000,
  "monthlyPayment": 5000,
  "interestRate": 8.5,
  "dueDate": "2025-06-30",
  "maturityDate": "2030-06-30",
  "priority": "high|medium|low"
}
```

### List Debts
```
GET /debt/list
```

**Response**:
```json
{
  "totalDebt": 200000,
  "totalMonthlyPayment": 15000,
  "numberOfDebts": 2,
  "debts": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "userId": "user123",
      "creditorName": "Education Loan",
      "debtType": "education-loan",
      "totalAmount": 100000,
      "amountRemaining": 95000,
      "monthlyPayment": 5000,
      "interestRate": 8.5,
      "dueDate": "2025-06-30",
      "paymentHistory": [
        {
          "amount": 5000,
          "paidOn": "2024-01-01",
          "status": "on-time"
        }
      ],
      "isActive": true
    }
  ]
}
```

### Make Debt Payment
```
POST /debt/:debtId/pay
```

**Request Body**:
```json
{
  "amount": 5000
}
```

**Response** (202 if flagged for verification):
```json
{
  "message": "Payment requires verification",
  "requiresConfirmation": true,
  "reason": "High-value transaction detected",
  "amount": 5000,
  "debtId": "507f1f77bcf86cd799439012"
}
```

### Confirm Debt Payment
```
POST /debt/:debtId/confirm-payment
```

**Request Body**:
```json
{
  "amount": 5000
}
```

**Response** (200):
```json
{
  "message": "Payment confirmed and recorded",
  "debt": {
    "amountRemaining": 90000,
    "isActive": true
  }
}
```

### Get Debt Analytics
```
GET /debt/analytics/summary
```

**Response**:
```json
{
  "totalDebt": 200000,
  "activeDebts": 2,
  "closedDebts": 1,
  "totalMonthlyObligation": 15000,
  "highPriorityDebts": [ array of high priority debts ],
  "overdueSoon": [ array of debts due within 7 days ]
}
```

---

## Financial Prediction API

### Get Shortfall Prediction
```
GET /prediction/shortfall
```

**Query Parameters**: `user-id: <userId>`

**Response** (200):
```json
{
  "timeframe": "next-30-days",
  "monthlyIncome": 20000,
  "monthlyExpenses": 18000,
  "monthlyDebtPayment": 5000,
  "totalMonthlyObligations": 23000,
  "monthlyCashFlow": -3000,
  "hasShortfall": true,
  "shortfallAmount": 3000,
  "riskLevel": "HIGH",
  "recommendations": [
    {
      "priority": "HIGH",
      "action": "Reduce discretionary spending",
      "reason": "Expenses exceed income by more than 25%. Focus on cutting non-essential costs."
    },
    {
      "priority": "MEDIUM",
      "action": "Review food expenses",
      "reason": "food represents 35.5% of your spending. Consider if all purchases are necessary."
    }
  ],
  "expenseBreakdown": {
    "food": 6300,
    "transport": 3600,
    "utilities": 2700,
    "entertainment": 5400
  },
  "incomeDetails": [income objects],
  "debtDetails": [debt objects]
}
```

### Get Shortfall Trend
```
GET /prediction/trend?months=3
```

**Response**:
```json
{
  "baselinePredict": { shortfall prediction },
  "trendForcast": [
    {
      "month": "January 2024",
      "projectedIncome": 20000,
      "projectedExpenses": 18200,
      "projectedDebt": 5000,
      "projectedCashFlow": -3200,
      "hasShortfall": true,
      "shortfallAmount": 3200
    },
    {
      "month": "February 2024",
      "projectedIncome": 20000,
      "projectedExpenses": 17800,
      "projectedDebt": 5000,
      "projectedCashFlow": -2800,
      "hasShortfall": true,
      "shortfallAmount": 2800
    }
  ]
}
```

### Get Alert Status
```
GET /prediction/alert-status
```

**Response**:
```json
{
  "hasAlert": true,
  "riskLevel": "HIGH",
  "shortfallAmount": 3000,
  "message": "⚠️ High Risk: Your expenses are exceeding income. Review spending patterns.",
  "actionItems": [
    {
      "priority": "HIGH",
      "action": "Reduce discretionary spending",
      "reason": "Expenses exceed income by more than 25%."
    }
  ]
}
```

---

## Two-Factor Authentication API

### Enable TOTP 2FA
```
POST /2fa/enable-totp
```

**Response** (201):
```json
{
  "message": "TOTP 2FA enabled. Scan QR code or enter secret manually.",
  "secret": "JBSWY3DPEBLW64TMMQ======",
  "backupCodes": [
    "A1B2-C3D4",
    "E5F6-G7H8",
    "...8 more codes"
  ],
  "qrCodeUrl": "otpauth://totp/SecureFin:user@example.com?secret=JBSWY3DPEBLW64TMMQ======&issuer=SecureFin"
}
```

### Enable Email OTP 2FA
```
POST /2fa/enable-email-otp
```

**Response** (201):
```json
{
  "message": "Email OTP 2FA enabled. OTP sent to registered email.",
  "demoOtp": "123456"
}
```

### Verify TOTP Token
```
POST /2fa/verify-totp
```

**Request Body**:
```json
{
  "token": "123456"
}
```

**Response** (200):
```json
{
  "message": "Token verified successfully",
  "verified": true
}
```

### Verify Email OTP
```
POST /2fa/verify-email-otp
```

**Request Body**:
```json
{
  "otp": "123456"
}
```

### Use Backup Code
```
POST /2fa/use-backup-code
```

**Request Body**:
```json
{
  "code": "A1B2-C3D4"
}
```

**Response**:
```json
{
  "message": "Backup code used successfully",
  "codesRemaining": 7
}
```

### Get 2FA Status
```
GET /2fa/status
```

**Response**:
```json
{
  "totpEnabled": true,
  "emailOtpEnabled": false,
  "verificationMethod": "totp",
  "lastVerified": "2024-01-15T10:30:00Z",
  "backupCodesRemaining": 8
}
```

---

## Internationalization (i18n) API

### Get Available Languages
```
GET /i18n/languages
```

**Response**:
```json
[
  { "code": "en", "name": "English" },
  { "code": "hi", "name": "हिन्दी" },
  { "code": "ta", "name": "தமிழ்" },
  { "code": "te", "name": "తెలుగు" }
]
```

### Get Translation for Key
```
GET /i18n/translate/:language/:module/:key
```

**Example**:
```
GET /i18n/translate/hi/auth/login
```

**Response**:
```json
{
  "language": "hi",
  "module": "auth",
  "key": "login",
  "translation": "लॉगिन"
}
```

### Get All Module Translations
```
GET /i18n/module/:language/:module
```

**Example**:
```
GET /i18n/module/ta/expenses
```

**Response**:
```json
{
  "language": "ta",
  "module": "expenses",
  "translations": {
    "title": "செலவுகள்",
    "add_expense": "செலவு சேர்க்கவும்",
    "amount": "தொகை",
    "category": "பிரிவு",
    "date": "தேதி",
    "description": "விளக்கம்",
    "edit": "திருத்தவும்",
    "delete": "நீக்கவும்",
    "no_expenses": "இதுவரை எந்த செலவும் பதிவு செய்யப்படவில்லை"
  }
}
```

---

## Existing APIs (Already Documented)

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/verify-token` - JWT verification

### Expenses
- `POST /expenses` - Create expense
- `GET /expenses` - List expenses
- `PUT /expenses/:id` - Update expense
- `DELETE /expenses/:id` - Delete expense
- `POST /expenses/confirm-anomalous` - Confirm flagged transaction

### Budget
- `POST /budget` - Create budget
- `GET /budget` - List budgets
- `PUT /budget/:id` - Update budget
- `DELETE /budget/:id` - Delete budget

### Wallet
- `GET /wallet/balance` - Get balance
- `POST /wallet/send` - Send money
- `POST /wallet/transfer` - Transfer
- `POST /wallet/transfer/confirm` - Confirm transfer
- `GET /wallet/history` - Transaction history

### Fraud Detection
- `GET /fraud/flagged` - List flagged transactions
- `POST /fraud/report` - Report fraud

### Blockchain
- `GET /blockchain` - Get blockchain
- `POST /blockchain/transaction` - Create transaction

### Financial Literacy
- `GET /literacy` - List educational content
- `POST /literacy` - Add content

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Authentication

All protected endpoints require the `user-id` header:
```
Headers:
  user-id: <userId>
  Content-Type: application/json
```

---

## Rate Limiting (Future Enhancement)

Recommended rate limits:
- Auth endpoints: 5 requests per minute
- Data endpoints: 100 requests per minute
- 2FA endpoints: 10 requests per minute

---

## Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created
- **202 Accepted**: Request accepted (requires confirmation)
- **400 Bad Request**: Invalid input
- **401 Unauthorized**: Missing/invalid authentication
- **403 Forbidden**: Permission denied / Transaction blocked
- **404 Not Found**: Resource not found
- **500 Server Error**: Internal error

