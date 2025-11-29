const express = require('express');
const router = express.Router();
const { authenticateToken } = require('./auth');
const Expense = require('../models/Expense');
const Blockchain = require('../../blockchain/Blockchain');
const ExpenseAnalyzer = require('../ai/expenseAnalyzer');
const inMemoryStore = require('../inmemoryStore');

// Add expense
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { amount, category, description, paymentMethod, isRecurring, recurringFrequency } = req.body;

    if (!amount || !category) {
      return res.status(400).json({ error: 'Amount and category are required' });
    }

    const blockchain = new Blockchain();
    const blockchainHash = blockchain.createTransaction({
      from: req.user.userId,
      to: 'expense',
      amount,
      category,
      timestamp: new Date(),
    });

    const expense = new Expense({
      userId: req.user.userId,
      amount,
      category,
      description,
      paymentMethod,
      blockchainHash,
      isRecurring,
      recurringFrequency,
    });

    const saved = await expense.save();

    // also store in in-memory store for quick access / analysis
    try {
      const userId = req.user && req.user.userId ? req.user.userId : 'anonymous';
      const plain = {
        amount: saved.amount,
        category: saved.category,
        description: saved.description,
        date: saved.date,
        paymentMethod: saved.paymentMethod,
        isRecurring: saved.isRecurring,
        recurringFrequency: saved.recurringFrequency,
        mongoId: saved._id,
      };
      inMemoryStore.addExpense(userId, plain);
    } catch (e) {
      console.error('Failed to write to in-memory store', e.message || e);
    }

    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user expenses
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const { month, year, category } = req.query;
    let query = { userId: req.user.userId };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    if (category) {
      query.category = category;
    }

    const expenses = await Expense.find(query).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get expense summary
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const summary = await Expense.aggregate([
      {
        $match: {
          userId: require('mongoose').Types.ObjectId(req.user.userId),
          date: { $gte: startDate, $lte: endDate },
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        }
      },
    ]);

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get AI-powered recommendations
router.get('/recommendations', authenticateToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const expenses = await Expense.find({
      userId: req.user.userId,
      date: { $gte: startDate }
    }).sort({ date: -1 });

    const analyzer = new ExpenseAnalyzer();
    const recommendations = analyzer.generateRecommendations(expenses);

    res.json({
      success: true,
      dataPoints: expenses.length,
      period: `Last ${days} days`,
      recommendations
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get comprehensive AI expense report
router.get('/ai-report', authenticateToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const expenses = await Expense.find({
      userId: req.user.userId,
      date: { $gte: startDate }
    }).sort({ date: -1 });

    const analyzer = new ExpenseAnalyzer();
    const report = analyzer.generateReport(expenses);

    res.json({
      success: true,
      period: `Last ${days} days`,
      report
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get anomaly detection
router.get('/anomalies', authenticateToken, async (req, res) => {
  try {
    const { days = 60 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const expenses = await Expense.find({
      userId: req.user.userId,
      date: { $gte: startDate }
    }).sort({ date: -1 });

    const analyzer = new ExpenseAnalyzer();
    const anomalies = analyzer.detectAnomalies(expenses);

    res.json({
      success: true,
      anomalies,
      totalTransactions: expenses.length,
      anomalyCount: anomalies.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get future spending prediction based on past 5-7 transactions from in-memory store
router.get('/predict', authenticateToken, async (req, res) => {
  try {
    const userId = req.user && req.user.userId ? req.user.userId : 'anonymous';
    const items = inMemoryStore.getExpenses(userId);

    if (items.length === 0) {
      return res.json({
        success: true,
        prediction: null,
        message: 'No expense data available for prediction',
      });
    }

    // Sort by date (most recent first) and pass to analyzer
    const sortedExpenses = items.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const analyzer = new ExpenseAnalyzer();
    const prediction = analyzer.predictFutureSpending(sortedExpenses);

    res.json({
      success: true,
      source: 'in-memory-store',
      totalTransactionsAvailable: items.length,
      prediction
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET in-memory expenses for the current user
router.get('/inmemory', authenticateToken, async (req, res) => {
  try {
    const userId = req.user && req.user.userId ? req.user.userId : 'anonymous';
    const items = inMemoryStore.getExpenses(userId);
    return res.json(items);
  } catch (e) {
    console.error('Error fetching in-memory expenses', e.message || e);
    return res.status(500).json({ error: 'Failed to fetch in-memory expenses' });
  }
});

module.exports = router;
