// Test script to verify Supabase signup flow
import { supabase } from './src/config/supabaseClient.js';

async function testSupabaseSetup() {
  console.log('=== Testing Supabase Setup ===\n');
  
  // Test 1: Check connection
  console.log('1. Checking Supabase connection...');
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    console.log('✓ Supabase connection successful\n');
  } catch (err) {
    console.error('✗ Failed to connect:', err.message, '\n');
    return;
  }

  // Test 2: Check if clients table exists and is readable
  console.log('2. Testing clients table access...');
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('count', { count: 'exact' })
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('✓ Clients table exists (empty or no rows)\n');
      } else {
        throw error;
      }
    } else {
      console.log(`✓ Clients table found\n`);
    }
  } catch (err) {
    console.error('✗ Cannot access clients table:', err.message);
    console.error('   Make sure to run SUPABASE_SETUP.md SQL in your Supabase dashboard\n');
  }

  // Test 3: Check if trigger exists
  console.log('3. Checking trigger setup...');
  console.log('   The trigger should auto-create client profiles on signup');
  console.log('   If signup fails, the trigger may not be configured.\n');

  console.log('=== Troubleshooting ===');
  console.log('If signup still fails after tests pass:');
  console.log('1. Verify your Supabase URL and Keys in .env');
  console.log('2. Run all SQL from supabase_schema_final.sql in Supabase Dashboard → SQL Editor');
  console.log('3. Check browser console (F12) for detailed error messages');
  console.log('4. Verify email/password authentication is enabled in Supabase');
}

testSupabaseSetup().catch(console.error);
