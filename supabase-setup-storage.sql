-- ============================================
-- Configuration Supabase Storage pour les photos de profil
-- ============================================

-- 1. Créer le bucket pour les photos de profil (à faire via l'interface Supabase)
-- Allez dans Storage → Create bucket
-- Nom: profile-photos
-- Public: OUI (coché)

-- 2. Politiques RLS pour le bucket profile-photos

-- Permettre à tous de LIRE les photos de profil (pour affichage public des CVs)
CREATE POLICY "Public can view profile photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-photos');

-- Permettre aux utilisateurs authentifiés d'UPLOADER leur propre photo
-- Le nom du fichier doit commencer par leur user_id
CREATE POLICY "Users can upload their own profile photo"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'profile-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Permettre aux utilisateurs de METTRE À JOUR leur propre photo
CREATE POLICY "Users can update their own profile photo"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'profile-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Permettre aux utilisateurs de SUPPRIMER leur propre photo
CREATE POLICY "Users can delete their own profile photo"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'profile-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- Instructions
-- ============================================

-- ÉTAPE 1: Créer le bucket
-- --------------------------
-- 1. Allez sur Supabase Dashboard → Storage
-- 2. Cliquez sur "New bucket"
-- 3. Nom: profile-photos
-- 4. Public: OUI (coché)
-- 5. Cliquez sur "Create bucket"

-- ÉTAPE 2: Exécuter ce script SQL
-- --------------------------
-- 1. Allez sur Supabase Dashboard → SQL Editor
-- 2. Copiez/collez les politiques RLS ci-dessus
-- 3. Exécutez le script

-- ÉTAPE 3: Vérification
-- --------------------------
-- Les politiques devraient apparaître dans:
-- Storage → profile-photos → Policies

-- ============================================
-- Structure des fichiers
-- ============================================

-- Les photos seront organisées ainsi:
-- profile-photos/
--   ├── {user_id_1}/
--   │   └── profile.jpg
--   ├── {user_id_2}/
--   │   └── profile.jpg
--   └── {user_id_3}/
--       └── profile.jpg

-- Exemple d'URL publique:
-- https://btcdbewqypejzmlwwedz.supabase.co/storage/v1/object/public/profile-photos/{user_id}/profile.jpg

-- ============================================
-- Notes importantes
-- ============================================

-- 1. Taille maximale par défaut: 50 MB
-- 2. Pour changer la limite: Storage → Settings → File size limit
-- 3. Formats acceptés: JPG, PNG, WEBP, GIF
-- 4. Recommandation: Redimensionner à 400x400px côté client avant upload

DO $$
BEGIN
  RAISE NOTICE '✅ Script de configuration du Storage prêt!';
  RAISE NOTICE '📋 Suivez les instructions ci-dessus pour créer le bucket';
  RAISE NOTICE '🔒 Les politiques RLS seront appliquées après exécution';
END $$;
