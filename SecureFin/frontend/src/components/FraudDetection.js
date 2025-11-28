import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/FraudDetection.css';

function FraudDetection() {
  const [alerts, setAlerts] = useState([]);
  const [flaggedTransactions, setFlaggedTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFraudAlerts();
  }, []);

  const fetchFraudAlerts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/fraud/alerts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setAlerts(response.data.suspiciousTransactions || []);
      setFlaggedTransactions(response.data.flaggedTransactions || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching fraud alerts:', error);
      setLoading(false);
    }
  };

  const reportFraud = async (transactionId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/fraud/report', 
        { transactionId, reason: 'User reported' },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      alert('Fraud reported successfully!');
      fetchFraudAlerts();
    } catch (error) {
      alert('Error reporting fraud: ' + error.response?.data?.error);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="fraud-detection">
      <h1>Fraud Detection & Alerts</h1>

      <div className="alerts-summary">
        <div className="alert-card warning">
          <h3>Suspicious Transactions</h3>
          <p className="count">{alerts.length}</p>
        </div>
        <div className="alert-card danger">
          <h3>Flagged Transactions</h3>
          <p className="count">{flaggedTransactions.length}</p>
        </div>
      </div>

      <div className="alerts-section">
        <h2>Anomaly Detection Results</h2>
        {alerts.length > 0 ? (
          <div className="alerts-table">
            <table>
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Amount</th>
                  <th>Fraud Score</th>
                  <th>Z-Score</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert, idx) => (
                  <tr key={idx}>
                    <td>{alert.transactionId}</td>
                    <td>₹{alert.amount}</td>
                    <td>{(alert.fraudScore * 100).toFixed(1)}%</td>
                    <td>{alert.zScore.toFixed(2)}</td>
                    <td>
                      <button 
                        className="report-btn"
                        onClick={() => reportFraud(alert.transactionId)}
                      >
                        Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-data">No suspicious transactions detected</p>
        )}
      </div>

      <div className="flagged-section">
        <h2>Flagged Transactions</h2>
        {flaggedTransactions.length > 0 ? (
          <div className="flagged-table">
            <table>
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {flaggedTransactions.map((tx, idx) => (
                  <tr key={idx} className="flagged">
                    <td>{tx._id}</td>
                    <td>₹{tx.amount}</td>
                    <td>{tx.type}</td>
                    <td className="status-badge">{tx.status}</td>
                    <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-data">No flagged transactions</p>
        )}
      </div>

      <div className="security-tips">
        <h2>Security Tips</h2>
        <ul>
          <li>Monitor your transactions regularly for unusual activity</li>
          <li>Enable two-factor authentication on your account</li>
          <li>Never share your wallet private key with anyone</li>
          <li>Use strong, unique passwords for your accounts</li>
          <li>Report suspicious transactions immediately</li>
          <li>Keep your contact information up to date</li>
        </ul>
      </div>
    </div>
  );
}

export default FraudDetection;
