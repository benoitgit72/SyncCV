-- ============================================
-- CV Info RLS Policies (RECREATION)
-- Supprime et recrée les policies pour cv_info
-- ============================================

-- Activer RLS sur cv_info (si pas déjà fait)
ALTER TABLE cv_info ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SUPPRESSION DES ANCIENNES POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view their own cv_info" ON cv_info;
DROP POLICY IF EXISTS "Users can update their own cv_info" ON cv_info;
DROP POLICY IF EXISTS "Users can insert their own cv_info" ON cv_info;
DROP POLICY IF EXISTS "Public can view all cv_info" ON cv_info;

-- ============================================
-- CRÉATION DES NOUVELLES POLICIES
-- ============================================

-- Politique 1: Permettre aux utilisateurs de lire leurs propres données
CREATE POLICY "Users can view their own cv_info"
    ON cv_info
    FOR SELECT
    USING (auth.uid() = user_id);

-- Politique 2: Permettre aux utilisateurs de mettre à jour leurs propres données
CREATE POLICY "Users can update their own cv_info"
    ON cv_info
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Politique 3: Permettre aux utilisateurs de créer leurs propres données
CREATE POLICY "Users can insert their own cv_info"
    ON cv_info
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Politique 4: Permettre l'accès public en lecture (pour les CV publiques)
-- Cette policy permet à n'importe qui de lire les cv_info (nécessaire pour afficher les CV publiques)
CREATE POLICY "Public can view all cv_info"
    ON cv_info
    FOR SELECT
    USING (true);

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Afficher toutes les policies créées pour cv_info
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

-- Message de succès
DO $$
BEGIN
    RAISE NOTICE '✅ RLS Policies created successfully for cv_info!';
    RAISE NOTICE '✅ Users can now read and update their own CV info';
    RAISE NOTICE '✅ Public access enabled for displaying public CVs';
END $$;
