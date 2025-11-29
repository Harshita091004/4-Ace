import React from 'react';
import '../styles/Navbar.css';

function Navbar({ user, currentView, onViewChange, onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>🏦 SecureFin</h1>
      </div>

      <div className="navbar-links">
        <button
          className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => onViewChange('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`nav-link ${currentView === 'expenses' ? 'active' : ''}`}
          onClick={() => onViewChange('expenses')}
        >
          Expenses
        </button>
        <button
          className={`nav-link ${currentView === 'budget' ? 'active' : ''}`}
          onClick={() => onViewChange('budget')}
        >
          Budget
        </button>
        <button
          className={`nav-link ${currentView === 'wallet' ? 'active' : ''}`}
          onClick={() => onViewChange('wallet')}
        >
          Wallet
        </button>
        <button
          className={`nav-link ${currentView === 'fraud' ? 'active' : ''}`}
          onClick={() => onViewChange('fraud')}
        >
          Security
        </button>
        <button
          className={`nav-link ${currentView === 'literacy' ? 'active' : ''}`}
          onClick={() => onViewChange('literacy')}
        >
          Learn
        </button>
        <button
          className={`nav-link ${currentView === 'ai-insights' ? 'active' : ''}`}
          onClick={() => onViewChange('ai-insights')}
        >
          🤖 AI Insights
        </button>
      </div>

      <div className="navbar-user">
        {user && <span className="user-name">{user.name}</span>}
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
