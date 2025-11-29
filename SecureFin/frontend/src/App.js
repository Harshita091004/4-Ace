import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ExpenseTracker from './components/ExpenseTracker';
import BudgetManager from './components/BudgetManager';
import Wallet from './components/Wallet';
import FraudDetection from './components/FraudDetection';
import FinancialLiteracy from './components/FinancialLiteracy';
import AIRecommendations from './components/AIRecommendations';
import Navbar from './components/Navbar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [currentView, setCurrentView] = useState('dashboard');
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile();
    }
  }, [isAuthenticated]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
    }
  };

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setCurrentView('dashboard');
  };

  if (!isAuthenticated) {
    return (
      <div className="app">
        {currentView === 'login' ? (
          <Login onLogin={handleLogin} onSwitchToRegister={() => setCurrentView('register')} />
        ) : (
          <Register onRegister={handleLogin} onSwitchToLogin={() => setCurrentView('login')} />
        )}
      </div>
    );
  }

  return (
    <div className="app">
      <Navbar user={user} currentView={currentView} onViewChange={setCurrentView} onLogout={handleLogout} />
      <main className="main-content">
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'expenses' && <ExpenseTracker />}
        {currentView === 'budget' && <BudgetManager />}
        {currentView === 'wallet' && <Wallet />}
        {currentView === 'fraud' && <FraudDetection />}
        {currentView === 'literacy' && <FinancialLiteracy />}
        {currentView === 'ai-insights' && <AIRecommendations />}
      </main>
    </div>
  );
}

export default App;
