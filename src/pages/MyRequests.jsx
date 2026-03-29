import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RequestTable from '../components/RequestTable';
import FilterPanel from '../components/FilterPanel';
import { fetchClientDossiers } from '../services/clientApi';
import '../styles/MyRequests.css';

function mapEtatToStatus(etat) {
  switch (etat) {
    case 'EN_COURS': return 'En cours';
    case 'EN_INSTANCE': return 'En attente';
    case 'CLOTURE': return 'Validé';
    default: return etat || 'En attente';
  }
}

function MyRequests({ clientInfo }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filteredRequests, setFilteredRequests] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await fetchClientDossiers();
        
        const mappedData = res.data.map(dossier => {
          let typePrestation = dossier.type_prestation || 'Rachat partiel';
          let demandeInitiale = dossier.demande_initiale || '';
          
          const details = Array.isArray(dossier.dossier_details_rc) ? dossier.dossier_details_rc[0] : dossier.dossier_details_rc;
          if (details?.demande_initiale) {
            demandeInitiale = details.demande_initiale;
            if (demandeInitiale.startsWith('[')) {
              const parts = demandeInitiale.split(']');
              typePrestation = parts[0].replace('[', '');
              // Optionally remove the bracketed part from the description
              demandeInitiale = parts.slice(1).join(']').trim();
            } else {
              typePrestation = demandeInitiale;
            }
          }

          return {
            id: dossier.id,
            tipoPrestation: typePrestation,
            montant: 0,
            created_at: dossier.created_at,
            status: mapEtatToStatus(dossier.etat),
            description: demandeInitiale,
            police_number: dossier.police_number
          };
        });
        
        setRequests(mappedData);
        setFilteredRequests(mappedData);
      } catch (err) {
        console.error('Error fetching dossiers:', err);
        setError('Erreur lors du chargement des données.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    let filtered = requests;

    if (filterStatus !== 'All') {
      filtered = filtered.filter(req => req.status.toLowerCase() === filterStatus.toLowerCase());
    }
    if (filterType !== 'All') {
      filtered = filtered.filter(req => req.tipoPrestation === filterType);     
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(req =>
        (req.id && req.id.toLowerCase().includes(q)) ||
        (req.description && req.description.toLowerCase().includes(q)) ||
        (req.police_number && req.police_number.toLowerCase().includes(q))
      );
    }

    setFilteredRequests(filtered);
  }, [filterStatus, filterType, searchQuery, requests]);

  return (
    <div className="my-requests-container" style={{ backgroundColor: '#FAFBFD', minHeight: '100vh', paddingBottom: '2rem' }}>
      <div className="my-requests-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        
        {/* Full width filter panel */}
        <div style={{ marginBottom: '2rem' }}>
          <FilterPanel
            filterStatus={filterStatus}
            filterType={filterType}
            searchQuery={searchQuery}
            onFilterStatusChange={setFilterStatus}
            onFilterTypeChange={setFilterType}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Espace comprenant le compteur à gauche et le bouton à droite dans l'alignement */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div className="requests-summary" style={{ margin: 0 }}>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>Affichage de <strong>{filteredRequests.length}</strong> demande(s)</p>
          </div>
          <Link to="/soumettre-dossier" className="create-request-link" style={{ backgroundColor: '#214e9f', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '6px', textDecoration: 'none', fontWeight: '600', boxShadow: '0 2px 4px rgba(33, 78, 159, 0.2)', backgroundImage: 'none', border: 'none', fontSize: '0.95rem' }}>
            + Nouvelle Demande
          </Link>
        </div>

        {loading ? (
            <div className="loading-spinner" style={{ padding: '2rem', textAlign: 'center' }}>Chargement de vos demandes...</div>
        ) : error ? (
            <div className="error-message" style={{ color: 'red', padding: '1rem' }}>{error}</div>
        ) : filteredRequests.length > 0 ? (
          <RequestTable requests={filteredRequests} />
        ) : (
          <div className="no-requests" style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Aucune demande trouvée.</p>        
            <Link to="/soumettre-dossier" className="create-link" style={{ color: '#214e9f', fontWeight: '500', textDecoration: 'none' }}>Créer votre première demande</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyRequests;
