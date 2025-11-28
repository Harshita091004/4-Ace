const mongoose = require('mongoose');

const FlaggedTransactionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    transaction: {
      amount: Number,
      category: String,
      description: String,
      toAddress: String,
      fromAddress: String,
      timestamp: Date,
    },
    anomalies: { type: Array, default: [] },
    riskLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'UNKNOWN'], default: 'UNKNOWN' },
    riskScore: { type: Number, default: 0 },
    status: { type: String, enum: ['pending_review', 'approved', 'rejected', 'confirmed_fraud'], default: 'pending_review' },
    userResponse: { type: String },
    reviewedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('FlaggedTransaction', FlaggedTransactionSchema);
