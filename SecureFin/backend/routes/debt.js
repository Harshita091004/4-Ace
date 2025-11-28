const express = require('express');
const router = express.Router();
const Debt = require('../models/Debt');
const Expense = require('../models/Expense');
const TransactionEngine = require('../ai/transactionEngine');

// Middleware - Auth (placeholder - implement proper JWT middleware)
const authenticateUser = (req, res, next) => {
  const userId = req.headers['user-id'] || req.query.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  req.userId = userId;
  next();
};

router.use(authenticateUser);

// Add new debt
router.post('/add', async (req, res) => {
  try {
    const { creditorName, debtType, totalAmount, monthlyPayment, interestRate, dueDate, maturityDate, priority } = req.body;

    if (!creditorName || !debtType || !totalAmount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newDebt = new Debt({
      userId: req.userId,
      creditorName,
      debtType,
      totalAmount,
      amountRemaining: totalAmount,
      monthlyPayment,
      interestRate,
      dueDate,
      maturityDate,
      priority: priority || 'medium',
      isActive: true,
    });

    await newDebt.save();

    res.status(201).json({
      message: 'Debt added successfully',
      debt: newDebt,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all debts for user
router.get('/list', async (req, res) => {
  try {
    const debts = await Debt.find({ userId: req.userId, isActive: true }).sort({ dueDate: 1 });

    const summary = {
      totalDebt: debts.reduce((sum, d) => sum + d.amountRemaining, 0),
      totalMonthlyPayment: debts.reduce((sum, d) => sum + (d.monthlyPayment || 0), 0),
      numberOfDebts: debts.length,
      debts,
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get debt by ID
router.get('/:debtId', async (req, res) => {
  try {
    const debt = await Debt.findOne({ _id: req.params.debtId, userId: req.userId });
    if (!debt) return res.status(404).json({ error: 'Debt not found' });
    res.json(debt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Make debt payment (deduct from wallet via expense)
router.post('/:debtId/pay', async (req, res) => {
  try {
    const { amount } = req.body;
    const debt = await Debt.findOne({ _id: req.params.debtId, userId: req.userId });

    if (!debt) return res.status(404).json({ error: 'Debt not found' });
    if (amount > debt.amountRemaining) {
      return res.status(400).json({ error: 'Payment exceeds remaining balance' });
    }

    // Check transaction validity via TransactionEngine
    const engineResult = TransactionEngine({
      userId: req.userId,
      type: 'debt-payment',
      amount,
      category: 'debt-repayment',
    });

    if (engineResult.action === 'BLOCK') {
      return res.status(403).json({
        error: 'Transaction blocked',
        reason: engineResult.reason,
      });
    }

    if (engineResult.action === 'VERIFY_VIA_EMAIL') {
      return res.status(202).json({
        message: 'Payment requires verification',
        requiresConfirmation: true,
        reason: engineResult.reason,
        amount,
        debtId: debt._id,
      });
    }

    // Record payment
    debt.paymentHistory.push({
      amount,
      paidOn: new Date(),
      status: 'on-time',
    });

    debt.amountRemaining -= amount;

    if (debt.amountRemaining <= 0) {
      debt.isActive = false;
      debt.amountRemaining = 0;
    }

    await debt.save();

    // Create expense entry for tracking
    const expense = new Expense({
      userId: req.userId,
      category: 'debt-repayment',
      amount,
      description: `Debt payment to ${debt.creditorName}`,
      date: new Date(),
    });
    await expense.save();

    res.json({
      message: 'Payment recorded successfully',
      debt,
      totalRemaining: debt.amountRemaining,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Confirm debt payment (after email verification)
router.post('/:debtId/confirm-payment', async (req, res) => {
  try {
    const { amount } = req.body;
    const debt = await Debt.findOne({ _id: req.params.debtId, userId: req.userId });

    if (!debt) return res.status(404).json({ error: 'Debt not found' });

    // Record payment
    debt.paymentHistory.push({
      amount,
      paidOn: new Date(),
      status: 'on-time',
    });

    debt.amountRemaining -= amount;

    if (debt.amountRemaining <= 0) {
      debt.isActive = false;
      debt.amountRemaining = 0;
    }

    await debt.save();

    // Create expense entry
    const expense = new Expense({
      userId: req.userId,
      category: 'debt-repayment',
      amount,
      description: `Debt payment to ${debt.creditorName}`,
      date: new Date(),
    });
    await expense.save();

    res.json({
      message: 'Payment confirmed and recorded',
      debt,
      totalRemaining: debt.amountRemaining,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update debt details
router.put('/:debtId', async (req, res) => {
  try {
    const { monthlyPayment, priority, dueDate } = req.body;
    const debt = await Debt.findOne({ _id: req.params.debtId, userId: req.userId });

    if (!debt) return res.status(404).json({ error: 'Debt not found' });

    if (monthlyPayment !== undefined) debt.monthlyPayment = monthlyPayment;
    if (priority !== undefined) debt.priority = priority;
    if (dueDate !== undefined) debt.dueDate = dueDate;

    await debt.save();

    res.json({
      message: 'Debt updated successfully',
      debt,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Close/Mark debt as paid
router.patch('/:debtId/close', async (req, res) => {
  try {
    const debt = await Debt.findOne({ _id: req.params.debtId, userId: req.userId });

    if (!debt) return res.status(404).json({ error: 'Debt not found' });

    debt.isActive = false;
    debt.amountRemaining = 0;
    await debt.save();

    res.json({
      message: 'Debt marked as closed',
      debt,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get debt analytics
router.get('/analytics/summary', async (req, res) => {
  try {
    const debts = await Debt.find({ userId: req.userId });

    const analytics = {
      totalDebt: debts.reduce((sum, d) => sum + d.amountRemaining, 0),
      activeDebts: debts.filter((d) => d.isActive).length,
      closedDebts: debts.filter((d) => !d.isActive).length,
      totalMonthlyObligation: debts.reduce((sum, d) => sum + (d.monthlyPayment || 0), 0),
      highPriorityDebts: debts.filter((d) => d.priority === 'high' && d.isActive),
      overdueSoon: debts.filter((d) => d.dueDate && new Date(d.dueDate) - new Date() < 7 * 24 * 60 * 60 * 1000),
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
