import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pie, Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import '../styles/Dashboard.css';

function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [expensesRes, budgetsRes, walletRes] = await Promise.all([
        axios.get('http://localhost:5000/api/expenses/all', { headers }),
        axios.get('http://localhost:5000/api/budget/all', { headers }),
        axios.get('http://localhost:5000/api/wallet/info', { headers }).catch(() => ({ data: { balance: 0 } })),
      ]);

      setExpenses(expensesRes.data.slice(0, 10));
      setBudgets(budgetsRes.data);
      setWalletBalance(walletRes.data.balance);
      setSummary(expensesRes.data);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const categorySummary = {};
  expenses.forEach(e => {
    categorySummary[e.category] = (categorySummary[e.category] || 0) + e.amount;
  });

  const pieChartData = {
    labels: Object.keys(categorySummary),
    datasets: [{
      data: Object.values(categorySummary),
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#FF6384', '#C9CBCF',
      ],
    }],
  };

  const categoryNames = Object.keys(categorySummary);
  const categoryAmounts = Object.values(categorySummary);
  const barChartData = {
    labels: categoryNames,
    datasets: [{
      label: 'Spending by Category',
      data: categoryAmounts,
      backgroundColor: '#36A2EB',
    }],
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <h3>Total Expenses</h3>
          <p className="stat-value">₹{totalExpenses.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Wallet Balance</h3>
          <p className="stat-value">₹{walletBalance.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Active Budgets</h3>
          <p className="stat-value">{budgets.length}</p>
        </div>
        <div className="stat-card">
          <h3>Recent Transactions</h3>
          <p className="stat-value">{expenses.length}</p>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart">
          <h3>Expenses by Category (Pie)</h3>
          {categoryNames.length > 0 ? (
            <Pie data={pieChartData} />
          ) : (
            <p>No expense data</p>
          )}
        </div>
        <div className="chart">
          <h3>Spending Trends (Bar)</h3>
          {categoryNames.length > 0 ? (
            <Bar data={barChartData} />
          ) : (
            <p>No expense data</p>
          )}
        </div>
      </div>

      <div className="recent-transactions">
        <h2>Recent Transactions</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense._id}>
                <td>{new Date(expense.date).toLocaleDateString()}</td>
                <td>{expense.category}</td>
                <td>₹{expense.amount}</td>
                <td className="status-badge">{expense.paymentMethod}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
