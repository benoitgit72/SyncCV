-- ============================================
-- Correction des politiques RLS pour permettre l'accès public
-- ============================================

-- IMPORTANT: Ce script permet l'accès public en lecture aux profils via le slug
-- Cela est nécessaire pour que les CV soient accessibles sans authentification

-- 1. Supprimer l'ancienne politique restrictive sur profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- 2. Créer une nouvelle politique pour permettre l'accès public par slug
CREATE POLICY "Anyone can view profiles by slug"
  ON profiles FOR SELECT
  USING (true); -- Accès public en lecture

-- 3. Garder la politique de mise à jour restreinte (seulement le propriétaire)
-- La politique "Users can update their own profile" reste inchangée

-- Vérifier que la politique a été créée
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
WHERE tablename = 'profiles';
