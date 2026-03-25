import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/RecentRequests.css';

function RecentRequests({ requests }) {
  const getStatusClass = (status) => {
    return `status-${status.toLowerCase().replace(/\s+/g, '-')}`;
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  return (
    <div className="recent-requests">
      {requests.length > 0 ? (
        <table className="requests-table">
          <thead>
            <tr>
              <th>N° Demande</th>
              <th>Type de Prestation</th>
              <th>Montant</th>
              <th>Date</th>
              <th>Statut</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id}>
                <td className="request-id">{request.id}</td>
                <td className="request-type">{request.tipoPrestation || request.type}</td>
                <td className="request-amount">{(request.montant || request.amount).toLocaleString('fr-FR')} €</td>
                <td className="request-date">{formatDate(request.created_at || request.date)}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(request.status)}`}>
                    {request.status}
                  </span>
                </td>
                <td>
                  <Link to={`/request-details/${request.id}`} className="view-link">
                    Voir Détails
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="no-requests-message">
          <p>Aucune demande récente</p>
        </div>
      )}
    </div>
  );
}

export default RecentRequests;
