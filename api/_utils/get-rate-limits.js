// ============================================
// API Rate Limits Utility
// Récupère les limites depuis Supabase avec cache
// ============================================

import { createClient } from '@supabase/supabase-js';

// Configuration avec valeurs par défaut
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://btcdbewqypejzmlwwedz.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0Y2RiZXdxeXBlanptbHd3ZWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MzYwOTUsImV4cCI6MjA4NDUxMjA5NX0.YL7UuvIE9DGdvfjGHNk3JvV2Go7hB83eNMvx2h6mjvw';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Cache en mémoire avec TTL (Time To Live)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Valeurs par défaut en cas d'échec de connexion DB
const DEFAULT_LIMITS = {
    chatbot: { minute: 4, hour: 10, day: 15 },
    translate: { minute: 4, hour: 10, day: 15 },
    statistics: { minute: 3, hour: 10, day: 20 },
    fit_assessment: { minute: 2, hour: 5, day: 5 },
    suggest_tags: { minute: 4, hour: 10, day: 15 }
};

/**
 * Récupère les limites pour une fonctionnalité depuis la DB (avec cache)
 * @param {string} featureName - Nom de la fonctionnalité (chatbot, translate, etc.)
 * @returns {Promise<Object|null>} - Objet avec les limites ou null si désactivé
 */
export async function getRateLimitsFromDB(featureName) {
    // Vérifier le cache
    const cached = cache.get(featureName);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`✅ Using cached rate limits for ${featureName}`);
        return cached.limits;
    }

    try {
        const { data, error } = await supabase
            .from('api_limits')
            .select('limit_per_minute, limit_per_hour, limit_per_day, is_enabled')
            .eq('feature_name', featureName)
            .single();

        if (error) {
            console.error(`❌ Error fetching rate limits for ${featureName}:`, error);
            return getDefaultLimits(featureName);
        }

        // Si la fonctionnalité est désactivée, retourner null (pas de limites)
        if (!data.is_enabled) {
            console.log(`⚠️ Rate limiting disabled for ${featureName}`);
            cache.set(featureName, {
                limits: null,
                timestamp: Date.now()
            });
            return null;
        }

        // Construire l'objet des limites
        const limits = {};

        if (data.limit_per_minute) {
            limits.minute = {
                limit: data.limit_per_minute,
                window: 60 * 1000
            };
        }

        if (data.limit_per_hour) {
            limits.hour = {
                limit: data.limit_per_hour,
                window: 60 * 60 * 1000
            };
        }

        if (data.limit_per_day) {
            limits.day = {
                limit: data.limit_per_day,
                window: 24 * 60 * 60 * 1000
            };
        }

        // Si aucune limite définie, retourner null
        if (Object.keys(limits).length === 0) {
            cache.set(featureName, {
                limits: null,
                timestamp: Date.now()
            });
            return null;
        }

        // Mettre en cache
        cache.set(featureName, {
            limits,
            timestamp: Date.now()
        });

        console.log(`✅ Rate limits loaded from DB for ${featureName}:`, limits);
        return limits;

    } catch (error) {
        console.error(`❌ Exception fetching rate limits for ${featureName}:`, error);
        // Fallback sur valeurs par défaut
        return getDefaultLimits(featureName);
    }
}

/**
 * Retourne les limites par défaut pour une fonctionnalité
 * @param {string} featureName - Nom de la fonctionnalité
 * @returns {Object} - Objet avec les limites par défaut
 */
function getDefaultLimits(featureName) {
    const defaults = DEFAULT_LIMITS[featureName];

    if (!defaults) {
        console.warn(`⚠️ No default limits found for ${featureName}, using no limits`);
        return null;
    }

    const limits = {};

    if (defaults.minute) {
        limits.minute = {
            limit: defaults.minute,
            window: 60 * 1000
        };
    }

    if (defaults.hour) {
        limits.hour = {
            limit: defaults.hour,
            window: 60 * 60 * 1000
        };
    }

    if (defaults.day) {
        limits.day = {
            limit: defaults.day,
            window: 24 * 60 * 60 * 1000
        };
    }

    console.log(`ℹ️ Using default rate limits for ${featureName}:`, limits);
    return limits;
}

/**
 * Vide le cache pour une ou toutes les fonctionnalités
 * Utilisé après mise à jour des limites dans l'admin
 * @param {string|null} featureName - Nom de la fonctionnalité ou null pour tout vider
 */
export function clearLimitsCache(featureName = null) {
    if (featureName) {
        cache.delete(featureName);
        console.log(`🧹 Cache cleared for ${featureName}`);
    } else {
        cache.clear();
        console.log('🧹 All rate limits cache cleared');
    }
}

/**
 * Affiche les stats du cache (utile pour debugging)
 */
export function getCacheStats() {
    const stats = {
        size: cache.size,
        entries: []
    };

    for (const [key, value] of cache.entries()) {
        const age = Date.now() - value.timestamp;
        stats.entries.push({
            feature: key,
            age_ms: age,
            expired: age > CACHE_TTL
        });
    }

    return stats;
}
