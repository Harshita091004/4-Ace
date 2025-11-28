# SecureFin - Blockchain Technology Details

## Overview
SecureFin implements a custom blockchain based on SHA-256 hashing and Proof-of-Work consensus, designed specifically for tracking personal finance transactions immutably.

## Blockchain Architecture

### 1. Block Structure
Each block contains:
```javascript
{
  index: number,           // Block position in chain
  timestamp: Date,         // Block creation time
  transactions: Array,     // Transaction data
  previousHash: string,    // Hash of previous block
  nonce: number,          // Number used for proof-of-work
  hash: string            // Current block's hash
}
```

### 2. Transaction Structure
```javascript
{
  from: userId,           // Sender address (user ID)
  to: recipientId,        // Recipient address (user ID)
  amount: number,         // Transaction amount
  category: string,       // Expense category
  timestamp: Date,        // Transaction time
  hash: string           // Transaction hash
}
```

### 3. Chain Validation
```javascript
isChainValid() {
  // For each block:
  // 1. Verify block's hash is correct
  // 2. Verify previous hash matches previous block's hash
  // 3. Return true if all valid
}
```

## Key Features

### SHA-256 Hashing
Every transaction and block is hashed using SHA-256:
```
Input: { from: "user1", to: "user2", amount: 100 }
Output: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2"
```

### Proof-of-Work (PoW)
- **Difficulty**: Adjustable (default: 2)
- **Goal**: Find nonce where block hash starts with N zeros
- **Time**: ~100ms per block at difficulty 2

Example mining:
```
Difficulty: 2 (hash must start with "00")
Attempt 1: hash = "a1b2..." ❌
Attempt 2: hash = "1c3d..." ❌
...
Attempt 2451: hash = "00ab..." ✅
Block mined with nonce: 2451
```

### Immutability
Once a block is added to the chain:
1. **Cannot be modified** - Changing data changes hash
2. **Cannot be removed** - Breaks chain continuity
3. **Cannot be rearranged** - Each block references the previous

Example tampering detection:
```
Original: Block[2].hash = "00ab..."
Tampered: Block[2].data modified
Result: Block[2].hash = "1c3d..." ≠ "00ab..."
        Block[3].previousHash ≠ Block[2].hash
        ❌ Chain invalid!
```

## Mining Process

### Step-by-Step Mining
```javascript
mineBlock(difficulty) {
  while (this.hash.substring(0, difficulty) !== "00...0") {
    this.nonce++;
    this.hash = this.calculateHash();
  }
  console.log(`Block mined: ${this.hash}`);
}
```

### Example: Mining a Block
```
Difficulty: 3 (requires "000")
Transaction: 100 INR from User1 to User2
Starting nonce: 0

Iteration 1: nonce=0, hash="a1b..." ❌
Iteration 2: nonce=1, hash="2c3..." ❌
...
Iteration 7823: nonce=7822, hash="000ab..." ✅

Block successfully mined!
```

## Transaction Flow in SecureFin

### 1. User Initiates Transfer
```
User A → Transfer 100 INR to User B
```

### 2. Transaction Created
```javascript
transaction = {
  from: "User_A_ID",
  to: "User_B_ID",
  amount: 100,
  timestamp: 2024-01-15T10:30:00Z
}
```

### 3. Hash Transaction
```
SHA-256(transaction) = "x1y2z3..."
```

### 4. Add to Pending Pool
```
Pending Transactions: [transaction_with_hash]
```

### 5. Mine Block (Proof-of-Work)
```
Block containing transaction is mined
Takes ~100ms at difficulty 2
```

### 6. Add to Chain
```
Blockchain.chain.push(minedBlock)
Previous block's hash → New block's previousHash
```

### 7. Transaction Confirmed
```
Transaction status: "confirmed"
blockchainHash: "x1y2z3..."
blockchainTimestamp: when mined
```

## Data Structure Example

### Fresh Blockchain
```
Chain:
  ├─ Genesis Block (index: 0)
  │  ├─ hash: "00000initial"
  │  ├─ previousHash: "0"
  │  ├─ transactions: []
  │  └─ nonce: 0
  
Pending Transactions: []
```

### After First Transaction
```
Chain:
  ├─ Genesis Block
  │
  └─ Block 1 (index: 1)
     ├─ hash: "00abc123def"
     ├─ previousHash: "00000initial"
     ├─ nonce: 2451
     ├─ transactions: [
     │   {
     │     from: "user1",
     │     to: "user2",
     │     amount: 100,
     │     hash: "1a2b3c4d..."
     │   }
     │ ]
     └─ mineTime: 145ms
```

## Smart Features

### 1. Balance Calculation
```javascript
getBalance(address) {
  for each block in chain:
    for each transaction in block:
      if (transaction.from === address)
        balance -= transaction.amount
      if (transaction.to === address)
        balance += transaction.amount
  return balance
}
```

### 2. Transaction History
```javascript
getTransactionHistory(address) {
  transactions = []
  for each block in chain:
    for each transaction in block:
      if (transaction involves address):
        transactions.push(transaction with blockInfo)
  return transactions
}
```

### 3. Mining Rewards
```
After mining a block:
Miner receives 10 INR reward
New transaction added to pending
```

## Security Analysis

### Strengths
✅ **Immutability**: SHA-256 ensures data integrity
✅ **Proof-of-Work**: Prevents spam and tampering
✅ **Chain Continuity**: Previous hash creates linkage
✅ **Transparency**: All transactions visible
✅ **Auditability**: Complete history preserved

### Considerations (for 24-hour hackathon)
⚠️ **Not cryptographically secured** (no digital signatures)
⚠️ **Centralized** (single node, no distributed consensus)
⚠️ **Performance limited** (not optimized for high throughput)
⚠️ **Network-less** (no P2P implementation)

## Performance Metrics

### Current Implementation
- **Block time**: ~100ms (difficulty 2)
- **Transactions per block**: Unlimited (demo size)
- **Chain validation**: O(n) where n = blocks
- **Transaction lookup**: O(n*m) where m = txs per block

### Scalability Improvements (Future)
- Merkle tree for faster validation
- Transaction batching
- Layer 2 solutions
- Sharding

## Integration with SecureFin

### 1. Expense Recording
```
When user adds ₹500 expense:
├─ Create transaction in MongoDB
├─ Hash and add to blockchain
├─ Mine block
└─ Store blockchain hash in MongoDB
```

### 2. Fraud Detection
```
Blockchain serves as:
├─ Immutable audit log
├─ Proof of transaction
└─ Fraud prevention
```

### 3. Wallet Transfers
```
P2P Transfer Process:
├─ Verify wallet addresses exist
├─ Check sufficient balance
├─ Create blockchain transaction
├─ Update wallet balances
└─ Mine and confirm
```

## Example API Response

### Record Transaction Response
```json
{
  "transactionId": "60d5ec49c1234567890abcde",
  "blockchainHash": "00abcdef123456789...",
  "blockNumber": 5,
  "message": "Transaction recorded on blockchain",
  "details": {
    "from": "user1_id",
    "to": "user2_id",
    "amount": 250,
    "timestamp": "2024-01-15T10:30:00Z",
    "nonce": 3421,
    "mineTime": 125
  }
}
```

## Testing Blockchain

### Via API
```bash
# Get blockchain info
curl http://localhost:5000/api/blockchain/info

# Record transaction
curl -X POST http://localhost:5000/api/blockchain/record-transaction \
  -H "Authorization: Bearer TOKEN" \
  -d '{"toUserId":"user2","amount":100}'

# Get ledger
curl http://localhost:5000/api/blockchain/ledger \
  -H "Authorization: Bearer TOKEN"
```

### Programmatic Testing
```javascript
const Blockchain = require('./blockchain/Blockchain');
const blockchain = new Blockchain();

// Create transactions
blockchain.createTransaction({
  from: 'Alice',
  to: 'Bob',
  amount: 100
});

// Mine block
blockchain.minePendingTransactions('Miner');

// Check balance
console.log(blockchain.getBalance('Alice')); // -100

// Validate chain
console.log(blockchain.isChainValid()); // true
```

## Real-World Applications

### Current (Hackathon)
- Demo blockchain for understanding
- Transaction immutability proof
- Educational purposes
- Fraud prevention audit trail

### Future (Production)
- Ethereum integration for real transactions
- Smart contracts for escrow
- Multi-signature wallets
- Cross-chain interoperability
- Real staking mechanisms

---

## References

- SHA-256: Secure Hash Algorithm
- Proof-of-Work: Bitcoin consensus mechanism
- Blockchain: Distributed ledger technology
- Immutability: Tamper-proof data structures

**Blockchain Version**: 1.0 (Custom SHA-256 based)
**Status**: Ready for hackathon demonstration
