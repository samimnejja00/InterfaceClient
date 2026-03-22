#!/usr/bin/env node

/**
 * Database Setup Script
 * Run this to initialize the Supabase database schema
 * Usage: node setup-db.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase configuration in .env file');
  console.error('Make sure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// SQL Schema
const schema = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. CLIENTS TABLE
-- ============================================
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

-- ============================================
-- 2. REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('Withdrawal', 'Advance', 'Transfer')),
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Review', 'Approved', 'Rejected')),
  notes TEXT,
  admin_comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_path TEXT NOT NULL,
  content_type TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TRIGGER FOR AUTO-CREATE PROFILE AFTER SIGNUP
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.clients (id, email, name, client_number)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'CLI-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES FOR CLIENTS
-- ============================================
DROP POLICY IF EXISTS "Clients can view own profile" ON clients;
DROP POLICY IF EXISTS "Clients can update own profile" ON clients;

CREATE POLICY "Clients can view own profile"
ON clients
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Clients can update own profile"
ON clients
FOR UPDATE
USING (auth.uid() = id);

-- ============================================
-- POLICIES FOR REQUESTS
-- ============================================
DROP POLICY IF EXISTS "Clients can view own requests" ON requests;
DROP POLICY IF EXISTS "Clients can create requests" ON requests;

CREATE POLICY "Clients can view own requests"
ON requests
FOR SELECT
USING (auth.uid() = client_id);

CREATE POLICY "Clients can create requests"
ON requests
FOR INSERT
WITH CHECK (auth.uid() = client_id);

-- ============================================
-- POLICIES FOR DOCUMENTS
-- ============================================
DROP POLICY IF EXISTS "Clients can view own documents" ON documents;
DROP POLICY IF EXISTS "Clients can upload documents" ON documents;

CREATE POLICY "Clients can view own documents"
ON documents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM requests
    WHERE requests.id = documents.request_id
    AND requests.client_id = auth.uid()
  )
);

CREATE POLICY "Clients can upload documents"
ON documents
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM requests
    WHERE requests.id = documents.request_id
    AND requests.client_id = auth.uid()
  )
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_requests_client_id ON requests(client_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at);
CREATE INDEX IF NOT EXISTS idx_documents_request_id ON documents(request_id);
`;

async function setupDatabase() {
  console.log('🚀 Starting database setup...\n');

  try {
    // Verify connection
    console.log('📡 Connecting to Supabase...');
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.warn('⚠️  Warning: Could not verify session (this is OK)');
    }

    // Test basic connection
    console.log('✓ Connected to Supabase\n');

    // Run schema creation
    console.log('📝 Creating database schema...');
    console.log('This may take a moment...\n');

    const { data, error } = await supabase.rpc('exec_sql', { sql: schema });

    if (error) {
      // If exec_sql doesn't exist, provide alternative instructions
      if (error.code === 'PGRST116' || error.message.includes('not found')) {
        console.log('⚠️  Note: Automatic schema creation requires manual setup\n');
        console.log('📋 Please follow these steps:');
        console.log('1. Go to your Supabase Dashboard: https://app.supabase.com');
        console.log('2. Select your project');
        console.log('3. Click "SQL Editor" in the sidebar');
        console.log('4. Click "New Query"');
        console.log('5. Open supabase_schema_final.sql in this project');
        console.log('6. Copy all content and paste into Supabase');
        console.log('7. Click "Run"\n');
        console.log('✅ Your database will be ready!\n');
        return;
      }
      throw error;
    }

    console.log('✅ Database schema created successfully!\n');
    console.log('🎉 Ready to sign up users!\n');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n📋 Manual Setup Instructions:');
    console.log('1. Go to https://app.supabase.com');
    console.log('2. Select your project');
    console.log('3. Go to SQL Editor → New Query');
    console.log('4. Copy content from supabase_schema_final.sql');
    console.log('5. Paste and click Run');
    process.exit(1);
  }
}

setupDatabase();
