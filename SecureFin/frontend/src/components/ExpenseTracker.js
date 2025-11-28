import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ExpenseTracker.css';

function ExpenseTracker() {
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    amount: '',
    category: 'food',
    description: '',
    paymentMethod: 'cash',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExpenses();
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
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
      setFormData({
        amount: '',
        category: 'food',
        description: '',
        paymentMethod: 'cash',
      });
      alert('Expense added successfully!');
    } catch (error) {
      alert('Error adding expense: ' + error.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="expense-tracker">
      <h1>Expense Tracker</h1>

      <div className="expense-form">
        <h2>Add New Expense</h2>
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
