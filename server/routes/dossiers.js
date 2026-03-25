const express = require('express');
const { body, validationResult } = require('express-validator');
const supabase = require('../config/supabase');
const authenticateClient = require('../middleware/authenticateClient');

const router = express.Router();

// All routes here require client authentication
router.use(authenticateClient);

// ─── Validation rules ───────────────────────────────────────────────
const dossierValidation = [
  body('souscripteur')
    .trim()
    .notEmpty().withMessage('Le nom du souscripteur est obligatoire.'),
  body('police_number')
    .trim()
    .notEmpty().withMessage('Le numéro de police est obligatoire.'),
  body('agence_id')
    .trim()
    .notEmpty().withMessage("L'agence est obligatoire.")
    .isUUID().withMessage("Identifiant d'agence invalide."),
  body('type_prestation')
    .trim()
    .notEmpty().withMessage('Le type de prestation est obligatoire.')
    .isIn(['Décès', 'Rachat', 'Échéance']).withMessage('Type de prestation invalide. Valeurs acceptées : Décès, Rachat, Échéance.'),
  body('demande_initiale')
    .trim()
    .notEmpty().withMessage('La description de la demande est obligatoire.')
    .isLength({ min: 10 }).withMessage('La description doit contenir au moins 10 caractères.'),
];

// ─── GET /api/dossiers/agences — Liste des agences ──────────────────
router.get('/agences', async (req, res) => {
  try {
    const { data: agences, error } = await supabase
      .from('agences')
      .select('id, code, nom, adresse')
      .order('nom', { ascending: true });

    if (error) {
      console.error('Fetch agences error:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors du chargement des agences.'
      });
    }

    return res.status(200).json({
      success: true,
      data: agences || []
    });
  } catch (error) {
    console.error('Agences error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur.'
    });
  }
});

// ─── POST /api/dossiers — Soumission d'un dossier ──────────────────
router.post('/', dossierValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(e => e.msg);
    return res.status(400).json({ success: false, message: messages[0], errors: messages });
  }

  const { souscripteur, police_number, agence_id, type_prestation, demande_initiale } = req.body;
  const client_id = req.client.id;

  try {
    // Verify agence exists
    const { data: agence } = await supabase
      .from('agences')
      .select('id')
      .eq('id', agence_id)
      .maybeSingle();

    if (!agence) {
      return res.status(400).json({
        success: false,
        message: "L'agence sélectionnée n'existe pas."
      });
    }

    // Step 1: Create dossier
    const { data: dossier, error: dossierError } = await supabase
      .from('dossiers')
      .insert({
        souscripteur,
        police_number,
        agence_id,
        client_id,
        niveau: 'RELATION_CLIENT',
        etat: 'EN_COURS',
        is_urgent: false,
        created_by: null, // Client, not an internal agent
      })
      .select('id, souscripteur, police_number, niveau, etat, is_urgent, created_at')
      .single();

    if (dossierError) {
      console.error('Dossier insert error:', dossierError);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la création du dossier. Veuillez réessayer.'
      });
    }

    // Step 2: Create dossier_details_rc
    const { error: detailsError } = await supabase
      .from('dossier_details_rc')
      .insert({
        dossier_id: dossier.id,
        date_reception: new Date().toISOString().split('T')[0], // TODAY
        demande_initiale,
        motif_instance: 'Nouvelle demande client',
      });

    if (detailsError) {
      console.error('Dossier details insert error:', detailsError);
      // Rollback: delete the dossier if details failed
      await supabase.from('dossiers').delete().eq('id', dossier.id);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la création des détails du dossier. Veuillez réessayer.'
      });
    }

    // Step 3: Log action in historique_actions
    await supabase
      .from('historique_actions')
      .insert({
        dossier_id: dossier.id,
        user_id: null,
        action: `Dossier soumis par le client (${type_prestation})`,
        old_status: null,
        new_status: 'EN_COURS',
      });

    return res.status(201).json({
      success: true,
      message: 'Votre dossier a été soumis avec succès !',
      dossier: {
        id: dossier.id,
        souscripteur: dossier.souscripteur,
        police_number: dossier.police_number,
        niveau: dossier.niveau,
        etat: dossier.etat,
        type_prestation,
        created_at: dossier.created_at,
      }
    });
  } catch (error) {
    console.error('Create dossier error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur. Veuillez réessayer.'
    });
  }
});

// ─── GET /api/dossiers — Récupérer les dossiers du client ───────────
router.get('/', async (req, res) => {
  try {
    const { data: dossiers, error } = await supabase
      .from('dossiers')
      .select(`
        id, souscripteur, police_number, niveau, etat, is_urgent, created_at, updated_at,
        agences ( id, nom, code ),
        dossier_details_rc ( date_reception, demande_initiale, motif_instance )
      `)
      .eq('client_id', req.client.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch dossiers error:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors du chargement de vos dossiers.'
      });
    }

    return res.status(200).json({
      success: true,
      data: dossiers || []
    });
  } catch (error) {
    console.error('Dossiers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur.'
    });
  }
});

module.exports = router;
