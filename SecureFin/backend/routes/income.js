const express = require('express');
const router = express.Router();
const IncomeSource = require('../models/IncomeSource');

// Middleware - Auth
const authenticateUser = (req, res, next) => {
  const userId = req.headers['user-id'] || req.query.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  req.userId = userId;
  next();
};

router.use(authenticateUser);

// Add new income source
router.post('/add', async (req, res) => {
  try {
    const { sourceType, sourceName, monthlyAmount, frequency, nextPaymentDate } = req.body;

    if (!sourceType || !sourceName || !monthlyAmount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const validTypes = ['scholarship', 'part-time-job', 'freelance', 'internship', 'business', 'other'];
    if (!validTypes.includes(sourceType)) {
      return res.status(400).json({ error: 'Invalid source type' });
    }

    const newIncome = new IncomeSource({
      userId: req.userId,
      sourceType,
      sourceName,
      monthlyAmount,
      frequency: frequency || 'monthly',
      nextPaymentDate,
      isActive: true,
    });

    await newIncome.save();

    res.status(201).json({
      message: 'Income source added successfully',
      income: newIncome,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all income sources for user
router.get('/list', async (req, res) => {
  try {
    const incomes = await IncomeSource.find({ userId: req.userId, isActive: true });

    const summary = {
      totalMonthlyIncome: incomes
        .filter((i) => i.frequency === 'monthly')
        .reduce((sum, i) => sum + i.monthlyAmount, 0),
      totalIncomeStreams: incomes.length,
      incomes,
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single income source
router.get('/:incomeId', async (req, res) => {
  try {
    const income = await IncomeSource.findOne({ _id: req.params.incomeId, userId: req.userId });
    if (!income) return res.status(404).json({ error: 'Income source not found' });
    res.json(income);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update income source
router.put('/:incomeId', async (req, res) => {
  try {
    const { sourceName, monthlyAmount, frequency, nextPaymentDate, isActive } = req.body;
    const income = await IncomeSource.findOne({ _id: req.params.incomeId, userId: req.userId });

    if (!income) return res.status(404).json({ error: 'Income source not found' });

    if (sourceName !== undefined) income.sourceName = sourceName;
    if (monthlyAmount !== undefined) income.monthlyAmount = monthlyAmount;
    if (frequency !== undefined) income.frequency = frequency;
    if (nextPaymentDate !== undefined) income.nextPaymentDate = nextPaymentDate;
    if (isActive !== undefined) income.isActive = isActive;

    await income.save();

    res.json({
      message: 'Income source updated successfully',
      income,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete/Deactivate income source
router.delete('/:incomeId', async (req, res) => {
  try {
    const income = await IncomeSource.findOne({ _id: req.params.incomeId, userId: req.userId });

    if (!income) return res.status(404).json({ error: 'Income source not found' });

    income.isActive = false;
    await income.save();

    res.json({
      message: 'Income source deactivated successfully',
      income,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get income analytics
router.get('/analytics/summary', async (req, res) => {
  try {
    const incomes = await IncomeSource.find({ userId: req.userId, isActive: true });

    const analytics = {
      totalMonthlyIncome: incomes
        .filter((i) => i.frequency === 'monthly')
        .reduce((sum, i) => sum + i.monthlyAmount, 0),
      totalQuarterlyIncome: incomes
        .filter((i) => i.frequency === 'quarterly')
        .reduce((sum, i) => sum + i.monthlyAmount, 0),
      incomeStreams: {
        scholarship: incomes.filter((i) => i.sourceType === 'scholarship').length,
        'part-time-job': incomes.filter((i) => i.sourceType === 'part-time-job').length,
        freelance: incomes.filter((i) => i.sourceType === 'freelance').length,
        internship: incomes.filter((i) => i.sourceType === 'internship').length,
        business: incomes.filter((i) => i.sourceType === 'business').length,
        other: incomes.filter((i) => i.sourceType === 'other').length,
      },
      upcomingPayments: incomes
        .filter((i) => i.nextPaymentDate)
        .sort((a, b) => new Date(a.nextPaymentDate) - new Date(b.nextPaymentDate))
        .slice(0, 5),
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
