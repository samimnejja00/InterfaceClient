const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const supabase = require('../config/supabase');
const authenticateClient = require('../middleware/authenticateClient');

const router = express.Router();
const POLICE_NUMBER_REGEX = /^\d{8}-\d$/;
const PASSWORD_RESET_AUDIENCE = 'client-password-reset';
const PASSWORD_RESET_EXPIRY = process.env.CLIENT_PASSWORD_RESET_TOKEN_EXPIRY || '20m';
const DEFAULT_CLIENT_APP_BASE_URL = 'http://localhost:3000';

function parseBool(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).trim().toLowerCase());
}

function parseIntSafe(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getClientAppBaseUrl() {
  const rawBaseUrl = String(process.env.CLIENT_APP_BASE_URL || DEFAULT_CLIENT_APP_BASE_URL).trim();
  return rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
}

function buildPasswordResetUrl(token) {
  return `${getClientAppBaseUrl()}/reset-password?token=${encodeURIComponent(token)}`;
}

function buildSmtpTransport(logger = console) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseIntSafe(process.env.SMTP_PORT, 587);
  const smtpSecure = parseBool(process.env.SMTP_SECURE, false);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = String(process.env.SMTP_PASS || '').replace(/\s+/g, '');
  const smtpFrom = process.env.SMTP_FROM;

  const hasRequiredConfig = smtpHost && smtpPort && smtpUser && smtpPass && smtpFrom;
  if (!hasRequiredConfig) {
    logger.warn('[Clients] SMTP incomplet: impossible d\'envoyer les emails de reset mot de passe.');
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

async function sendPasswordResetRequestEmail({ toEmail, clientName, resetUrl, logger = console }) {
  const transport = buildSmtpTransport(logger);
  if (!transport) {
    throw new Error('SMTP non configure.');
  }

  const subject = '[COMAR] Changement de mot de passe';
  const text = [
    `Bonjour ${clientName || 'Client'},`,
    '',
    'Nous avons recu une demande de changement de mot de passe pour votre espace client COMAR.',
    'Cliquez sur ce lien pour confirmer le changement :',
    resetUrl,
    '',
    `Ce lien expire dans ${PASSWORD_RESET_EXPIRY}.`,
    'Si vous n\'etes pas a l\'origine de cette demande, ignorez simplement cet email.',
    '',
    'Ceci est un email automatique, merci de ne pas y repondre.',
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
      <p>Bonjour ${clientName || 'Client'},</p>
      <p>Nous avons recu une demande de changement de mot de passe pour votre espace client COMAR.</p>
      <p>
        <a href="${resetUrl}" style="display:inline-block;padding:10px 16px;border-radius:8px;background:#1f4db3;color:#fff;text-decoration:none;font-weight:600;">
          Confirmer le changement de mot de passe
        </a>
      </p>
      <p>Ou copiez ce lien dans votre navigateur:<br /><span style="color:#1f4db3;">${resetUrl}</span></p>
      <p>Ce lien expire dans ${PASSWORD_RESET_EXPIRY}.</p>
      <p>Si vous n'etes pas a l'origine de cette demande, ignorez simplement cet email.</p>
      <p style="color:#6b7280; font-size: 12px;">Ceci est un email automatique, merci de ne pas y repondre.</p>
    </div>
  `;

  return transport.transporter.sendMail({
    from: transport.fromEmail,
    to: toEmail,
    subject,
    text,
    html,
  });
}

async function sendPasswordChangedConfirmationEmail({ toEmail, clientName, logger = console }) {
  const transport = buildSmtpTransport(logger);
  if (!transport) return;

  const subject = '[COMAR] Votre mot de passe a ete modifie';
  const text = [
    `Bonjour ${clientName || 'Client'},`,
    '',
    'Votre mot de passe PrestaTrack a ete modifie avec succes.',
    'Si ce changement ne vient pas de vous, contactez immediatement le support COMAR.',
    '',
    'Ceci est un email automatique, merci de ne pas y repondre.',
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
      <p>Bonjour ${clientName || 'Client'},</p>
      <p>Votre mot de passe PrestaTrack a ete modifie avec succes.</p>
      <p>Si ce changement ne vient pas de vous, contactez immediatement le support COMAR.</p>
      <p style="color:#6b7280; font-size: 12px;">Ceci est un email automatique, merci de ne pas y repondre.</p>
    </div>
  `;

  await transport.transporter.sendMail({
    from: transport.fromEmail,
    to: toEmail,
    subject,
    text,
    html,
  });
}

// ─── Validation rules ───────────────────────────────────────────────
const registerValidation = [
  body('nom_complet')
    .trim()
    .notEmpty().withMessage('Le nom complet est obligatoire.')
    .isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caractères.'),
  body('email')
    .trim()
    .notEmpty().withMessage("L'email est obligatoire.")
    .isEmail().withMessage("Format d'email invalide."),
  body('mot_de_passe')
    .notEmpty().withMessage('Le mot de passe est obligatoire.')
    .isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères.'),
  body('police_number')
    .trim()
    .notEmpty().withMessage('Le numéro de police est obligatoire.')
    .matches(POLICE_NUMBER_REGEX)
    .withMessage('Format numéro de police invalide. Format attendu: 12345678-9.'),
  body('telephone')
    .optional({ checkFalsy: true })
    .trim(),
  body('adresse')
    .optional({ checkFalsy: true })
    .trim(),
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage("L'email est obligatoire.")
    .isEmail().withMessage("Format d'email invalide."),
  body('mot_de_passe')
    .notEmpty().withMessage('Le mot de passe est obligatoire.'),
];

const passwordResetRequestValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage("L'email est obligatoire.")
    .isEmail().withMessage("Format d'email invalide."),
];

const passwordResetConfirmValidation = [
  body('token')
    .trim()
    .notEmpty().withMessage('Le token de confirmation est obligatoire.'),
  body('mot_de_passe')
    .notEmpty().withMessage('Le nouveau mot de passe est obligatoire.')
    .isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caracteres.'),
];

// ─── Helper: generate JWT ───────────────────────────────────────────
function generateToken(client) {
  return jwt.sign(
    {
      client_id: client.id,
      email: client.email,
      nom_complet: client.nom_complet,
      police_number: client.police_number || client.cin || null,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// ─── POST /api/clients/register ─────────────────────────────────────
router.post('/register', registerValidation, async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(e => e.msg);
    return res.status(400).json({ success: false, message: messages[0], errors: messages });
  }

  const { nom_complet, email, mot_de_passe, telephone, adresse, police_number } = req.body;
  const normalizedPoliceNumber = (police_number || '').trim();

  try {
    // Check if email already exists
    const { data: existingByEmail } = await supabase
      .from('clients')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingByEmail) {
      return res.status(409).json({
        success: false,
        message: 'Cet email est déjà utilisé. Veuillez vous connecter ou utiliser un autre email.'
      });
    }

    // The DB currently stores contract number in clients.cin for compatibility.
    const { data: existingByPolice } = await supabase
      .from('clients')
      .select('id')
      .eq('cin', normalizedPoliceNumber)
      .maybeSingle();

    if (existingByPolice) {
      return res.status(409).json({
        success: false,
        message: 'Ce numéro de police est déjà enregistré.'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const mot_de_passe_hash = await bcrypt.hash(mot_de_passe, salt);

    // Insert client
    const { data: newClient, error } = await supabase
      .from('clients')
      .insert({
        nom_complet,
        email,
        telephone: telephone || null,
        cin: normalizedPoliceNumber,
        adresse: adresse || null,
        mot_de_passe_hash,
        is_active: true,
      })
      .select('id, nom_complet, email, telephone, cin, adresse, created_at')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la création du compte. Veuillez réessayer.'
      });
    }

    // Generate JWT
    const token = generateToken(newClient);

    return res.status(201).json({
      success: true,
      message: 'Compte créé avec succès !',
      token,
      client: {
        id: newClient.id,
        nom_complet: newClient.nom_complet,
        email: newClient.email,
        telephone: newClient.telephone,
        police_number: newClient.cin,
        cin: newClient.cin,
        adresse: newClient.adresse,
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur. Veuillez réessayer.'
    });
  }
});

// ─── POST /api/clients/login ────────────────────────────────────────
router.post('/login', loginValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(e => e.msg);
    return res.status(400).json({ success: false, message: messages[0], errors: messages });
  }

  const { email, mot_de_passe } = req.body;

  try {
    // Fetch client by email
    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.error('Supabase query error:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur interne. Veuillez réessayer.'
      });
    }

    if (!client) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect.'
      });
    }

    if (!client.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Votre compte a été désactivé. Contactez le support.'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(mot_de_passe, client.mot_de_passe_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect.'
      });
    }

    // Generate JWT
    const token = generateToken(client);

    return res.status(200).json({
      success: true,
      message: 'Connexion réussie !',
      token,
      client: {
        id: client.id,
        nom_complet: client.nom_complet,
        email: client.email,
        telephone: client.telephone,
        police_number: client.police_number || client.cin,
        cin: client.cin,
        adresse: client.adresse,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur. Veuillez réessayer.'
    });
  }
});

// ─── POST /api/clients/password-reset/request ──────────────────────
router.post('/password-reset/request', passwordResetRequestValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return res.status(400).json({ success: false, message: messages[0], errors: messages });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      success: false,
      message: 'Service temporairement indisponible.',
    });
  }

  const normalizedEmail = String(req.body.email || '').trim().toLowerCase();

  try {
    const { data: client, error } = await supabase
      .from('clients')
      .select('id, nom_complet, email, is_active')
      .ilike('email', normalizedEmail)
      .maybeSingle();

    if (error) {
      console.error('Password reset request fetch error:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur. Veuillez reessayer.',
      });
    }

    if (client && client.is_active) {
      const resetToken = jwt.sign(
        {
          client_id: client.id,
          email: client.email,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: PASSWORD_RESET_EXPIRY,
          audience: PASSWORD_RESET_AUDIENCE,
          subject: String(client.id),
        }
      );

      const resetUrl = buildPasswordResetUrl(resetToken);
      await sendPasswordResetRequestEmail({
        toEmail: client.email,
        clientName: client.nom_complet,
        resetUrl,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Si un compte existe pour cet email, un lien de confirmation a ete envoye.',
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Impossible d\'envoyer l\'email de confirmation pour le moment.',
    });
  }
});

// ─── GET /api/clients/password-reset/verify ───────────────────────
router.get('/password-reset/verify', async (req, res) => {
  const token = String(req.query.token || '').trim();
  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Token de verification manquant.',
    });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      success: false,
      message: 'Service temporairement indisponible.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      audience: PASSWORD_RESET_AUDIENCE,
    });

    if (!decoded?.client_id || !decoded?.email) {
      throw new Error('Invalid token payload');
    }

    return res.status(200).json({
      success: true,
      message: 'Token valide.',
      data: {
        email: decoded.email,
      },
    });
  } catch (error) {
    const expired = error?.name === 'TokenExpiredError';
    return res.status(400).json({
      success: false,
      message: expired
        ? 'Le lien de confirmation a expire. Veuillez recommencer la procedure.'
        : 'Lien de confirmation invalide.',
    });
  }
});

// ─── POST /api/clients/password-reset/confirm ──────────────────────
router.post('/password-reset/confirm', passwordResetConfirmValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return res.status(400).json({ success: false, message: messages[0], errors: messages });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      success: false,
      message: 'Service temporairement indisponible.',
    });
  }

  const token = String(req.body.token || '').trim();
  const newPassword = String(req.body.mot_de_passe || '');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      audience: PASSWORD_RESET_AUDIENCE,
    });

    if (!decoded?.client_id || !decoded?.email) {
      return res.status(400).json({
        success: false,
        message: 'Lien de confirmation invalide.',
      });
    }

    const { data: client, error: fetchError } = await supabase
      .from('clients')
      .select('id, nom_complet, email, is_active')
      .eq('id', decoded.client_id)
      .ilike('email', decoded.email)
      .maybeSingle();

    if (fetchError) {
      console.error('Password reset confirm fetch error:', fetchError);
      return res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur. Veuillez reessayer.',
      });
    }

    if (!client || !client.is_active) {
      return res.status(404).json({
        success: false,
        message: 'Compte client introuvable ou inactif.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const mot_de_passe_hash = await bcrypt.hash(newPassword, salt);

    const { error: updateError } = await supabase
      .from('clients')
      .update({
        mot_de_passe_hash,
        updated_at: new Date().toISOString(),
      })
      .eq('id', client.id);

    if (updateError) {
      console.error('Password reset confirm update error:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Impossible de modifier le mot de passe pour le moment.',
      });
    }

    sendPasswordChangedConfirmationEmail({
      toEmail: client.email,
      clientName: client.nom_complet,
    }).catch((emailError) => {
      console.error('Password changed confirmation email error:', emailError.message);
    });

    return res.status(200).json({
      success: true,
      message: 'Votre mot de passe a ete mis a jour avec succes.',
    });
  } catch (error) {
    const expired = error?.name === 'TokenExpiredError';
    return res.status(400).json({
      success: false,
      message: expired
        ? 'Le lien de confirmation a expire. Veuillez recommencer la procedure.'
        : 'Lien de confirmation invalide.',
    });
  }
});

// ─── GET /api/clients/me ───────────────────────────────────────────
router.get('/me', authenticateClient, async (req, res) => {
  try {
    const { data: client, error } = await supabase
      .from('clients')
      .select('id, nom_complet, email, telephone, cin, adresse, is_active, created_at, updated_at')
      .eq('id', req.client.id)
      .maybeSingle();

    if (error) {
      console.error('Profile fetch error:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors du chargement du profil.'
      });
    }

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Profil client introuvable.'
      });
    }

    return res.status(200).json({
      success: true,
      client: {
        id: client.id,
        nom_complet: client.nom_complet,
        email: client.email,
        telephone: client.telephone,
        police_number: client.cin,
        cin: client.cin,
        adresse: client.adresse,
        is_active: client.is_active,
        created_at: client.created_at,
        updated_at: client.updated_at,
      }
    });
  } catch (error) {
    console.error('Profile route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur.'
    });
  }
});

module.exports = router;
