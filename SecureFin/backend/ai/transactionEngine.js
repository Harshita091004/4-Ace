const AnomalyDetector = require('./anomalyDetector');
const User = require('../models/User');

/**
 * Transaction Logic Engine
 * Inputs: userId, userProfile (optional), currentBalance, transactionDetails { amount, merchant, category }
 * Output (strict): { action, reason, email_subject, email_body_message }
 */
class TransactionEngine {
  static async evaluate(userId, userProfile = {}, currentBalance = 0, transaction = {}) {
    try {
      const amount = parseFloat(transaction.amount) || 0;

      // Fetch user profile if needed
      let profile = userProfile;
      if ((!profile || Object.keys(profile).length === 0) && userId) {
        const u = await User.findById(userId).lean().catch(() => null);
        if (u) profile = { homeCity: u.homeCity || null, status: u.status || null, email: u.email || null };
      }

      // 1) INSUFFICIENT FUNDS CHECK
      if (amount > currentBalance) {
        return {
          action: 'VERIFY_VIA_EMAIL',
          reason: 'Insufficient funds: transaction amount exceeds current balance',
          email_subject: 'Action required: Verify large payment (insufficient funds)',
          email_body_message: `We detected a payment request of ₹${amount.toFixed(2)} but your available balance is ₹${currentBalance.toFixed(2)}. Please verify the payment or add funds to proceed.`,
        };
      }

      // 2) HIGH VALUE / ANOMALY CHECK
      // Use anomaly detector statistics to determine average spend
      const statsRes = await AnomalyDetector.getUserSpendingStats(userId).catch(() => null);
      let categoryAvg = null;
      let overallAvg = null;
      if (statsRes && !statsRes.noHistory) {
        const stats = statsRes.stats || {};
        if (transaction.category && stats[transaction.category]) categoryAvg = stats[transaction.category].average;
        // overall average across categories
        const allAvgs = Object.values(stats).map(s => s.average).filter(Boolean);
        if (allAvgs.length) overallAvg = allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length;
      }

      const highValueByBalance = amount > currentBalance * 0.5; // >50% of balance
      const highValueByAvg = (categoryAvg && amount > categoryAvg * 10) || (overallAvg && amount > overallAvg * 10);

      // Use anomaly detector for further context
      const anomaly = await AnomalyDetector.detectAnomalies(userId, transaction).catch(() => ({ riskLevel: 'UNKNOWN', riskScore: 0 }));

      if (anomaly && anomaly.riskLevel === 'CRITICAL') {
        return {
          action: 'BLOCK',
          reason: 'Transaction flagged as critical risk by anomaly engine',
          email_subject: null,
          email_body_message: null,
        };
      }

      if (highValueByBalance || highValueByAvg || (anomaly && anomaly.riskLevel === 'HIGH')) {
        return {
          action: 'VERIFY_VIA_EMAIL',
          reason: 'High value security check triggered',
          email_subject: 'Confirm your high-value SecureFin payment',
          email_body_message: `We noticed a high-value payment of ₹${amount.toFixed(2)} from your account. For your security, please confirm this transaction via the link sent to your registered email.`,
        };
      }

      // Default: allow
      return {
        action: 'ALLOW',
        reason: 'Within normal thresholds and balance',
        email_subject: null,
        email_body_message: null,
      };
    } catch (err) {
      console.error('TransactionEngine error', err);
      return {
        action: 'VERIFY_VIA_EMAIL',
        reason: 'Error evaluating transaction risk - fallback to verification',
        email_subject: 'Verify your payment',
        email_body_message: 'We were unable to automatically verify this transaction. Please confirm via email to proceed.',
      };
    }
  }
}

module.exports = TransactionEngine;
