const express = require('express');
const router = express.Router();
const { authenticateToken } = require('./auth');
const User = require('../models/User');

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, monthlyBudget, preferredLanguage } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name, phone, monthlyBudget, preferredLanguage, updatedAt: new Date() },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enable 2FA
router.post('/enable-2fa', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    user.twoFactorEnabled = true;
    user.twoFactorSecret = Math.random().toString(36).substring(7);
    await user.save();
    
    res.json({ 
      message: '2FA enabled',
      secret: user.twoFactorSecret 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
