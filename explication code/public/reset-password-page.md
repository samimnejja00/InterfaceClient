# ResetPasswordPage

## But et utilite

- But et utilite: Cette page permet de verifier le token et changer le mot de passe.

## Route

- /reset-password?token=...

## Data flow

- verifyPasswordResetToken(token) on load
- confirmPasswordReset({ token, mot_de_passe }) on submit
- On success: redirect to /login

## API

- GET /api/clients/password-reset/verify?token=...
- POST /api/clients/password-reset/confirm
