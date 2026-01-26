// ============================================
// Honest Fit Assessment API Endpoint
// Analyzes CV fit against job descriptions using Claude Haiku
// ============================================

import { createClient } from '@supabase/supabase-js';

// Simple in-memory rate limiting
const rateLimitStore = new Map();

// Rate limits per IP address
const RATE_LIMITS = {
    minute: { limit: 2, window: 60 * 1000 }, // 2 analyses per minute
    hour: { limit: 5, window: 60 * 60 * 1000 }, // 5 analyses per hour
    day: { limit: 5, window: 24 * 60 * 60 * 1000 }, // 5 analyses per day
};

// Rate limit check function
function checkRateLimit(ip) {
    const now = Date.now();

    if (!rateLimitStore.has(ip)) {
        rateLimitStore.set(ip, {
            minute: [],
            hour: [],
            day: []
        });
    }

    const userData = rateLimitStore.get(ip);

    for (const [period, config] of Object.entries(RATE_LIMITS)) {
        userData[period] = userData[period].filter(timestamp => now - timestamp < config.window);

        if (userData[period].length >= config.limit) {
            const oldestTimestamp = Math.min(...userData[period]);
            const resetTime = oldestTimestamp + config.window;
            const hoursRemaining = Math.ceil((resetTime - now) / (1000 * 60 * 60));

            return {
                allowed: false,
                period: period,
                resetTime: resetTime,
                hoursRemaining: hoursRemaining,
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

// Cleanup old entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of rateLimitStore.entries()) {
        const hasRecentActivity = data.day.some(timestamp => now - timestamp < RATE_LIMITS.day.window);
        if (!hasRecentActivity) {
            rateLimitStore.delete(ip);
        }
    }
}, 60 * 60 * 1000);

// Initialize Supabase client
function getSupabaseClient() {
    const SUPABASE_URL = 'https://btcdbewqypejzmlwwedz.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0Y2RiZXdxeXBlanptbHd3ZWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MzYwOTUsImV4cCI6MjA4NDUxMjA5NX0.YL7UuvIE9DGdvfjGHNk3JvV2Go7hB83eNMvx2h6mjvw';

    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Fetch CV data from Supabase
async function fetchCVData(slug, language) {
    const supabase = getSupabaseClient();

    try {
        // Get profile by slug
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('slug', slug)
            .single();

        if (profileError || !profile) {
            throw new Error('CV not found');
        }

        const userId = profile.id;

        // Fetch CV info
        const { data: cvInfo, error: cvInfoError } = await supabase
            .from('cv_info')
            .select('nom, titre, titre_en, bio, bio_en')
            .eq('user_id', userId)
            .single();

        if (cvInfoError) throw cvInfoError;

        // Fetch experiences (top 5 most recent)
        const { data: experiences, error: experiencesError } = await supabase
            .from('experiences')
            .select('titre, titre_en, entreprise, periode_debut, periode_fin, description, description_en, en_cours')
            .eq('user_id', userId)
            .order('ordre', { ascending: true })
            .limit(5);

        if (experiencesError) throw experiencesError;

        // Fetch formations
        const { data: formations, error: formationsError } = await supabase
            .from('formations')
            .select('diplome, diplome_en, institution, annee_debut, annee_fin')
            .eq('user_id', userId)
            .order('ordre', { ascending: true });

        if (formationsError) throw formationsError;

        // Fetch competences
        const { data: competences, error: competencesError } = await supabase
            .from('competences')
            .select('competence, competence_en, categorie, categorie_en, niveau, niveau_en')
            .eq('user_id', userId)
            .order('categorie', { ascending: true });

        if (competencesError) throw competencesError;

        return {
            cvInfo,
            experiences: experiences || [],
            formations: formations || [],
            competences: competences || []
        };
    } catch (error) {
        console.error('❌ Error fetching CV data:', error);
        throw error;
    }
}

// Build CV context for Claude
function buildCVContext(cvData, language) {
    const { cvInfo, experiences, formations, competences } = cvData;
    const isFrench = language === 'fr';

    let context = '';

    // Personal info
    context += `NOM: ${cvInfo.nom || ''}\n`;
    context += `TITRE: ${isFrench ? (cvInfo.titre || '') : (cvInfo.titre_en || cvInfo.titre || '')}\n`;

    if (isFrench && cvInfo.bio) {
        context += `BIO: ${cvInfo.bio.substring(0, 300)}${cvInfo.bio.length > 300 ? '...' : ''}\n`;
    } else if (!isFrench && cvInfo.bio_en) {
        context += `BIO: ${cvInfo.bio_en.substring(0, 300)}${cvInfo.bio_en.length > 300 ? '...' : ''}\n`;
    }
    context += `\n`;

    // Experiences
    if (experiences.length > 0) {
        context += `EXPÉRIENCES PROFESSIONNELLES (${experiences.length} plus récentes):\n`;
        experiences.forEach((exp, index) => {
            const titre = isFrench ? (exp.titre || '') : (exp.titre_en || exp.titre || '');
            const entreprise = exp.entreprise || '';
            const debut = exp.periode_debut || '';
            const fin = exp.en_cours ? (isFrench ? 'Présent' : 'Present') : (exp.periode_fin || '');

            context += `${index + 1}. ${titre} chez ${entreprise} (${debut} - ${fin})\n`;

            if (isFrench && exp.description) {
                context += `   ${exp.description.substring(0, 200)}${exp.description.length > 200 ? '...' : ''}\n`;
            } else if (!isFrench && exp.description_en) {
                context += `   ${exp.description_en.substring(0, 200)}${exp.description_en.length > 200 ? '...' : ''}\n`;
            }
        });
        context += `\n`;
    }

    // Formations
    if (formations.length > 0) {
        context += `FORMATIONS (${formations.length}):\n`;
        formations.forEach((form, index) => {
            const diplome = isFrench ? (form.diplome || '') : (form.diplome_en || form.diplome || '');
            const periode = form.annee_debut && form.annee_fin
                ? `${form.annee_debut}-${form.annee_fin}`
                : form.annee_debut || form.annee_fin || '';
            context += `${index + 1}. ${diplome} - ${form.institution}${periode ? ` (${periode})` : ''}\n`;
        });
        context += `\n`;
    }

    // Competences by category
    if (competences.length > 0) {
        const competencesParCategorie = {};
        competences.forEach(comp => {
            const cat = isFrench ? (comp.categorie || 'Autre') : (comp.categorie_en || comp.categorie || 'Other');
            if (!competencesParCategorie[cat]) {
                competencesParCategorie[cat] = [];
            }
            const skillLabel = isFrench ? (comp.competence || '') : (comp.competence_en || comp.competence || '');
            const niveau = isFrench ? comp.niveau : (comp.niveau_en || comp.niveau);
            const skillWithLevel = niveau ? `${skillLabel} (${niveau})` : skillLabel;
            competencesParCategorie[cat].push(skillWithLevel);
        });

        context += `COMPÉTENCES (${competences.length}):\n`;
        Object.entries(competencesParCategorie).forEach(([categorie, skills]) => {
            context += `- ${categorie}: ${skills.slice(0, 10).join(', ')}${skills.length > 10 ? '...' : ''}\n`;
        });
    }

    return context;
}

// Validate Claude response
function validateAnalysis(analysis) {
    if (!analysis || typeof analysis !== 'object') {
        return false;
    }

    const requiredKeys = [
        'overallScore',
        'strongFit',
        'areasForDevelopment',
        'recommendations',
        'strongFitSummary',
        'developmentSummary'
    ];

    for (const key of requiredKeys) {
        if (!analysis.hasOwnProperty(key)) {
            return false;
        }
    }

    // Validate score
    if (typeof analysis.overallScore !== 'number' || analysis.overallScore < 0 || analysis.overallScore > 100) {
        return false;
    }

    // Validate arrays
    if (!Array.isArray(analysis.strongFit) || analysis.strongFit.length === 0) {
        return false;
    }
    if (!Array.isArray(analysis.areasForDevelopment) || analysis.areasForDevelopment.length === 0) {
        return false;
    }
    if (!Array.isArray(analysis.recommendations) || analysis.recommendations.length === 0) {
        return false;
    }

    // Validate summaries
    if (typeof analysis.strongFitSummary !== 'string' || analysis.strongFitSummary.length < 10) {
        return false;
    }
    if (typeof analysis.developmentSummary !== 'string' || analysis.developmentSummary.length < 10) {
        return false;
    }

    return true;
}

// Main handler
export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get IP for rate limiting
        const ip = req.headers['x-forwarded-for']?.split(',')[0] ||
                   req.headers['x-real-ip'] ||
                   req.socket?.remoteAddress ||
                   'unknown';

        // Extract request body
        const { slug, jobDescription, language } = req.body;

        if (!slug || !jobDescription || !language) {
            return res.status(400).json({
                error: 'Missing required fields: slug, jobDescription, language'
            });
        }

        // Validate job description length
        if (jobDescription.length < 50) {
            return res.status(400).json({
                error: 'Job description too short (minimum 50 characters)'
            });
        }

        if (jobDescription.length > 10000) {
            return res.status(400).json({
                error: 'Job description too long (maximum 10,000 characters)'
            });
        }

        // Check rate limit
        const rateLimitResult = checkRateLimit(ip);

        if (!rateLimitResult.allowed) {
            const { hoursRemaining, period, total } = rateLimitResult;

            console.log(`⏱️ Rate limit exceeded for IP: ${ip}, period: ${period}`);

            return res.status(429).json({
                error: 'Rate limit exceeded',
                message: `You have reached the limit of ${total} analyses per ${period}. Please try again later.`,
                hoursRemaining: hoursRemaining,
                retryAfter: rateLimitResult.resetTime
            });
        }

        console.log(`✅ Rate limit OK for IP: ${ip}. Remaining: day=${rateLimitResult.remaining.day}`);

        // Check API key
        if (!process.env.ANTHROPIC_API_KEY) {
            return res.status(500).json({
                error: 'API key not configured'
            });
        }

        console.log(`📊 Analyzing fit for slug: ${slug}, language: ${language}`);

        // Fetch CV data
        const cvData = await fetchCVData(slug, language);

        if (!cvData.cvInfo) {
            return res.status(404).json({
                error: 'CV not found'
            });
        }

        // Check if CV has sufficient data for analysis
        const hasExperiences = cvData.experiences && cvData.experiences.length > 0;
        const hasFormations = cvData.formations && cvData.formations.length > 0;
        const hasCompetences = cvData.competences && cvData.competences.length >= 3;

        const insufficientData = !hasExperiences && (!hasFormations || !hasCompetences);

        if (insufficientData) {
            console.log('⚠️ Insufficient CV data for analysis');

            const message = language === 'fr'
                ? 'Ce CV ne contient pas suffisamment de données pour effectuer une analyse approfondie. Pour obtenir une évaluation pertinente, le CV devrait inclure au minimum des expériences professionnelles ou une combinaison de formations et compétences détaillées.'
                : 'This CV does not contain enough data to perform a thorough analysis. For a relevant assessment, the CV should include at minimum professional experiences or a combination of detailed education and skills.';

            return res.status(400).json({
                error: 'Insufficient CV data',
                message: message,
                suggestions: language === 'fr'
                    ? [
                        'Ajoutez au moins une expérience professionnelle',
                        'Complétez vos formations',
                        'Ajoutez vos compétences principales (minimum 3)'
                    ]
                    : [
                        'Add at least one professional experience',
                        'Complete your education section',
                        'Add your main skills (minimum 3)'
                    ]
            });
        }

        // Build context
        const cvContext = buildCVContext(cvData, language);

        console.log('📝 CV context built:', cvContext.substring(0, 200) + '...');

        // Prepare Claude prompt
        const systemPrompt = `Tu es un expert en recrutement et analyse de CV.

TÂCHE: Analyser la compatibilité entre ce CV et une description de poste.

CONTEXTE: Tu analyses pour un employeur ou une firme de placement qui évalue ce candidat.

RÈGLES:
- Génère un score global de 0 à 100 (sois réaliste et honnête)
- Liste 3-5 points "Strong Fit" (correspondances fortes avec le poste)
- Liste 2-4 points "Areas for Development" (compétences manquantes ou à développer)
- Propose 2-3 recommandations POUR L'EMPLOYEUR/RECRUTEUR (ex: "Évaluer ses compétences en...", "Prévoir une formation sur...", "Vérifier son expérience avec...")
- Ajoute un résumé de 30-50 mots pour Strong Fit et Development
- Sois constructif mais honnête
- Réponds en ${language === 'fr' ? 'français' : 'anglais'}

IMPORTANT - FORMAT DE SORTIE:
- Réponds UNIQUEMENT avec du JSON valide
- NE PAS utiliser de balises markdown (pas de \`\`\`json ou \`\`\`)
- NE PAS ajouter de texte avant ou après le JSON
- Commence directement par { et termine par }

FORMAT JSON ATTENDU:
{
  "overallScore": 75,
  "strongFit": ["point 1", "point 2", "point 3"],
  "areasForDevelopment": ["point 1", "point 2"],
  "recommendations": ["rec 1", "rec 2", "rec 3"],
  "strongFitSummary": "texte de 30-50 mots résumant les forces",
  "developmentSummary": "texte de 30-50 mots résumant les axes de développement"
}`;

        const userPrompt = `CV:\n${cvContext}\n\nDESCRIPTION DE POSTE:\n${jobDescription}`;

        // Call Claude API
        console.log('🤖 Calling Claude Haiku API...');
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 2048,
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
            console.error('❌ Claude API error:', error);
            return res.status(response.status).json({
                error: error.error?.message || 'Error calling Claude API'
            });
        }

        const data = await response.json();
        console.log('✅ Claude response received');

        // Extract content
        const content = data.content?.[0]?.text || '';
        console.log('📄 Raw content:', content);

        // Clean JSON (remove markdown if present)
        let cleanedContent = content.trim();

        // Try multiple cleaning strategies
        // Strategy 1: Remove markdown code blocks
        cleanedContent = cleanedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');

        // Strategy 2: Extract JSON from text (find first { to last })
        const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            cleanedContent = jsonMatch[0];
        }

        cleanedContent = cleanedContent.trim();

        console.log('🧹 Cleaned content:', cleanedContent.substring(0, 200) + '...');

        // Parse JSON
        let analysis;
        try {
            analysis = JSON.parse(cleanedContent);
        } catch (parseError) {
            console.error('❌ JSON parse error:', parseError);
            console.error('Failed content:', cleanedContent);
            return res.status(500).json({
                error: 'Failed to parse Claude response',
                details: parseError.message,
                contentPreview: cleanedContent.substring(0, 500)
            });
        }

        // Validate analysis
        if (!validateAnalysis(analysis)) {
            console.error('❌ Invalid analysis format:', analysis);
            return res.status(500).json({
                error: 'Invalid analysis format from Claude',
                analysis: analysis
            });
        }

        console.log('✅ Analysis validated successfully');

        // Return results
        return res.status(200).json({
            success: true,
            analysis: analysis,
            remainingAnalyses: rateLimitResult.remaining.day,
            message: 'Analysis completed successfully'
        });

    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
