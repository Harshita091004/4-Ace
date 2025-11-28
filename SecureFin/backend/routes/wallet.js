const express = require('express');
const router = express.Router();
const { authenticateToken } = require('./auth');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const crypto = require('crypto');

// Create wallet
router.post('/create', authenticateToken, async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ userId: req.user.userId });
    
    if (wallet) {
      return res.status(400).json({ error: 'Wallet already exists' });
    }

    const walletAddress = '0x' + crypto.randomBytes(20).toString('hex');
    const privateKey = crypto.randomBytes(32).toString('hex');
    const publicKey = crypto.randomBytes(32).toString('hex');

    wallet = new Wallet({
      userId: req.user.userId,
      walletAddress,
      privateKey,
      publicKey,
      balance: 1000, // Initial mock balance
    });

    await wallet.save();

    res.status(201).json({
      walletAddress: wallet.walletAddress,
      balance: wallet.balance,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get wallet
router.get('/info', authenticateToken, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.user.userId }).select('-privateKey');
    
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    res.json(wallet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Transfer funds
router.post('/transfer', authenticateToken, async (req, res) => {
  try {
    const { toWalletAddress, amount, description } = req.body;

    if (!toWalletAddress || !amount) {
      return res.status(400).json({ error: 'Recipient address and amount are required' });
    }

    const fromWallet = await Wallet.findOne({ userId: req.user.userId });
    const toWallet = await Wallet.findOne({ walletAddress: toWalletAddress });

    if (!fromWallet) {
      return res.status(404).json({ error: 'Your wallet not found' });
    }

    if (!toWallet) {
      return res.status(404).json({ error: 'Recipient wallet not found' });
    }

    if (fromWallet.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Create transaction
    const transaction = new Transaction({
      fromUserId: req.user.userId,
      toUserId: toWallet.userId,
      amount,
      type: 'transfer',
      description,
      status: 'confirmed',
      confirmedAt: new Date(),
    });

    // Update wallets
    fromWallet.balance -= amount;
    toWallet.balance += amount;

    await transaction.save();
    await fromWallet.save();
    await toWallet.save();

    res.status(201).json({
      transactionId: transaction._id,
      status: 'Transfer successful',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
