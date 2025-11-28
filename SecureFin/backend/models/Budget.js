const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    enum: ['food', 'education', 'travel', 'entertainment', 'utilities', 'health', 'shopping', 'other'],
    required: true,
  },
  limit: {
    type: Number,
    required: true,
  },
  spent: {
    type: Number,
    default: 0,
  },
  month: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  suggestions: [
    {
      title: String,
      description: String,
      potentialSavings: Number,
      timestamp: Date,
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

budgetSchema.index({ userId: 1, month: 1, year: 1 });

module.exports = mongoose.model('Budget', budgetSchema);
