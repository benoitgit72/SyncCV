// Serverless function pour appeler l'API Claude de façon sécurisée
// La clé API est stockée dans les variables d'environnement Vercel

export default async function handler(req, res) {
    // Permettre seulement les requêtes POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
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
                system: `Tu es un assistant IA qui aide les visiteurs à en savoir plus sur Benoit Gaulin en répondant à leurs questions sur son CV. Voici les informations du CV:\n\n${cvContext}\n\nRéponds de manière professionnelle, concise et en français. IMPORTANT: Limite tes réponses à un maximum de 50 mots. Si on te demande des informations qui ne sont pas dans le CV, dis-le poliment.`,
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
