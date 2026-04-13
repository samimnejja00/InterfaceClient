const express = require('express');
const { body, validationResult } = require('express-validator');

const supabase = require('../config/supabase');
const authenticateClient = require('../middleware/authenticateClient');
const { sendManualProgressEmail, toRequestNumber } = require('../services/emailNotifier');

const router = express.Router();

router.use(authenticateClient);

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
