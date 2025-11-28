const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['expense', 'income', 'transfer', 'remittance'],
    required: true,
  },
  description: String,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending',
  },
  blockchainHash: {
    type: String,
    unique: true,
    sparse: true,
  },
  blockchainTimestamp: Date,
  fraudScore: {
    type: Number,
    default: 0,
  },
  isFlaggedAsFraud: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  confirmedAt: Date,
});

transactionSchema.index({ fromUserId: 1, createdAt: -1 });
transactionSchema.index({ blockchainHash: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
