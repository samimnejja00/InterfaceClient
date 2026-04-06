const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const supabase = require('../config/supabase');
const authenticateClient = require('../middleware/authenticateClient');

const router = express.Router();

const DEMANDE_INITIALE_OPTIONS = [
  'Rachat Total',
  'Rachat Partiel',
  'Rachat Échu',
  'Transfert Contrat',
  'Autre',
];
const POLICE_NUMBER_REGEX = /^\d{8}-\d$/;

function buildRequestNumber(dossierId) {
  return `DEM-${String(dossierId || '').slice(0, 8).toUpperCase()}`;
}

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
  body('agence_id')
    .trim()
    .notEmpty().withMessage("L'agence est obligatoire.")
    .isUUID().withMessage("Identifiant d'agence invalide."),
  body('demande_initiale')
    .trim()
    .notEmpty().withMessage('La demande initiale est obligatoire.')
    .isIn([...DEMANDE_INITIALE_OPTIONS, 'Rachat Echu']).withMessage('Demande initiale invalide.'),
  body('motif_instance')
    .trim()
    .notEmpty().withMessage("Le motif d'instance est obligatoire.")
    .isLength({ min: 5 }).withMessage("Le motif d'instance doit contenir au moins 5 caractères."),
  body('telephone')
    .optional({ checkFalsy: true })
    .trim(),
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

  const { agence_id, demande_initiale, motif_instance, telephone } = req.body;
  const client_id = req.client.id;
  const normalizedDemandeInitiale = demande_initiale === 'Rachat Echu' ? 'Rachat Échu' : demande_initiale;

  try {
    // Resolve client identity and contract number from account.
    const { data: clientProfile, error: clientError } = await supabase
      .from('clients')
      .select('nom_complet, cin')
      .eq('id', client_id)
      .maybeSingle();

    if (clientError) {
      console.error('Client profile fetch error:', clientError);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du profil client.'
      });
    }

    const souscripteur = clientProfile?.nom_complet || req.client.nom_complet;
    const policeNumber = (clientProfile?.cin || req.client.police_number || '').trim();

    if (!souscripteur) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de déterminer le souscripteur depuis votre compte.'
      });
    }

    if (!policeNumber) {
      return res.status(400).json({
        success: false,
        message: 'Aucun numéro de police trouvé sur votre compte. Veuillez contacter le support.'
      });
    }

    if (!POLICE_NUMBER_REGEX.test(policeNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Le numéro de police de votre compte est invalide. Format attendu: 12345678-9.'
      });
    }

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
        police_number: policeNumber,
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

    // Step 2: Create dossier_details_rc using the same structure as internal platform
    const { error: detailsError } = await supabase
      .from('dossier_details_rc')
      .insert({
        dossier_id: dossier.id,
        date_reception: new Date().toISOString().split('T')[0], // TODAY
        telephone: telephone || null,
        demande_initiale: normalizedDemandeInitiale,
        motif_instance,
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
        action: 'Dossier soumis par le client',
        description: `Demande initiale: ${normalizedDemandeInitiale}`,
        old_status: null,
        new_status: 'RELATION_CLIENT',
      });

    return res.status(201).json({
      success: true,
      message: 'Votre dossier a été soumis avec succès !',
      dossier: {
        id: dossier.id,
        request_number: buildRequestNumber(dossier.id),
        souscripteur: dossier.souscripteur,
        police_number: dossier.police_number,
        niveau: dossier.niveau,
        etat: dossier.etat,
        demande_initiale: normalizedDemandeInitiale,
        motif_instance,
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
      data: (dossiers || []).map((dossier) => ({
        ...dossier,
        request_number: buildRequestNumber(dossier.id),
      }))
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
      data: {
        ...dossier,
        request_number: buildRequestNumber(dossier.id),
      },
      historique: historique || []
    });
  } catch (error) {
    console.error('Fetch dossier error general:', error);
    return res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
  }
});

module.exports = router;
