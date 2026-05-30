# Dashboard

## But et utilite

- But et utilite: Ce tableau de bord affiche les stats client et les dossiers recents.

## Route

- /home (protected)

## Data flow

- fetchClientDossiers() on mount
- Builds stats from dossier.etat and cancellation flag
- Shows recent dossiers (first 5)

## API

- GET /api/dossiers

## Notes

- Uses dossierStatus utils for display status and badges
