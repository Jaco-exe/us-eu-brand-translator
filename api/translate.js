export default async function handler(req, res) {
    // 1. The "Permission Slip" (CORS Headers)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // 2. Handle the Browser's "Pre-flight" check
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // 3. Safety check for the method
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { brand } = req.body;
    
    // 4. Safety check for the API Key
    if (!process.env.AI_API_KEY) {
        return res.status(500).json({ error: 'API Key is missing in Vercel settings.' });
    }

    try {
        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.AI_API_KEY.trim()}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "mistral-small-latest", 
                messages: [
                    { role: "system", content: "You are an AI Brand Translator. Task: Input = American (USA) brand name. Output = A European (EU-based) alternative brand. Hard Rules: - You MUST always return a European brand headquartered in Europe. - Never return a US, Asian, or global non-European company. note that even though Meta is headquartered in Ireland, it is still an American company and therefore not a viable alternative. - If no direct equivalent exists, choose the closest comparable European brand by: - product category - price segment - brand positioning - target audience - You are not allowed to say 'no equivalent'. - Always return a best-match European brand. Output format: EU Brand: [Brand Name] Country: [European Country] Reason: [One short sentence explaining the match] No extra commentary." },
                    { role: "user", content: brand }
                ],
            }),
        });

        const data = await response.json();

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
