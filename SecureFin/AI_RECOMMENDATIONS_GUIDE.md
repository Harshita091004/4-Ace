# AI-Powered Expense Analysis & Recommendations

## Overview
SecureFin now includes an advanced AI-powered expense analyzer that provides personalized spending recommendations, detects anomalies, predicts future spending, and offers detailed financial insights.

## Features

### 1. **Personalized Recommendations** 💡
- Category overspending alerts with reduction suggestions
- Peak spending hour identification
- Safe daily budget recommendations
- Payment method optimization tips
- Recurring expense tracking and alerts
- Unusual spending pattern detection
- Weekend spending analysis

### 2. **Detailed Expense Report** 📊
- Total spending summary
- Transaction count and averages
- Category-wise breakdown with visualizations
- Peak spending hours analysis
- Day-of-week spending patterns
- High and low transaction tracking

### 3. **Anomaly Detection** 🚨
Uses statistical analysis (z-score calculation) to detect unusual transactions:
- Identifies spending patterns 2.5+ standard deviations from average
- Shows deviation severity
- Helps identify fraudulent or impulsive purchases
- Provides context for each anomaly

### 4. **Future Spending Prediction** 🔮
- 30-day spending forecast based on historical data
- Category-wise predictions
- Percentage breakdown of predicted spending
- Based on configurable historical lookback period

## API Endpoints

### Get Recommendations
```
GET /api/expenses/recommendations?days=30
Headers: Authorization: Bearer {token}

Response:
{
  success: true,
  dataPoints: number,
  period: "Last X days",
  recommendations: [
    {
      type: "category_reduction|peak_hours|budget_suggestion|...",
      priority: "high|medium|low",
      message: "Recommendation text"
    }
  ]
}
```

### Get Comprehensive Report
```
GET /api/expenses/ai-report?days=30
Headers: Authorization: Bearer {token}

Response includes:
- Summary (total spending, averages, min/max)
- Category analysis with totals and counts
- Peak spending hours
- Day-of-week breakdown
- Anomalies detected
- Future predictions
```

### Get Anomalies
```
GET /api/expenses/anomalies?days=60
Headers: Authorization: Bearer {token}

Response:
{
  success: true,
  anomalies: [
    {
      expense: {...},
      deviation: "2.8",
      message: "Unusual spending of ₹X in Y category"
    }
  ],
  anomalyCount: number,
  totalTransactions: number
}
```

### Get Spending Prediction
```
GET /api/expenses/predict?days=30&lookback=60
Headers: Authorization: Bearer {token}

Response:
{
  success: true,
  historicalPeriod: "Last 60 days",
  predictionPeriod: "Next 30 days",
  prediction: {
    totalPredicted: number,
    categoryPredictions: [
      {
        category: "food",
        predictedAmount: "15000",
        percentage: "35.5"
      }
    ]
  }
}
```

## Frontend Components

### AIRecommendations Component
Located at: `frontend/src/components/AIRecommendations.js`

**Features:**
- Tab-based interface (Recommendations, Report, Anomalies, Predictions)
- Dynamic time-range selection (7, 30, 60, 90 days)
- Color-coded priority levels
- Interactive charts and visualizations
- Real-time data fetching
- Responsive design for mobile and desktop

**Usage:**
The component is accessible via the navbar under "🤖 AI Insights" after login.

## How It Works

### Recommendation Engine
1. **Analyzes spending patterns** across selected time period
2. **Calculates category totals** and averages
3. **Identifies peak spending hours** using hourly aggregation
4. **Detects anomalies** using standard deviation analysis
5. **Generates personalized recommendations** based on patterns found
6. **Prioritizes recommendations** (high, medium, low)

### Anomaly Detection Algorithm
```javascript
1. Calculate mean of all transactions
2. Calculate standard deviation
3. For each transaction:
   - Calculate z-score = |amount - mean| / stdDev
   - If z-score > 2.5, mark as anomaly
4. Return anomalies with deviation details
```

### Prediction Model
```javascript
1. Get category-wise spending distribution
2. Calculate average daily spending
3. Project 30 days forward
4. Break down by category using historical percentages
5. Return predicted total and category breakdown
```

## Data Used

The AI analyzer uses:
- **Amount**: Transaction amount
- **Category**: Expense category (food, travel, utilities, etc.)
- **Date**: Transaction timestamp
- **Payment Method**: How payment was made (optional)
- **Is Recurring**: Whether expense repeats

## Supported Categories
- Food
- Education
- Travel
- Entertainment
- Utilities
- Health
- Shopping
- Other

## Example Recommendations Generated

1. **Category Reduction**
   - "📌 You spend the most on *food* (₹15,000 total). Try reducing this category by 15% to save ₹225 per transaction."

2. **Peak Hours Alert**
   - "⏰ Your peak spending hours are: 12:00, 18:00, 20:00. Be extra careful with your wallet during these times!"

3. **Budget Suggestion**
   - "💡 Your average spending is *₹500* per transaction. Set a safe daily limit at *₹400* to build savings."

4. **Payment Optimization**
   - "💳 Use UPI or credit cards with cashback/rewards to reduce effective spending. You could save 2-5% on most purchases."

5. **Recurring Expense Alert**
   - "🔄 You have 3 recurring expenses totaling ₹2,000. Review these to eliminate unnecessary subscriptions."

6. **Anomaly Detection**
   - "🚨 Detected 2 unusual spending patterns. Review large transactions to identify one-time or discretionary expenses."

## Customization

### Adjusting Sensitivity
Modify anomaly detection threshold in `backend/ai/expenseAnalyzer.js`:
```javascript
if (zScore > 2.5) { // Change 2.5 to different value
  // Lower = more sensitive, Higher = less sensitive
}
```

### Budget Reduction Percentage
Change the reduction percentage in recommendation generation:
```javascript
const reduction = Math.round(top.average * 0.15); // 15% reduction
```

### Time Ranges
Frontend supports: 7, 30, 60, 90 days (easily extendable in AIRecommendations.js)

## Performance Considerations

- Analyzer efficiently processes transactions using array methods
- Aggregations use MongoDB's powerful aggregation pipeline
- No external ML libraries (lightweight, fast)
- Results cache by time period on frontend
- Suitable for users with thousands of transactions

## Future Enhancements

1. Machine Learning integration (TensorFlow.js)
2. Natural Language Explanations
3. Budget vs. Actual comparison
4. Spending trend analysis
5. Category correlation detection
6. Behavioral pattern learning
7. Mobile app notifications
8. Email digest reports
9. Savings goal tracking
10. Investment recommendations

## Troubleshooting

### No recommendations appearing
- Ensure user has expenses in selected time period
- Check browser console for API errors
- Verify backend is running on port 5001

### Anomalies not detected
- Need at least 5 transactions for meaningful analysis
- Anomalies only shown for 2.5σ+ deviations
- Try analyzing a longer period

### Predictions seem off
- Requires historical data (use lookback parameter)
- Based on past patterns, not external factors
- More data = better predictions

## Credits
Built as part of SecureFin - Blockchain-Powered Personal Finance Tracker
AI Module: ExpenseAnalyzer.js
Frontend Component: AIRecommendations.js
