const express = require('express');
const router = express.Router();
const { authenticateToken } = require('./auth');
const Transaction = require('../models/Transaction');

// Fraud detection using anomaly detection
const detectAnomalies = (transactions) => {
  if (transactions.length < 3) return [];

  const amounts = transactions.map(t => t.amount);
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const variance = amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length;
  const stdDev = Math.sqrt(variance);

  const anomalies = [];
  transactions.forEach((transaction, index) => {
    const zScore = Math.abs((transaction.amount - mean) / (stdDev || 1));
    if (zScore > 2) { // 2 standard deviations threshold
      anomalies.push({
        transactionIndex: index,
        transactionId: transaction._id,
        amount: transaction.amount,
        zScore,
        fraudScore: Math.min(zScore / 3, 1),
      });
    }
  });

  return anomalies;
};

// Get fraud alerts
router.get('/alerts', authenticateToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      fromUserId: req.user.userId,
    }).sort({ createdAt: -1 }).limit(50);

    const anomalies = detectAnomalies(transactions);

    // Flag suspicious transactions
    for (let anomaly of anomalies) {
      const transaction = await Transaction.findById(anomaly.transactionId);
      if (transaction) {
        transaction.fraudScore = anomaly.fraudScore;
        transaction.isFlaggedAsFraud = anomaly.fraudScore > 0.6;
        await transaction.save();
      }
    }

    const fraudTransactions = await Transaction.find({
      fromUserId: req.user.userId,
      isFlaggedAsFraud: true,
    });

    res.json({
      suspiciousTransactions: anomalies,
      flaggedTransactions: fraudTransactions,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Report fraud
router.post('/report', authenticateToken, async (req, res) => {
  try {
    const { transactionId, reason } = req.body;

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    transaction.isFlaggedAsFraud = true;
    await transaction.save();

    res.json({ 
      message: 'Fraud reported successfully',
      transactionId: transaction._id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
