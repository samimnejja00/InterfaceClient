import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import StatusTimeline from '../components/StatusTimeline';
import { fetchClientDossierById } from '../services/clientApi';

function mapEtatToStatus(etat) {
  switch (etat) {
    case 'EN_COURS':
      return 'En cours';
    case 'EN_INSTANCE':
    case 'EN_ATTENTE': // legacy
      return 'En instance';
    case 'CLOTURE':
    case 'TRAITE': // legacy
      return 'Clôturé';
    case 'REJETE': // legacy
      return 'Rejeté';
    default:
      return etat || 'Inconnu';
  }
}

function formatRequestNumber(dossier) {
  if (dossier?.request_number) return dossier.request_number;
  return `DEM-${String(dossier?.id || '').slice(0, 8).toUpperCase()}`;
}

function RequestDetails() {
  const { requestId } = useParams();
  
  const [dossier, setDossier] = useState(null);
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await fetchClientDossierById(requestId);
        setDossier(res.data);
        setHistorique(res.historique || []);
      } catch (err) {
        console.error('Frontend error fetching dossier:', err);
        setError('Erreur technique: ' + (err.message || 'Inconnue'));
      } finally {
        setLoading(false);
      }
    };
    if (requestId) {
      loadData();
    }
  }, [requestId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-comar-gray-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-comar-border border-t-comar-royal rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-comar-gray-text">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !dossier) {
    return (
      <div className="min-h-screen bg-comar-gray-bg px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
            <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-comar-red text-sm font-medium mb-6">
              {error || 'Dossier introuvable'}
            </div>
            <Link to="/my-requests" className="inline-flex items-center gap-2 text-comar-royal font-semibold hover:text-comar-navy transition-colors duration-200">
              ← Retour aux Demandes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const buildTrackingTimeline = () => {
    const steps = [
      { id: 'RELATION_CLIENT', title: 'Service Relation Client', desc: 'Réception et constitution du dossier' },
      { id: 'PRESTATION', title: 'Service Prestation', desc: 'Analyse métier et calcul' },
      { id: 'FINANCE', title: 'Service Finance', desc: 'Validation financière' },
      { id: 'CLOTURE', title: 'Clôture et Paiement', desc: 'Règlement effectué' }
    ];

    let currentNiveauIndex = steps.findIndex(s => s.id === dossier.niveau);
    if (currentNiveauIndex === -1) currentNiveauIndex = 0;
    const normalizedEtat = dossier.etat === 'TRAITE' ? 'CLOTURE' : dossier.etat;
    const isFinished = normalizedEtat === 'CLOTURE' || normalizedEtat === 'REJETE';

    if (normalizedEtat === 'CLOTURE') {
      currentNiveauIndex = steps.length;
    }

    return steps.map((step, index) => {
      let stepStatus = 'pending';
      let dateText = 'À venir';
      let timeText = '';

      if (isFinished) {
        stepStatus = index === steps.length - 1 ? (normalizedEtat === 'REJETE' ? 'rejected' : 'completed') : 'completed';
      } else if (index < currentNiveauIndex) {
        stepStatus = 'completed';
      } else if (index === currentNiveauIndex) {
        stepStatus = 'in-progress';
      }

      const eventHistoList = historique.filter((h) =>
        h.new_status === step.id ||
        (index === 0 && /soumis|création du dossier|creation du dossier/i.test(h.action || ''))
      );
      if (eventHistoList.length > 0) {
        const lastEvent = eventHistoList[eventHistoList.length - 1];
        const dateObj = new Date(lastEvent.created_at);
        dateText = dateObj.toLocaleDateString('fr-FR');
        timeText = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      } else if (stepStatus === 'completed' || stepStatus === 'in-progress') {
        const dateObj = new Date(dossier.updated_at || dossier.created_at);
        dateText = dateObj.toLocaleDateString('fr-FR');
      }

      return {
        title: step.title,
        description: step.desc,
        status: stepStatus,
        date: dateText,
        time: timeText,
        icon: getStepIcon(step.id)
      };
    });
  };

  const getStepIcon = (id) => {
    switch(id) {
      case 'RELATION_CLIENT': return '📦';
      case 'PRESTATION': return '🔍';
      case 'FINANCE': return '⚖️';
      case 'CLOTURE': return '✅';
      default: return '📄';
    }
  };

  const displayStatus = mapEtatToStatus(dossier.etat);
  const details = Array.isArray(dossier.dossier_details_rc) ? dossier.dossier_details_rc[0] : dossier.dossier_details_rc;
  let demandeInitiale = details?.demande_initiale || '-';
  if (demandeInitiale.startsWith('[')) {
    const parts = demandeInitiale.split(']');
    if (parts.length > 0) {
      demandeInitiale = parts[0].replace('[', '').trim() || demandeInitiale;
    }
  }

  return (
    <div className="min-h-screen bg-comar-gray-bg">
      {/* Header */}
      <div className="bg-gradient-to-r from-comar-navy to-comar-royal px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Suivi d'Acheminement</h1>
            <p className="text-white/60 mt-1 text-sm font-mono">N° Demande: {formatRequestNumber(dossier)}</p>
          </div>
          <Link 
            to="/my-requests" 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white border border-white/20 text-sm font-medium hover:bg-white/20 transition-all duration-200"
          >
            ← Retour aux Demandes
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 pb-12">
        {/* Summary Card */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div>
                <span className="block text-xs font-semibold text-comar-gray-text uppercase tracking-wider mb-1">Numéro Demande</span>
                <span className="text-base font-bold text-comar-navy">{formatRequestNumber(dossier)}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-comar-gray-text uppercase tracking-wider mb-1">Numéro de Police</span>
                <span className="text-base font-bold text-comar-navy">{dossier.police_number}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-comar-gray-text uppercase tracking-wider mb-1">Demande Initiale</span>
                <span className="text-base font-bold text-comar-navy">{demandeInitiale}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-comar-gray-text uppercase tracking-wider mb-1">Date de Soumission</span>
                <span className="text-base font-bold text-comar-navy">{new Date(dossier.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-comar-gray-text uppercase tracking-wider mb-1">Statut Actuel</span>
                <span className={`status-badge status-${dossier.etat.toLowerCase()}`}>
                  {displayStatus}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-comar-navy mb-2">Parcours de votre dossier</h2>
            <p className="text-sm text-comar-gray-text mb-6">
              Suivez l'avancement de votre demande dans nos différents services, étape par étape.
            </p>
            <StatusTimeline timeline={buildTrackingTimeline()} />
          </div>
        </section>
        
        {/* History */}
        {historique && historique.length > 0 && (
          <section>
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-comar-navy mb-4">Historique Détaillé</h2>
              <div className="space-y-3">
                {historique.map(h => (
                  <div key={h.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 border-b border-gray-50 last:border-0">
                    <span className="text-xs font-mono text-comar-gray-text bg-comar-gray-bg px-3 py-1 rounded-lg shrink-0">
                      {new Date(h.created_at).toLocaleString('fr-FR')}
                    </span>
                    <span className="text-sm text-comar-navy font-medium">{h.action}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default RequestDetails;
