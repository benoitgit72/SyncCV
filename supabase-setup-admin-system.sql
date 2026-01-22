-- ============================================
-- Admin System Setup for SyncCV
-- ============================================
-- This script creates the necessary tables and policies for:
-- 1. Admin user identification (is_admin column)
-- 2. CV visit tracking (cv_visits table)
-- 3. Admin communication system (admin_messages table)
-- ============================================

-- 1. Add is_admin column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create index for efficient admin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin
ON profiles(is_admin) WHERE is_admin = TRUE;

-- 2. Create cv_visits table for tracking visits
CREATE TABLE IF NOT EXISTS cv_visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  slug TEXT NOT NULL,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT,
  referrer TEXT
);

-- Indexes for cv_visits (optimize query performance)
CREATE INDEX IF NOT EXISTS idx_cv_visits_user_id
ON cv_visits(user_id);

CREATE INDEX IF NOT EXISTS idx_cv_visits_slug
ON cv_visits(slug);

CREATE INDEX IF NOT EXISTS idx_cv_visits_visited_at
ON cv_visits(visited_at DESC);

-- Enable Row Level Security on cv_visits
ALTER TABLE cv_visits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent script)
DROP POLICY IF EXISTS "Anyone can insert cv_visits" ON cv_visits;
DROP POLICY IF EXISTS "Admins can view all cv_visits" ON cv_visits;
DROP POLICY IF EXISTS "Users can view their own cv_visits" ON cv_visits;

-- RLS Policy: Anyone can insert visits (public CV tracking)
CREATE POLICY "Anyone can insert cv_visits"
  ON cv_visits FOR INSERT
  WITH CHECK (true);

-- RLS Policy: Admins can view all visits
CREATE POLICY "Admins can view all cv_visits"
  ON cv_visits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );

-- RLS Policy: Users can view their own visits
CREATE POLICY "Users can view their own cv_visits"
  ON cv_visits FOR SELECT
  USING (auth.uid() = user_id);

-- 3. Create admin_messages table for communication
CREATE TABLE IF NOT EXISTS admin_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  sent_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  recipient_count INTEGER DEFAULT 0
);

-- Index for admin_messages (efficient sorting by date)
CREATE INDEX IF NOT EXISTS idx_admin_messages_sent_at
ON admin_messages(sent_at DESC);

-- Enable Row Level Security on admin_messages
ALTER TABLE admin_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can insert messages" ON admin_messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON admin_messages;

-- RLS Policy: Only admins can create messages
CREATE POLICY "Admins can insert messages"
  ON admin_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );

-- RLS Policy: Only admins can view messages
CREATE POLICY "Admins can view all messages"
  ON admin_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );

-- ============================================
-- Confirmation Message
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Admin system setup complete!';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  - cv_visits (visit tracking)';
  RAISE NOTICE '  - admin_messages (communication)';
  RAISE NOTICE '';
  RAISE NOTICE 'Column added:';
  RAISE NOTICE '  - profiles.is_admin';
  RAISE NOTICE '';
  RAISE NOTICE 'RLS policies configured for admin-only access';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  NEXT STEP: Grant admin rights to your user';
  RAISE NOTICE '';
  RAISE NOTICE 'To make a user an admin, run one of these queries:';
  RAISE NOTICE '';
  RAISE NOTICE '-- Option 1: By slug (recommended)';
  RAISE NOTICE 'UPDATE profiles SET is_admin = TRUE WHERE slug = ''ron-more'';';
  RAISE NOTICE '';
  RAISE NOTICE '-- Option 2: By GitHub username';
  RAISE NOTICE 'UPDATE profiles SET is_admin = TRUE WHERE id = (';
  RAISE NOTICE '  SELECT id FROM auth.users';
  RAISE NOTICE '  WHERE raw_user_meta_data->>''user_name'' = ''benoitgit72''';
  RAISE NOTICE ');';
  RAISE NOTICE '';
END $$;
