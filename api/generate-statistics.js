// Serverless function pour générer des statistiques de CV en utilisant l'API Claude
// Analyse les données du CV depuis Supabase et suggère 3 statistiques personnalisées

import { createClient } from '@supabase/supabase-js';

// Simple in-memory rate limiting
const rateLimitStore = new Map();

// Limites de taux par utilisateur (rate limit par userId au lieu de IP)
const RATE_LIMITS = {
    minute: { limit: 3, window: 60 * 1000 }, // 3 requêtes par minute
    hour: { limit: 10, window: 60 * 60 * 1000 }, // 10 requêtes par heure
    day: { limit: 20, window: 24 * 60 * 60 * 1000 }, // 20 requêtes par jour
};

// Fonction pour vérifier et mettre à jour le rate limit par userId
function checkRateLimit(userId) {
    const now = Date.now();

    if (!rateLimitStore.has(userId)) {
        rateLimitStore.set(userId, {
            minute: [],
            hour: [],
            day: []
        });
    }

    const userData = rateLimitStore.get(userId);

    for (const [period, config] of Object.entries(RATE_LIMITS)) {
        userData[period] = userData[period].filter(timestamp => now - timestamp < config.window);

        if (userData[period].length >= config.limit) {
            const oldestTimestamp = Math.min(...userData[period]);
            const resetTime = oldestTimestamp + config.window;
            const waitTime = Math.ceil((resetTime - now) / 60000);

            return {
                allowed: false,
                period: period,
                resetTime: resetTime,
                waitTime: waitTime,
                remaining: 0,
                total: config.limit
            };
        }
    }

    userData.minute.push(now);
    userData.hour.push(now);
    userData.day.push(now);

    return {
        allowed: true,
        remaining: {
            minute: RATE_LIMITS.minute.limit - userData.minute.length,
            hour: RATE_LIMITS.hour.limit - userData.hour.length,
            day: RATE_LIMITS.day.limit - userData.day.length
        }
    };
}

// Nettoyer périodiquement le store
setInterval(() => {
    const now = Date.now();
    for (const [userId, data] of rateLimitStore.entries()) {
        const hasRecentActivity = data.day.some(timestamp => now - timestamp < RATE_LIMITS.day.window);
        if (!hasRecentActivity) {
            rateLimitStore.delete(userId);
        }
    }
}, 60 * 60 * 1000);

// Initialiser le client Supabase
function getSupabaseClient() {
    const SUPABASE_URL = 'https://btcdbewqypejzmlwwedz.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0Y2RiZXdxeXBlanptbHd3ZWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MzYwOTUsImV4cCI6MjA4NDUxMjA5NX0.YL7UuvIE9DGdvfjGHNk3JvV2Go7hB83eNMvx2h6mjvw';

    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Fonction pour récupérer les données du CV depuis Supabase
async function fetchCVData(userId) {
    const supabase = getSupabaseClient();

    try {
        // Récupérer les informations personnelles
        const { data: cvInfo, error: cvInfoError } = await supabase
            .from('cv_info')
            .select('nom, prenom, titre, titre_en, bio, bio_en')
            .eq('user_id', userId)
            .single();

        if (cvInfoError) throw cvInfoError;

        // Récupérer les expériences
        const { data: experiences, error: experiencesError } = await supabase
            .from('experiences')
            .select('titre, titre_en, entreprise, periode_debut, periode_fin, description, description_en')
            .eq('user_id', userId)
            .order('ordre', { ascending: true });

        if (experiencesError) throw experiencesError;

        // Récupérer les formations
        const { data: formations, error: formationsError } = await supabase
            .from('formations')
            .select('diplome, diplome_en, institution, annee_debut, annee_fin, description, description_en')
            .eq('user_id', userId)
            .order('ordre', { ascending: true });

        if (formationsError) throw formationsError;

        // Récupérer les compétences
        const { data: competences, error: competencesError } = await supabase
            .from('competences')
            .select('nom, nom_en, categorie, categorie_en')
            .eq('user_id', userId)
            .order('ordre', { ascending: true });

        if (competencesError) throw competencesError;

        return {
            cvInfo,
            experiences: experiences || [],
            formations: formations || [],
            competences: competences || []
        };
    } catch (error) {
        console.error('Erreur lors de la récupération des données CV:', error);
        throw error;
    }
}

// Fonction pour construire le contexte du CV pour Claude
function buildCVContext(cvData) {
    const { cvInfo, experiences, formations, competences } = cvData;

    let context = `NOM COMPLET: ${cvInfo.prenom || ''} ${cvInfo.nom || ''}\n`;
    context += `TITRE: ${cvInfo.titre || ''}\n`;
    if (cvInfo.bio) {
        context += `BIO: ${cvInfo.bio.substring(0, 200)}${cvInfo.bio.length > 200 ? '...' : ''}\n`;
    }
    context += `\n`;

    // Expériences professionnelles
    if (experiences.length > 0) {
        context += `EXPÉRIENCES PROFESSIONNELLES (${experiences.length} postes):\n`;
        experiences.forEach((exp, index) => {
            const periodeDebut = exp.periode_debut || '';
            const periodeFin = exp.periode_fin || 'Présent';
            context += `${index + 1}. ${exp.titre} chez ${exp.entreprise} (${periodeDebut} - ${periodeFin})\n`;
            if (exp.description) {
                context += `   ${exp.description.substring(0, 150)}${exp.description.length > 150 ? '...' : ''}\n`;
            }
        });
        context += `\n`;
    }

    // Formations
    if (formations.length > 0) {
        context += `FORMATIONS (${formations.length} diplômes/certifications):\n`;
        formations.forEach((form, index) => {
            const periode = form.annee_debut && form.annee_fin
                ? `${form.annee_debut}-${form.annee_fin}`
                : form.annee_debut || form.annee_fin || '';
            context += `${index + 1}. ${form.diplome} - ${form.institution}${periode ? ` (${periode})` : ''}\n`;
        });
        context += `\n`;
    }

    // Compétences par catégorie
    if (competences.length > 0) {
        const competencesParCategorie = {};
        competences.forEach(comp => {
            const cat = comp.categorie || 'Autre';
            if (!competencesParCategorie[cat]) {
                competencesParCategorie[cat] = [];
            }
            competencesParCategorie[cat].push(comp.nom);
        });

        context += `COMPÉTENCES (${competences.length} compétences):\n`;
        Object.entries(competencesParCategorie).forEach(([categorie, skills]) => {
            context += `- ${categorie}: ${skills.slice(0, 10).join(', ')}${skills.length > 10 ? '...' : ''}\n`;
        });
    }

    return context;
}

// Fonction pour valider la réponse de Claude
function validateStatistics(stats) {
    if (!stats || typeof stats !== 'object') {
        return false;
    }

    // Vérifier que nous avons bien 3 paires de statistiques
    const requiredKeys = [
        'stat1_fr', 'stat1_en', 'stat1_value',
        'stat2_fr', 'stat2_en', 'stat2_value',
        'stat3_fr', 'stat3_en', 'stat3_value'
    ];

    for (const key of requiredKeys) {
        if (!stats.hasOwnProperty(key)) {
            return false;
        }
    }

    // Vérifier que les valeurs sont des nombres positifs
    const values = [stats.stat1_value, stats.stat2_value, stats.stat3_value];
    for (const value of values) {
        if (typeof value !== 'number' || value < 0 || value > 1000000) {
            return false;
        }
    }

    // Vérifier que les labels ne sont pas vides
    const labels = [
        stats.stat1_fr, stats.stat1_en,
        stats.stat2_fr, stats.stat2_en,
        stats.stat3_fr, stats.stat3_en
    ];
    for (const label of labels) {
        if (typeof label !== 'string' || label.trim().length === 0) {
            return false;
        }
    }

    return true;
}

export default async function handler(req, res) {
    // Permettre seulement les requêtes POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Extraire userId du corps de la requête AVANT le rate limiting
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        // Vérifier le rate limit par userId (chaque utilisateur a son propre quota)
        const rateLimitResult = checkRateLimit(userId);

        if (!rateLimitResult.allowed) {
            const { waitTime, period, total, remaining } = rateLimitResult;
            let errorMessage;

            if (period === 'minute') {
                errorMessage = `Limite atteinte: ${total} requêtes par minute maximum. Veuillez réessayer dans ${waitTime} minute${waitTime > 1 ? 's' : ''}.`;
            } else if (period === 'hour') {
                errorMessage = `Limite atteinte: ${total} requêtes par heure maximum. Veuillez réessayer dans ${waitTime} minute${waitTime > 1 ? 's' : ''}.`;
            } else {
                const waitHours = Math.ceil(waitTime / 60);
                errorMessage = `Limite atteinte: ${total} requêtes par jour maximum. Veuillez réessayer dans ${waitHours} heure${waitHours > 1 ? 's' : ''}.`;
            }

            console.log(`⏱️ Rate limit dépassé pour userId: ${userId}, période: ${period}`);

            return res.status(429).json({
                error: errorMessage,
                retryAfter: rateLimitResult.resetTime,
                remaining: remaining
            });
        }

        console.log(`✅ Rate limit OK pour userId: ${userId}. Quotas restants:`, rateLimitResult.remaining);

        // Vérifier que les clés API sont configurées
        if (!process.env.ANTHROPIC_API_KEY) {
            return res.status(500).json({
                error: 'API key not configured. Please add ANTHROPIC_API_KEY to your Vercel environment variables.'
            });
        }

        console.log(`📊 Génération de statistiques pour l'utilisateur: ${userId}`);

        // Récupérer les données du CV depuis Supabase
        const cvData = await fetchCVData(userId);

        // Si le CV est vide, retourner des statistiques par défaut
        if (!cvData.cvInfo) {
            return res.status(404).json({
                error: 'CV not found for this user'
            });
        }

        // Construire le contexte du CV
        const cvContext = buildCVContext(cvData);

        console.log('📝 Contexte du CV construit:', cvContext.substring(0, 200) + '...');

        // Préparer le prompt système pour Claude
        const systemPrompt = `Tu es un expert en analyse de CV qui génère des statistiques impressionnantes et factuelles.

RÈGLES IMPORTANTES:
1. Tu dois générer EXACTEMENT 3 statistiques basées sur les données réelles du CV
2. Chaque statistique doit avoir un label en français (stat1_fr, stat2_fr, stat3_fr) et en anglais (stat1_en, stat2_en, stat3_en)
3. Chaque statistique doit avoir une valeur numérique entière (stat1_value, stat2_value, stat3_value)
4. Les statistiques doivent être impressionnantes mais véridiques
5. Varie les types de statistiques : années d'expérience, nombre de technologies/compétences, portée/impact, projets réalisés, etc.
6. Les valeurs doivent être des nombres entiers positifs
7. Les labels doivent être courts (maximum 30 caractères) et percutants

FORMAT DE SORTIE STRICT (JSON pur, sans markdown):
{
  "stat1_fr": "Années d'expérience",
  "stat1_en": "Years of experience",
  "stat1_value": 15,
  "stat2_fr": "Technologies maîtrisées",
  "stat2_en": "Technologies mastered",
  "stat2_value": 42,
  "stat3_fr": "Projets réalisés",
  "stat3_en": "Projects completed",
  "stat3_value": 120
}

IMPORTANT: Tu dois retourner UNIQUEMENT du JSON valide, sans balises markdown, sans commentaires, sans texte d'explication.`;

        const userPrompt = `Génère 3 statistiques impressionnantes pour ce CV:\n\n${cvContext}`;

        // Appeler l'API Claude
        console.log('🤖 Appel de l\'API Claude Haiku...');
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 1024,
                system: systemPrompt,
                messages: [
                    {
                        role: 'user',
                        content: userPrompt
                    }
                ]
            })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('❌ Erreur API Claude:', error);
            return res.status(response.status).json({
                error: error.error?.message || 'Error calling Claude API'
            });
        }

        const data = await response.json();
        console.log('✅ Réponse reçue de Claude');

        // Extraire le contenu de la réponse
        const content = data.content?.[0]?.text || '';
        console.log('📄 Contenu brut:', content);

        // Nettoyer le JSON (enlever les balises markdown si présentes)
        let cleanedContent = content.trim();
        if (cleanedContent.startsWith('```json')) {
            cleanedContent = cleanedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (cleanedContent.startsWith('```')) {
            cleanedContent = cleanedContent.replace(/```\n?/g, '');
        }
        cleanedContent = cleanedContent.trim();

        console.log('🧹 Contenu nettoyé:', cleanedContent);

        // Parser le JSON
        let statistics;
        try {
            statistics = JSON.parse(cleanedContent);
        } catch (parseError) {
            console.error('❌ Erreur de parsing JSON:', parseError);
            return res.status(500).json({
                error: 'Failed to parse Claude response as JSON',
                rawResponse: cleanedContent
            });
        }

        // Valider la structure des statistiques
        if (!validateStatistics(statistics)) {
            console.error('❌ Format de statistiques invalide:', statistics);
            return res.status(500).json({
                error: 'Invalid statistics format from Claude',
                statistics: statistics
            });
        }

        console.log('✅ Statistiques validées:', statistics);

        // Retourner les statistiques
        return res.status(200).json({
            success: true,
            statistics: statistics,
            message: 'Statistics generated successfully'
        });

    } catch (error) {
        console.error('❌ Erreur:', error);
        return res.status(500).json({
            error: 'Internal server error: ' + error.message
        });
    }
}
