import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchClientDossiers } from '../services/clientApi';
import StatusSummary from '../components/StatusSummary';
import '../styles/Dashboard.css';

// Icônes SVG professionnelles
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const ListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/>
    <line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/>
    <line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);

const FileTextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

// Helper: map DB etat to display status
function mapEtatToStatus(etat) {
  switch (etat) {
    case 'EN_COURS': return 'En cours';
    case 'EN_ATTENTE': return 'En attente';
    case 'TRAITE': return 'Validé';
    case 'REJETE': return 'Rejeté';
    default: return etat || 'En cours';
  }
}

function Dashboard({ clientInfo }) {
  const [requestStats, setRequestStats] = useState({
    enAttente: 0,
    enCours: 0,
    valide: 0,
    rejete: 0
  });
  const [recentDossiers, setRecentDossiers] = useState([]);
  const [loadingDossiers, setLoadingDossiers] = useState(true);

  // Fetch real dossiers from the DB on mount
  useEffect(() => {
    const loadDossiers = async () => {
      try {
        const result = await fetchClientDossiers();
        const dossiers = result.data || [];

        // Compute stats from real data
        const stats = { enAttente: 0, enCours: 0, valide: 0, rejete: 0 };
        dossiers.forEach((d) => {
          switch (d.etat) {
            case 'EN_ATTENTE': stats.enAttente++; break;
            case 'EN_COURS': stats.enCours++; break;
            case 'TRAITE': stats.valide++; break;
            case 'REJETE': stats.rejete++; break;
            default: stats.enCours++; break;
          }
        });
        setRequestStats(stats);
        setRecentDossiers(dossiers.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dossiers:', err);
      } finally {
        setLoadingDossiers(false);
      }
    };
    loadDossiers();
  }, []);

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Bienvenue, {clientInfo?.name}!</h1>
          <p className="client-info">Client n°: {clientInfo?.clientNumber}</p>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Quick Actions */}
        <section className="quick-actions">
          <h2>Actions Rapides</h2>
          <div className="actions-grid">
            <Link to="/soumettre-dossier" className="action-button primary">
              <span className="action-icon">
                <PlusIcon />
              </span>
              <span className="action-text">Nouvelle Demande</span>
            </Link>
            <Link to="/my-requests" className="action-button secondary">
              <span className="action-icon">
                <ListIcon />
              </span>
              <span className="action-text">Voir Toutes les Demandes</span>
            </Link>
          </div>
        </section>

        {/* Status Summary */}
        <section className="status-section">
          <h2>Résumé des Demandes</h2>
          <StatusSummary stats={requestStats} />
        </section>

        {/* Recent Dossiers from DB */}
        <section className="recent-requests-section">
          <div className="section-header">
            <h2>Demandes Récentes</h2>
            <Link to="/my-requests" className="view-all-link">Voir Tout</Link>
          </div>
          {loadingDossiers ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
              Chargement de vos demandes...
            </div>
          ) : recentDossiers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
              <p>Aucune demande pour le moment.</p>
              <Link to="/soumettre-dossier" style={{ color: '#3b82f6' }}>Soumettre votre premier dossier</Link>
            </div>
          ) : (
            <table className="requests-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Souscripteur</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>N° Police</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Agence</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>État</th>
                </tr>
              </thead>
              <tbody>
                {recentDossiers.map((dossier) => (
                  <tr key={dossier.id}>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>{dossier.souscripteur}</td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>{dossier.police_number}</td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>{dossier.agences?.nom || '-'}</td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>{formatDate(dossier.created_at)}</td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                      <span className={`status-badge status-${dossier.etat?.toLowerCase()?.replace('_', '-')}`}>
                        {mapEtatToStatus(dossier.etat)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Quick Tips */}
        <section className="quick-tips">
          <h2>Conseils</h2>
          <div className="tips-grid">
            <div className="tip-card">
              <h3>
                <span className="tip-icon"><FileTextIcon /></span>
                Documents Requis
              </h3>
              <p>Assurez-vous de télécharger tous les documents requis pour accélérer le traitement.</p>
            </div>
            <div className="tip-card">
              <h3>
                <span className="tip-icon"><ClockIcon /></span>
                Délai de Traitement
              </h3>
              <p>La plupart des demandes sont traitées dans les 5 à 7 jours ouvrables.</p>
            </div>
            <div className="tip-card">
              <h3>
                <span className="tip-icon"><MailIcon /></span>
                Restez Informé
              </h3>
              <p>Vous recevrez des notifications par email pour tout changement de statut.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
