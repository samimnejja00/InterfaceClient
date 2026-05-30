# RequestDetails

## But et utilite

- But et utilite: Cette page affiche le detail d'un dossier et sa timeline.

## Route

- /request-details/:requestId (protected)

## Data flow

- fetchClientDossierById(requestId)
- Uses response.historique to build timeline
- Derives status labels and cancellation flow

## API

- GET /api/dossiers/:id

## Notes

- Uses dossierStatus helpers (normalizeAction, isCancellationAction)
- Builds a custom timeline for validation, gestion, traitement, cloture
