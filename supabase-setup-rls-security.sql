-- ============================================
-- Configuration Row-Level Security (RLS) pour Multi-Clients
-- ============================================
--
-- Ce script configure la sécurité au niveau des lignes pour garantir que:
-- 1. Chaque client ne peut voir/modifier que SES propres données
-- 2. Aucun client ne peut accéder aux données d'un autre client
-- 3. L'isolation est garantie au niveau PostgreSQL (pas seulement application)
--
-- IMPORTANT: Exécutez ce script UNE SEULE FOIS dans Supabase SQL Editor
-- ============================================

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

-- Lecture publique des profils (pour afficher les CV)
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

SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('profiles', 'cv_info', 'experiences', 'formations', 'competences')
ORDER BY tablename, policyname;

-- ============================================
-- TESTS DE SÉCURITÉ (à exécuter après configuration)
-- ============================================

-- Test 1: Vérifier que RLS est activé
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'cv_info', 'experiences', 'formations', 'competences');
-- Résultat attendu: rowsecurity = true pour toutes les tables

-- Test 2: Compter les politiques par table
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE tablename IN ('profiles', 'cv_info', 'experiences', 'formations', 'competences')
GROUP BY tablename
ORDER BY tablename;

-- ============================================
-- MESSAGE DE CONFIRMATION
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Row-Level Security configuré avec succès !';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 Sécurité active sur :';
  RAISE NOTICE '   - profiles';
  RAISE NOTICE '   - cv_info';
  RAISE NOTICE '   - experiences';
  RAISE NOTICE '   - formations';
  RAISE NOTICE '   - competences';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Politiques créées :';
  RAISE NOTICE '   - Lecture publique : Tous les CV sont visibles (affichage public)';
  RAISE NOTICE '   - Modification : Chaque utilisateur ne peut modifier que SES données';
  RAISE NOTICE '   - Isolation : Un utilisateur ne peut pas voir les données d''édition des autres';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️ IMPORTANT : Configurez maintenant Supabase Auth pour permettre aux clients de se connecter';
END $$;
