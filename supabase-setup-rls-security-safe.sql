-- ============================================
-- Configuration Row-Level Security (RLS) pour Multi-Clients
-- VERSION SÉCURISÉE - Gère les politiques existantes
-- ============================================
--
-- Ce script peut être exécuté plusieurs fois sans erreur
-- Il supprime et recrée toutes les politiques RLS
--
-- IMPORTANT: Exécutez ce script dans Supabase SQL Editor
-- ============================================

-- ============================================
-- ÉTAPE 0: Supprimer toutes les politiques existantes
-- ============================================

-- Supprimer les politiques de profiles
DROP POLICY IF EXISTS "Public can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;

-- Supprimer les politiques de cv_info
DROP POLICY IF EXISTS "Public can read all cv_info" ON cv_info;
DROP POLICY IF EXISTS "Users can view their own cv_info" ON cv_info;
DROP POLICY IF EXISTS "Users can update their own cv_info" ON cv_info;
DROP POLICY IF EXISTS "Users can insert their own cv_info" ON cv_info;
DROP POLICY IF EXISTS "Users can delete their own cv_info" ON cv_info;

-- Supprimer les politiques de experiences
DROP POLICY IF EXISTS "Public can read all experiences" ON experiences;
DROP POLICY IF EXISTS "Users can view their own experiences" ON experiences;
DROP POLICY IF EXISTS "Users can update their own experiences" ON experiences;
DROP POLICY IF EXISTS "Users can insert their own experiences" ON experiences;
DROP POLICY IF EXISTS "Users can delete their own experiences" ON experiences;

-- Supprimer les politiques de formations
DROP POLICY IF EXISTS "Public can read all formations" ON formations;
DROP POLICY IF EXISTS "Users can view their own formations" ON formations;
DROP POLICY IF EXISTS "Users can update their own formations" ON formations;
DROP POLICY IF EXISTS "Users can insert their own formations" ON formations;
DROP POLICY IF EXISTS "Users can delete their own formations" ON formations;
DROP POLICY IF EXISTS "Users can delete leur own formations" ON formations; -- Ancienne version avec typo

-- Supprimer les politiques de competences
DROP POLICY IF EXISTS "Public can read all competences" ON competences;
DROP POLICY IF EXISTS "Users can view their own competences" ON competences;
DROP POLICY IF EXISTS "Users can update their own competences" ON competences;
DROP POLICY IF EXISTS "Users can insert their own competences" ON competences;
DROP POLICY IF EXISTS "Users can delete their own competences" ON competences;

-- ============================================
-- ÉTAPE 1: Activer RLS sur toutes les tables
-- ============================================

-- Activer RLS sur la table profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Activer RLS sur la table cv_info
ALTER TABLE cv_info ENABLE ROW LEVEL SECURITY;

-- Activer RLS sur la table experiences
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;

-- Activer RLS sur la table formations
ALTER TABLE formations ENABLE ROW LEVEL SECURITY;

-- Activer RLS sur la table competences
ALTER TABLE competences ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ÉTAPE 2: Politiques pour la table PROFILES
-- ============================================

-- Lecture publique des profils (pour afficher les CV par slug)
CREATE POLICY "Public can read all profiles"
ON profiles
FOR SELECT
USING (true);

-- Les utilisateurs authentifiés peuvent voir leur propre profil
CREATE POLICY "Users can view their own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);

-- Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Les utilisateurs peuvent insérer leur propre profil
CREATE POLICY "Users can insert their own profile"
ON profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- ============================================
-- ÉTAPE 3: Politiques pour la table CV_INFO
-- ============================================

-- Lecture publique des CV (pour affichage public)
CREATE POLICY "Public can read all cv_info"
ON cv_info
FOR SELECT
USING (true);

-- Les utilisateurs peuvent voir leur propre CV
CREATE POLICY "Users can view their own cv_info"
ON cv_info
FOR SELECT
USING (auth.uid() = user_id);

-- Les utilisateurs peuvent mettre à jour leur propre CV
CREATE POLICY "Users can update their own cv_info"
ON cv_info
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent insérer leur propre CV
CREATE POLICY "Users can insert their own cv_info"
ON cv_info
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent supprimer leur propre CV
CREATE POLICY "Users can delete their own cv_info"
ON cv_info
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- ÉTAPE 4: Politiques pour la table EXPERIENCES
-- ============================================

-- Lecture publique des expériences (pour affichage public des CV)
CREATE POLICY "Public can read all experiences"
ON experiences
FOR SELECT
USING (true);

-- Les utilisateurs peuvent voir leurs propres expériences
CREATE POLICY "Users can view their own experiences"
ON experiences
FOR SELECT
USING (auth.uid() = user_id);

-- Les utilisateurs peuvent mettre à jour leurs propres expériences
CREATE POLICY "Users can update their own experiences"
ON experiences
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent insérer leurs propres expériences
CREATE POLICY "Users can insert their own experiences"
ON experiences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent supprimer leurs propres expériences
CREATE POLICY "Users can delete their own experiences"
ON experiences
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- ÉTAPE 5: Politiques pour la table FORMATIONS
-- ============================================

-- Lecture publique des formations
CREATE POLICY "Public can read all formations"
ON formations
FOR SELECT
USING (true);

-- Les utilisateurs peuvent voir leurs propres formations
CREATE POLICY "Users can view their own formations"
ON formations
FOR SELECT
USING (auth.uid() = user_id);

-- Les utilisateurs peuvent mettre à jour leurs propres formations
CREATE POLICY "Users can update their own formations"
ON formations
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent insérer leurs propres formations
CREATE POLICY "Users can insert their own formations"
ON formations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent supprimer leurs propres formations
CREATE POLICY "Users can delete their own formations"
ON formations
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- ÉTAPE 6: Politiques pour la table COMPETENCES
-- ============================================

-- Lecture publique des compétences
CREATE POLICY "Public can read all competences"
ON competences
FOR SELECT
USING (true);

-- Les utilisateurs peuvent voir leurs propres compétences
CREATE POLICY "Users can view their own competences"
ON competences
FOR SELECT
USING (auth.uid() = user_id);

-- Les utilisateurs peuvent mettre à jour leurs propres compétences
CREATE POLICY "Users can update their own competences"
ON competences
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent insérer leurs propres compétences
CREATE POLICY "Users can insert their own competences"
ON competences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent supprimer leurs propres compétences
CREATE POLICY "Users can delete their own competences"
ON competences
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- VÉRIFICATION: Afficher toutes les politiques créées
-- ============================================

SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd,
    CASE
        WHEN qual IS NOT NULL THEN 'USING: ' || qual
        ELSE 'No USING clause'
    END as using_clause,
    CASE
        WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check
        ELSE 'No WITH CHECK'
    END as with_check_clause
FROM pg_policies
WHERE tablename IN ('profiles', 'cv_info', 'experiences', 'formations', 'competences')
ORDER BY tablename, cmd, policyname;

-- ============================================
-- TESTS DE SÉCURITÉ
-- ============================================

-- Test 1: Vérifier que RLS est activé
SELECT
    tablename,
    rowsecurity,
    CASE
        WHEN rowsecurity THEN '✅ RLS Activé'
        ELSE '❌ RLS Désactivé'
    END as status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'cv_info', 'experiences', 'formations', 'competences')
ORDER BY tablename;

-- Test 2: Compter les politiques par table
SELECT
    tablename,
    COUNT(*) as policy_count,
    CASE
        WHEN COUNT(*) >= 4 THEN '✅ Complet'
        ELSE '⚠️ Incomplet'
    END as status
FROM pg_policies
WHERE tablename IN ('profiles', 'cv_info', 'experiences', 'formations', 'competences')
GROUP BY tablename
ORDER BY tablename;

-- Test 3: Résumé par type d'opération
SELECT
    tablename,
    cmd as operation,
    COUNT(*) as count
FROM pg_policies
WHERE tablename IN ('profiles', 'cv_info', 'experiences', 'formations', 'competences')
GROUP BY tablename, cmd
ORDER BY tablename, cmd;

-- ============================================
-- MESSAGE DE CONFIRMATION
-- ============================================

DO $$
DECLARE
    total_policies INTEGER;
    rls_enabled_count INTEGER;
BEGIN
    -- Compter les politiques
    SELECT COUNT(*) INTO total_policies
    FROM pg_policies
    WHERE tablename IN ('profiles', 'cv_info', 'experiences', 'formations', 'competences');

    -- Compter les tables avec RLS activé
    SELECT COUNT(*) INTO rls_enabled_count
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'cv_info', 'experiences', 'formations', 'competences')
    AND rowsecurity = true;

    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════════';
    RAISE NOTICE '✅ Row-Level Security configuré avec succès !';
    RAISE NOTICE '════════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '🔒 Statistiques :';
    RAISE NOTICE '   - Tables avec RLS activé : % / 5', rls_enabled_count;
    RAISE NOTICE '   - Politiques créées : %', total_policies;
    RAISE NOTICE '';
    RAISE NOTICE '📋 Tables sécurisées :';
    RAISE NOTICE '   ✓ profiles';
    RAISE NOTICE '   ✓ cv_info';
    RAISE NOTICE '   ✓ experiences';
    RAISE NOTICE '   ✓ formations';
    RAISE NOTICE '   ✓ competences';
    RAISE NOTICE '';
    RAISE NOTICE '🔐 Politiques de sécurité :';
    RAISE NOTICE '   ✓ Lecture publique : Tous les CV visibles (affichage public)';
    RAISE NOTICE '   ✓ Modification privée : Chaque utilisateur modifie UNIQUEMENT ses données';
    RAISE NOTICE '   ✓ Isolation totale : user_id = auth.uid()';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  PROCHAINES ÉTAPES :';
    RAISE NOTICE '   1. Créer des comptes utilisateurs dans Authentication';
    RAISE NOTICE '   2. Chaque user_id dans les tables DOIT correspondre à auth.uid()';
    RAISE NOTICE '   3. Tester l''isolation en vous connectant avec différents comptes';
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════════';
    RAISE NOTICE '';
END $$;
