import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import StatusTimeline from '../components/StatusTimeline';
import { fetchClientDossierById } from '../services/clientApi';
import {
  getClientDisplayStatus,
  isCancellationAction,
  isDossierCancelled,
  normalizeAction,
  toStatusCssClass,
} from '../utils/dossierStatus';

function formatRequestNumber(dossier) {
  if (dossier?.request_number) return dossier.request_number;
  return `DEM-${String(dossier?.id || '').slice(0, 8).toUpperCase()}`;
}

function mapWorkflowStatus(status) {
  const statusMap = {
    RELATION_CLIENT: 'Relation Client',
    PRESTATION: 'Prestation',
    FINANCE: 'Finance',
    EN_COURS: 'En cours',
    EN_INSTANCE: 'En instance',
    ANNULE: 'Annulé',
    CLOTURE: 'Clôture',
    TRAITE: 'Clôture',
    REJETE: 'Rejeté',
  };

  return statusMap[String(status || '').toUpperCase()] || String(status || '').trim();
}

function getReadableActionLabel(action) {
  const code = normalizeAction(action);

  const actionMap = {
    DOSSIER_SOUMIS_PAR_LE_CLIENT: 'Demande soumise par le client',
    CREATION_DU_DOSSIER: 'Dossier créé',
    CREATION_ET_ENVOI_AU_SERVICE_PRESTATION: 'Dossier créé et transmis au service Prestation',
    ENVOI_PRESTATION: 'Dossier transmis au service Prestation',
    TRANSMISSION_A_PRESTATION: 'Dossier transmis au service Prestation',
    MODIFICATION_DU_DOSSIER: 'Informations du dossier mises à jour',
    MODIFICATION_PRESTATION: 'Analyse du dossier mise à jour par le service Prestation',
    PIECE_TRANSFEREE: 'Pièces marquées pour traitement',
    PIECES_TRANSFEREES: 'Pièces marquées pour traitement',
    QUITTANCE_TRANSFEREE: 'Quittance transférée au service Finance',
    VALIDATION_CONFORMITE: 'Conformité vérifiée par le service Finance',
    ANNULATION_DOSSIER: 'Dossier annulé',
    DOSSIER_ANNULE: 'Dossier annulé',
    DOSSIER_ANNULEE: 'Dossier annulé',
    PAIEMENT_CONFIRME: 'Paiement confirmé et dossier clôturé',
  };

  if (actionMap[code]) return actionMap[code];

  const raw = String(action || '').trim();
  if (!raw) return 'Événement enregistré';

  if (raw.includes('_')) {
    const sentence = raw.replace(/_/g, ' ').toLowerCase();
    return sentence.charAt(0).toUpperCase() + sentence.slice(1);
  }

  return raw;
}

function formatHistoryEvent(event) {
  const title = getReadableActionLabel(event?.action);

  const from = mapWorkflowStatus(event?.old_status);
  const to = mapWorkflowStatus(event?.new_status);

  let transitionText = '';
  if (from && to && from !== to) {
    transitionText = `Passage de ${from} vers ${to}`;
  } else if (!from && to) {
    transitionText = `Statut: ${to}`;
  } else if (from && !to) {
    transitionText = `Statut précédent: ${from}`;
  }

  const description = String(event?.description || '').trim();
  const useDescription =
    description && normalizeAction(description) !== normalizeAction(event?.action);

  return {
    title,
    subtitle: useDescription ? description : transitionText,
  };
}

/* ─── Summary Info Item ─── */
function SummaryItem({ icon, label, value, highlight }) {
  return (
    <div className="group relative flex flex-col gap-1.5 p-3 rounded-xl transition-all duration-300 hover:bg-comar-royal/5">
      <div className="flex items-center gap-2">
        <span className="text-comar-royal/60">{icon}</span>
        <span className="text-[10px] sm:text-xs font-bold text-comar-gray-text uppercase tracking-widest">
          {label}
        </span>
      </div>
      {highlight ? (
        <div>{value}</div>
      ) : (
        <span className="text-sm sm:text-base font-bold text-comar-navy pl-0.5">
          {value}
        </span>
      )}
    </div>
  );
}

/* ─── Progress Bar ─── */
function ProgressIndicator({ timeline }) {
  const total = timeline.length;
  const completed = timeline.filter((s) => ['completed', 'cancelled', 'rejected'].includes(s.status)).length;
  const inProgress = timeline.filter(s => s.status === 'in-progress').length;
  const percentage = total === 0 ? 0 : Math.round(((completed + inProgress * 0.5) / total) * 100);

  return (
    <div className="flex items-center gap-4">
      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-comar-royal via-blue-500 to-emerald-400 rounded-full transition-all duration-1000 ease-out relative"
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
        </div>
      </div>
      <span className="text-sm font-bold text-comar-navy shrink-0 tabular-nums">
        {percentage}%
      </span>
    </div>
  );
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

  /* ─── Loading State ─── */
  if (loading) {
    return (
      <div className="min-h-screen bg-comar-gray-bg flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-comar-royal/20" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-comar-royal animate-spin" />
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-emerald-400 animate-spin" style={{ animationDuration: '0.8s', animationDirection: 'reverse' }} />
          </div>
          <p className="text-comar-gray-text font-medium animate-pulse">Chargement du dossier...</p>
        </div>
      </div>
    );
  }

  /* ─── Error State ─── */
  if (error || !dossier) {
    return (
      <div className="min-h-screen bg-comar-gray-bg px-4 py-12">
        <div className="max-w-lg mx-auto text-center animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-comar-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-comar-navy mb-2">Dossier introuvable</h2>
            <p className="text-sm text-comar-gray-text mb-6">
              {error || 'Le dossier demandé n\'existe pas ou n\'est plus accessible.'}
            </p>
            <Link 
              to="/my-requests" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-comar-navy to-comar-royal text-white text-sm font-semibold shadow-lg shadow-comar-royal/25 hover:shadow-xl hover:shadow-comar-royal/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour aux Demandes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isCancelledDossier = isDossierCancelled(dossier, historique);

  /* ─── Build Timeline ─── */
  const buildTrackingTimeline = () => {
    const serviceSteps = [
      { id: 'RELATION_CLIENT', title: 'Service Relation Client', desc: 'Réception et constitution du dossier' },
      { id: 'PRESTATION', title: 'Service Prestation', desc: 'Analyse métier et calcul' },
      { id: 'FINANCE', title: 'Service Finance', desc: 'Validation financière' },
    ];

    const cancellationEvents = historique.filter((h) => isCancellationAction(h?.action));
    const lastCancellationEvent = cancellationEvents[cancellationEvents.length - 1] || null;

    if (isCancelledDossier) {
      const steps = [
        ...serviceSteps,
        {
          id: 'ANNULE',
          title: 'Annulation du dossier',
          desc: 'Le traitement a été arrêté. Veuillez contacter votre agence pour plus de détails.',
        },
      ];

      let currentNiveauIndex = serviceSteps.findIndex((s) => s.id === dossier.niveau);
      if (currentNiveauIndex === -1) currentNiveauIndex = serviceSteps.length - 1;

      return steps.map((step, index) => {
        let stepStatus = 'pending';
        let dateText = 'À venir';
        let timeText = '';

        if (step.id === 'ANNULE') {
          stepStatus = 'cancelled';
        } else if (index <= currentNiveauIndex) {
          stepStatus = 'completed';
        }

        const eventHistoList = historique.filter((h) => {
          if (step.id === 'ANNULE') {
            return isCancellationAction(h?.action);
          }

          return (
            h.new_status === step.id ||
            (index === 0 && /soumis|création du dossier|creation du dossier/i.test(h.action || ''))
          );
        });

        if (eventHistoList.length > 0) {
          const lastEvent = eventHistoList[eventHistoList.length - 1];
          const dateObj = new Date(lastEvent.created_at);
          dateText = dateObj.toLocaleDateString('fr-FR');
          timeText = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        } else if (step.id === 'ANNULE' && lastCancellationEvent?.created_at) {
          const dateObj = new Date(lastCancellationEvent.created_at);
          dateText = dateObj.toLocaleDateString('fr-FR');
          timeText = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        } else if (stepStatus === 'completed') {
          const dateObj = new Date(dossier.updated_at || dossier.created_at);
          dateText = dateObj.toLocaleDateString('fr-FR');
        }

        return {
          title: step.title,
          description: step.id === 'ANNULE' && lastCancellationEvent?.description
            ? String(lastCancellationEvent.description).trim()
            : step.desc,
          status: stepStatus,
          date: dateText,
          time: timeText,
          icon: getStepIcon(step.id),
        };
      });
    }

    const steps = [
      ...serviceSteps,
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
      case 'ANNULE': return '⛔';
      default: return '📄';
    }
  };

  const displayStatus = getClientDisplayStatus(dossier.etat, { isCancelled: isCancelledDossier });
  const displayStatusClass = toStatusCssClass(displayStatus);
  const details = Array.isArray(dossier.dossier_details_rc) ? dossier.dossier_details_rc[0] : dossier.dossier_details_rc;
  let demandeInitiale = details?.demande_initiale || '-';
  if (demandeInitiale.startsWith('[')) {
    const parts = demandeInitiale.split(']');
    if (parts.length > 0) {
      demandeInitiale = parts[0].replace('[', '').trim() || demandeInitiale;
    }
  }

  const timelineData = buildTrackingTimeline();

  return (
    <div className="min-h-screen bg-comar-gray-bg">

      {/* ═══════════ Hero Header ═══════════ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-comar-navy via-comar-royal to-blue-600">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-comar-royal/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-transparent via-white/3 to-transparent rounded-full" />
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Suivi d'Acheminement
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-[52px]">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 text-white/80 text-xs font-mono">
                  <svg className="w-3 h-3 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                  {formatRequestNumber(dossier)}
                </span>
              </div>
            </div>

            <Link 
              to="/my-requests" 
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm text-white border border-white/20 text-sm font-semibold hover:bg-white/20 hover:border-white/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10"
            >
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour aux Demandes
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 pb-16 relative z-10">

        {/* ═══════════ Summary Card ═══════════ */}
        <section className="mb-8 animate-slide-up">
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100/80 overflow-hidden">
            {/* Accent line */}
            <div className="h-1 bg-gradient-to-r from-comar-navy via-comar-royal to-emerald-400" />
            <div className="p-5 sm:p-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-1 divide-x-0 md:divide-x divide-gray-100">
                <SummaryItem
                  icon={
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                  }
                  label="N° Demande"
                  value={formatRequestNumber(dossier)}
                />
                <SummaryItem
                  icon={
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  }
                  label="N° Police"
                  value={dossier.police_number}
                />
                <SummaryItem
                  icon={
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  }
                  label="Demande"
                  value={demandeInitiale}
                />
                <SummaryItem
                  icon={
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  }
                  label="Soumission"
                  value={new Date(dossier.created_at).toLocaleDateString('fr-FR')}
                />
                <SummaryItem
                  icon={
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                  label="Statut"
                  value={
                    <span className={`status-badge ${displayStatusClass}`}>
                      {displayStatus}
                    </span>
                  }
                  highlight
                />
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ Timeline Section ═══════════ */}
        <section className="mb-8 animate-slide-up" style={{ animationDelay: '100ms', animationFillMode: 'backwards' }}>
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100/80 overflow-hidden">
            <div className="p-6 sm:p-8">
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-1.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-comar-royal/10 to-comar-navy/10 flex items-center justify-center">
                      <svg className="w-4 h-4 text-comar-royal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-comar-navy">
                      Parcours de votre dossier
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-comar-gray-text ml-11">
                    Suivez l'avancement de votre demande dans nos différents services, étape par étape.
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-8 px-1">
                <ProgressIndicator timeline={timelineData} />
              </div>

              {/* Separator */}
              <div className="border-t border-gray-100 mb-8" />

              {/* Timeline */}
              <StatusTimeline timeline={timelineData} />
            </div>
          </div>
        </section>
        
        {/* ═══════════ History Section ═══════════ */}
        {historique && historique.length > 0 && (
          <section className="animate-slide-up" style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}>
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100/80 overflow-hidden">
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-comar-navy">
                    Historique Détaillé
                  </h2>
                  <span className="ml-auto text-xs font-bold text-comar-gray-text bg-comar-gray-bg px-3 py-1 rounded-full">
                    {historique.length} événement{historique.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-2">
                  {historique.map((h, idx) => {
                    const eventText = formatHistoryEvent(h);
                    return (
                      <div 
                        key={h.id} 
                        className="group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3.5 rounded-xl border border-transparent hover:border-gray-100 hover:bg-gray-50/50 transition-all duration-200 animate-fade-in"
                        style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'backwards' }}
                      >
                        {/* Timeline dot */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-br from-comar-royal to-blue-500 ring-4 ring-comar-royal/10 group-hover:ring-comar-royal/20 transition-all" />
                          <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-mono text-comar-gray-text bg-comar-gray-bg px-3 py-1.5 rounded-lg border border-gray-100/50">
                            <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {new Date(h.created_at).toLocaleString('fr-FR')}
                          </span>
                        </div>

                        {/* Action text */}
                        <div className="min-w-0">
                          <p className="text-sm text-comar-navy font-medium group-hover:text-comar-royal transition-colors duration-200">
                            {eventText.title}
                          </p>
                          {eventText.subtitle && (
                            <p className="text-xs text-comar-gray-text mt-1">
                              {eventText.subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default RequestDetails;
