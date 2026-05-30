# Server - Email notifier

## But et utilite

- But et utilite: Ce service envoie des emails de suivi en surveillant l'historique.

## File

- server/services/emailNotifier.js

## Role

- Polls historique_actions for progress events
- Sends email updates to client

## Config

- EMAIL_NOTIFIER_ENABLED (default true)
- EMAIL_NOTIFIER_POLL_MS (default 30000, min 5000)
- EMAIL_NOTIFIER_STATE_FILE (default server/.cache/email-notifier-state.json)
- SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM

## Data usage

- Reads dossiers + clients + agences for context
- Detects progress via old_status/new_status or keywords

## Tables

- historique_actions
- dossiers
- clients
- agences
