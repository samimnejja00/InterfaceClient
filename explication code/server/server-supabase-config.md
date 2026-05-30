# Server - Supabase config

## But et utilite

- But et utilite: Ce module configure le client Supabase service role cote serveur.

## File

- server/config/supabase.js

## Role

- Uses SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
- Creates Supabase client with service role key
- Exits process if env vars missing
