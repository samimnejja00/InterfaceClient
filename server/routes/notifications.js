const express = require('express');
const { body, validationResult } = require('express-validator');

const supabase = require('../config/supabase');
const authenticateClient = require('../middleware/authenticateClient');
const { sendManualProgressEmail, toRequestNumber } = require('../services/emailNotifier');

const router = express.Router();

router.use(authenticateClient);

function normalizeAction(action) {
  return String(action || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[']/g, '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function toStatusLabel(status) {
  const labels = {
    RELATION_CLIENT: 'Relation Client',
    PRESTATION: 'Prestation',
    FINANCE: 'Finance',
    EN_COURS: 'En cours',
    EN_INSTANCE: 'En instance',
    CLOTURE: 'Clôturé',
    REJETE: 'Rejeté',
    ANNULE: 'Annulé',
    TRAITE: 'Clôturé',
  };

  const key = String(status || '').trim().toUpperCase();
  if (!key) return '';
  return labels[key] || key.replace(/_/g, ' ');
}

function getReadableActionLabel(action) {
  const code = normalizeAction(action);

  const actionMap = {
    DOSSIER_SOUMIS_PAR_LE_CLIENT: 'Demande soumise',
    CREATION_DU_DOSSIER: 'Dossier créé',
    CREATION_ET_ENVOI_AU_SERVICE_PRESTATION: 'Dossier créé et transmis',
    ENVOI_PRESTATION: 'Dossier transmis au service Prestation',
    TRANSMISSION_A_PRESTATION: 'Dossier transmis au service Prestation',
    MODIFICATION_DU_DOSSIER: 'Dossier mis à jour',
    MODIFICATION_PRESTATION: 'Analyse Prestation mise à jour',
    PIECE_TRANSFEREE: 'Pièces transférées',
    PIECES_TRANSFEREES: 'Pièces transférées',
    QUITTANCE_TRANSFEREE: 'Quittance transférée',
    VALIDATION_CONFORMITE: 'Conformité validée',
    PAIEMENT_CONFIRME: 'Paiement confirmé',
    ANNULATION_DOSSIER: 'Dossier annulé',
    MARQUER_URGENT: 'Dossier marqué prioritaire',
    RETIRER_URGENT: 'Priorité retirée',
  };

  if (actionMap[code]) return actionMap[code];

  const raw = String(action || '').trim();
  if (!raw) return 'Mise à jour du dossier';

  if (raw.includes('_')) {
    const sentence = raw.replace(/_/g, ' ').toLowerCase();
    return sentence.charAt(0).toUpperCase() + sentence.slice(1);
  }

  return raw;
}

function normalizeRelation(value) {
  if (Array.isArray(value)) return value[0] || null;
  return value || null;
}

function buildNotificationMessage(actionRow) {
  const description = String(actionRow?.description || '').trim();
  const oldStatus = toStatusLabel(actionRow?.old_status);
  const newStatus = toStatusLabel(actionRow?.new_status);

  if (description) return description;

  if (oldStatus && newStatus && oldStatus !== newStatus) {
    return `Passage de ${oldStatus} vers ${newStatus}.`;
  }

  if (newStatus) {
    return `Statut actuel: ${newStatus}.`;
  }

  return 'Votre dossier a été mis à jour.';
}

router.get('/', async (req, res) => {
  const parsedLimit = Number.parseInt(String(req.query?.limit || '50'), 10);
  const limit = Number.isFinite(parsedLimit) ? Math.max(1, Math.min(parsedLimit, 100)) : 50;

  try {
    const { data: dossiers, error: dossiersError } = await supabase
      .from('dossiers')
      .select('id, police_number, etat, niveau, agences ( id, code, nom )')
      .eq('client_id', req.client.id)
      .order('updated_at', { ascending: false });

    if (dossiersError) {
      console.error('Notifications dossiers fetch error:', dossiersError);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors du chargement des notifications.',
      });
    }

    const safeDossiers = dossiers || [];
    const dossierIds = safeDossiers.map((dossier) => dossier.id);

    if (dossierIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        meta: { count: 0, limit },
      });
    }

    const { data: actions, error: actionsError } = await supabase
      .from('historique_actions')
      .select('id, dossier_id, action, description, old_status, new_status, created_at')
      .in('dossier_id', dossierIds)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (actionsError) {
      console.error('Notifications actions fetch error:', actionsError);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors du chargement des notifications.',
      });
    }

    const dossierById = new Map(
      safeDossiers.map((dossier) => [dossier.id, dossier])
    );

    const notifications = (actions || []).map((actionRow) => {
      const dossier = dossierById.get(actionRow.dossier_id) || {};
      const agence = normalizeRelation(dossier.agences);

      return {
        id: actionRow.id,
        dossier_id: actionRow.dossier_id,
        request_number: toRequestNumber(actionRow.dossier_id),
        police_number: dossier.police_number || null,
        title: getReadableActionLabel(actionRow.action),
        message: buildNotificationMessage(actionRow),
        action: actionRow.action,
        old_status: actionRow.old_status,
        new_status: actionRow.new_status,
        current_etat: dossier.etat || null,
        current_niveau: dossier.niveau || null,
        agence: agence
          ? {
              id: agence.id,
              code: agence.code || null,
              nom: agence.nom || null,
            }
          : null,
        created_at: actionRow.created_at,
      };
    });

    return res.status(200).json({
      success: true,
      data: notifications,
      meta: {
        count: notifications.length,
        limit,
      },
    });
  } catch (error) {
    console.error('Notifications route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur.',
    });
  }
});

router.get('/emailing/status', async (req, res) => {
  const smtpConfigured = Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_FROM
  );

  const notifierEnabled = process.env.EMAIL_NOTIFIER_ENABLED === undefined
    ? true
    : ['1', 'true', 'yes', 'on'].includes(String(process.env.EMAIL_NOTIFIER_ENABLED).trim().toLowerCase());

  return res.status(200).json({
    success: true,
    data: {
      notifier_enabled: notifierEnabled,
      smtp_configured: smtpConfigured,
      poll_ms: Number.parseInt(process.env.EMAIL_NOTIFIER_POLL_MS || '30000', 10),
    },
  });
});

router.post(
  '/emailing/test',
  [
    body('dossier_id')
      .optional({ checkFalsy: true })
      .isUUID()
      .withMessage('Identifiant dossier invalide.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors.array().map((e) => e.msg);
      return res.status(400).json({ success: false, message: messages[0], errors: messages });
    }

    if (!req.client?.email) {
      return res.status(400).json({
        success: false,
        message: 'Aucun email client trouve dans votre session.',
      });
    }

    const dossierId = req.body?.dossier_id || null;

    try {
      let dossierContext = null;

      if (dossierId) {
        const { data: dossier, error } = await supabase
          .from('dossiers')
          .select('id, etat, niveau, client_id')
          .eq('id', dossierId)
          .eq('client_id', req.client.id)
          .maybeSingle();

        if (error) {
          console.error('Test emailing dossier fetch error:', error);
          return res.status(500).json({
            success: false,
            message: 'Erreur lors de la verification du dossier.',
          });
        }

        if (!dossier) {
          return res.status(404).json({
            success: false,
            message: 'Dossier introuvable pour votre compte.',
          });
        }

        dossierContext = dossier;
      }

      const requestNumber = dossierContext ? toRequestNumber(dossierContext.id) : 'DEMO-EMAIL';
      const currentEtat = dossierContext?.etat || 'EN_COURS';
      const currentNiveau = dossierContext?.niveau || 'RELATION_CLIENT';

      const delivery = await sendManualProgressEmail({
        toEmail: req.client.email,
        clientName: req.client.nom_complet || 'Client',
        requestNumber,
        oldStatus: null,
        newStatus: currentNiveau,
        currentEtat,
        currentNiveau,
        actionLabel: 'Notification de test',
        actionDescription: 'Ceci est un email de test pour valider la configuration SMTP.',
        actionDate: new Date().toISOString(),
      });

      return res.status(200).json({
        success: true,
        message: `Email de test envoye a ${req.client.email}`,
        data: {
          message_id: delivery?.messageId || null,
          preview_url: delivery?.previewUrl || null,
          request_number: requestNumber,
        },
      });
    } catch (error) {
      console.error('Test emailing error:', error);
      return res.status(500).json({
        success: false,
        message: `Echec envoi email de test: ${error.message}`,
      });
    }
  }
);

module.exports = router;
