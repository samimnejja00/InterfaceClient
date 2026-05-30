# RegisterPage

## But et utilite

- But et utilite: Cette page permet de creer un compte client via l'API.

## Route

- /register

## Data flow

- Validates fields (password, police format)
- Calls registerClient({ nom_complet, email, mot_de_passe, police_number, telephone, adresse })
- On success: setAuthClient(result.client), redirect /home after 2s

## API

- POST /api/clients/register (clientApi)
- Stores client_token and client_data in localStorage

## Storage

- localStorage: client_token, client_data
