const express = require('express');
const router = express.Router();
const { authenticateToken } = require('./auth');
const Blockchain = require('../../blockchain/Blockchain');
const Transaction = require('../models/Transaction');

const blockchain = new Blockchain();

// Get blockchain
router.get('/ledger', authenticateToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [
        { fromUserId: req.user.userId },
        { toUserId: req.user.userId },
      ]
    }).sort({ createdAt: -1 });

    res.json({
      transactions,
      blockchainValid: blockchain.isChainValid(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get blockchain info
router.get('/info', (req, res) => {
  try {
    res.json({
      chainLength: blockchain.chain.length,
      difficulty: blockchain.difficulty,
      isValid: blockchain.isChainValid(),
      networkStatus: 'Simulated Local Testnet',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Record transaction on blockchain
router.post('/record-transaction', authenticateToken, async (req, res) => {
  try {
    const { toUserId, amount, description } = req.body;

    const transaction = new Transaction({
      fromUserId: req.user.userId,
      toUserId,
      amount,
      type: 'transfer',
      description,
      status: 'pending',
    });

    const blockchainHash = blockchain.createTransaction({
      from: req.user.userId,
      to: toUserId,
      amount,
      timestamp: new Date(),
    });

    transaction.blockchainHash = blockchainHash;
    transaction.blockchainTimestamp = new Date();
    transaction.status = 'confirmed';

    await transaction.save();

    res.status(201).json({
      transactionId: transaction._id,
      blockchainHash,
      message: 'Transaction recorded on blockchain',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
