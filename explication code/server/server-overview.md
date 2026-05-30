# Server Overview

## But et utilite

- But et utilite: Ce fichier d'entree serveur demarre l'API Express et monte les routes.

## Entry point

- server/index.js
- Starts Express on PORT (default 5000)
- CORS allows http://localhost:* only
- Mounts routes:
  - /api/clients
  - /api/dossiers
  - /api/notifications
  - /notifications (same router)
- Starts email notifier on boot

## Health

- GET /api/health -> { status: "ok" }
