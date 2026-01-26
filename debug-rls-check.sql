-- Script de vérification des RLS policies
-- Exécutez ceci dans Supabase SQL Editor et donnez-moi le résultat

-- 1. Vérifier si RLS est activé sur cv_info
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'cv_info' AND schemaname = 'public';

-- 2. Lister toutes les policies sur cv_info
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'cv_info'
ORDER BY policyname;

-- 3. Vérifier si RLS est activé sur cv_visits
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'cv_visits' AND schemaname = 'public';

-- 4. Lister les policies sur cv_visits
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'cv_visits'
ORDER BY policyname;

-- 5. Vérifier la structure de profiles (is_admin existe?)
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name IN ('id', 'is_admin');
