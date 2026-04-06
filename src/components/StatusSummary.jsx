import React from 'react';

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
    { key: 'enInstance', label: 'En instance', value: stats.enInstance || 0, color: '#F59E0B', bgColor: 'bg-amber-50', textColor: 'text-amber-600', icon: <ClockIcon /> },
    { key: 'enCours', label: 'En cours', value: stats.enCours || 0, color: '#1E4FD8', bgColor: 'bg-blue-50', textColor: 'text-comar-royal', icon: <EyeIcon /> },
    { key: 'cloture', label: 'Clôturé', value: stats.cloture || 0, color: '#10B981', bgColor: 'bg-emerald-50', textColor: 'text-emerald-600', icon: <CheckIcon /> },
    { key: 'rejete', label: 'Rejeté', value: stats.rejete || 0, color: '#D42B2B', bgColor: 'bg-red-50', textColor: 'text-comar-red', icon: <XIcon /> }
  ];

  const total = (stats.enInstance || 0) + (stats.enCours || 0) + (stats.cloture || 0) + (stats.rejete || 0);

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {statuses.map((status) => (
          <div key={status.key} className="bg-white rounded-xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl ${status.bgColor} ${status.textColor} flex items-center justify-center`}>
                {status.icon}
              </div>
              <div>
                <span className="block text-2xl font-bold text-comar-navy">{status.value}</span>
                <span className="block text-xs font-medium text-comar-gray-text">{status.label}</span>
              </div>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: total > 0 ? `${(status.value / total) * 100}%` : '0%', 
                  backgroundColor: status.color
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow-md border border-gray-100 px-5 py-3 text-center">
        <p className="text-sm text-comar-gray-text">
          <strong className="text-comar-navy">Total de Demandes:</strong> {total}
        </p>
      </div>
    </div>
  );
}

export default StatusSummary;
