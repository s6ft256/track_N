-- Supabase Database Schema for HSE Inspection Report System
-- Run this in your Supabase SQL Editor

-- Create assessors table
CREATE TABLE IF NOT EXISTS assessors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    assessor_id TEXT UNIQUE NOT NULL,
    department TEXT,
    certification TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create observations table
CREATE TABLE IF NOT EXISTS observations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assessor_id UUID REFERENCES assessors(id),
    location TEXT NOT NULL,
    observation TEXT NOT NULL,
    risk_level TEXT CHECK (risk_level IN ('High', 'Medium', 'Low')),
    action_taken TEXT,
    responsible TEXT,
    photos JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('inspection-photos', 'inspection-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for inspection-photos bucket
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
CREATE POLICY "Allow public uploads" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'inspection-photos');

-- Grant public read access to the 'inspection-photos' bucket for anonymous users.
-- This allows anyone with the link to view the images.
DROP POLICY IF EXISTS "Allow public downloads" ON storage.objects;
CREATE POLICY "Allow public downloads" ON storage.objects
    FOR SELECT TO anon
    USING (bucket_id = 'inspection-photos');

DROP POLICY IF EXISTS "Allow public deletes" ON storage.objects;
CREATE POLICY "Allow public deletes" ON storage.objects
    FOR DELETE USING (bucket_id = 'inspection-photos');

-- Alternative: If above policies don't work, disable RLS on storage.objects
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Row Level Security (RLS) policies
ALTER TABLE assessors ENABLE ROW LEVEL SECURITY;
ALTER TABLE observations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all assessors
DROP POLICY IF EXISTS "Allow read access to assessors" ON assessors;
CREATE POLICY "Allow read access to assessors" ON assessors
    FOR SELECT USING (true);

-- Policy: Users can insert/update their own assessor record
DROP POLICY IF EXISTS "Allow insert/update own assessor" ON assessors;
CREATE POLICY "Allow insert/update own assessor" ON assessors
    FOR ALL USING (true);

-- Policy: Users can read all observations
DROP POLICY IF EXISTS "Allow read access to observations" ON observations;
CREATE POLICY "Allow read access to observations" ON observations
    FOR SELECT USING (true);

-- Policy: Users can insert/update/delete observations
DROP POLICY IF EXISTS "Allow full access to observations" ON observations;
CREATE POLICY "Allow full access to observations" ON observations
    FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assessors_assessor_id ON assessors(assessor_id);
CREATE INDEX IF NOT EXISTS idx_observations_assessor_id ON observations(assessor_id);
CREATE INDEX IF NOT EXISTS idx_observations_created_at ON observations(created_at);
CREATE INDEX IF NOT EXISTS idx_observations_risk_level ON observations(risk_level);

-- ==========================================================
-- Trainings, User Preferences, and Custom Responsible Names
-- (needed by front-end migration from localStorage to Supabase)
-- ==========================================================

-- Trainings table (camelCase columns quoted to match front-end)
CREATE TABLE IF NOT EXISTS trainings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    date DATE,
    time TEXT,
    instructor TEXT,
    presenter TEXT,
    description TEXT,
    "isCertification" BOOLEAN DEFAULT FALSE,
    type TEXT,
    status TEXT,
    "completionDate" DATE,
    "trainingDate" DATE,
    location TEXT,
    category TEXT,
    "keyPoints" TEXT,
    "safetyConsiderations" TEXT,
    "requiresEquipment" BOOLEAN,
    "requiredEquipment" TEXT,
    duration INTEGER,
    "validityPeriod" INTEGER,
    "issuingOrg" TEXT,
    "certificateNumber" TEXT,
    "issuedDate" DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "trainings_read_all" ON trainings;
CREATE POLICY "trainings_read_all" ON trainings FOR SELECT USING (true);
DROP POLICY IF EXISTS "trainings_full_access" ON trainings;
CREATE POLICY "trainings_full_access" ON trainings FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_trainings_date ON trainings(date);
CREATE INDEX IF NOT EXISTS idx_trainings_created_at ON trainings(created_at);

-- User preferences (store theme per user)
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID PRIMARY KEY,
    theme TEXT CHECK (theme IN ('light','dark')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
-- Only the owner can read/write their preferences
DROP POLICY IF EXISTS "user_prefs_select_own" ON user_preferences;
CREATE POLICY "user_prefs_select_own" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "user_prefs_upsert_own" ON user_preferences;
CREATE POLICY "user_prefs_upsert_own" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "user_prefs_update_own" ON user_preferences;
CREATE POLICY "user_prefs_update_own" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Custom responsible names
CREATE TABLE IF NOT EXISTS custom_responsible_names (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE custom_responsible_names ENABLE ROW LEVEL SECURITY;
-- Allow public read and insert (adjust later if needed)
DROP POLICY IF EXISTS "crn_read_all" ON custom_responsible_names;
CREATE POLICY "crn_read_all" ON custom_responsible_names FOR SELECT USING (true);
DROP POLICY IF EXISTS "crn_insert_all" ON custom_responsible_names;
CREATE POLICY "crn_insert_all" ON custom_responsible_names FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "crn_delete_all" ON custom_responsible_names;
CREATE POLICY "crn_delete_all" ON custom_responsible_names FOR DELETE USING (true);

-- Toolbox Talks
CREATE TABLE IF NOT EXISTS toolbox_talks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    topic TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    duration INTEGER NOT NULL,
    location TEXT NOT NULL,
    presenter TEXT NOT NULL,
    attendees TEXT[] DEFAULT '{}'::TEXT[],
    key_points TEXT[] DEFAULT '{}'::TEXT[],
    discussion_notes TEXT,
    follow_up_actions TEXT,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE toolbox_talks ENABLE ROW LEVEL SECURITY;

-- Policies for Toolbox Talks
DROP POLICY IF EXISTS "toolbox_talks_view_all" ON toolbox_talks;
CREATE POLICY "toolbox_talks_view_all" ON toolbox_talks
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "toolbox_talks_insert_own" ON toolbox_talks;
CREATE POLICY "toolbox_talks_insert_own" ON toolbox_talks
    FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "toolbox_talks_update_own" ON toolbox_talks;
CREATE POLICY "toolbox_talks_update_own" ON toolbox_talks
    FOR UPDATE USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "toolbox_talks_delete_own" ON toolbox_talks;
CREATE POLICY "toolbox_talks_delete_own" ON toolbox_talks
    FOR DELETE USING (auth.uid() = created_by);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_toolbox_talks_date ON toolbox_talks(date);
CREATE INDEX IF NOT EXISTS idx_toolbox_talks_created_by ON toolbox_talks(created_by);
