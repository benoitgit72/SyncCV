-- ============================================
-- Ajout de la colonne formspree_id pour le formulaire de contact
-- ============================================

-- Ajouter la colonne pour stocker l'ID du formulaire Formspree
ALTER TABLE cv_info
ADD COLUMN IF NOT EXISTS formspree_id TEXT;

COMMENT ON COLUMN cv_info.formspree_id IS 'Formspree Form ID for contact form (ex: mykkkqpg)';

-- Mettre à jour le Form ID pour Ron More
UPDATE cv_info
SET formspree_id = 'mpqqkbka'
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315';

-- Vérification
SELECT user_id, nom, formspree_id
FROM cv_info;

-- ============================================
-- Instructions
-- ============================================

-- 1. Allez sur Formspree.io et trouvez votre formulaire "Message-to-Ron-More-CV"
-- 2. Copiez le Form ID (la partie après /f/ dans l'URL)
--    Exemple : https://formspree.io/f/xyzabc123 -> le Form ID est "xyzabc123"
-- 3. Remplacez 'VOTRE_FORM_ID_ICI' ci-dessus par votre vrai Form ID
-- 4. Exécutez ce script dans Supabase SQL Editor
