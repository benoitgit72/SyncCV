-- ============================================
-- Ajout de la colonne theme pour la personnalisation
-- ============================================

-- IMPORTANT: Exécutez ce script dans Supabase SQL Editor
-- Ce script ajoute une colonne theme à la table profiles

-- ============================================
-- 1. Ajouter la colonne theme à la table profiles
-- ============================================

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'purple-gradient' CHECK (theme IN ('purple-gradient', 'ocean-blue', 'forest-green'));

COMMENT ON COLUMN profiles.theme IS 'Theme de couleur choisi par l''utilisateur (purple-gradient, ocean-blue, forest-green)';

-- ============================================
-- Vérification : Afficher la structure de la table profiles
-- ============================================

SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name = 'theme'
ORDER BY ordinal_position;

-- ============================================
-- Message de confirmation
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Colonne theme ajoutée avec succès à la table profiles !';
  RAISE NOTICE 'Valeurs possibles : purple-gradient (défaut), ocean-blue, forest-green';
  RAISE NOTICE 'Prochaine étape : Implémenter l''interface de sélection de thème';
END $$;
