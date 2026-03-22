import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RequestTable from '../components/RequestTable';
import FilterPanel from '../components/FilterPanel';
import '../styles/MyRequests.css';

function MyRequests({ clientInfo }) {
  const [requests, setRequests] = useState([
    {
      id: 'DEM-2024-001234',
      tipoPrestation: 'Rachat partiel',
      montant: 5000,
      created_at: '2024-03-10',
      status: 'En attente',
      description: 'Rachat partiel de mon contrat'
    },
    {
      id: 'DEM-2024-001235',
      tipoPrestation: 'Avance sur contrat',
      montant: 3000,
      created_at: '2024-03-08',
      status: 'En cours',
      description: 'Demande d\'avance d\'urgence'
    },
    {
      id: 'DEM-2024-001236',
      tipoPrestation: 'Rachat partiel',
      montant: 2500,
      created_at: '2024-03-05',
      status: 'Validé',
      description: 'Rachat régulier'
    },
    {
      id: 'DEM-2024-001237',
      tipoPrestation: 'Transfert',
      montant: 1500,
      created_at: '2024-02-28',
      status: 'Validé',
      description: 'Transfert de prestation'
    },
    {
      id: 'DEM-2024-001238',
      tipoPrestation: 'Résiliation',
      montant: 4000,
      created_at: '2024-02-20',
      status: 'Rejeté',
      description: 'Demande de résiliation'
    },
  ]);

  const [filteredRequests, setFilteredRequests] = useState(requests);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let filtered = requests;

    // Filter by status
    if (filterStatus !== 'All') {
      filtered = filtered.filter(req => req.status === filterStatus);
    }

    // Filter by type
    if (filterType !== 'All') {
      filtered = filtered.filter(req => req.tipoPrestation === filterType);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(req =>
        req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  }, [filterStatus, filterType, searchQuery, requests]);

  return (
    <div className="my-requests-container">
      <div className="my-requests-header">
        <h1>Mes Demandes de Prestation</h1>
        <p>Suivez toutes vos demandes de prestation d'assurance et leur statut actuel</p>
      </div>

      <div className="my-requests-content">
        {/* Filter and Search */}
        <div className="controls-section">
          <FilterPanel
            filterStatus={filterStatus}
            filterType={filterType}
            searchQuery={searchQuery}
            onFilterStatusChange={setFilterStatus}
            onFilterTypeChange={setFilterType}
            onSearchChange={setSearchQuery}
          />

          <Link to="/create-request" className="create-request-link">
            + Nouvelle Demande
          </Link>
        </div>

        {/* Summary */}
        <div className="requests-summary">
          <p>Affichage de <strong>{filteredRequests.length}</strong> demande(s)</p>
        </div>

        {/* Requests Table */}
        {filteredRequests.length > 0 ? (
          <RequestTable requests={filteredRequests} />
        ) : (
          <div className="no-requests">
            <p>Aucune demande trouvée correspondant à vos filtres.</p>
            <Link to="/create-request" className="create-link">Créer votre première demande</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyRequests;
