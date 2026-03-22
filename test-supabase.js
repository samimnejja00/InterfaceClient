// Test rapide pour vérifier la configuration Supabase
import { supabase } from './src/config/supabaseClient.js';

console.log('=== DEBUG SUPABASE ===');
console.log('Supabase URL:', process.env.REACT_APP_SUPABASE_URL);
console.log('Supabase Key exists:', !!process.env.REACT_APP_SUPABASE_ANON_KEY);
console.log('Supabase Key length:', process.env.REACT_APP_SUPABASE_ANON_KEY?.length);

// Test de connexion
supabase.from('profiles').select('*').limit(1).then(result => {
  console.log('Test connexion Supabase:', result);
}).catch(error => {
  console.error('Erreur connexion Supabase:', error);
});
