const Transaction = require('../models/Transaction');

class AnomalyDetector {
  static THRESHOLDS = {
    AMOUNT_MULTIPLIER: 2.5,
    HIGH_VELOCITY_COUNT: 10,
  };

  static async getUserSpendingStats(userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const transactions = await Transaction.find({ userId, createdAt: { $gte: startDate } }).lean();
    if (!transactions || transactions.length === 0) return { noHistory: true };

    const byCategory = {};
    transactions.forEach(tx => {
      const cat = tx.category || 'uncategorized';
      byCategory[cat] = byCategory[cat] || [];
      byCategory[cat].push(tx.amount);
    });

    const stats = {};
    for (const [category, amounts] of Object.entries(byCategory)) {
      const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const variance = amounts.reduce((acc, x) => acc + Math.pow(x - avg, 2), 0) / amounts.length;
      const stdDev = Math.sqrt(variance);
      stats[category] = {
        count: amounts.length,
        average: avg,
        max: Math.max(...amounts),
        min: Math.min(...amounts),
        stdDev,
        lastTransaction: null,
      };
    }

    const latest = transactions.reduce((a, b) => (new Date(a.createdAt) > new Date(b.createdAt) ? a : b));
    if (latest) {
      const c = latest.category || 'uncategorized';
      if (stats[c]) stats[c].lastTransaction = latest.createdAt;
    }

    return { stats, totalTransactions: transactions.length };
  }

  static async detectAnomalies(userId, transaction) {
    try {
      const { amount, category } = transaction;
      const anomalies = [];
      let riskScore = 0;

      const spendingData = await this.getUserSpendingStats(userId);
      if (spendingData.noHistory) {
        return { anomalies: [], riskLevel: 'LOW', riskScore: 0, message: 'No history to compare' };
      }

      const { stats } = spendingData;

      if (stats[category]) {
        const cat = stats[category];
        if (cat.average > 0 && amount > cat.average * this.THRESHOLDS.AMOUNT_MULTIPLIER) {
          anomalies.push({ type: 'AMOUNT_SPIKE', severity: 'HIGH', message: `Amount ${amount} is ${ (amount / cat.average).toFixed(1) }x average for ${category}` });
          riskScore += 40;
        }

        if (amount > cat.max * 1.5) {
          anomalies.push({ type: 'NEW_RECORD', severity: 'MEDIUM', message: `Amount ${amount} exceeds previous max ${cat.max} for ${category}` });
          riskScore += 20;
        }
      } else {
        anomalies.push({ type: 'NEW_CATEGORY', severity: 'LOW', message: `First time spending in ${category}` });
        riskScore += 10;
      }

      const recentCount = await Transaction.countDocuments({ userId, createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } });
      if (recentCount > this.THRESHOLDS.HIGH_VELOCITY_COUNT) {
        anomalies.push({ type: 'HIGH_VELOCITY', severity: 'MEDIUM', message: `${recentCount} transactions in last hour` });
        riskScore += 25;
      }

      let riskLevel = 'LOW';
      if (riskScore >= 60) riskLevel = 'CRITICAL';
      else if (riskScore >= 40) riskLevel = 'HIGH';
      else if (riskScore >= 20) riskLevel = 'MEDIUM';

      return { anomalies, riskLevel, riskScore, message: anomalies.length ? `${anomalies.length} anomalies detected` : 'OK' };
    } catch (err) {
      console.error('AnomalyDetector error', err);
      return { anomalies: [], riskLevel: 'UNKNOWN', riskScore: 0, message: 'Error during detection' };
    }
  }

  static async flagSuspiciousTransaction(userId, transaction, anomalies, riskLevel, riskScore) {
    try {
      const FlaggedTransaction = require('../models/FlaggedTransaction');
      const doc = await FlaggedTransaction.create({ userId, transaction, anomalies, riskLevel, riskScore, status: 'pending_review' });
      return doc;
    } catch (err) {
      console.error('Error flagging suspicious transaction', err);
      return null;
    }
  }
}

module.exports = AnomalyDetector;
