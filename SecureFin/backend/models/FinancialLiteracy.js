const mongoose = require('mongoose');

const literacySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  quizzes: [
    {
      quizId: String,
      title: String,
      category: String,
      score: Number,
      completedAt: Date,
      answers: [
        {
          questionId: String,
          selectedOption: String,
          correct: Boolean,
        }
      ],
    }
  ],
  articles: [
    {
      articleId: String,
      title: String,
      topic: String,
      readAt: Date,
      completed: Boolean,
    }
  ],
  badges: [
    {
      name: String,
      description: String,
      awardedAt: Date,
    }
  ],
  totalScore: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

literacySchema.index({ userId: 1 });

module.exports = mongoose.model('FinancialLiteracy', literacySchema);
