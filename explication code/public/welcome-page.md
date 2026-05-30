# WelcomePage

## But et utilite

- But et utilite: Cette page d'accueil publique oriente le client selon son etat d'auth.

## Route

- /

## Role

- Public landing page
- Uses auth state to show CTA buttons

## Data flow

- No API calls
- Reads isAuthenticated from AuthContext

## Notes

- Buttons redirect to /login, /register, /soumettre-dossier, /my-requests
