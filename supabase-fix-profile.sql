-- ============================================
-- Script pour créer le profil manuellement
-- ============================================

-- Insérer le profil manuellement avec le slug ron-more
INSERT INTO profiles (id, slug, template_id, subscription_status)
VALUES (
  'd5b317b1-34ba-4289-8d40-11fd1b584315',
  'ron-more',
  1,
  'trial'
)
ON CONFLICT (id) DO UPDATE
SET slug = 'ron-more';

-- Vérifier que le profil existe
SELECT * FROM profiles WHERE id = 'd5b317b1-34ba-4289-8d40-11fd1b584315';
