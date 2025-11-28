const express = require('express');
const router = express.Router();
const { authenticateToken } = require('./auth');
const Expense = require('../models/Expense');
const Blockchain = require('../../blockchain/Blockchain');

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

    await expense.save();

    res.status(201).json(expense);
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

module.exports = router;
