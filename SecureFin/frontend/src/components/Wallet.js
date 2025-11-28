import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Wallet.css';

function Wallet() {
  const [wallet, setWallet] = useState(null);
  const [formData, setFormData] = useState({
    toWalletAddress: '',
    amount: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchWallet();
    // Auto-refresh wallet every 5 seconds for real-time updates
    const interval = setInterval(fetchWallet, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchWallet = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/wallet/info', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setWallet(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching wallet:', error);
      if (error.response?.status === 404) {
        // Wallet doesn't exist, create one
        createWallet();
      } else {
        setError('Failed to load wallet');
      }
    }
  };

  const createWallet = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5001/api/wallet/create', {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setWallet(response.data);
      setSuccess('Wallet created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error creating wallet:', error);
      setError('Failed to create wallet');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5001/api/wallet/transfer', formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setSuccess(`Transfer successful! Sent ₹${formData.amount} to ${formData.toWalletAddress.slice(0, 10)}...`);
      setFormData({
        toWalletAddress: '',
        amount: '',
        description: '',
      });
      
      // Immediately refresh wallet to show new balance
      await fetchWallet();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  if (!wallet) return <div className="loading">Creating/loading wallet...</div>;

  return (
    <div className="wallet">
      <h1>Blockchain Wallet 🔐</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="wallet-info">
        <div className="wallet-card">
          <h2>Your Wallet</h2>
          <div className="balance">
            <h3>Balance</h3>
            <p className="balance-amount">₹{(wallet.balance || 0).toFixed(2)}</p>
            <p className="balance-status">Last updated: just now</p>
          </div>
          <div className="wallet-address">
            <h3>Wallet Address</h3>
            <p className="address">{wallet.walletAddress}</p>
            <button 
              className="copy-btn"
              onClick={() => {
                navigator.clipboard.writeText(wallet.walletAddress);
                alert('Address copied!');
              }}
            >
              📋 Copy Address
            </button>
          </div>
        </div>
      </div>

      <div className="transfer-section">
        <h2>Send Money (P2P Transfer)</h2>
        <form onSubmit={handleTransfer}>
          <div className="form-group">
            <label>Recipient Wallet Address</label>
            <input
              type="text"
              name="toWalletAddress"
              placeholder="0x..."
              value={formData.toWalletAddress}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Amount (₹)</label>
            <input
              type="number"
              name="amount"
              placeholder="Enter amount"
              value={formData.amount}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              required
            />
            {wallet && formData.amount && parseFloat(formData.amount) > wallet.balance && (
              <p className="warning">⚠️ Insufficient balance!</p>
            )}
          </div>
          <div className="form-group">
            <label>Description (Optional)</label>
            <input
              type="text"
              name="description"
              placeholder="What is this payment for?"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>
          <button type="submit" disabled={loading || !formData.toWalletAddress || !formData.amount}>
            {loading ? '⏳ Sending...' : '✓ Send Money'}
          </button>
        </form>
      </div>

      <div className="transaction-history">
        <h2>Transaction History</h2>
        {wallet.transactionHistory && wallet.transactionHistory.length > 0 ? (
          <div className="history-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date & Time</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {wallet.transactionHistory.map((tx, idx) => {
                  const isSent = tx.fromUserId === wallet.userId;
                  const typeLabel = isSent ? '📤 Sent' : '📥 Received';
                  return (
                    <tr key={idx} className={isSent ? 'sent' : 'received'}>
                      <td>{typeLabel}</td>
                      <td className={isSent ? 'negative' : 'positive'}>
                        {isSent ? '-' : '+'}₹{(tx.amount || 0).toFixed(2)}
                      </td>
                      <td>
                        <span className={`status ${tx.status || 'confirmed'}`}>
                          {tx.status === 'confirmed' ? '✓' : '⧗'} {tx.status || 'Confirmed'}
                        </span>
                      </td>
                      <td>{new Date(tx.timestamp).toLocaleString()}</td>
                      <td className="description">{tx.description || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-transactions">No transactions yet. Start by receiving money or creating another wallet to transfer to!</p>
        )}
      </div>

      <div className="wallet-tips">
        <h3>💡 Tips</h3>
        <ul>
          <li>Share your wallet address to receive money</li>
          <li>Keep your private key secure</li>
          <li>All transactions are recorded on blockchain</li>
          <li>Wallet updates in real-time</li>
        </ul>
      </div>
    </div>
  );
}

export default Wallet;
