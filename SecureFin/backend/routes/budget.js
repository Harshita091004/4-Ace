const express = require('express');
const router = express.Router();
const { authenticateToken } = require('./auth');
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');

// Create/Update budget
router.post('/set', authenticateToken, async (req, res) => {
  try {
    const { category, limit, month, year } = req.body;

    if (!category || !limit) {
      return res.status(400).json({ error: 'Category and limit are required' });
    }

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const queryMonth = month || currentMonth;
    const queryYear = year || currentYear;

    let budget = await Budget.findOne({
      userId: req.user.userId,
      category,
      month: queryMonth,
      year: queryYear,
    });

    if (budget) {
      budget.limit = limit;
    } else {
      budget = new Budget({
        userId: req.user.userId,
        category,
        limit,
        month: queryMonth,
        year: queryYear,
      });
    }

    await budget.save();
    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get budgets with suggestions
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const budgets = await Budget.find({
      userId: req.user.userId,
      month: currentMonth,
      year: currentYear,
    });

    // Calculate spent amount for each budget
    for (let budget of budgets) {
      const startDate = new Date(currentYear, currentMonth - 1, 1);
      const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);

      const spent = await Expense.aggregate([
        {
          $match: {
            userId: require('mongoose').Types.ObjectId(req.user.userId),
            category: budget.category,
            date: { $gte: startDate, $lte: endDate },
          }
        },
        {
          $group: { _id: null, total: { $sum: '$amount' } }
        }
      ]);

      budget.spent = spent.length > 0 ? spent[0].total : 0;

      // Generate AI suggestions
      if (budget.spent > budget.limit * 0.8) {
        budget.suggestions.push({
          title: `${budget.category} spending alert`,
          description: `You've spent ${((budget.spent / budget.limit) * 100).toFixed(0)}% of your ${budget.category} budget.`,
          potentialSavings: budget.spent - budget.limit,
          timestamp: new Date(),
        });
      }
    }

    res.json(budgets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
