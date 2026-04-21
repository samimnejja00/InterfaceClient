import React from 'react';
import { Link } from 'react-router-dom';

function RequestTable({ requests }) {
  const getStatusClass = (status) => {
    const normalized = (status || '')
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[_\s]+/g, '-');
    return `status-${normalized}`;
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const formatMontant = (montant) => {
    if (montant === null || montant === undefined || montant === '') return '-';
    try {
      return new Intl.NumberFormat('fr-TN', {
        style: 'currency',
        currency: 'TND',
        minimumFractionDigits: 3,
      }).format(Number(montant));
    } catch {
      return `${montant} TND`;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-comar-gray-bg/50 border-b border-gray-100">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-comar-gray-text uppercase tracking-wider">N° Demande</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-comar-gray-text uppercase tracking-wider">N° Police</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-comar-gray-text uppercase tracking-wider hidden sm:table-cell">Demande Initiale</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-comar-gray-text uppercase tracking-wider">Montant</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-comar-gray-text uppercase tracking-wider hidden md:table-cell">Date de Soumission</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-comar-gray-text uppercase tracking-wider">Statut</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-comar-gray-text uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {requests.map((request) => (
              <tr key={request.id} className="hover:bg-comar-gray-bg/30 transition-colors duration-150">
                <td className="px-5 py-4 text-sm font-mono text-comar-gray-text">
                  {request.requestNumber || `DEM-${String(request.id || '').slice(0, 8).toUpperCase()}`}
                </td>
                <td className="px-5 py-4 text-sm font-semibold text-comar-navy">
                  {request.police_number}
                </td>
                <td className="px-5 py-4 text-sm text-comar-gray-text hidden sm:table-cell">
                  {request.demandeInitiale || request.tipoPrestation || request.type || '-'}
                </td>
                <td className="px-5 py-4 text-sm text-comar-gray-text font-medium">
                  {formatMontant(request.montant)}
                </td>
                <td className="px-5 py-4 text-sm text-comar-gray-text hidden md:table-cell">
                  {formatDate(request.date || request.created_at)}
                </td>
                <td className="px-5 py-4">
                  <span className={`status-badge ${getStatusClass(request.status)}`}>
                    {request.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <Link 
                    to={`/request-details/${request.id}`}
                    className="inline-flex items-center text-sm font-semibold text-comar-royal hover:text-comar-navy transition-colors duration-200"
                  >
                    Voir détails →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RequestTable;
