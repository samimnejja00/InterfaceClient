# MyRequests

## But et utilite

- But et utilite: Cette page liste les dossiers du client avec des filtres UI.

## Route

- /my-requests (protected)

## Data flow

- fetchClientDossiers() then map to table rows
- Client-side filters: status, type, search

## API

- GET /api/dossiers

## Notes

- Uses dossierStatus utils for display status
- Extracts demande_initiale from dossier_details_rc or dossier.demande_initiale
