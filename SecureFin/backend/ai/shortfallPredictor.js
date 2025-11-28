const Expense = require('../models/Expense');
const IncomeSource = require('../models/IncomeSource');
const Debt = require('../models/Debt');

/**
 * Predict financial shortfalls based on income vs expenses + debt obligations
 * Returns: forecasted shortfall date, amount, and recommendations
 */
async function predictShortfall(userId) {
  try {
    // Get all active income sources
    const incomes = await IncomeSource.find({ userId, isActive: true });
    const totalMonthlyIncome = incomes
      .filter((i) => i.frequency === 'monthly')
      .reduce((sum, i) => sum + i.monthlyAmount, 0);

    // Get debt obligations
    const debts = await Debt.find({ userId, isActive: true });
    const totalMonthlyDebtPayment = debts.reduce((sum, d) => sum + (d.monthlyPayment || 0), 0);

    // Get last 3 months of expenses
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentExpenses = await Expense.find({
      userId,
      date: { $gte: thirtyDaysAgo },
    });

    // Calculate average daily spending
    const totalRecentExpenses = recentExpenses.reduce((sum, e) => sum + e.amount, 0);
    const daysInAnalysis = 30;
    const averageDailySpending = totalRecentExpenses / daysInAnalysis;
    const projectedMonthlyExpenses = averageDailySpending * 30;

    // Get expense breakdown by category
    const expenseByCategory = {};
    recentExpenses.forEach((exp) => {
      const cat = exp.category || 'other';
      expenseByCategory[cat] = (expenseByCategory[cat] || 0) + exp.amount;
    });

    // Calculate monthly cash flow
    const monthlyIncome = totalMonthlyIncome;
    const monthlyObligations = totalMonthlyDebtPayment + projectedMonthlyExpenses;
    const monthlyCashFlow = monthlyIncome - monthlyObligations;

    // Predict shortfall scenarios
    const predictions = {
      timeframe: 'next-30-days',
      monthlyIncome,
      monthlyExpenses: projectedMonthlyExpenses,
      monthlyDebtPayment: totalMonthlyDebtPayment,
      totalMonthlyObligations: monthlyObligations,
      monthlyCashFlow,
      hasShortfall: monthlyCashFlow < 0,
      shortfallAmount: monthlyCashFlow < 0 ? Math.abs(monthlyCashFlow) : 0,
      riskLevel: getRiskLevel(monthlyCashFlow, totalMonthlyIncome),
      recommendations: generateRecommendations(monthlyCashFlow, totalMonthlyIncome, expenseByCategory),
      expenseBreakdown: expenseByCategory,
      incomeDetails: incomes,
      debtDetails: debts.map((d) => ({
        creditorName: d.creditorName,
        monthlyPayment: d.monthlyPayment,
        dueDate: d.dueDate,
      })),
    };

    return predictions;
  } catch (error) {
    throw new Error(`Shortfall prediction error: ${error.message}`);
  }
}

/**
 * Determine financial risk level based on cash flow
 */
function getRiskLevel(cashFlow, totalIncome) {
  if (cashFlow >= totalIncome * 0.2) return 'LOW'; // Surplus or good cushion
  if (cashFlow >= 0) return 'MEDIUM'; // Breaking even
  if (cashFlow >= -totalIncome * 0.1) return 'HIGH'; // Small shortfall
  return 'CRITICAL'; // Severe shortfall
}

/**
 * Generate actionable recommendations based on financial situation
 */
function generateRecommendations(cashFlow, totalIncome, expensesByCategory) {
  const recommendations = [];

  if (cashFlow < 0) {
    const shortfallPercentage = Math.abs(cashFlow / totalIncome) * 100;

    if (shortfallPercentage > 50) {
      recommendations.push({
        priority: 'CRITICAL',
        action: 'Seek additional income sources',
        reason: 'Expenses exceed income by more than 50%. Consider freelance work or part-time income.',
      });
    } else if (shortfallPercentage > 25) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Reduce discretionary spending',
        reason: 'Expenses exceed income by more than 25%. Focus on cutting non-essential costs.',
      });
    } else {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Track spending closely',
        reason: 'You have a minor shortfall. Monitor expenses and adjust as needed.',
      });
    }
  }

  // Check for high spending categories
  const totalExpenses = Object.values(expensesByCategory).reduce((a, b) => a + b, 0);
  Object.entries(expensesByCategory).forEach(([category, amount]) => {
    const percentage = (amount / totalExpenses) * 100;
    if (percentage > 40 && category !== 'food' && category !== 'rent') {
      recommendations.push({
        priority: 'MEDIUM',
        action: `Review ${category} expenses`,
        reason: `${category} represents ${percentage.toFixed(1)}% of your spending. Consider if all purchases are necessary.`,
      });
    }
  });

  // Income diversification
  recommendations.push({
    priority: 'LOW',
    action: 'Diversify income sources',
    reason: 'Consider adding multiple income streams to improve financial stability.',
  });

  // Savings
  if (cashFlow > 0) {
    recommendations.push({
      priority: 'LOW',
      action: 'Build emergency fund',
      reason: `You have positive cash flow. Save ${Math.min(cashFlow * 0.2, totalIncome * 0.05)} monthly as emergency fund.`,
    });
  }

  return recommendations;
}

/**
 * Get monthly trend predictions (next 3-6 months)
 */
async function getShortfallTrend(userId, months = 3) {
  try {
    const predictions = await predictShortfall(userId);
    const trend = [];

    for (let i = 0; i < months; i++) {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + i);

      // Simulate slight variations in spending (±10%)
      const variance = (Math.random() - 0.5) * 0.2; // -0.1 to +0.1
      const adjustedExpenses = predictions.monthlyExpenses * (1 + variance);
      const adjustedCashFlow = predictions.monthlyIncome - adjustedExpenses - predictions.monthlyDebtPayment;

      trend.push({
        month: futureDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        projectedIncome: predictions.monthlyIncome,
        projectedExpenses: adjustedExpenses,
        projectedDebt: predictions.monthlyDebtPayment,
        projectedCashFlow: adjustedCashFlow,
        hasShortfall: adjustedCashFlow < 0,
        shortfallAmount: adjustedCashFlow < 0 ? Math.abs(adjustedCashFlow) : 0,
      });
    }

    return {
      baselinePredict: predictions,
      trendForcast: trend,
    };
  } catch (error) {
    throw new Error(`Trend prediction error: ${error.message}`);
  }
}

module.exports = {
  predictShortfall,
  getShortfallTrend,
  getRiskLevel,
  generateRecommendations,
};
