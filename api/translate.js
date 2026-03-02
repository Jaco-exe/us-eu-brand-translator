export default async function handler(req, res) {
    // 1. Safety check for the method
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { brand } = req.body;
    
    // 2. Safety check for the API Key
    if (!process.env.AI_API_KEY) {
        return res.status(500).json({ error: 'API Key is missing in Vercel settings.' });
    }

    try {
        // 3. Pointing to Mistral's server instead of OpenAI
        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.AI_API_KEY.trim()}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "mistral-small-latest", // Fast, smart, and very cheap model
                messages: [
                    { role: "system", content: "You are a helpful brand expert. The user will give you an American brand. Reply with the closest European equivalent and a 1-sentence explanation. Keep it concise." },
                    { role: "user", content: brand }
                ],
            }),
        });

        const data = await response.json();

        // 4. Extracting the answer (Mistral uses the exact same format as OpenAI!)
        if (data.choices && data.choices[0] && data.choices[0].message) {
            return res.status(200).json({ answer: data.choices[0].message.content });
        } else {
            console.error("Mistral Error:", data);
            return res.status(500).json({ error: data.error?.message || 'Mistral returned an error.' });
        }

    } catch (error) {
        return res.status(500).json({ error: 'Server crash: ' + error.message });
    }
}
