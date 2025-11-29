/**
 * AI Expense Analyzer Module
 * Analyzes user spending patterns and generates personalized recommendations
 * for both past and future expenses
 */

class ExpenseAnalyzer {
  constructor() {
    this.categories = ['food', 'education', 'travel', 'entertainment', 'utilities', 'health', 'shopping', 'other'];
  }

  /**
   * Get top spending categories
   */
  getTopSpendingCategories(expenses) {
    const categorySpend = {};
    
    expenses.forEach(exp => {
      if (!categorySpend[exp.category]) {
        categorySpend[exp.category] = { amount: 0, count: 0 };
      }
      categorySpend[exp.category].amount += exp.amount;
      categorySpend[exp.category].count += 1;
    });

    return Object.entries(categorySpend)
      .map(([cat, data]) => ({
        category: cat,
        totalAmount: data.amount,
        count: data.count,
        average: data.amount / data.count,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);
  }

  /**
   * Find peak spending hours
   */
  getPeakSpendingHours(expenses) {
    const hourSpend = {};
    
    expenses.forEach(exp => {
      const hour = new Date(exp.date).getHours();
      if (!hourSpend[hour]) {
        hourSpend[hour] = 0;
      }
      hourSpend[hour] += exp.amount;
    });

    return Object.entries(hourSpend)
      .map(([hour, amount]) => ({
        hour: parseInt(hour),
        totalAmount: amount,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5);
  }

  /**
   * Analyze spending by day of week
   */
  getSpendingByDayOfWeek(expenses) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const daySpend = {};

    expenses.forEach(exp => {
      const day = new Date(exp.date).getDay();
      const dayName = dayNames[day];
      if (!daySpend[dayName]) {
        daySpend[dayName] = 0;
      }
      daySpend[dayName] += exp.amount;
    });

    return daySpend;
  }

  /**
   * Calculate average daily spending
   */
  getAverageDailySpending(expenses) {
    if (expenses.length === 0) return 0;
    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    return totalAmount / expenses.length;
  }

  /**
   * Detect anomalies in spending
   */
  detectAnomalies(expenses) {
    if (expenses.length < 5) return [];

    const amounts = expenses.map(e => e.amount);
    const mean = amounts.reduce((a, b) => a + b) / amounts.length;
    const variance = amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);

    const anomalies = [];
    expenses.forEach((exp, idx) => {
      const zScore = Math.abs((exp.amount - mean) / stdDev);
      if (zScore > 2.5) { // 2.5 standard deviations
        anomalies.push({
          index: idx,
          expense: exp,
          deviation: zScore.toFixed(2),
          message: `Unusual spending of ₹${exp.amount} in ${exp.category} (${zScore.toFixed(1)}σ above average)`,
        });
      }
    });

    return anomalies;
  }

  /**
   * Predict future spending based on past 5-7 transactions
   * Accuracy improves with more historical data
   */
  predictFutureSpending(expenses) {
    // Use only past 5-7 most recent transactions for prediction
    const recentCount = Math.min(7, Math.max(5, expenses.length));
    const recentExpenses = expenses.slice(0, recentCount);
    
    if (recentExpenses.length === 0) return {
      totalPredicted: 0,
      categoryPredictions: [],
      basedOnTransactions: 0,
      confidence: 'very_low',
      confidenceScore: 0,
      accuracyNote: 'Insufficient data to make predictions'
    };

    const amounts = recentExpenses.map(e => e.amount);
    const mean = amounts.reduce((a, b) => a + b) / amounts.length;
    const variance = amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);
    
    // Calculate confidence based on consistency of spending
    const coefficientOfVariation = stdDev / mean; // lower = more consistent = higher confidence
    let confidence = 'low';
    let confidenceScore = 0;
    
    if (coefficientOfVariation < 0.3) {
      confidence = 'high';
      confidenceScore = 85;
    } else if (coefficientOfVariation < 0.5) {
      confidence = 'medium';
      confidenceScore = 65;
    } else if (coefficientOfVariation < 0.8) {
      confidence = 'low';
      confidenceScore = 40;
    } else {
      confidence = 'very_low';
      confidenceScore = 20;
    }

    // Predict next transaction average based on recent pattern
    const categoryTotals = this.getTopSpendingCategories(recentExpenses);
    const avgNextTransaction = mean;
    
    // Category-wise prediction for next few transactions
    const categoryPredictions = categoryTotals.map(cat => ({
      category: cat.category,
      averageTransaction: parseFloat(cat.average.toFixed(2)),
      expectedNextAmount: parseFloat((cat.average * 1).toFixed(2)),
      percentage: parseFloat(((cat.totalAmount / recentExpenses.reduce((s, e) => s + e.amount, 0)) * 100).toFixed(1)),
    }));

    return {
      nextTransactionPredicted: Math.round(avgNextTransaction),
      categoryPredictions,
      basedOnTransactions: recentExpenses.length,
      confidence,
      confidenceScore,
      accuracyNote: `Prediction based on ${recentExpenses.length} recent transactions. Confidence: ${confidence}. Consistency: ${(coefficientOfVariation * 100).toFixed(1)}% variance.`,
    };
  }

  /**
   * Generate personalized recommendations
   */
  generateRecommendations(expenses) {
    const recommendations = [];

    if (expenses.length === 0) {
      return ['📌 Start tracking your expenses to get personalized recommendations!'];
    }

    // 1. Top spending category
    const topCategories = this.getTopSpendingCategories(expenses);
    if (topCategories.length > 0) {
      const top = topCategories[0];
      const reduction = Math.round(top.average * 0.15);
      recommendations.push({
        type: 'category_reduction',
        priority: 'high',
        message: `📌 You spend the most on *${top.category}* (₹${Math.round(top.totalAmount)} total). Try reducing this category by 15% to save ₹${reduction} per transaction.`,
      });
    }

    // 2. Peak spending hours
    const peakHours = this.getPeakSpendingHours(expenses);
    if (peakHours.length > 0) {
      const hours = peakHours.slice(0, 3).map(h => `${h.hour}:00`).join(', ');
      recommendations.push({
        type: 'peak_hours',
        priority: 'medium',
        message: `⏰ Your peak spending hours are: ${hours}. Be extra careful with your wallet during these times!`,
      });
    }

    // 3. Daily budget suggestion
    const avgDaily = this.getAverageDailySpending(expenses);
    const safeBudget = Math.round(avgDaily * 0.8);
    recommendations.push({
      type: 'budget_suggestion',
      priority: 'high',
      message: `💡 Your average spending is *₹${Math.round(avgDaily)}* per transaction. Set a safe daily limit at *₹${safeBudget}* to build savings.`,
    });

    // 4. Payment method optimization
    recommendations.push({
      type: 'payment_optimization',
      priority: 'medium',
      message: `💳 Use UPI or credit cards with cashback/rewards to reduce effective spending. You could save 2-5% on most purchases.`,
    });

    // 5. Recurring expense alert
    const recurringExpenses = expenses.filter(e => e.isRecurring);
    if (recurringExpenses.length > 0) {
      const recurringTotal = recurringExpenses.reduce((sum, e) => sum + e.amount, 0);
      recommendations.push({
        type: 'recurring_alert',
        priority: 'medium',
        message: `🔄 You have ${recurringExpenses.length} recurring expenses totaling ₹${Math.round(recurringTotal)}. Review these to eliminate unnecessary subscriptions.`,
      });
    }

    // 6. Anomaly detection
    const anomalies = this.detectAnomalies(expenses);
    if (anomalies.length > 0) {
      recommendations.push({
        type: 'anomaly_alert',
        priority: 'high',
        message: `🚨 Detected ${anomalies.length} unusual spending patterns. Review large transactions to identify one-time or discretionary expenses.`,
      });
    }

    // 7. Weekend spending pattern
    const daySpending = this.getSpendingByDayOfWeek(expenses);
    const weekendSpend = (daySpending['Saturday'] || 0) + (daySpending['Sunday'] || 0);
    const weekdaySpend = Object.values(daySpending).reduce((a, b) => a + b, 0) - weekendSpend;
    if (weekendSpend > weekdaySpend * 0.5) {
      recommendations.push({
        type: 'weekend_alert',
        priority: 'medium',
        message: `📅 You tend to spend more on weekends. Plan your discretionary spending in advance to avoid impulse purchases.`,
      });
    }

    return recommendations;
  }

  /**
   * Generate comprehensive expense report
   */
  generateReport(expenses) {
    return {
      summary: {
        totalTransactions: expenses.length,
        totalSpending: expenses.reduce((sum, e) => sum + e.amount, 0),
        averagePerTransaction: this.getAverageDailySpending(expenses),
        highestTransaction: expenses.length > 0 ? Math.max(...expenses.map(e => e.amount)) : 0,
        lowestTransaction: expenses.length > 0 ? Math.min(...expenses.map(e => e.amount)) : 0,
      },
      categoryAnalysis: this.getTopSpendingCategories(expenses),
      peakHours: this.getPeakSpendingHours(expenses),
      dayOfWeekAnalysis: this.getSpendingByDayOfWeek(expenses),
      anomalies: this.detectAnomalies(expenses),
      futurePrediction: this.predictFutureSpending(expenses),
      recommendations: this.generateRecommendations(expenses),
    };
  }
}

module.exports = ExpenseAnalyzer;
