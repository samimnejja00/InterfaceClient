# LoginPage

## But et utilite

- But et utilite: Cette page permet au client de se connecter et d'ouvrir une session locale.

## Route

- /login

## Data flow

- Calls loginClient({ email, mot_de_passe })
- On success: setAuthClient(result.client), navigate /home
- If already authenticated: redirect to /home

## API

- POST /api/clients/login (clientApi)
- Stores client_token and client_data in localStorage

## Storage

- localStorage: client_token, client_data
