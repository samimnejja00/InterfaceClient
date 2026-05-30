# SignUpPage

## But et utilite

- But et utilite: Cette page d'inscription legacy utilise Supabase mais n'est plus branchee.

## Route

- Not used in router (App.jsx redirects /signup -> /register)

## Data flow

- Uses authService.signUp(email, password, { name, clientNumber, phone })
- On success: shows success then redirects to /login

## DB / Supabase

- Supabase auth signUp
- Updates clients table with phone/client_number

## Notes

- Legacy page, route is not active
