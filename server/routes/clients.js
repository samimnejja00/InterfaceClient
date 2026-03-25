const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const supabase = require('../config/supabase');

const router = express.Router();

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
  body('telephone')
    .optional({ checkFalsy: true })
    .trim(),
  body('cin')
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

// ─── Helper: generate JWT ───────────────────────────────────────────
function generateToken(client) {
  return jwt.sign(
    {
      client_id: client.id,
      email: client.email,
      nom_complet: client.nom_complet,
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

  const { nom_complet, email, mot_de_passe, telephone, cin, adresse } = req.body;

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

    // Check if CIN already exists (if provided)
    if (cin) {
      const { data: existingByCin } = await supabase
        .from('clients')
        .select('id')
        .eq('cin', cin)
        .maybeSingle();

      if (existingByCin) {
        return res.status(409).json({
          success: false,
          message: 'Ce numéro CIN est déjà enregistré.'
        });
      }
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
        cin: cin || null,
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

module.exports = router;
