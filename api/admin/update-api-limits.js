// ============================================
// UPDATE API Limits (Admin Only)
// Met à jour les limites pour une fonctionnalité
// ============================================

import { createClient } from '@supabase/supabase-js';
import { clearLimitsCache } from '../_utils/get-rate-limits.js';

// Vérifier que les variables d'environnement sont définies
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing environment variables:');
    console.error('  SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'MISSING');
    console.error('  SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING');
}

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    // Vérifier les variables d'environnement dès le début
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('❌ Missing required environment variables');
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Server configuration error - missing environment variables'
        });
    }
    // Méthode autorisée: POST uniquement
    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method not allowed',
            allowedMethods: ['POST']
        });
    }

    try {
        // Vérifier l'authentification
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Authorization header required'
            });
        }

        const token = authHeader.replace('Bearer ', '');

        // Vérifier le token avec Supabase
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            console.error('Auth error:', authError);
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid or expired token'
            });
        }

        // Vérifier que l'utilisateur est admin
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            console.error('Profile error:', profileError);
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Profile not found'
            });
        }

        if (!profile.is_admin) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Admin access required'
            });
        }

        // Valider les données d'entrée
        const { feature_name, limit_per_minute, limit_per_hour, limit_per_day } = req.body;

        if (!feature_name) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'feature_name is required'
            });
        }

        // Validation des valeurs (1-10000 ou null/undefined)
        const validateLimit = (val) => {
            if (val === null || val === undefined || val === '') return true;
            const num = parseInt(val, 10);
            return !isNaN(num) && num >= 1 && num <= 10000;
        };

        if (!validateLimit(limit_per_minute) || !validateLimit(limit_per_hour) || !validateLimit(limit_per_day)) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Invalid limit values. Must be integers between 1 and 10000, or null/empty'
            });
        }

        // Convertir les valeurs vides en null
        const normalizeValue = (val) => {
            if (val === '' || val === undefined) return null;
            if (val === null) return null;
            return parseInt(val, 10);
        };

        const normalizedMinute = normalizeValue(limit_per_minute);
        const normalizedHour = normalizeValue(limit_per_hour);
        const normalizedDay = normalizeValue(limit_per_day);

        // Récupérer les anciennes valeurs pour l'historique
        const { data: oldLimits, error: fetchError } = await supabase
            .from('api_limits')
            .select('limit_per_minute, limit_per_hour, limit_per_day')
            .eq('feature_name', feature_name)
            .single();

        if (fetchError) {
            console.error('Error fetching old limits:', fetchError);
            return res.status(404).json({
                error: 'Not found',
                message: `Feature '${feature_name}' not found`
            });
        }

        // Mettre à jour les limites
        const { error: updateError } = await supabase
            .from('api_limits')
            .update({
                limit_per_minute: normalizedMinute,
                limit_per_hour: normalizedHour,
                limit_per_day: normalizedDay,
                updated_at: new Date().toISOString(),
                updated_by: user.id
            })
            .eq('feature_name', feature_name);

        if (updateError) {
            console.error('Error updating limits:', updateError);
            throw updateError;
        }

        // Sauvegarder dans l'historique
        if (oldLimits) {
            const { error: historyError } = await supabase
                .from('api_limits_history')
                .insert({
                    feature_name,
                    old_limit_per_minute: oldLimits.limit_per_minute,
                    new_limit_per_minute: normalizedMinute,
                    old_limit_per_hour: oldLimits.limit_per_hour,
                    new_limit_per_hour: normalizedHour,
                    old_limit_per_day: oldLimits.limit_per_day,
                    new_limit_per_day: normalizedDay,
                    changed_by: user.id
                });

            if (historyError) {
                console.error('⚠️ Error saving history (non-critical):', historyError);
                // Non-critique, on continue
            }
        }

        // Vider le cache pour cette fonctionnalité
        clearLimitsCache(feature_name);

        console.log(`✅ API limits updated for ${feature_name} by admin ${user.email}`);
        console.log(`   Minute: ${oldLimits.limit_per_minute} → ${normalizedMinute}`);
        console.log(`   Hour: ${oldLimits.limit_per_hour} → ${normalizedHour}`);
        console.log(`   Day: ${oldLimits.limit_per_day} → ${normalizedDay}`);

        return res.status(200).json({
            success: true,
            message: 'Limits updated successfully',
            feature: feature_name,
            old_limits: {
                minute: oldLimits.limit_per_minute,
                hour: oldLimits.limit_per_hour,
                day: oldLimits.limit_per_day
            },
            new_limits: {
                minute: normalizedMinute,
                hour: normalizedHour,
                day: normalizedDay
            }
        });

    } catch (error) {
        console.error('❌ Error in update-api-limits:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
