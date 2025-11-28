import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/BudgetManager.css';

function BudgetManager() {
  const [budgets, setBudgets] = useState([]);
  const [formData, setFormData] = useState({
    category: 'food',
    limit: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/budget/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setBudgets(response.data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSetBudget = async (e) => {
    e.preventDefault();
    
    if (!formData.limit || formData.limit <= 0) {
      alert('Please enter a valid budget limit');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/budget/set', formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Refresh entire budget list after setting new budget
      await fetchBudgets();
      
      setFormData({
        category: 'food',
        limit: '',
      });
      alert('Budget set successfully!');
    } catch (error) {
      alert('Error setting budget: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="budget-manager">
      <h1>Budget Manager</h1>

      <div className="budget-form">
        <h2>Set Budget</h2>
        <form onSubmit={handleSetBudget}>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
          >
            <option value="food">Food</option>
            <option value="education">Education</option>
            <option value="travel">Travel</option>
            <option value="entertainment">Entertainment</option>
            <option value="utilities">Utilities</option>
            <option value="health">Health</option>
            <option value="shopping">Shopping</option>
            <option value="other">Other</option>
          </select>
          <input
            type="number"
            name="limit"
            placeholder="Budget Limit (₹)"
            value={formData.limit}
            onChange={handleInputChange}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Setting...' : 'Set Budget'}
          </button>
        </form>
      </div>

      <div className="budgets-list">
        <h2>Current Budgets ({budgets.length})</h2>
        {budgets.length === 0 ? (
          <p className="no-budgets">No budgets set yet. Create your first budget above!</p>
        ) : (
          <div className="budget-cards">
            {budgets.map((budget) => {
              const spent = budget.spent || 0;
              const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
              const status = percentage > 80 ? 'critical' : percentage > 50 ? 'warning' : 'safe';

              return (
                <div key={budget._id} className={`budget-card ${status}`}>
                  <h3>{budget.category.charAt(0).toUpperCase() + budget.category.slice(1)}</h3>
                  <p className="limit">Limit: <strong>₹{budget.limit}</strong></p>
                  <p className="spent">Spent: <strong>₹{spent.toFixed(0)}</strong></p>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                  <p className="percentage">{percentage.toFixed(1)}% used</p>
                  {budget.suggestions && budget.suggestions.length > 0 && (
                    <div className="suggestions">
                      <p className="alert-title">⚠️ Alert</p>
                      {budget.suggestions.map((suggestion, idx) => (
                        <p key={idx} className="suggestion">{suggestion.description}</p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default BudgetManager;
