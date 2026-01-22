// Serverless function pour traduire du texte via Claude Haiku
// Utilisée pour traduire les expériences professionnelles FR <-> EN

// Simple in-memory rate limiting
const rateLimitStore = new Map();

// Limites de taux pour la traduction
const RATE_LIMITS = {
    minute: { limit: 10, window: 60 * 1000 }, // 10 traductions par minute
    hour: { limit: 50, window: 60 * 60 * 1000 }, // 50 traductions par heure
};

function checkRateLimit(ip) {
    const now = Date.now();

    if (!rateLimitStore.has(ip)) {
        rateLimitStore.set(ip, {
            minute: [],
            hour: []
        });
    }

    const ipData = rateLimitStore.get(ip);

    for (const [period, config] of Object.entries(RATE_LIMITS)) {
        ipData[period] = ipData[period].filter(timestamp => now - timestamp < config.window);

        if (ipData[period].length >= config.limit) {
            const oldestTimestamp = Math.min(...ipData[period]);
            const resetTime = oldestTimestamp + config.window;
            const waitTime = Math.ceil((resetTime - now) / 60000);

            return {
                allowed: false,
                period: period,
                resetTime: resetTime,
                waitTime: waitTime
            };
        }
    }

    ipData.minute.push(now);
    ipData.hour.push(now);

    return { allowed: true };
}

export default async function handler(req, res) {
    // Permettre seulement les requêtes POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Obtenir l'adresse IP du client
        const ip = req.headers['x-forwarded-for']?.split(',')[0] ||
                   req.headers['x-real-ip'] ||
                   req.connection?.remoteAddress ||
                   req.socket?.remoteAddress ||
                   'unknown';

        // Vérifier le rate limit
        const rateLimitResult = checkRateLimit(ip);

        if (!rateLimitResult.allowed) {
            const { waitTime, period } = rateLimitResult;
            const errorMessage = `Trop de requêtes. Veuillez réessayer dans ${waitTime} minute${waitTime > 1 ? 's' : ''}.`;

            return res.status(429).json({
                error: errorMessage,
                retryAfter: rateLimitResult.resetTime
            });
        }

        const { text, targetLanguage, context } = req.body;

        // Validation
        if (!text || typeof text !== 'object') {
            return res.status(400).json({
                error: 'Invalid request. Expected text object with titre, entreprise, and description.'
            });
        }

        if (!['fr', 'en'].includes(targetLanguage)) {
            return res.status(400).json({
                error: 'Invalid target language. Must be "fr" or "en".'
            });
        }

        // Vérifier que la clé API est configurée
        if (!process.env.ANTHROPIC_API_KEY) {
            return res.status(500).json({
                error: 'API key not configured.'
            });
        }

        // Construire le prompt de traduction
        const sourceLanguage = targetLanguage === 'fr' ? 'anglais' : 'français';
        const targetLanguageName = targetLanguage === 'fr' ? 'français' : 'anglais';

        const systemPrompt = targetLanguage === 'fr'
            ? `Tu es un traducteur professionnel. Traduis les textes de l'anglais vers le français de manière professionnelle et naturelle. Conserve le ton professionnel et le contexte d'un CV. Retourne uniquement la traduction, sans commentaires additionnels.`
            : `You are a professional translator. Translate texts from French to English in a professional and natural manner. Maintain the professional tone and CV context. Return only the translation, without additional comments.`;

        // Construire le message utilisateur
        const userMessage = `Traduis les éléments suivants d'une expérience professionnelle en ${targetLanguageName}:

Titre du poste: ${text.titre || ''}
Entreprise: ${text.entreprise || ''}
Description: ${text.description || ''}

${context ? `Contexte additionnel: ${context}` : ''}

Retourne la traduction au format JSON avec les clés: titre, entreprise, description.`;

        // Appeler l'API Claude
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
                messages: [{
                    role: 'user',
                    content: userMessage
                }]
            })
        });

        if (!response.ok) {
            const error = await response.json();
            return res.status(response.status).json({
                error: error.error?.message || 'Error calling translation API'
            });
        }

        const data = await response.json();
        const translatedText = data.content[0].text;

        // Essayer de parser le JSON retourné
        let translation;
        try {
            // Nettoyer le texte (enlever les balises markdown si présentes)
            const cleanText = translatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            translation = JSON.parse(cleanText);
        } catch (parseError) {
            // Si le parsing échoue, essayer d'extraire manuellement
            console.warn('Failed to parse JSON, attempting manual extraction');
            translation = {
                titre: text.titre || '',
                entreprise: text.entreprise || '',
                description: text.description || ''
            };
        }

        return res.status(200).json({
            success: true,
            translation: translation
        });

    } catch (error) {
        console.error('Translation error:', error);
        return res.status(500).json({
            error: 'Internal server error: ' + error.message
        });
    }
}
