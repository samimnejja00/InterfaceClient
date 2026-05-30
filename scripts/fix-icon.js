const fs = require('fs');

const code = `import React from 'react';
import '../styles/StatusSummary.css';

// SVG Icons
const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

function StatusSummary({ stats }) {
  const statuses = [
    { key: 'enAttente', label: 'En attente', value: stats.enAttente || 0, color: '#FFA500', icon: <ClockIcon /> },
    { key: 'enCours', label: 'En cours', value: stats.enCours || 0, color: '#4A90E2', icon: <EyeIcon /> },
    { key: 'valide', label: 'Validé', value: stats.valide || 0, color: '#27AE60', icon: <CheckIcon /> },
    { key: 'rejete', label: 'Rejeté', value: stats.rejete || 0, color: '#E74C3C', icon: <XIcon /> }
  ];

  const total = (stats.enAttente || 0) + (stats.enCours || 0) + (stats.valide || 0) + (stats.rejete || 0);

  return (
    <div className="status-summary">
      <div className="status-cards">
        {statuses.map((status) => (
          <div key={status.key} className="status-card">
            <div className="status-icon" style={{ backgroundColor: status.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
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
                  width: total > 0 ? \`\${(status.value / total) * 100}%\` : '0%', 
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
`;

fs.writeFileSync('src/components/StatusSummary.jsx', code, 'utf-8');
console.log('StatusSummary updated!');