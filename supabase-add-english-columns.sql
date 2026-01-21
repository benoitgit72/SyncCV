-- ============================================
-- Ajout des colonnes anglaises pour support bilingue FR/EN
-- ============================================

-- IMPORTANT: Exécutez ce script dans Supabase SQL Editor
-- Ce script ajoute des colonnes _en (English) à toutes les tables

-- ============================================
-- 1. Table cv_info - Ajouter colonnes anglaises
-- ============================================

ALTER TABLE cv_info
ADD COLUMN IF NOT EXISTS titre_en TEXT,
ADD COLUMN IF NOT EXISTS bio_en TEXT;

COMMENT ON COLUMN cv_info.titre_en IS 'Job title in English';
COMMENT ON COLUMN cv_info.bio_en IS 'Biography in English';

-- ============================================
-- 2. Table experiences - Ajouter colonnes anglaises
-- ============================================

ALTER TABLE experiences
ADD COLUMN IF NOT EXISTS titre_en TEXT,
ADD COLUMN IF NOT EXISTS entreprise_en TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT;

COMMENT ON COLUMN experiences.titre_en IS 'Job title in English';
COMMENT ON COLUMN experiences.entreprise_en IS 'Company name in English (if different)';
COMMENT ON COLUMN experiences.description_en IS 'Job description in English';

-- ============================================
-- 3. Table formations - Ajouter colonnes anglaises
-- ============================================

ALTER TABLE formations
ADD COLUMN IF NOT EXISTS diplome_en TEXT,
ADD COLUMN IF NOT EXISTS institution_en TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT;

COMMENT ON COLUMN formations.diplome_en IS 'Degree/certification name in English';
COMMENT ON COLUMN formations.institution_en IS 'Institution name in English (if different)';
COMMENT ON COLUMN formations.description_en IS 'Description in English';

-- ============================================
-- 4. Table competences - Ajouter colonnes anglaises
-- ============================================

ALTER TABLE competences
ADD COLUMN IF NOT EXISTS categorie_en TEXT,
ADD COLUMN IF NOT EXISTS competence_en TEXT,
ADD COLUMN IF NOT EXISTS niveau_en TEXT;

COMMENT ON COLUMN competences.categorie_en IS 'Category name in English';
COMMENT ON COLUMN competences.competence_en IS 'Skill name in English';
COMMENT ON COLUMN competences.niveau_en IS 'Skill level in English (Beginner, Intermediate, Advanced, Expert)';

-- ============================================
-- Vérification : Afficher la structure des tables
-- ============================================

-- Vérifier les colonnes de cv_info
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'cv_info'
AND column_name LIKE '%_en'
ORDER BY ordinal_position;

-- Vérifier les colonnes de experiences
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'experiences'
AND column_name LIKE '%_en'
ORDER BY ordinal_position;

-- Vérifier les colonnes de formations
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'formations'
AND column_name LIKE '%_en'
ORDER BY ordinal_position;

-- Vérifier les colonnes de competences
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'competences'
AND column_name LIKE '%_en'
ORDER BY ordinal_position;

-- ============================================
-- Message de confirmation
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Colonnes anglaises ajoutées avec succès !';
  RAISE NOTICE 'Tables modifiées :';
  RAISE NOTICE '  - cv_info : titre_en, bio_en';
  RAISE NOTICE '  - experiences : titre_en, entreprise_en, description_en';
  RAISE NOTICE '  - formations : diplome_en, institution_en, description_en';
  RAISE NOTICE '  - competences : categorie_en, competence_en, niveau_en';
  RAISE NOTICE '';
  RAISE NOTICE 'Prochaine étape : Insérer les traductions anglaises';
END $$;
