import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RequestTable from '../components/RequestTable';
import FilterPanel from '../components/FilterPanel';
import { fetchClientDossiers } from '../services/clientApi';
import { getClientDisplayStatus, isDossierCancelled } from '../utils/dossierStatus';

function formatRequestNumber(dossier) {
  if (dossier?.request_number) return dossier.request_number;
  return `DEM-${String(dossier?.id || '').slice(0, 8).toUpperCase()}`;
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
          const details = Array.isArray(dossier.dossier_details_rc) ? dossier.dossier_details_rc[0] : dossier.dossier_details_rc;
          const prestationDetails = Array.isArray(dossier.dossier_details_prestation)
            ? dossier.dossier_details_prestation[0]
            : dossier.dossier_details_prestation;
          let demandeInitiale = details?.demande_initiale || dossier.demande_initiale || 'Non précisée';
          if (demandeInitiale.startsWith('[')) {
            const parts = demandeInitiale.split(']');
            demandeInitiale = parts[0].replace('[', '').trim() || demandeInitiale;
          }

          return {
            id: dossier.id,
            requestNumber: formatRequestNumber(dossier),
            demandeInitiale,
            montant: dossier?.montant ?? prestationDetails?.montant ?? null,
            created_at: dossier.created_at,
            status: getClientDisplayStatus(dossier.etat, {
              isCancelled: isDossierCancelled(dossier),
            }),
            motifInstance: details?.motif_instance || '',
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
      filtered = filtered.filter(req => req.demandeInitiale === filterType);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(req =>
        String(req.id || '').toLowerCase().includes(q) ||
        String(req.requestNumber || '').toLowerCase().includes(q) ||
        (req.demandeInitiale && req.demandeInitiale.toLowerCase().includes(q)) ||
        (req.motifInstance && req.motifInstance.toLowerCase().includes(q)) ||
        (req.montant !== null && req.montant !== undefined && String(req.montant).toLowerCase().includes(q)) ||
        (req.police_number && req.police_number.toLowerCase().includes(q))
      );
    }

    setFilteredRequests(filtered);
  }, [filterStatus, filterType, searchQuery, requests]);

  return (
    <div className="min-h-screen bg-comar-gray-bg pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Filter panel */}
        <div className="mb-6">
          <FilterPanel
            filterStatus={filterStatus}
            filterType={filterType}
            searchQuery={searchQuery}
            onFilterStatusChange={setFilterStatus}
            onFilterTypeChange={setFilterType}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Counter + New Request button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <p className="text-sm text-comar-gray-text">
            Affichage de <strong className="text-comar-navy">{filteredRequests.length}</strong> demande(s)
          </p>
          <Link
            to="/soumettre-dossier"
            className="inline-flex items-center px-5 py-2.5 bg-comar-royal text-white text-sm font-semibold rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200"
          >
            + Nouvelle Demande
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-comar-border border-t-comar-royal rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-comar-gray-text">Chargement de vos demandes...</p>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 px-5 py-4 rounded-xl bg-red-50 border border-red-200 text-comar-red text-sm font-medium">
            {error}
          </div>
        ) : filteredRequests.length > 0 ? (
          <RequestTable requests={filteredRequests} />
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-md">
            <p className="text-comar-gray-text mb-3">Aucune demande trouvée.</p>
            <Link
              to="/soumettre-dossier"
              className="text-comar-royal font-semibold hover:text-comar-navy transition-colors duration-200"
            >
              Créer votre première demande
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyRequests;
