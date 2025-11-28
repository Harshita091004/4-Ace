import React from 'react';
import '../styles/AnomalyAlert.css';

export default function AnomalyAlert({ anomalies, riskLevel, onConfirm, onCancel }) {
  if (!anomalies || anomalies.length === 0) return null;

  const getRiskColor = (level) => {
    const colors = { LOW: '#2ecc71', MEDIUM: '#f39c12', HIGH: '#e74c3c', CRITICAL: '#c0392b' };
    return colors[level] || '#95a5a6';
  };

  const getRiskIcon = (level) => {
    const icons = { LOW: '✓', MEDIUM: '⚠️', HIGH: '🚨', CRITICAL: '⛔' };
    return icons[level] || '?';
  };

  return (
    <div className="anomaly-alert-overlay">
      <div className="anomaly-alert-modal" style={{ borderLeft: `5px solid ${getRiskColor(riskLevel)}` }}>
        <div className="anomaly-header">
          <span className="risk-icon">{getRiskIcon(riskLevel)}</span>
          <h3>{riskLevel} RISK DETECTED</h3>
        </div>

        <div className="anomaly-list">
          {anomalies.map((anomaly, idx) => (
            <div key={idx} className={`anomaly-item severity-${anomaly.severity}`}>
              <strong>{anomaly.type}:</strong> {anomaly.message}
            </div>
          ))}
        </div>

        <div className="anomaly-actions">
          <button className="btn-cancel" onClick={onCancel}>❌ Cancel</button>
          <button className="btn-confirm" onClick={onConfirm} style={{ backgroundColor: getRiskColor(riskLevel) }}>✓ Confirm</button>
        </div>
      </div>
    </div>
  );
}
