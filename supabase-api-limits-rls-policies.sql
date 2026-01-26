-- ============================================
-- API Limits RLS Policies
-- Permissions pour les admins uniquement
-- ============================================

-- Activer RLS sur les tables (si pas déjà fait)
ALTER TABLE api_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_limits_history ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES POUR api_limits
-- ============================================

-- Permettre aux admins de lire toutes les limites
CREATE POLICY "Admins can view all api limits"
    ON api_limits
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- Permettre aux admins de mettre à jour les limites
CREATE POLICY "Admins can update api limits"
    ON api_limits
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- Permettre aux admins d'insérer de nouvelles limites
CREATE POLICY "Admins can insert api limits"
    ON api_limits
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- ============================================
-- POLICIES POUR api_limits_history
-- ============================================

-- Permettre aux admins de lire l'historique
CREATE POLICY "Admins can view api limits history"
    ON api_limits_history
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- Permettre aux admins d'insérer dans l'historique
CREATE POLICY "Admins can insert into api limits history"
    ON api_limits_history
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Afficher toutes les policies créées
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
WHERE tablename IN ('api_limits', 'api_limits_history')
ORDER BY tablename, policyname;

-- Message de succès
DO $$
BEGIN
    RAISE NOTICE '✅ RLS Policies created successfully!';
    RAISE NOTICE '✅ Admins can now read and update API limits';
    RAISE NOTICE '✅ Admins can view limits history';
END $$;
