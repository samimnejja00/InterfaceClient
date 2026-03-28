import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/RequestTable.css';

function RequestTable({ requests }) {
  const getStatusClass = (status) => {
    return `status-${status.toLowerCase().replace(/\s+/g, '-')}`;
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  return (
    <div className="request-table-wrapper">
      <table className="request-table">
        <thead>
          <tr>
            <th>N° Police</th>
            <th>Type de Prestation</th>
            <th>Montant</th>
            <th>Date de Soumission</th>
            <th>Statut</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id}>
              <td className="request-id">
                <strong>{request.police_number}</strong>
              </td>
              <td className="request-type">{request.tipoPrestation || request.type}</td>
              <td className="request-amount">
                <strong>{(request.montant !== undefined ? request.montant : (request.amount || 0)).toLocaleString('fr-FR')} €</strong>
              </td>
              <td className="request-date">{formatDate(request.date || request.created_at)}</td>
              <td>
                <span className={`status-badge ${getStatusClass(request.status)}`}>
                  {request.status}
                </span>
              </td>
              <td className="request-action">
                <Link to={`/request-details/${request.id}`} className="action-link">
                  Voir détails →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RequestTable;
