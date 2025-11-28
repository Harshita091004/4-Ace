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

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/wallet/info', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setWallet(response.data);
    } catch (error) {
      console.error('Error fetching wallet:', error);
      // Create wallet if doesn't exist
      createWallet();
    }
  };

  const createWallet = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/wallet/create', {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setWallet(response.data);
    } catch (error) {
      console.error('Error creating wallet:', error);
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

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/wallet/transfer', formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      alert('Transfer successful!');
      setFormData({
        toWalletAddress: '',
        amount: '',
        description: '',
      });
      fetchWallet();
    } catch (error) {
      alert('Error: ' + error.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  if (!wallet) return <div className="loading">Loading wallet...</div>;

  return (
    <div className="wallet">
      <h1>Blockchain Wallet</h1>

      <div className="wallet-info">
        <div className="wallet-card">
          <h2>Your Wallet</h2>
          <div className="balance">
            <h3>Balance</h3>
            <p className="balance-amount">₹{wallet.balance || 0}</p>
          </div>
          <div className="wallet-address">
            <h3>Wallet Address</h3>
            <p className="address">{wallet.walletAddress}</p>
            <button onClick={() => navigator.clipboard.writeText(wallet.walletAddress)}>Copy</button>
          </div>
        </div>
      </div>

      <div className="transfer-section">
        <h2>Send Money (P2P Transfer)</h2>
        <form onSubmit={handleTransfer}>
          <input
            type="text"
            name="toWalletAddress"
            placeholder="Recipient Wallet Address"
            value={formData.toWalletAddress}
            onChange={handleInputChange}
            required
          />
          <input
            type="number"
            name="amount"
            placeholder="Amount (₹)"
            value={formData.amount}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="description"
            placeholder="Description (optional)"
            value={formData.description}
            onChange={handleInputChange}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Money'}
          </button>
        </form>
      </div>

      <div className="transaction-history">
        <h2>Transaction History</h2>
        {wallet.transactionHistory && wallet.transactionHistory.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {wallet.transactionHistory.map((tx, idx) => (
                <tr key={idx}>
                  <td>{tx.type}</td>
                  <td>₹{tx.amount}</td>
                  <td>{new Date(tx.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No transactions yet</p>
        )}
      </div>
    </div>
  );
}

export default Wallet;
