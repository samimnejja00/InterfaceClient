import React from 'react';
import '../styles/StatusSummary.css';

function StatusSummary({ stats }) {
  const statuses = [
    { key: 'enAttente', label: 'En attente', value: stats.enAttente, color: '#FFA500', icon: '⏳' },
    { key: 'enCours', label: 'En cours', value: stats.enCours, color: '#4A90E2', icon: '👁️' },
    { key: 'valide', label: 'Validé', value: stats.valide, color: '#27AE60', icon: '✓' },
    { key: 'rejete', label: 'Rejeté', value: stats.rejete, color: '#E74C3C', icon: '✕' }
  ];

  const total = stats.enAttente + stats.enCours + stats.valide + stats.rejete;

  return (
    <div className="status-summary">
      <div className="status-cards">
        {statuses.map((status) => (
          <div key={status.key} className="status-card">
            <div className="status-icon" style={{ backgroundColor: status.color }}>
              {status.icon}
            </div>
            <div className="status-details">
              <span className="status-value">{status.value}</span>
              <span className="status-label">{status.label}</span>
            </div>
            <div className="status-progress">
              <div
                className="progress-bar"
                style={{
                  width: total > 0 ? `${(status.value / total) * 100}%` : '0%',
                  backgroundColor: status.color
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      <div className="status-total">
        <p><strong>Total de Demandes:</strong> {total}</p>
      </div>
    </div>
  );
}

export default StatusSummary;
