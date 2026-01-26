-- ============================================
-- API Limits Management System
-- Migration pour créer les tables de gestion des limites API
-- ============================================

-- Table principale pour stocker les limites API
CREATE TABLE IF NOT EXISTS api_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feature_name TEXT UNIQUE NOT NULL,
    feature_label_fr TEXT NOT NULL,
    feature_label_en TEXT NOT NULL,
    limit_per_minute INTEGER,
    limit_per_hour INTEGER,
    limit_per_day INTEGER,
    is_enabled BOOLEAN DEFAULT TRUE,
    rate_limit_by TEXT DEFAULT 'ip', -- 'ip' ou 'user_id'
    description_fr TEXT,
    description_en TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche rapide par feature_name
CREATE INDEX IF NOT EXISTS idx_api_limits_feature ON api_limits(feature_name);

-- Index pour recherche par date de mise à jour
CREATE INDEX IF NOT EXISTS idx_api_limits_updated ON api_limits(updated_at DESC);

-- Commentaires pour documentation
COMMENT ON TABLE api_limits IS 'Configuration des limites d''utilisation pour les APIs utilisant Claude';
COMMENT ON COLUMN api_limits.feature_name IS 'Nom unique de la fonctionnalité (chatbot, translate, etc.)';
COMMENT ON COLUMN api_limits.rate_limit_by IS 'Type de rate limiting: ip (par adresse IP) ou user_id (par utilisateur)';
COMMENT ON COLUMN api_limits.is_enabled IS 'Si false, la fonctionnalité n''a aucune limite';

-- Table pour l'historique des modifications
CREATE TABLE IF NOT EXISTS api_limits_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feature_name TEXT NOT NULL,
    old_limit_per_minute INTEGER,
    new_limit_per_minute INTEGER,
    old_limit_per_hour INTEGER,
    new_limit_per_hour INTEGER,
    old_limit_per_day INTEGER,
    new_limit_per_day INTEGER,
    changed_by UUID REFERENCES profiles(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche rapide dans l'historique
CREATE INDEX IF NOT EXISTS idx_api_limits_history_feature ON api_limits_history(feature_name);
CREATE INDEX IF NOT EXISTS idx_api_limits_history_date ON api_limits_history(changed_at DESC);

-- Commentaires
COMMENT ON TABLE api_limits_history IS 'Historique des modifications des limites API';
COMMENT ON COLUMN api_limits_history.changed_by IS 'Admin qui a effectué la modification';

-- Insérer les 5 fonctionnalités avec leurs limites actuelles
INSERT INTO api_limits (
    feature_name,
    feature_label_fr,
    feature_label_en,
    limit_per_minute,
    limit_per_hour,
    limit_per_day,
    rate_limit_by,
    description_fr,
    description_en
) VALUES
    (
        'chatbot',
        'Chatbot (CV publique)',
        'Chatbot (Public CV)',
        4,
        10,
        15,
        'ip',
        'Chatbot IA sur les pages publiques de CV',
        'AI Chatbot on public CV pages'
    ),
    (
        'translate',
        'Traduction (Admin CV)',
        'Translation (CV Admin)',
        4,
        10,
        15,
        'ip',
        'Traduction automatique dans le panneau admin',
        'Automatic translation in admin panel'
    ),
    (
        'statistics',
        'Générateur de Statistiques',
        'Statistics Generator',
        3,
        10,
        20,
        'user_id',
        'Génération de statistiques personnalisées du CV',
        'Personalized CV statistics generation'
    ),
    (
        'fit_assessment',
        'Évaluation de Compatibilité',
        'Honest Fit Assessment',
        2,
        5,
        5,
        'ip',
        'Analyse de compatibilité CV vs offre d''emploi',
        'CV vs job offer compatibility analysis'
    ),
    (
        'suggest_tags',
        'Suggestion de Tags',
        'Tag Suggestions',
        4,
        10,
        15,
        'ip',
        'Suggestions automatiques de tags pour les compétences',
        'Automatic tag suggestions for skills'
    )
ON CONFLICT (feature_name) DO NOTHING;

-- Afficher les données insérées pour vérification
SELECT
    feature_name,
    feature_label_fr,
    limit_per_minute,
    limit_per_hour,
    limit_per_day,
    rate_limit_by,
    is_enabled
FROM api_limits
ORDER BY feature_name;

-- Message de succès
DO $$
BEGIN
    RAISE NOTICE '✅ API Limits tables created successfully!';
    RAISE NOTICE '✅ 5 features configured with current rate limits';
    RAISE NOTICE '📊 Run the SELECT query above to verify the data';
END $$;
