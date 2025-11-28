const express = require('express');
const router = express.Router();
const { predictShortfall, getShortfallTrend } = require('../ai/shortfallPredictor');

// Middleware - Auth
const authenticateUser = (req, res, next) => {
  const userId = req.headers['user-id'] || req.query.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  req.userId = userId;
  next();
};

router.use(authenticateUser);

// Get shortfall prediction for next 30 days
router.get('/shortfall', async (req, res) => {
  try {
    const prediction = await predictShortfall(req.userId);
    res.json(prediction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get shortfall trend for next 3-6 months
router.get('/trend', async (req, res) => {
  try {
    const months = req.query.months || 3;
    const trend = await getShortfallTrend(req.userId, parseInt(months));
    res.json(trend);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get shortfall alert status
router.get('/alert-status', async (req, res) => {
  try {
    const prediction = await predictShortfall(req.userId);

    const alert = {
      hasAlert: prediction.hasShortfall,
      riskLevel: prediction.riskLevel,
      shortfallAmount: prediction.shortfallAmount,
      message:
        prediction.riskLevel === 'CRITICAL'
          ? '🚨 Critical: Your expenses exceed income significantly. Immediate action required.'
          : prediction.riskLevel === 'HIGH'
            ? '⚠️ High Risk: Your expenses are exceeding income. Review spending patterns.'
            : prediction.riskLevel === 'MEDIUM'
              ? '📊 Moderate: Monitor your spending closely to maintain stability.'
              : '✅ Good: Your financial situation is stable.',
      actionItems: prediction.recommendations.filter((r) => r.priority === 'CRITICAL' || r.priority === 'HIGH'),
    };

    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
