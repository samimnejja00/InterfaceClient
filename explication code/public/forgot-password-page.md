# ForgotPasswordPage

## But et utilite

- But et utilite: Cette page permet de demander un reset de mot de passe.

## Route

- /forgot-password

## Data flow

- Calls requestPasswordReset({ email })
- Shows success or error message

## API

- POST /api/clients/password-reset/request
