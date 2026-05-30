# Server - Clients routes

## But et utilite

- But et utilite: Ce routeur gere l'inscription, la connexion et le reset mot de passe.

## File

- server/routes/clients.js

## Base path

- /api/clients

## Routes

- POST /register
  - Validates nom_complet, email, mot_de_passe, police_number
  - Stores police number in clients.cin (compat)
  - Hashes password (bcrypt)
  - Returns JWT (7d) + client data

- POST /login
  - Validates email + mot_de_passe
  - Checks is_active
  - Returns JWT (7d) + client data

- GET /me
  - Protected (authenticateClient)
  - Returns client profile for req.client.id

- POST /password-reset/request
  - Sends reset email via SMTP
  - JWT audience: client-password-reset
  - Expiry: CLIENT_PASSWORD_RESET_TOKEN_EXPIRY (default 20m)
  - Link: CLIENT_APP_BASE_URL/reset-password?token=...

- GET /password-reset/verify
  - Verifies reset token

- POST /password-reset/confirm
  - Verifies token, hashes new password, updates DB
  - Sends confirmation email

## Tables

- clients
