const express = require('express');
const router = express.Router();
const { authenticateToken } = require('./auth');
const FinancialLiteracy = require('../models/FinancialLiteracy');

// Financial literacy content for Indian context
const quizzes = [
  {
    id: 'quiz-1',
    title: 'Basics of Mutual Funds',
    questions: [
      {
        id: 'q1',
        text: 'What is a mutual fund?',
        options: [
          'A pool of money managed by professionals',
          'A loan from the bank',
          'A type of insurance',
          'A savings account',
        ],
        correct: 0,
      },
      {
        id: 'q2',
        text: 'What is SIP in mutual funds?',
        options: [
          'Systematic Investment Plan - investing regularly',
          'Simple Interest Payment',
          'Stock Investment Premium',
          'Safety Insurance Premium',
        ],
        correct: 0,
      },
    ]
  },
  {
    id: 'quiz-2',
    title: 'Government Schemes for Youth',
    questions: [
      {
        id: 'q1',
        text: 'Which government scheme offers pension for unorganized workers?',
        options: [
          'Pradhan Mantri Suraksha Bima Yojana',
          'PM-KISAN Samman Nidhi',
          'Pradhan Mantri Jeevan Jyoti Bima Yojana',
          'All of the above',
        ],
        correct: 0,
      },
    ]
  },
];

const articles = [
  {
    id: 'article-1',
    title: '5 Simple Steps to Start Budgeting',
    content: 'Learn how to create a budget that works for you...',
    category: 'budgeting',
  },
  {
    id: 'article-2',
    title: 'Understanding UPI and Digital Payments',
    content: 'A guide to safe digital transactions in India...',
    category: 'digital-payments',
  },
  {
    id: 'article-3',
    title: 'Investing for Beginners: Mutual Funds vs Stocks',
    content: 'Know the difference and which is right for you...',
    category: 'investing',
  },
];

// Get available quizzes
router.get('/quizzes', authenticateToken, async (req, res) => {
  try {
    res.json(quizzes.map(q => ({
      id: q.id,
      title: q.title,
      questionCount: q.questions.length,
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get quiz questions
router.get('/quizzes/:quizId', authenticateToken, async (req, res) => {
  try {
    const quiz = quizzes.find(q => q.id === req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.json({
      id: quiz.id,
      title: quiz.title,
      questions: quiz.questions.map(q => ({
        id: q.id,
        text: q.text,
        options: q.options,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit quiz answers
router.post('/quizzes/:quizId/submit', authenticateToken, async (req, res) => {
  try {
    const { answers } = req.body;
    const quiz = quizzes.find(q => q.id === req.params.quizId);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    let score = 0;
    const evaluatedAnswers = [];

    quiz.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correct;
      if (isCorrect) score++;

      evaluatedAnswers.push({
        questionId: question.id,
        selectedOption: question.options[userAnswer],
        correct: isCorrect,
      });
    });

    const percentage = (score / quiz.questions.length) * 100;

    let literacy = await FinancialLiteracy.findOne({ userId: req.user.userId });
    if (!literacy) {
      literacy = new FinancialLiteracy({ userId: req.user.userId });
    }

    literacy.quizzes.push({
      quizId: quiz.id,
      title: quiz.title,
      category: 'finance',
      score: percentage,
      completedAt: new Date(),
      answers: evaluatedAnswers,
    });

    literacy.totalScore += score;
    await literacy.save();

    res.json({
      score: percentage.toFixed(1),
      passStatus: percentage >= 60 ? 'Passed' : 'Try Again',
      answers: evaluatedAnswers,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get articles
router.get('/articles', authenticateToken, async (req, res) => {
  try {
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's literacy progress
router.get('/progress', authenticateToken, async (req, res) => {
  try {
    let literacy = await FinancialLiteracy.findOne({ userId: req.user.userId });
    
    if (!literacy) {
      literacy = new FinancialLiteracy({ userId: req.user.userId });
      await literacy.save();
    }

    res.json({
      quizzesCompleted: literacy.quizzes.length,
      articlesRead: literacy.articles.length,
      totalScore: literacy.totalScore,
      badges: literacy.badges,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
