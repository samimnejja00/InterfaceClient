import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://hsldywkbdhtzaglbounm.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzbGR5d2tiZGh0emFnbGJvdW5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MDQ0NTgsImV4cCI6MjA4OTM4MDQ1OH0.ZU2lJnsHWa12rVJ92E8graH68bHReHX9wt8j-f-JOKg';

export const supabaseConfigured = true;
export const supabaseConfigError = null;

// IMPORTANT: never throw during module import (it would blank-screen the whole app).
export const supabase = supabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null;

export function getSupabaseOrThrow() {
  if (!supabaseConfigured || !supabase) {
    throw new Error(supabaseConfigError || 'Supabase is not configured');
  }
  return supabase;
}
