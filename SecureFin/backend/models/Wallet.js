const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
  walletAddress: {
    type: String,
    unique: true,
    required: true,
  },
  privateKey: String, // Should be encrypted in production
  publicKey: String,
  transactionHistory: [
    {
      transactionId: mongoose.Schema.Types.ObjectId,
      amount: Number,
      type: String,
      timestamp: Date,
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

walletSchema.index({ userId: 1 });
walletSchema.index({ walletAddress: 1 });

module.exports = mongoose.model('Wallet', walletSchema);
