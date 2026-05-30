# SoumettreDossier

## But et utilite

- But et utilite: Cette page permet de soumettre un dossier avec choix d'agence et pieces jointes.

## Route

- /soumettre-dossier (protected)

## Data flow

- fetchAgences() to populate agency list
- submitDossier(FormData) with fields + files
- On success: shows success summary with request number

## API

- GET /api/dossiers/agences
- POST /api/dossiers (multipart/form-data)

## Notes

- Uses client.police_number or client.cin from AuthContext
- Validates max 5 files and 5MB per file
