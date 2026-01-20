-- ============================================
-- Script de création de la base de données
-- Ron-More-CV - Proof of Concept
-- ============================================

-- 1. Créer la table profiles (extension de auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  template_id INTEGER DEFAULT 1 CHECK (template_id IN (1, 2, 3)),
  subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche rapide par slug
CREATE INDEX idx_profiles_slug ON profiles(slug);

-- 2. Créer la table cv_info (informations personnelles)
CREATE TABLE cv_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  nom TEXT NOT NULL,
  titre TEXT,
  email TEXT,
  telephone TEXT,
  bio TEXT,
  linkedin TEXT,
  github TEXT,
  photo_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id) -- Un seul cv_info par utilisateur
);

-- 3. Créer la table experiences
CREATE TABLE experiences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  titre TEXT NOT NULL,
  entreprise TEXT NOT NULL,
  periode_debut DATE NOT NULL,
  periode_fin DATE,
  en_cours BOOLEAN DEFAULT FALSE,
  description TEXT,
  competences TEXT[], -- Array de compétences
  ordre INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Contrainte : periode_fin doit être après periode_debut
  CONSTRAINT check_periode CHECK (periode_fin IS NULL OR periode_fin >= periode_debut)
);

-- Index pour tri par ordre
CREATE INDEX idx_experiences_user_ordre ON experiences(user_id, ordre);

-- 4. Créer la table formations
CREATE TABLE formations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  diplome TEXT NOT NULL,
  institution TEXT NOT NULL,
  annee_debut INTEGER,
  annee_fin INTEGER,
  description TEXT,
  ordre INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Contrainte : années valides
  CONSTRAINT check_annees CHECK (
    annee_debut IS NULL OR
    annee_fin IS NULL OR
    annee_fin >= annee_debut
  )
);

-- Index pour tri par ordre
CREATE INDEX idx_formations_user_ordre ON formations(user_id, ordre);

-- 5. Créer la table competences
CREATE TABLE competences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  categorie TEXT NOT NULL,
  competence TEXT NOT NULL,
  niveau TEXT CHECK (niveau IN ('Débutant', 'Intermédiaire', 'Avancé', 'Expert')),
  ordre INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour tri par catégorie et ordre
CREATE INDEX idx_competences_user_categorie ON competences(user_id, categorie, ordre);

-- ============================================
-- SÉCURITÉ : Row Level Security (RLS)
-- ============================================

-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE formations ENABLE ROW LEVEL SECURITY;
ALTER TABLE competences ENABLE ROW LEVEL SECURITY;

-- Politiques pour la table profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Politiques pour la table cv_info
CREATE POLICY "Anyone can view cv_info by slug"
  ON cv_info FOR SELECT
  USING (true); -- Public pour afficher les CV

CREATE POLICY "Users can insert their own cv_info"
  ON cv_info FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cv_info"
  ON cv_info FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cv_info"
  ON cv_info FOR DELETE
  USING (auth.uid() = user_id);

-- Politiques pour la table experiences
CREATE POLICY "Anyone can view experiences"
  ON experiences FOR SELECT
  USING (true); -- Public pour afficher les CV

CREATE POLICY "Users can insert their own experiences"
  ON experiences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own experiences"
  ON experiences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own experiences"
  ON experiences FOR DELETE
  USING (auth.uid() = user_id);

-- Politiques pour la table formations
CREATE POLICY "Anyone can view formations"
  ON formations FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own formations"
  ON formations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own formations"
  ON formations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own formations"
  ON formations FOR DELETE
  USING (auth.uid() = user_id);

-- Politiques pour la table competences
CREATE POLICY "Anyone can view competences"
  ON competences FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own competences"
  ON competences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own competences"
  ON competences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own competences"
  ON competences FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- FONCTIONS & TRIGGERS
-- ============================================

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cv_info_updated_at
  BEFORE UPDATE ON cv_info
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experiences_updated_at
  BEFORE UPDATE ON experiences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_formations_updated_at
  BEFORE UPDATE ON formations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competences_updated_at
  BEFORE UPDATE ON competences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FONCTION pour créer un profile automatiquement
-- lors de l'inscription d'un utilisateur
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, slug)
  VALUES (
    NEW.id,
    -- Générer un slug basé sur l'email (peut être personnalisé après)
    LOWER(REGEXP_REPLACE(SPLIT_PART(NEW.email, '@', 1), '[^a-zA-Z0-9]', '-', 'g'))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement un profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- VUES UTILES (optionnel - pour faciliter les requêtes)
-- ============================================

-- Vue pour obtenir un CV complet par slug
CREATE OR REPLACE VIEW cv_complet AS
SELECT
  p.slug,
  p.template_id,
  p.subscription_status,
  ci.nom,
  ci.titre,
  ci.email,
  ci.telephone,
  ci.bio,
  ci.linkedin,
  ci.github,
  ci.photo_url,
  (
    SELECT json_agg(
      json_build_object(
        'id', e.id,
        'titre', e.titre,
        'entreprise', e.entreprise,
        'periode_debut', e.periode_debut,
        'periode_fin', e.periode_fin,
        'en_cours', e.en_cours,
        'description', e.description,
        'competences', e.competences
      ) ORDER BY e.ordre, e.periode_debut DESC
    )
    FROM experiences e
    WHERE e.user_id = p.id
  ) AS experiences,
  (
    SELECT json_agg(
      json_build_object(
        'id', f.id,
        'diplome', f.diplome,
        'institution', f.institution,
        'annee_debut', f.annee_debut,
        'annee_fin', f.annee_fin,
        'description', f.description
      ) ORDER BY f.ordre, f.annee_fin DESC
    )
    FROM formations f
    WHERE f.user_id = p.id
  ) AS formations,
  (
    SELECT json_agg(
      json_build_object(
        'id', c.id,
        'categorie', c.categorie,
        'competence', c.competence,
        'niveau', c.niveau
      ) ORDER BY c.categorie, c.ordre
    )
    FROM competences c
    WHERE c.user_id = p.id
  ) AS competences
FROM profiles p
LEFT JOIN cv_info ci ON ci.user_id = p.id;

-- ============================================
-- MESSAGE DE CONFIRMATION
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'Base de données créée avec succès !';
  RAISE NOTICE 'Tables créées : profiles, cv_info, experiences, formations, competences';
  RAISE NOTICE 'Row Level Security activé sur toutes les tables';
  RAISE NOTICE 'Triggers et fonctions créés';
  RAISE NOTICE 'Vous pouvez maintenant créer votre premier utilisateur !';
END $$;
