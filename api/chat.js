// Serverless function pour appeler l'API Claude de façon sécurisée
// La clé API est stockée dans les variables d'environnement Vercel

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Configuration du rate limiting avec Upstash Redis
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 requêtes par minute
    analytics: true,
    prefix: 'benoit-cv-ratelimit',
});

// Rate limiters supplémentaires pour heure et jour
const hourlyLimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 requêtes par heure
    analytics: true,
    prefix: 'benoit-cv-hourly',
});

const dailyLimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(15, '1 d'), // 15 requêtes par jour
    analytics: true,
    prefix: 'benoit-cv-daily',
});

export default async function handler(req, res) {
    // Permettre seulement les requêtes POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Obtenir l'adresse IP du client
        const ip = req.headers['x-forwarded-for']?.split(',')[0] ||
                   req.headers['x-real-ip'] ||
                   req.connection.remoteAddress ||
                   'unknown';

        // Vérifier les limites (minute, heure, jour)
        const [minuteResult, hourResult, dayResult] = await Promise.all([
            ratelimit.limit(ip),
            hourlyLimit.limit(ip),
            dailyLimit.limit(ip),
        ]);

        // Si l'une des limites est dépassée, retourner une erreur 429
        if (!minuteResult.success) {
            const resetInMinutes = Math.ceil((minuteResult.reset - Date.now()) / 60000);
            return res.status(429).json({
                error: `Trop de requêtes. Veuillez réessayer dans ${resetInMinutes} minute${resetInMinutes > 1 ? 's' : ''}.`,
                retryAfter: minuteResult.reset
            });
        }

        if (!hourResult.success) {
            const resetInMinutes = Math.ceil((hourResult.reset - Date.now()) / 60000);
            return res.status(429).json({
                error: `Trop de requêtes. Veuillez réessayer dans ${resetInMinutes} minute${resetInMinutes > 1 ? 's' : ''}.`,
                retryAfter: hourResult.reset
            });
        }

        if (!dayResult.success) {
            const resetInHours = Math.ceil((dayResult.reset - Date.now()) / 3600000);
            return res.status(429).json({
                error: `Trop de requêtes. Veuillez réessayer dans ${resetInHours} heure${resetInHours > 1 ? 's' : ''}.`,
                retryAfter: dayResult.reset
            });
        }

        const { messages, cvContext } = req.body;

        // Vérifier que la clé API est configurée
        if (!process.env.ANTHROPIC_API_KEY) {
            return res.status(500).json({
                error: 'API key not configured. Please add ANTHROPIC_API_KEY to your Vercel environment variables.'
            });
        }

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
                system: `Tu es un assistant IA qui aide les visiteurs à en savoir plus sur Benoit Gaulin en répondant à leurs questions sur son CV. Voici les informations du CV:\n\n${cvContext}\n\nRéponds de manière professionnelle, concise et en français. IMPORTANT: Limite tes réponses à un maximum de 75 mots. Si on te demande des informations qui ne sont pas dans le CV, dis-le poliment. Si quelqu'un souhaite contacter Benoit, réfère-le à la section "Me contacter" du CV interactif.`,
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
