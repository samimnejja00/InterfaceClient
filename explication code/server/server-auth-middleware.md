# Server - authenticateClient

## But et utilite

- But et utilite: Ce middleware protege les routes client en validant le JWT.

## File

- server/middleware/authenticateClient.js

## Role

- Checks Authorization: Bearer <jwt>
- Verifies JWT with JWT_SECRET
- Injects req.client { id, email, nom_complet, police_number }

## Errors

- 401 if missing or invalid token
- 401 if token expired
