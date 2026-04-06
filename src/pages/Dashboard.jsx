import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchClientDossiers } from '../services/clientApi';
import StatusSummary from '../components/StatusSummary';

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
      return etat || 'En cours';
  }
}

function formatRequestNumber(dossier) {
  if (dossier?.request_number) return dossier.request_number;
  return `DEM-${String(dossier?.id || '').slice(0, 8).toUpperCase()}`;
}

function Dashboard({ clientInfo }) {
  const [requestStats, setRequestStats] = useState({
    enInstance: 0,
    enCours: 0,
    cloture: 0,
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
        const stats = { enInstance: 0, enCours: 0, cloture: 0, rejete: 0 };
        dossiers.forEach((d) => {
          switch (d.etat) {
            case 'EN_INSTANCE':
            case 'EN_ATTENTE':
              stats.enInstance++;
              break;
            case 'EN_COURS':
              stats.enCours++;
              break;
            case 'CLOTURE':
            case 'TRAITE':
              stats.cloture++;
              break;
            case 'REJETE':
              stats.rejete++;
              break;
            default:
              stats.enCours++;
              break;
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
    <div className="min-h-screen bg-comar-gray-bg">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-comar-navy to-comar-royal px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Bienvenue, {clientInfo?.name}!
          </h1>
          <p className="text-white/70 mt-1 text-sm sm:text-base">
            Police contrat n°: {clientInfo?.clientNumber || '-'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 pb-12">
        {/* Quick Actions */}
        <section className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link 
              to="/soumettre-dossier" 
              className="flex items-center gap-4 p-5 bg-comar-royal text-white rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200 group"
            >
              <span className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/20 group-hover:bg-white/30 transition-colors duration-200">
                <PlusIcon />
              </span>
              <span className="text-base font-semibold">Nouvelle Demande</span>
            </Link>
            <Link 
              to="/my-requests" 
              className="flex items-center gap-4 p-5 bg-white text-comar-navy rounded-xl shadow-md border border-gray-100 hover:shadow-lg hover:border-comar-royal/20 transition-all duration-200 group"
            >
              <span className="w-12 h-12 flex items-center justify-center rounded-xl bg-comar-royal/10 text-comar-royal group-hover:bg-comar-royal/20 transition-colors duration-200">
                <ListIcon />
              </span>
              <span className="text-base font-semibold">Voir Toutes les Demandes</span>
            </Link>
          </div>
        </section>

        {/* Status Summary */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-comar-navy mb-4">Résumé des Demandes</h2>
          <StatusSummary stats={requestStats} />
        </section>

        {/* Recent Dossiers from DB */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-comar-navy">Demandes Récentes</h2>
            <Link to="/my-requests" className="text-sm font-semibold text-comar-royal hover:text-comar-navy transition-colors duration-200">
              Voir Tout →
            </Link>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            {loadingDossiers ? (
              <div className="text-center py-12 text-comar-gray-text">
                <div className="w-8 h-8 border-4 border-comar-border border-t-comar-royal rounded-full animate-spin mx-auto mb-3"></div>
                Chargement de vos demandes...
              </div>
            ) : recentDossiers.length === 0 ? (
              <div className="text-center py-12 text-comar-gray-text">
                <p className="mb-2">Aucune demande pour le moment.</p>
                <Link to="/soumettre-dossier" className="text-comar-royal font-semibold hover:text-comar-navy transition-colors">
                  Soumettre votre premier dossier
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-comar-gray-bg/50">
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-comar-gray-text uppercase tracking-wider">N° Demande</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-comar-gray-text uppercase tracking-wider">Souscripteur</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-comar-gray-text uppercase tracking-wider">N° Police</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-comar-gray-text uppercase tracking-wider hidden sm:table-cell">Agence</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-comar-gray-text uppercase tracking-wider hidden md:table-cell">Date</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-comar-gray-text uppercase tracking-wider">État</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentDossiers.map((dossier) => (
                      <tr key={dossier.id} className="hover:bg-comar-gray-bg/30 transition-colors duration-150">
                        <td className="px-5 py-4 text-sm font-mono text-comar-gray-text">{formatRequestNumber(dossier)}</td>
                        <td className="px-5 py-4 text-sm text-comar-navy font-medium">{dossier.souscripteur}</td>
                        <td className="px-5 py-4 text-sm text-comar-gray-text">{dossier.police_number}</td>
                        <td className="px-5 py-4 text-sm text-comar-gray-text hidden sm:table-cell">{dossier.agences?.nom || '-'}</td>
                        <td className="px-5 py-4 text-sm text-comar-gray-text hidden md:table-cell">{formatDate(dossier.created_at)}</td>
                        <td className="px-5 py-4">
                          <span className={`status-badge status-${dossier.etat?.toLowerCase()?.replace('_', '-')}`}>
                            {mapEtatToStatus(dossier.etat)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Quick Tips */}
        <section>
          <h2 className="text-xl font-bold text-comar-navy mb-4">Conseils</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-200">
              <h3 className="flex items-center gap-2 text-base font-semibold text-comar-navy mb-2">
                <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-comar-royal/10 text-comar-royal">
                  <FileTextIcon />
                </span>
                Documents Requis
              </h3>
              <p className="text-sm text-comar-gray-text leading-relaxed">
                Assurez-vous de télécharger tous les documents requis pour accélérer le traitement.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-200">
              <h3 className="flex items-center gap-2 text-base font-semibold text-comar-navy mb-2">
                <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                  <ClockIcon />
                </span>
                Délai de Traitement
              </h3>
              <p className="text-sm text-comar-gray-text leading-relaxed">
                La plupart des demandes sont traitées dans les 5 à 7 jours ouvrables.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-200">
              <h3 className="flex items-center gap-2 text-base font-semibold text-comar-navy mb-2">
                <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <MailIcon />
                </span>
                Restez Informé
              </h3>
              <p className="text-sm text-comar-gray-text leading-relaxed">
                Vous recevrez des notifications par email pour tout changement de statut.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
