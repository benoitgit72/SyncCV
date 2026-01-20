// Serverless function pour appeler l'API Claude de façon sécurisée
// La clé API est stockée dans les variables d'environnement Vercel

// Simple in-memory rate limiting (survit pendant la durée de vie de la fonction serverless)
const rateLimitStore = new Map();

// Limites de taux
const RATE_LIMITS = {
    minute: { limit: 4, window: 60 * 1000 }, // 4 requêtes par minute
    hour: { limit: 10, window: 60 * 60 * 1000 }, // 10 requêtes par heure
    day: { limit: 15, window: 24 * 60 * 60 * 1000 }, // 15 requêtes par jour
};

// Fonction pour vérifier et mettre à jour le rate limit
function checkRateLimit(ip) {
    const now = Date.now();

    // Initialiser le store pour cette IP si nécessaire
    if (!rateLimitStore.has(ip)) {
        rateLimitStore.set(ip, {
            minute: [],
            hour: [],
            day: []
        });
    }

    const ipData = rateLimitStore.get(ip);

    // Nettoyer les anciennes entrées et vérifier chaque limite
    for (const [period, config] of Object.entries(RATE_LIMITS)) {
        // Filtrer les timestamps qui sont encore dans la fenêtre
        ipData[period] = ipData[period].filter(timestamp => now - timestamp < config.window);

        // Vérifier si la limite est atteinte
        if (ipData[period].length >= config.limit) {
            const oldestTimestamp = Math.min(...ipData[period]);
            const resetTime = oldestTimestamp + config.window;
            const waitTime = Math.ceil((resetTime - now) / 60000); // en minutes

            return {
                allowed: false,
                period: period,
                resetTime: resetTime,
                waitTime: waitTime
            };
        }
    }

    // Ajouter le timestamp actuel à toutes les périodes
    ipData.minute.push(now);
    ipData.hour.push(now);
    ipData.day.push(now);

    return { allowed: true };
}

// Nettoyer périodiquement le store pour éviter les fuites mémoire
setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of rateLimitStore.entries()) {
        // Supprimer les IPs qui n'ont pas fait de requête depuis 24h
        const hasRecentActivity = data.day.some(timestamp => now - timestamp < RATE_LIMITS.day.window);
        if (!hasRecentActivity) {
            rateLimitStore.delete(ip);
        }
    }
}, 60 * 60 * 1000); // Nettoyer toutes les heures

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
            let errorMessage;

            if (period === 'minute') {
                errorMessage = `Trop de requêtes. Veuillez réessayer dans ${waitTime} minute${waitTime > 1 ? 's' : ''}.`;
            } else if (period === 'hour') {
                errorMessage = `Trop de requêtes. Veuillez réessayer dans ${waitTime} minute${waitTime > 1 ? 's' : ''}.`;
            } else {
                const waitHours = Math.ceil(waitTime / 60);
                errorMessage = `Trop de requêtes. Veuillez réessayer dans ${waitHours} heure${waitHours > 1 ? 's' : ''}.`;
            }

            return res.status(429).json({
                error: errorMessage,
                retryAfter: rateLimitResult.resetTime
            });
        }

        const { messages, cvContext, language = 'fr' } = req.body;

        // Vérifier que la clé API est configurée
        if (!process.env.ANTHROPIC_API_KEY) {
            return res.status(500).json({
                error: 'API key not configured. Please add ANTHROPIC_API_KEY to your Vercel environment variables.'
            });
        }

        // Préparer le prompt système en fonction de la langue
        const systemPrompts = {
            fr: `Tu es un assistant IA qui aide les visiteurs à en savoir plus sur Benoit Gaulin en répondant à leurs questions sur son CV. Voici les informations du CV:\n\n${cvContext}\n\nRéponds de manière professionnelle, concise et en français. IMPORTANT: Limite tes réponses à un maximum de 75 mots. Si on te demande des informations qui ne sont pas dans le CV, dis-le poliment. Si quelqu'un souhaite contacter Benoit, réfère-le à la section "Me contacter" du CV interactif.`,
            en: `You are an AI assistant helping visitors learn more about Benoit Gaulin by answering questions about his resume. Here is the resume information:\n\n${cvContext}\n\nRespond in a professional, concise manner in English. IMPORTANT: Limit your responses to a maximum of 75 words. If asked for information not in the resume, politely say so. If someone wants to contact Benoit, refer them to the "Contact Me" section of the interactive resume.`
        };

        const systemPrompt = systemPrompts[language] || systemPrompts.fr;

        // Appeler l'API Claude
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                // model: 'claude-3-5-sonnet-20240620',
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 1024,
                system: systemPrompt,
                messages: messages
            })
        });

        if (!response.ok) {
            const error = await response.json();
            return res.status(response.status).json({
                error: error.error?.message || 'Error calling Claude API'
            });
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            error: 'Internal server error: ' + error.message
        });
    }
}
