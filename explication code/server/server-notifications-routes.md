# Server - Notifications routes

## But et utilite

- But et utilite: Ce routeur expose les notifications client et les endpoints d'emailing.

## File

- server/routes/notifications.js

## Base path

- /api/notifications (also mounted at /notifications)

## Routes

- GET /
  - Protected
  - Loads client dossiers
  - Fetches historique_actions for those dossiers
  - Filters to milestone/status changes
  - Returns a normalized list for the client UI

- GET /emailing/status
  - Returns SMTP + notifier status

- POST /emailing/test
  - Sends a test progress email
  - Optional body: dossier_id

## Tables

- dossiers
- historique_actions
- agences
