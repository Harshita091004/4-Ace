import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ExpenseTracker.css';

function ExpenseTracker() {
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [budgetAlert, setBudgetAlert] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    category: 'food',
    description: '',
    paymentMethod: 'cash',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExpenses();
    fetchBudgets();
  }, []);

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/expenses/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

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

  const checkBudgetAlert = (category, amount) => {
    const budget = budgets.find(b => b.category === category);
    if (!budget) return null;

    const newTotal = budget.spent + parseFloat(amount);
    const percentage = (newTotal / budget.limit) * 100;

    if (percentage > 100) {
      return {
        type: 'critical',
        message: `⚠️ CRITICAL: Adding ₹${amount} will exceed your ${category} budget by ₹${(newTotal - budget.limit).toFixed(0)}!`,
      };
    } else if (percentage > 80) {
      return {
        type: 'warning',
        message: `⚠️ WARNING: Adding ₹${amount} will use ${percentage.toFixed(0)}% of your ${category} budget (₹${budget.limit})`,
      };
    } else if (percentage > 50) {
      return {
        type: 'info',
        message: `ℹ️ INFO: You'll have used ${percentage.toFixed(0)}% of your ${category} budget after this expense.`,
      };
    }

    return null;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Check budget alert when amount or category changes
    if ((name === 'amount' && value) || name === 'category') {
      const amount = name === 'amount' ? value : formData.amount;
      const category = name === 'category' ? value : formData.category;
      const alert = checkBudgetAlert(category, amount);
      setBudgetAlert(alert);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/expenses/add', formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setExpenses([response.data, ...expenses]);
      setBudgetAlert(null);
      setFormData({
        amount: '',
        category: 'food',
        description: '',
        paymentMethod: 'cash',
      });
      
      // Refresh budgets after adding expense
      await fetchBudgets();
      
      alert('Expense added successfully!');
    } catch (error) {
      alert('Error adding expense: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="expense-tracker">
      <h1>Expense Tracker</h1>

      <div className="expense-form">
        <h2>Add New Expense</h2>
        
        {budgetAlert && (
          <div className={`budget-alert alert-${budgetAlert.type}`}>
            {budgetAlert.message}
          </div>
        )}

        <form onSubmit={handleAddExpense}>
          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={formData.amount}
            onChange={handleInputChange}
            required
          />
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
            type="text"
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleInputChange}
          />
          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleInputChange}
          >
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="upi">UPI</option>
            <option value="wallet">Wallet</option>
          </select>
          <button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Expense'}
          </button>
        </form>
      </div>

      <div className="expenses-list">
        <h2>Expenses</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Method</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense._id}>
                <td>{new Date(expense.date).toLocaleDateString()}</td>
                <td>{expense.category}</td>
                <td>{expense.description}</td>
                <td>₹{expense.amount}</td>
                <td>{expense.paymentMethod}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ExpenseTracker;
