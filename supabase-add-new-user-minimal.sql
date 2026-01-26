-- ============================================
-- Script MINIMAL pour ajouter un nouvel utilisateur dans SyncCV
-- Version simplifiée - Les données seront ajoutées via l'interface admin
-- ============================================

-- ÉTAPE 1: Créer l'utilisateur dans Supabase Auth UI
--   1. Allez dans Authentication → Users → Add user
--   2. Créez l'utilisateur avec email et mot de passe
--   3. Copiez l'UUID généré

-- ÉTAPE 2: Remplacez les 3 valeurs ci-dessous
--   - YOUR_USER_ID_HERE : UUID copié depuis Supabase Auth
--   - YOUR_SLUG_HERE : slug unique pour l'URL (ex: john-doe)
--   - YOUR_NAME_HERE : nom complet de la personne

-- ============================================
-- Valeurs à remplacer
-- ============================================

DO $$
DECLARE
    v_user_id UUID := 'YOUR_USER_ID_HERE';    -- ⚠️ REMPLACER par l'UUID
    v_slug TEXT := 'YOUR_SLUG_HERE';          -- ⚠️ REMPLACER (ex: john-doe)
    v_name TEXT := 'YOUR_NAME_HERE';          -- ⚠️ REMPLACER (ex: John Doe)
BEGIN

-- Créer le profil utilisateur
INSERT INTO profiles (id, slug, template_id, subscription_status, theme, created_at, updated_at)
VALUES (
    v_user_id,
    v_slug,
    1,                          -- Template par défaut
    'trial',                    -- Statut trial
    'purple-gradient',          -- Theme par défaut
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE
SET slug = EXCLUDED.slug, updated_at = NOW();

-- Créer les informations de base du CV
INSERT INTO cv_info (user_id, nom, updated_at)
VALUES (
    v_user_id,
    v_name,
    NOW()
)
ON CONFLICT (user_id) DO UPDATE
SET nom = EXCLUDED.nom, updated_at = NOW();

-- Message de confirmation
RAISE NOTICE '========================================';
RAISE NOTICE '✅ Utilisateur créé avec succès!';
RAISE NOTICE '========================================';
RAISE NOTICE 'User ID: %', v_user_id;
RAISE NOTICE 'Slug: %', v_slug;
RAISE NOTICE 'Nom: %', v_name;
RAISE NOTICE '';
RAISE NOTICE '📝 URL du CV: https://synccv.vercel.app/%', v_slug;
RAISE NOTICE '🔐 URL admin: https://synccv.vercel.app/admin_cv/';
RAISE NOTICE '';
RAISE NOTICE 'Prochaines étapes:';
RAISE NOTICE '1. Se connecter à l''admin avec l''email créé';
RAISE NOTICE '2. Compléter toutes les sections (Expériences, Formations, Compétences)';
RAISE NOTICE '3. Uploader une photo de profil';
RAISE NOTICE '4. Générer les statistiques personnalisées';
RAISE NOTICE '5. Configurer Formspree pour le formulaire de contact';

END $$;

-- ============================================
-- Vérification (optionnel)
-- ============================================

-- Décommentez pour vérifier la création:
-- SELECT p.slug, p.theme, c.nom
-- FROM profiles p
-- JOIN cv_info c ON c.user_id = p.id
-- WHERE p.slug = 'YOUR_SLUG_HERE';
