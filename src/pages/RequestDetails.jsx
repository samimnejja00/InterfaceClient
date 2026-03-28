import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import StatusTimeline from '../components/StatusTimeline';
import DocumentsList from '../components/DocumentsList';
import { fetchClientDossierById } from '../services/clientApi';
import '../styles/RequestDetails.css';

function mapEtatToStatus(etat) {
  switch (etat) {
    case 'EN_COURS': return 'En cours';
    case 'EN_INSTANCE': return 'En instance';
    case 'CLOTURE': return 'Clôturé';
    default: return etat || 'Inconnu';
  }
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
    return <div className="request-details-container"><div className="loading-spinner">Chargement...</div></div>;
  }

  if (error || !dossier) {
    return (
      <div className="request-details-container">
        <div className="error-message">{error || 'Dossier introuvable'}</div>
        <Link to="/my-requests" className="back-link">← Retour aux Demandes</Link>
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
    const isFinished = dossier.etat === 'CLOTURE' || dossier.etat === 'REJETE';

    if (dossier.etat === 'CLOTURE') {
        currentNiveauIndex = steps.length;
    }

    return steps.map((step, index) => {
      let stepStatus = 'pending';
      let dateText = 'À venir';
      let timeText = '';

      if (isFinished) {
         stepStatus = index === steps.length - 1 ? (dossier.etat === 'REJETE' ? 'rejected' : 'completed') : 'completed';
      } else if (index < currentNiveauIndex) {
         stepStatus = 'completed';
      } else if (index === currentNiveauIndex) {
         stepStatus = 'in-progress';
      }

      const eventHistoList = historique.filter(h => h.new_status === step.id || (index===0 && h.action.includes('Soumis')));
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
  let typePrestation = 'Prestation';
  const details = Array.isArray(dossier.dossier_details_rc) ? dossier.dossier_details_rc[0] : dossier.dossier_details_rc;
    if (details?.demande_initiale) {
    const parts = details.demande_initiale.split(']');
    if (parts.length > 0 && details.demande_initiale.startsWith('[')) {
      typePrestation = parts[0].replace('[', '');
    } else {
      typePrestation = details.demande_initiale;
    }
  }

  return (
    <div className="request-details-container">
      <div className="details-header">
        <div className="header-content">
          <h1>Suivi d\'Acheminement</h1>
          <p className="request-id">N° {dossier.id.substring(0, 8)}...</p>
        </div>
        <Link to="/my-requests" className="back-link">← Retour aux Demandes</Link>
      </div>

      <div className="details-content">
        <section className="summary-section">
          <div className="summary-card">
            <div className="summary-item">
              <span className="label">Numéro de Police</span>
              <span className="value">{dossier.police_number}</span>
            </div>
            <div className="summary-item">
              <span className="label">Type de Prestation</span>
              <span className="value">{typePrestation}</span>
            </div>
            <div className="summary-item">
              <span className="label">Date de Soumission</span>
              <span className="value large">{new Date(dossier.created_at).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="summary-item">
              <span className="label">Statut Actuel</span>
              <span className={`status-badge status-${dossier.etat.toLowerCase()}`}>
                {displayStatus}
              </span>
            </div>
          </div>
        </section>

        <section className="timeline-section">
          <h2>Parcours de votre dossier</h2>
          <p className="section-desc">Suivez l\'avancement de votre demande dans nos différents services, étape par étape.</p>
          <div className="tracking-container">
             <StatusTimeline timeline={buildTrackingTimeline()} />
          </div>
        </section>
        
        {historique && historique.length > 0 && (
          <section className="history-section">
            <h2>Historique Détaillé</h2>
            <div className="history-list">
              {historique.map(h => (
                 <div key={h.id} className="history-item">
                   <span className="history-date">{new Date(h.created_at).toLocaleString('fr-FR')}</span>
                   <span className="history-action">{h.action}</span>
                 </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default RequestDetails;

