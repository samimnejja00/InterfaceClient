const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const supabase = require('../config/supabase');
const authenticateClient = require('../middleware/authenticateClient');

const router = express.Router();

// Multer setup for memory storage (file buffers)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  }
});

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
router.post('/', upload.single('piece_justificative'), dossierValidation, async (req, res) => {
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

    let piece_justificative_url = null;

    // Upload file to Supabase if present
    if (req.file) {
      const fileExt = req.file.originalname.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${client_id}/${fileName}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pieces_justificatives')
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('File upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de l\'upload de la pièce justificative. Veuillez réessayer.'
        });
      }

      // Get public URL (assuming the bucket is public, or we can just store the path)
      const { data: publicURLData } = supabase.storage
        .from('pieces_justificatives')
        .getPublicUrl(filePath);

      piece_justificative_url = publicURLData.publicUrl;
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
        piece_justificative_url // On l'ajoute ici
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

    // Step 2: Create dossier_details_rc (includes type_prestation in demande_initiale)
    const { error: detailsError } = await supabase
      .from('dossier_details_rc')
      .insert({
        dossier_id: dossier.id,
        date_reception: new Date().toISOString().split('T')[0], // TODAY
        demande_initiale: `[${type_prestation}] ${demande_initiale}`,
        motif_instance: `Nouvelle demande client - ${type_prestation}`,
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

// GET /api/dossiers/:id — Récupérer un dossier spécifique du client avec son historique
router.get('/:id', async (req, res) => {
  try {
    const { data: dossier, error: dossierError } = await supabase
      .from('dossiers')
      .select(`
        *,
        agences ( id, nom, code ),
        dossier_details_rc ( date_reception, demande_initiale, motif_instance ) 
      `)
      .eq('id', req.params.id)
      .eq('client_id', req.client.id)
      .maybeSingle();

    if (dossierError || !dossier) {
      console.error('Dossier fetch error:', dossierError);
      return res.status(404).json({ success: false, message: 'Erreur Supabase: ' + (dossierError ? dossierError.message : 'Not found') + ' details: ' + JSON.stringify(dossierError) });
    }

    const { data: historique } = await supabase
      .from('historique_actions')
      .select('*')
      .eq('dossier_id', req.params.id)
      .order('created_at', { ascending: true });

    return res.status(200).json({
      success: true,
      data: dossier,
      historique: historique || []
    });
  } catch (error) {
    console.error('Fetch dossier error general:', error);
    return res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
  }
});

module.exports = router;
