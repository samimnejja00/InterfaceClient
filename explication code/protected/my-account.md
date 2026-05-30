# MyAccount

## But et utilite

- But et utilite: Cette page affiche le profil client et les actions compte.

## Route

- /mon-compte (protected)

## Data flow

- fetchClientProfile()
- Fallback to AuthContext client if profile route not found

## API

- GET /api/clients/me (fallback: /api/clients/profile)

## Notes

- Displays profile fields and account status
- Links to /forgot-password with email query
