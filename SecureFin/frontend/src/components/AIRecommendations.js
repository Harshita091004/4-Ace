import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/AIRecommendations.css';

function AIRecommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [report, setReport] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recommendations');
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  useEffect(() => {
    const handler = () => { fetchData(); };
    window.addEventListener('expensesUpdated', handler);
    return () => window.removeEventListener('expensesUpdated', handler);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch recommendations
      const recResponse = await axios.get(
        `http://localhost:5001/api/expenses/recommendations?days=${days}`,
        { headers }
      );
      setRecommendations(recResponse.data.recommendations || []);

      // Fetch full report
      const reportResponse = await axios.get(
        `http://localhost:5001/api/expenses/ai-report?days=${days}`,
        { headers }
      );
      setReport(reportResponse.data.report);

      // Fetch anomalies
      const anomaliesResponse = await axios.get(
        `http://localhost:5001/api/expenses/anomalies?days=${days * 2}`,
        { headers }
      );
      setAnomalies(anomaliesResponse.data.anomalies || []);

      // Fetch prediction
      const predictionResponse = await axios.get(
        `http://localhost:5001/api/expenses/predict?days=30&lookback=${days}`,
        { headers }
      );
      setPrediction(predictionResponse.data.prediction);
    } catch (error) {
      console.error('Error fetching AI data:', error);
      // Set default empty values on error
      setRecommendations([]);
      setReport(null);
      setAnomalies([]);
      setPrediction(null);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#e74c3c';
      case 'medium':
        return '#f39c12';
      case 'low':
        return '#27ae60';
      default:
        return '#3498db';
    }
  };

  if (loading) {
    return <div className="ai-recommendations"><p>Loading AI insights...</p></div>;
  }

  return (
    <div className="ai-recommendations">
      <div className="header">
        <h1>🤖 AI-Powered Expense Insights</h1>
        <div className="filter-days">
          <label>Analyze last:</label>
          <select value={days} onChange={(e) => setDays(parseInt(e.target.value))}>
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
            <option value={90}>90 days</option>
          </select>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          💡 Recommendations
        </button>
        <button
          className={`tab ${activeTab === 'report' ? 'active' : ''}`}
          onClick={() => setActiveTab('report')}
        >
          📊 Detailed Report
        </button>
        <button
          className={`tab ${activeTab === 'anomalies' ? 'active' : ''}`}
          onClick={() => setActiveTab('anomalies')}
        >
          🚨 Anomalies
        </button>
        <button
          className={`tab ${activeTab === 'prediction' ? 'active' : ''}`}
          onClick={() => setActiveTab('prediction')}
        >
          🔮 Predictions
        </button>
      </div>

      <div className="content">
        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div className="recommendations-section">
            <h2>Your Personalized Recommendations</h2>
            {recommendations && recommendations.length > 0 ? (
              <div className="recommendations-list">
                {recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="recommendation-card"
                    style={{ borderLeft: `4px solid ${getPriorityColor(rec.priority)}` }}
                  >
                    <p className="priority-badge" style={{ color: getPriorityColor(rec.priority) }}>
                      Priority: {rec.priority.toUpperCase()}
                    </p>
                    <p className="message">{rec.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p className="empty-icon">📊</p>
                <p className="empty-text">No expenses found in the last {days} days</p>
                <p className="empty-subtext">Add some expenses to get personalized recommendations based on your spending patterns!</p>
              </div>
            )}
          </div>
        )}

        {/* Report Tab */}
        {activeTab === 'report' && (
          <div className="report-section">
            <h2>Detailed Expense Report</h2>
            {report && report.summary && report.summary.totalTransactions > 0 ? (
              <>
                <div className="summary-grid">
                  <div className="summary-card">
                    <h3>Total Transactions</h3>
                    <p className="big-number">{report.summary.totalTransactions}</p>
                  </div>
                  <div className="summary-card">
                    <h3>Total Spending</h3>
                    <p className="big-number">₹{Math.round(report.summary.totalSpending)}</p>
                  </div>
                  <div className="summary-card">
                    <h3>Avg per Transaction</h3>
                    <p className="big-number">₹{Math.round(report.summary.averagePerTransaction)}</p>
                  </div>
                  <div className="summary-card">
                    <h3>Highest Transaction</h3>
                    <p className="big-number">₹{report.summary.highestTransaction}</p>
                  </div>
                </div>

                <div className="category-analysis">
                  <h3>Category Breakdown</h3>
                  {report.categoryAnalysis && report.categoryAnalysis.length > 0 ? (
                    report.categoryAnalysis.map((cat, idx) => (
                      <div key={idx} className="category-item">
                        <div className="category-name">{cat.category}</div>
                        <div className="category-bar">
                          <div
                            className="category-bar-fill"
                            style={{
                              width: `${(cat.totalAmount / report.summary.totalSpending) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <div className="category-amount">
                          ₹{Math.round(cat.totalAmount)} ({cat.count} transactions)
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No category data available</p>
                  )}
                </div>

                <div className="peak-hours">
                  <h3>Peak Spending Hours</h3>
                  {report.peakHours && report.peakHours.length > 0 ? (
                    report.peakHours.map((hour, idx) => (
                      <div key={idx} className="hour-item">
                        <span>{hour.hour}:00 - {hour.hour + 1}:00</span>
                        <span>₹{Math.round(hour.totalAmount)}</span>
                      </div>
                    ))
                  ) : (
                    <p>No hourly data available</p>
                  )}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <p className="empty-icon">📈</p>
                <p className="empty-text">No expense data available</p>
                <p className="empty-subtext">Add expenses to see detailed spending analysis and patterns</p>
              </div>
            )}
          </div>
        )}

        {/* Anomalies Tab */}
        {activeTab === 'anomalies' && (
          <div className="anomalies-section">
            <h2>Unusual Spending Detected</h2>
            {anomalies && anomalies.length > 0 ? (
              <div className="anomalies-list">
                {anomalies.map((anom, idx) => (
                  <div key={idx} className="anomaly-card">
                    <div className="anomaly-header">
                      <span className="anomaly-deviation">
                        {anom.deviation}σ
                      </span>
                      <span className="anomaly-category">
                        {anom.expense.category}
                      </span>
                    </div>
                    <p className="anomaly-message">{anom.message}</p>
                    <p className="anomaly-amount">Amount: ₹{anom.expense.amount}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p className="empty-icon">✅</p>
                <p className="empty-text">No anomalies detected</p>
                <p className="empty-subtext">Your spending patterns are consistent! Keep up the good habits.</p>
              </div>
            )}
          </div>
        )}

        {/* Prediction Tab */}
        {activeTab === 'prediction' && (
          <div className="prediction-section">
            <h2>30-Day Spending Forecast</h2>
            {prediction && prediction.totalPredicted ? (
              <>
                <div className="prediction-summary">
                  <div className="prediction-card">
                    <h3>Predicted Total Spending</h3>
                    <p className="big-number">₹{prediction.totalPredicted}</p>
                    <p className="prediction-note">Based on last {days} days of data</p>
                  </div>
                </div>

                <div className="category-predictions">
                  <h3>Category-wise Predictions</h3>
                  {prediction.categoryPredictions && prediction.categoryPredictions.length > 0 ? (
                    prediction.categoryPredictions.map((cat, idx) => (
                      <div key={idx} className="prediction-item">
                        <div className="prediction-name">{cat.category}</div>
                        <div className="prediction-bar">
                          <div
                            className="prediction-bar-fill"
                            style={{
                              width: `${parseFloat(cat.percentage)}%`,
                            }}
                          ></div>
                        </div>
                        <div className="prediction-amount">
                          ₹{cat.predictedAmount} ({cat.percentage}%)
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No category predictions available</p>
                  )}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <p className="empty-icon">🔮</p>
                <p className="empty-text">No prediction data available</p>
                <p className="empty-subtext">Add more expenses to enable spending forecasts and budget planning</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AIRecommendations;
