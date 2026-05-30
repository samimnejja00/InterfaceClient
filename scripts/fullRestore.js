const fs = require('fs');

const content = import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchClientDossiers } from '../services/clientApi';
import '../styles/MyRequests.css';

// Helper: map DB etat to display status
function mapEtatToStatus(etat) {
  switch (etat) {
    case 'EN_COURS': return 'En cours';
    case 'EN_INSTANCE': return 'En instance';
    case 'CLOTURE': return 'Clôturé';
    default: return etat || 'Inconnu';
  }
}

function formatDate(isoString) {
  if (!isoString) return '-';
  return new Date(isoString).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
}

function MyRequests({ clientInfo }) {
  const navigate = useNavigate();
  const [dossiers, setDossiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch real dossiers from the DB
  useEffect(() => {
    const loadDossiers = async () => {
      try {
        setLoading(true);
        const res = await fetchClientDossiers();
        setDossiers(res.data);
      } catch (err) {
        console.error('Failed to load dossiers:', err);
        setError('Erreur lors du chargement de vos demandes.');
      } finally {
        setLoading(false);
      }
    };
    loadDossiers();
  }, []);

  // Apply filters
  const filteredDossiers = dossiers.filter((d) => {
    // Filter by status
    if (filterStatus !== 'All') {
      const displayStatus = mapEtatToStatus(d.etat);
      if (displayStatus !== filterStatus) return false;
    }
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchSouscripteur = d.souscripteur?.toLowerCase().includes(query);
      const matchPolice = d.police_number?.toLowerCase().includes(query);
      const matchNiveau = d.niveau?.toLowerCase().includes(query);
      if (!matchSouscripteur && !matchPolice && !matchNiveau) return false;
    }
    return true;
  });

  return (
    <div className="my-requests-container">
      <div className="requests-header">
        <div className="header-info">
          <h1>Mes Demandes</h1>
          <p>Consultez et suivez l\'état d\'avancement de vos demandes</p>
        </div>
        <Link to="/soumettre-dossier" className="btn-primary">
          <span className="plus-icon">+</span> Nouvelle Demande
        </Link>
      </div>

      <div className="filters-section">
        <input 
          type="text" 
          placeholder="Rechercher par souscripteur, N° police..." 
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="status-filters">
          <button className={\ilter-btn \\} onClick={() => setFilterStatus('All')}>Toutes</button>
          <button className={\ilter-btn \\} onClick={() => setFilterStatus('En cours')}>En cours</button>
          <button className={\ilter-btn \\} onClick={() => setFilterStatus('En instance')}>En instance</button>
          <button className={\ilter-btn \\} onClick={() => setFilterStatus('Clôturé')}>Clôturées</button>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-spinner" style={{ padding: '2rem', textAlign: 'center' }}>Chargement de vos demandes...</div>
        ) : error ? (
          <div className="error-message" style={{ color: 'red', padding: '1rem', background: '#ffebee', borderRadius: '8px' }}>{error}</div>
        ) : filteredDossiers.length === 0 ? (
          <div className="empty-state" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            Aucune demande trouvée.
          </div>
        ) : (
          <table className="requests-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid #e2e8f0', fontWeight: '600', color: '#334155' }}>Souscripteur</th>
                <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid #e2e8f0', fontWeight: '600', color: '#334155' }}>N° Police</th>
                <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid #e2e8f0', fontWeight: '600', color: '#334155' }}>Agence</th>
                <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid #e2e8f0', fontWeight: '600', color: '#334155' }}>Niveau</th>
                <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid #e2e8f0', fontWeight: '600', color: '#334155' }}>Date</th>
                <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid #e2e8f0', fontWeight: '600', color: '#334155' }}>État</th>
              </tr>
            </thead>
            <tbody>
              {filteredDossiers.map((dossier) => (
                  <tr 
                    key={dossier.id} 
                    onClick={() => navigate(\/request-details/\\)}
                    style={{ transition: 'background-color 0.2s', cursor: 'pointer' }}
                    className="clickable-row"
                  >
                  <td style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', fontWeight: '500' }}>{dossier.souscripteur}</td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', fontFamily: 'monospace' }}>{dossier.police_number}</td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9' }}>{dossier.agences?.nom || '-'}</td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: '20px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      backgroundColor: dossier.niveau === 'RELATION_CLIENT' ? '#f0fdf4' : dossier.niveau === 'PRESTATION' ? '#f0fdf4' : '#faf5ff',
                      color: dossier.niveau === 'RELATION_CLIENT' ? '#166534' : dossier.niveau === 'PRESTATION' ? '#0f766e' : '#6b21a8',
                    }}>
                      {dossier.niveau === 'RELATION_CLIENT' ? 'Relation Client' : dossier.niveau === 'PRESTATION' ? 'Prestation' : dossier.niveau === 'FINANCE' ? 'Finance' : dossier.niveau}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9' }}>{formatDate(dossier.created_at)}</td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: '20px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      backgroundColor: dossier.etat === 'EN_COURS' ? '#e0f2fe' : dossier.etat === 'CLOTURE' ? '#f3f4f6' : dossier.etat === 'EN_INSTANCE' ? '#fef3c7' : '#f3f4f6',
                      color: dossier.etat === 'EN_COURS' ? '#0369a1' : dossier.etat === 'CLOTURE' ? '#4b5563' : dossier.etat === 'EN_INSTANCE' ? '#b45309' : '#4b5563',
                    }}>
                      {mapEtatToStatus(dossier.etat)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default MyRequests;
;

fs.writeFileSync('src/pages/MyRequests.jsx', content, 'utf8');
console.log('Restored fully');
