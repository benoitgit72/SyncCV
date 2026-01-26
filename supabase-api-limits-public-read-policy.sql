-- ============================================
-- API Limits - Public Read Policy
-- Permet la lecture publique des limites (nécessaire pour les APIs)
-- ============================================

-- Ajouter une policy de lecture publique pour api_limits
-- (Les endpoints publics comme chat.js, translate.js ont besoin de lire les limites)
CREATE POLICY IF NOT EXISTS "Public can read api limits"
    ON api_limits
    FOR SELECT
    USING (true);

-- Vérification
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'api_limits' AND policyname = 'Public can read api limits';
