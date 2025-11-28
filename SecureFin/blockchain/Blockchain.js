const crypto = require('crypto');

class Block {
  constructor(index, timestamp, transactions, previousHash = '0') {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(
        JSON.stringify({
          index: this.index,
          timestamp: this.timestamp,
          transactions: this.transactions,
          previousHash: this.previousHash,
          nonce: this.nonce,
        })
      )
      .digest('hex');
  }

  mineBlock(difficulty) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log(`Block mined: ${this.hash}`);
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.pendingTransactions = [];
    this.difficulty = 2;
    this.minerReward = 10;
  }

  createGenesisBlock() {
    return new Block(0, new Date(), [], '0');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  createTransaction(transaction) {
    const transactionHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(transaction))
      .digest('hex');

    this.pendingTransactions.push({
      ...transaction,
      hash: transactionHash,
    });

    return transactionHash;
  }

  minePendingTransactions(minerAddress) {
    const block = new Block(
      this.chain.length,
      new Date(),
      this.pendingTransactions,
      this.getLatestBlock().hash
    );

    block.mineBlock(this.difficulty);
    this.chain.push(block);

    this.pendingTransactions = [
      {
        from: 'System',
        to: minerAddress,
        amount: this.minerReward,
        timestamp: new Date(),
      }
    ];

    return block.hash;
  }

  getBalance(address) {
    let balance = 0;

    for (const block of this.chain) {
      for (const transaction of block.transactions) {
        if (transaction.from === address) {
          balance -= transaction.amount;
        }
        if (transaction.to === address) {
          balance += transaction.amount;
        }
      }
    }

    return balance;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }

    return true;
  }

  getTransactionHistory(address) {
    const transactions = [];

    for (const block of this.chain) {
      for (const transaction of block.transactions) {
        if (transaction.from === address || transaction.to === address) {
          transactions.push({
            ...transaction,
            blockIndex: block.index,
            blockHash: block.hash,
          });
        }
      }
    }

    return transactions;
  }
}

module.exports = Blockchain;
