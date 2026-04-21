export function normalizeAction(action) {
  return String(action || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[']/g, '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function isCancellationAction(action) {
  const code = normalizeAction(action);
  if (!code) return false;
  if (code.includes('ANNUL')) return true;
  return code === 'ANNULATION_DOSSIER' || code === 'DOSSIER_ANNULE' || code === 'DOSSIER_ANNULEE';
}

export function isDossierCancelled(dossier, historique = []) {
  if (!dossier) return false;

  const etatCode = String(dossier.etat || '').trim().toUpperCase();
  if (etatCode === 'ANNULE' || etatCode === 'ANNULEE') {
    return true;
  }

  if (dossier.is_cancelled === true) {
    return true;
  }

  return (historique || []).some((entry) => isCancellationAction(entry?.action));
}

export function getClientDisplayStatus(etat, options = {}) {
  const { isCancelled = false } = options;
  if (isCancelled) return 'Annulé';

  switch (String(etat || '').toUpperCase()) {
    case 'EN_COURS':
      return 'En cours';
    case 'EN_INSTANCE':
    case 'EN_ATTENTE':
      return 'En instance';
    case 'ANNULE':
    case 'ANNULEE':
      return 'Annulé';
    case 'CLOTURE':
    case 'TRAITE':
      return 'Clôturé';
    case 'REJETE':
      return 'Rejeté';
    default:
      return etat || 'En cours';
  }
}

export function toStatusCssClass(statusText) {
  const normalized = String(statusText || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_\s]+/g, '-');

  return `status-${normalized}`;
}
