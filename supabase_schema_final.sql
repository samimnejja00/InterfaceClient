-- Supabase schema for PrestaTrack client interface
-- Run this once in Supabase SQL Editor to create all tables, triggers and policies

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
-- 4. CLIENT QUESTIONS TABLE (AI Assistant)
-- ============================================
CREATE TABLE IF NOT EXISTS client_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  request_id UUID REFERENCES requests(id) ON DELETE SET NULL,
  question TEXT NOT NULL,
  question_type TEXT CHECK (question_type IN ('form_related', 'general', 'support')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'resolved')),
  answer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  answered_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT
);

-- ============================================
-- POLICIES FOR CLIENT QUESTIONS
-- ============================================
DROP POLICY IF EXISTS "Clients can view own questions" ON client_questions;
DROP POLICY IF EXISTS "Clients can create questions" ON client_questions;
DROP POLICY IF EXISTS "Clients can update own questions" ON client_questions;

CREATE POLICY "Clients can view own questions"
ON client_questions
FOR SELECT
USING (auth.uid() = client_id);

CREATE POLICY "Clients can create questions"
ON client_questions
FOR INSERT
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update own questions"
ON client_questions
FOR UPDATE
USING (auth.uid() = client_id);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_requests_client_id ON requests(client_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_client_questions_client_id ON client_questions(client_id);
CREATE INDEX IF NOT EXISTS idx_client_questions_status ON client_questions(status);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at);
CREATE INDEX IF NOT EXISTS idx_documents_request_id ON documents(request_id);

