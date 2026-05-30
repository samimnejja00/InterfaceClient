# Server - Dossiers routes

## But et utilite

- But et utilite: Ce routeur gere la creation et la consultation des dossiers, plus l'upload des pieces.

## File

- server/routes/dossiers.js

## Base path

- /api/dossiers

## Routes

- GET /agences
  - Lists agences (id, code, nom, adresse)

- POST /
  - Protected
  - Validates agence_id, demande_initiale, motif_instance
  - Loads client profile to get nom_complet + cin
  - Uploads files to storage bucket pieces_justificatives
  - Inserts dossiers + dossier_details_rc
  - date_reception uses sentinel 1970-01-01 (pending validation)
  - Inserts historique_actions: "Dossier soumis par le client"

- GET /
  - Protected
  - Lists client dossiers with agences + dossier_details_rc
  - Adds montant from dossier_details_prestation
  - Flags is_cancelled via historique_actions

- GET /:id
  - Protected
  - Returns dossier details + historique_actions
  - Adds dossier_details_prestation + montant

## Tables

- dossiers
- agences
- dossier_details_rc
- dossier_details_prestation
- historique_actions

## Storage

- pieces_justificatives
