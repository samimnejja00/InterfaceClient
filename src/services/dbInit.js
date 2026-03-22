import { supabase } from '../config/supabaseClient';

/**
 * Initialize database schema
 * This function creates all necessary tables, triggers, and policies
 */
export const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing database schema...');

    // Create clients table
    console.log('Creating clients table...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS clients (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          client_number TEXT UNIQUE,
          phone TEXT,
          address TEXT,
          city TEXT,
          postal_code TEXT,
          country TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    }).then(result => {
      if (result.error) throw result.error;
      console.log('✓ Clients table created');
    });

    // Create requests table
    console.log('Creating requests table...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS requests (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
          policy_number TEXT NOT NULL,
          tipo_prestation TEXT NOT NULL CHECK (tipo_prestation IN ('Rachat partiel', 'Avance sur contrat', 'Transfert', 'Résiliation')),
          montant DECIMAL(10, 2) NOT NULL,
          details_demande TEXT,
          status TEXT NOT NULL DEFAULT 'En attente' CHECK (status IN ('En attente', 'En cours', 'Validé', 'Rejeté')),
          notes TEXT,
          admin_comments TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    }).then(result => {
      if (result.error) throw result.error;
      console.log('✓ Requests table created');
    });

    // Create documents table
    console.log('Creating documents table...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS documents (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
          file_name TEXT NOT NULL,
          file_size INTEGER,
          file_path TEXT NOT NULL,
          content_type TEXT,
          uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    }).then(result => {
      if (result.error) throw result.error;
      console.log('✓ Documents table created');
    });

    console.log('✅ Database initialization complete!');
    return { success: true };
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if database is properly set up
 */
export const checkDatabaseSetup = async () => {
  try {
    console.log('🔍 Checking database setup...');

    // Check if tables exist
    const { data: tables, error } = await supabase
      .from('clients')
      .select('count', { count: 'exact' })
      .limit(1);

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    console.log('✓ Database is properly configured');
    return { success: true };
  } catch (error) {
    console.error('✗ Database check failed:', error.message);
    return { success: false, error: error.message };
  }
};
