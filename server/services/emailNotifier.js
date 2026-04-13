const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const MAX_PROCESSED_IDS = 4000;

const STATUS_LABELS = {
  EN_COURS: 'En cours',
  EN_INSTANCE: 'En instance',
  CLOTURE: 'Cloture',
  CLOTUREE: 'Cloturee',
  CLOTUREE_: 'Cloturee',
  PAYE: 'Paye',
  REJETE: 'Rejete',
  RELATION_CLIENT: 'Relation Client',
  PRESTATION: 'Prestation',
  FINANCE: 'Finance',
};

const PROGRESS_KEYWORDS = [
  'transmis',
  'transfert',
  'changement',
  'mise a jour',
  'mis a jour',
  'etat',
  'status',
  'niveau',
  'finance',
  'prestation',
  'relation client',
  'cloture',
  'valide',
  'rejete',
];

function parseBool(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).trim().toLowerCase());
}

function parseIntSafe(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toRequestNumber(dossierId) {
  return `DEM-${String(dossierId || '').slice(0, 8).toUpperCase()}`;
}

function toStatusLabel(statusValue) {
  const normalized = String(statusValue || '').trim().toUpperCase();
  if (!normalized) return 'Non defini';
  return STATUS_LABELS[normalized] || normalized.replace(/_/g, ' ');
}

function normalizeRel(value) {
  if (Array.isArray(value)) return value[0] || null;
  return value || null;
}

function formatDateFr(isoValue) {
  try {
    return new Date(isoValue).toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (_) {
    return String(isoValue || '');
  }
}

function ensureStateDir(stateFilePath) {
  const dirPath = path.dirname(stateFilePath);
  fs.mkdirSync(dirPath, { recursive: true });
}

function loadState(stateFilePath, logger = console) {
  try {
    if (!fs.existsSync(stateFilePath)) {
      const initialState = {
        lastProcessedAt: new Date().toISOString(),
        processedActionIds: [],
      };
      ensureStateDir(stateFilePath);
      fs.writeFileSync(stateFilePath, JSON.stringify(initialState, null, 2), 'utf8');
      logger.log(`[EmailNotifier] Etat initialise: ${stateFilePath}`);
      return initialState;
    }

    const raw = fs.readFileSync(stateFilePath, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      lastProcessedAt: parsed?.lastProcessedAt || new Date().toISOString(),
      processedActionIds: Array.isArray(parsed?.processedActionIds) ? parsed.processedActionIds : [],
    };
  } catch (error) {
    logger.error('[EmailNotifier] Erreur de lecture etat:', error.message);
    return {
      lastProcessedAt: new Date().toISOString(),
      processedActionIds: [],
    };
  }
}

function saveState(stateFilePath, state, logger = console) {
  try {
    ensureStateDir(stateFilePath);
    fs.writeFileSync(stateFilePath, JSON.stringify(state, null, 2), 'utf8');
  } catch (error) {
    logger.error('[EmailNotifier] Erreur ecriture etat:', error.message);
  }
}

function buildTransportFromEnv(logger = console) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseIntSafe(process.env.SMTP_PORT, 587);
  const smtpSecure = parseBool(process.env.SMTP_SECURE, false);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = String(process.env.SMTP_PASS || '').replace(/\s+/g, '');
  const smtpFrom = process.env.SMTP_FROM;

  const hasRequiredConfig = smtpHost && smtpPort && smtpUser && smtpPass && smtpFrom;
  if (!hasRequiredConfig) {
    logger.warn('[EmailNotifier] SMTP incomplet: emailing desactive tant que SMTP_* et SMTP_FROM ne sont pas configures.');
    return null;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  return {
    transporter,
    fromEmail: smtpFrom,
  };
}

function isProgressAction(actionRow) {
  if (!actionRow?.dossier_id) return false;

  const oldStatus = String(actionRow.old_status || '').trim().toUpperCase();
  const newStatus = String(actionRow.new_status || '').trim().toUpperCase();

  if (newStatus && oldStatus !== newStatus) return true;

  const searchableText = `${actionRow.action || ''} ${actionRow.description || ''}`.toLowerCase();
  return PROGRESS_KEYWORDS.some((keyword) => searchableText.includes(keyword));
}

async function fetchDossierContext(supabase, dossierId) {
  const nested = await supabase
    .from('dossiers')
    .select('id, etat, niveau, client_id, agence_id, clients ( id, nom_complet, email ), agences ( id, code, nom )')
    .eq('id', dossierId)
    .maybeSingle();

  if (!nested.error && nested.data) {
    return {
      id: nested.data.id,
      etat: nested.data.etat,
      niveau: nested.data.niveau,
      client: normalizeRel(nested.data.clients),
      agence: normalizeRel(nested.data.agences),
    };
  }

  const dossierRes = await supabase
    .from('dossiers')
    .select('id, etat, niveau, client_id, agence_id')
    .eq('id', dossierId)
    .maybeSingle();

  if (dossierRes.error || !dossierRes.data) {
    return null;
  }

  const dossier = dossierRes.data;

  const [clientRes, agenceRes] = await Promise.all([
    supabase
      .from('clients')
      .select('id, nom_complet, email')
      .eq('id', dossier.client_id)
      .maybeSingle(),
    dossier.agence_id
      ? supabase
          .from('agences')
          .select('id, code, nom')
          .eq('id', dossier.agence_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return {
    id: dossier.id,
    etat: dossier.etat,
    niveau: dossier.niveau,
    client: clientRes.data || null,
    agence: agenceRes.data || null,
  };
}

function buildEmailContent({
  clientName,
  requestNumber,
  oldStatus,
  newStatus,
  currentEtat,
  currentNiveau,
  actionLabel,
  actionDescription,
  actionDate,
  agenceLabel,
}) {
  const oldLabel = oldStatus ? toStatusLabel(oldStatus) : 'Non defini';
  const newLabel = newStatus ? toStatusLabel(newStatus) : 'Mise a jour du dossier';
  const etatLabel = toStatusLabel(currentEtat);
  const niveauLabel = toStatusLabel(currentNiveau);

  const subject = `[COMAR] Mise a jour de votre dossier ${requestNumber}`;

  const text = [
    `Bonjour ${clientName || 'Client'},`,
    '',
    `Votre dossier ${requestNumber} a ete mis a jour le ${formatDateFr(actionDate)}.`,
    `Evolution detectee: ${oldLabel} -> ${newLabel}`,
    `Etat actuel: ${etatLabel}`,
    `Niveau actuel: ${niveauLabel}`,
    actionLabel ? `Action: ${actionLabel}` : null,
    actionDescription ? `Detail: ${actionDescription}` : null,
    agenceLabel ? `Agence: ${agenceLabel}` : null,
    '',
    'Vous pouvez consulter votre espace client pour plus de details.',
    '',
    'Ceci est un email automatique, merci de ne pas y repondre.',
  ]
    .filter(Boolean)
    .join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
      <p>Bonjour ${clientName || 'Client'},</p>
      <p>Votre dossier <strong>${requestNumber}</strong> a ete mis a jour le <strong>${formatDateFr(actionDate)}</strong>.</p>
      <ul>
        <li><strong>Evolution detectee:</strong> ${oldLabel} -> ${newLabel}</li>
        <li><strong>Etat actuel:</strong> ${etatLabel}</li>
        <li><strong>Niveau actuel:</strong> ${niveauLabel}</li>
        ${actionLabel ? `<li><strong>Action:</strong> ${actionLabel}</li>` : ''}
        ${actionDescription ? `<li><strong>Detail:</strong> ${actionDescription}</li>` : ''}
        ${agenceLabel ? `<li><strong>Agence:</strong> ${agenceLabel}</li>` : ''}
      </ul>
      <p>Vous pouvez consulter votre espace client pour plus de details.</p>
      <p style="color:#6b7280; font-size: 12px;">Ceci est un email automatique, merci de ne pas y repondre.</p>
    </div>
  `;

  return { subject, text, html };
}

async function sendManualProgressEmail({
  toEmail,
  clientName,
  requestNumber,
  oldStatus,
  newStatus,
  currentEtat,
  currentNiveau,
  actionLabel,
  actionDescription,
  actionDate,
  agenceLabel,
  logger = console,
}) {
  const transport = buildTransportFromEnv(logger);
  if (!transport) {
    throw new Error('SMTP non configure.');
  }

  const content = buildEmailContent({
    clientName,
    requestNumber,
    oldStatus,
    newStatus,
    currentEtat,
    currentNiveau,
    actionLabel,
    actionDescription,
    actionDate,
    agenceLabel,
  });

  const info = await transport.transporter.sendMail({
    from: transport.fromEmail,
    to: toEmail,
    subject: content.subject,
    text: content.text,
    html: content.html,
  });

  return {
    ...info,
    previewUrl: nodemailer.getTestMessageUrl(info) || null,
  };
}

function startEmailNotifier({ supabase, logger = console }) {
  if (!supabase) {
    logger.error('[EmailNotifier] Supabase client requis.');
    return () => {};
  }

  const pollMs = Math.max(5000, parseIntSafe(process.env.EMAIL_NOTIFIER_POLL_MS, 30000));
  const stateFilePath = process.env.EMAIL_NOTIFIER_STATE_FILE
    ? path.resolve(process.env.EMAIL_NOTIFIER_STATE_FILE)
    : path.join(__dirname, '..', '.cache', 'email-notifier-state.json');

  const enabledByDefault = true;
  const notifierEnabled = parseBool(process.env.EMAIL_NOTIFIER_ENABLED, enabledByDefault);

  if (!notifierEnabled) {
    logger.log('[EmailNotifier] Desactive (EMAIL_NOTIFIER_ENABLED=false).');
    return () => {};
  }

  const transport = buildTransportFromEnv(logger);
  if (!transport) {
    return () => {};
  }

  const state = loadState(stateFilePath, logger);
  let lastProcessedAt = state.lastProcessedAt;
  let processedActionIds = new Set(state.processedActionIds || []);
  let isRunning = false;

  const persistState = () => {
    const trimmed = Array.from(processedActionIds).slice(-MAX_PROCESSED_IDS);
    processedActionIds = new Set(trimmed);

    saveState(
      stateFilePath,
      {
        lastProcessedAt,
        processedActionIds: trimmed,
      },
      logger
    );
  };

  const processOnce = async () => {
    if (isRunning) return;
    isRunning = true;

    try {
      const { data: actions, error } = await supabase
        .from('historique_actions')
        .select('id, dossier_id, action, description, old_status, new_status, created_at')
        .gte('created_at', lastProcessedAt)
        .order('created_at', { ascending: true })
        .limit(250);

      if (error) {
        logger.error('[EmailNotifier] Erreur lecture historique_actions:', error.message);
        return;
      }

      if (!actions || actions.length === 0) {
        return;
      }

      let maxSeen = lastProcessedAt;

      for (const action of actions) {
        if (!action?.id || !action?.created_at) continue;

        if (action.created_at > maxSeen) {
          maxSeen = action.created_at;
        }

        if (processedActionIds.has(action.id)) {
          continue;
        }

        try {
          if (isProgressAction(action)) {
            const dossier = await fetchDossierContext(supabase, action.dossier_id);
            const clientEmail = dossier?.client?.email;

            if (dossier && clientEmail && clientEmail.includes('@')) {
              const agenceCode = dossier?.agence?.code ? ` (${dossier.agence.code})` : '';
              const agenceLabel = dossier?.agence?.nom ? `${dossier.agence.nom}${agenceCode}` : null;

              const content = buildEmailContent({
                clientName: dossier?.client?.nom_complet || 'Client',
                requestNumber: toRequestNumber(dossier.id),
                oldStatus: action.old_status,
                newStatus: action.new_status,
                currentEtat: dossier.etat,
                currentNiveau: dossier.niveau,
                actionLabel: action.action,
                actionDescription: action.description,
                actionDate: action.created_at,
                agenceLabel,
              });

              const info = await transport.transporter.sendMail({
                from: transport.fromEmail,
                to: clientEmail,
                subject: content.subject,
                text: content.text,
                html: content.html,
              });

              logger.log(
                `[EmailNotifier] Notification envoyee: dossier=${toRequestNumber(dossier.id)} email=${clientEmail}`
              );

              const previewUrl = nodemailer.getTestMessageUrl(info);
              if (previewUrl) {
                logger.log(`[EmailNotifier] Preview email: ${previewUrl}`);
              }
            }
          }
        } catch (sendError) {
          logger.error(`[EmailNotifier] Echec envoi action=${action.id}:`, sendError.message);
        }

        processedActionIds.add(action.id);
      }

      if (maxSeen > lastProcessedAt) {
        lastProcessedAt = maxSeen;
      }

      persistState();
    } finally {
      isRunning = false;
    }
  };

  const timer = setInterval(() => {
    processOnce().catch((error) => {
      logger.error('[EmailNotifier] Erreur processOnce:', error.message);
    });
  }, pollMs);

  if (typeof timer.unref === 'function') {
    timer.unref();
  }

  processOnce().catch((error) => {
    logger.error('[EmailNotifier] Erreur premiere execution:', error.message);
  });

  logger.log(`[EmailNotifier] Actif - polling toutes les ${pollMs} ms`);

  return () => {
    clearInterval(timer);
    persistState();
    logger.log('[EmailNotifier] Arrete.');
  };
}

module.exports = {
  startEmailNotifier,
  sendManualProgressEmail,
  toRequestNumber,
};
