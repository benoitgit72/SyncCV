-- ============================================
-- Script pour ajouter un nouvel utilisateur dans SyncCV
-- ============================================

-- ÉTAPES PRÉALABLES:
-- 1. Créer l'utilisateur dans Supabase Auth:
--    - Allez dans Authentication → Users
--    - Cliquez "Add user" → "Create new user"
--    - Entrez email et mot de passe (ou envoyez invitation)
--    - Copiez l'UUID généré (format: 12345678-1234-1234-1234-123456789abc)

-- 2. Remplacez les valeurs suivantes dans ce script:
--    - YOUR_USER_ID_HERE : UUID de l'utilisateur créé
--    - YOUR_SLUG_HERE : slug unique pour l'URL (ex: john-doe)
--    - YOUR_NAME_HERE : nom complet
--    - YOUR_EMAIL_HERE : email de contact (peut être différent de auth)
--    - Autres informations personnelles

-- ============================================
-- CONFIGURATION: Remplacez ces valeurs
-- ============================================

-- UUID de l'utilisateur (copié depuis Supabase Auth)
DO $$
DECLARE
    v_user_id UUID := 'YOUR_USER_ID_HERE';  -- ⚠️ REMPLACER ICI
    v_slug TEXT := 'YOUR_SLUG_HERE';         -- ⚠️ REMPLACER ICI (ex: john-doe)
BEGIN

-- ============================================
-- 1. Créer le profil utilisateur
-- ============================================

INSERT INTO profiles (id, slug, template_id, subscription_status, theme, created_at, updated_at)
VALUES (
    v_user_id,                  -- ID de l'utilisateur (lié à auth.users)
    v_slug,                     -- Slug unique pour l'URL du CV (ex: john-doe)
    1,                          -- Template ID (1, 2 ou 3)
    'trial',                    -- Statut: 'trial', 'active', 'cancelled', 'expired'
    'purple-gradient',          -- Theme: 'purple-gradient', 'ocean-blue', 'forest-green'
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE
SET
    slug = EXCLUDED.slug,
    template_id = EXCLUDED.template_id,
    subscription_status = EXCLUDED.subscription_status,
    theme = EXCLUDED.theme,
    updated_at = NOW();

RAISE NOTICE '✅ Profil créé pour user_id: % avec slug: %', v_user_id, v_slug;

-- ============================================
-- 2. Créer les informations du CV
-- ============================================

INSERT INTO cv_info (
    user_id,
    nom,
    titre,
    titre_en,
    email,
    telephone,
    bio,
    bio_en,
    linkedin,
    github,
    photo_url,
    formspree_id,
    stat1_fr,
    stat1_en,
    stat2_fr,
    stat2_en,
    stat3_fr,
    stat3_en,
    updated_at
)
VALUES (
    v_user_id,
    'YOUR_NAME_HERE',                           -- ⚠️ Nom complet (ex: John Doe)
    'YOUR_TITLE_FR_HERE',                       -- ⚠️ Titre professionnel en français
    'YOUR_TITLE_EN_HERE',                       -- ⚠️ Titre professionnel en anglais
    'YOUR_EMAIL_HERE',                          -- ⚠️ Email de contact
    'YOUR_PHONE_HERE',                          -- ⚠️ Téléphone (optionnel, peut être NULL)
    'YOUR_BIO_FR_HERE',                         -- ⚠️ Biographie en français
    'YOUR_BIO_EN_HERE',                         -- ⚠️ Biographie en anglais
    'https://www.linkedin.com/in/your-profile', -- ⚠️ LinkedIn URL (optionnel, NULL si absent)
    'https://github.com/your-username',         -- ⚠️ GitHub URL (optionnel, NULL si absent)
    NULL,                                       -- Photo URL (sera uploadée plus tard via admin)
    NULL,                                       -- Formspree ID (à configurer plus tard)
    NULL,                                       -- Statistiques générées plus tard par l'IA
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NOW()
)
ON CONFLICT (user_id) DO UPDATE
SET
    nom = EXCLUDED.nom,
    titre = EXCLUDED.titre,
    titre_en = EXCLUDED.titre_en,
    email = EXCLUDED.email,
    telephone = EXCLUDED.telephone,
    bio = EXCLUDED.bio,
    bio_en = EXCLUDED.bio_en,
    linkedin = EXCLUDED.linkedin,
    github = EXCLUDED.github,
    updated_at = NOW();

RAISE NOTICE '✅ CV info créé pour: %', v_user_id;

-- ============================================
-- 3. Ajouter une expérience exemple (optionnel)
-- ============================================

INSERT INTO experiences (
    user_id,
    titre,
    titre_en,
    entreprise,
    entreprise_en,
    periode_debut,
    periode_fin,
    en_cours,
    description,
    description_en,
    competences,
    ordre
)
VALUES (
    v_user_id,
    'Titre du poste en français',              -- ⚠️ Titre
    'Job title in English',                    -- ⚠️ Titre EN
    'Nom de l''entreprise',                    -- ⚠️ Entreprise
    'Company name',                            -- ⚠️ Entreprise EN (NULL si identique)
    '2024-01-01',                              -- ⚠️ Date de début (format YYYY-MM-DD)
    NULL,                                      -- Date de fin (NULL si en cours)
    TRUE,                                      -- En cours (TRUE/FALSE)
    'Description du poste en français avec réalisations',
    'Job description in English with achievements',
    ARRAY['Compétence 1', 'Compétence 2'],    -- Array de compétences
    1                                          -- Ordre d'affichage (1 = plus récent)
);

RAISE NOTICE '✅ Expérience exemple ajoutée';

-- ============================================
-- 4. Ajouter une formation exemple (optionnel)
-- ============================================

INSERT INTO formations (
    user_id,
    diplome,
    diplome_en,
    institution,
    institution_en,
    annee_debut,
    annee_fin,
    description,
    description_en,
    ordre
)
VALUES (
    v_user_id,
    'Nom du diplôme en français',              -- ⚠️ Diplôme
    'Degree name in English',                  -- ⚠️ Diplôme EN
    'Nom de l''institution',                   -- ⚠️ Institution
    'Institution name',                        -- ⚠️ Institution EN (NULL si identique)
    2020,                                      -- Année de début
    2024,                                      -- Année de fin (NULL si en cours)
    'Description de la formation en français',
    'Education description in English',
    1                                          -- Ordre d'affichage
);

RAISE NOTICE '✅ Formation exemple ajoutée';

-- ============================================
-- 5. Ajouter des compétences exemples (optionnel)
-- ============================================

INSERT INTO competences (user_id, categorie, categorie_en, competence, competence_en, niveau, niveau_en, ordre)
VALUES
    (v_user_id, 'Langages de Programmation', 'Programming Languages', 'Python', 'Python', 'Expert', 'Expert', 1),
    (v_user_id, 'Langages de Programmation', 'Programming Languages', 'JavaScript', 'JavaScript', 'Avancé', 'Advanced', 2),
    (v_user_id, 'Bases de Données', 'Databases', 'PostgreSQL', 'PostgreSQL', 'Avancé', 'Advanced', 1),
    (v_user_id, 'Outils', 'Tools', 'Git', 'Git', 'Expert', 'Expert', 1);

RAISE NOTICE '✅ Compétences exemples ajoutées';

-- ============================================
-- Vérification finale
-- ============================================

RAISE NOTICE '';
RAISE NOTICE '========================================';
RAISE NOTICE '✅ Utilisateur créé avec succès!';
RAISE NOTICE '========================================';
RAISE NOTICE '';
RAISE NOTICE 'User ID: %', v_user_id;
RAISE NOTICE 'Slug: %', v_slug;
RAISE NOTICE 'URL du CV: https://synccv.vercel.app/%', v_slug;
RAISE NOTICE '';
RAISE NOTICE 'Prochaines étapes:';
RAISE NOTICE '1. Connexion à l''admin: https://synccv.vercel.app/admin_cv/';
RAISE NOTICE '2. Compléter les informations dans chaque section';
RAISE NOTICE '3. Uploader une photo de profil';
RAISE NOTICE '4. Générer des statistiques personnalisées';
RAISE NOTICE '5. Configurer Formspree pour le formulaire de contact';
RAISE NOTICE '';

END $$;

-- ============================================
-- Requêtes de vérification (optionnelles)
-- ============================================

-- Vérifier le profil créé
SELECT * FROM profiles WHERE slug = 'YOUR_SLUG_HERE';

-- Vérifier les infos CV
SELECT id, user_id, nom, titre, email FROM cv_info WHERE user_id = 'YOUR_USER_ID_HERE';

-- Vérifier les expériences
SELECT id, titre, entreprise, periode_debut, en_cours FROM experiences WHERE user_id = 'YOUR_USER_ID_HERE' ORDER BY ordre;

-- Vérifier les formations
SELECT id, diplome, institution, annee_debut FROM formations WHERE user_id = 'YOUR_USER_ID_HERE' ORDER BY ordre;

-- Vérifier les compétences
SELECT categorie, competence, niveau FROM competences WHERE user_id = 'YOUR_USER_ID_HERE' ORDER BY categorie, ordre;
