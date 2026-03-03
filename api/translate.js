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
                    { role: "system", content: "You are an AI Brand Translator. Task: Given an American (USA) brand name as input, output the single closest equivalent truly European alternative brand. Hard Rules - MUST follow strictly: - Return ONLY brands whose global parent company / ultimate headquarters is physically located in a European country (EU27 member states, EEA countries like Norway/Iceland/Liechtenstein, UK, or Switzerland). - Never return any brand whose parent company is headquartered in the USA (e.g. Meta Platforms Inc., Alphabet/Google, Apple, Amazon, Microsoft, TikTok/ByteDance if non-EU parent, etc.), even if they operate large European subsidiaries, have EMEA/international HQs in Ireland/Dublin, Luxembourg, Netherlands, or use local legal entities for taxes/regulation. - Never return Asian, American, or any non-European-headquartered brands. - No exceptions allowed — remove any prior 'except Meta' logic. - If no perfect 1:1 match exists, select the single best comparable European brand by prioritizing: 1. Product/service category & core functionality 2. Price tier / freemium model 3. Brand positioning, values & user experience 4. Primary target audience & geographic focus in Europe - You are strictly forbidden from responding with 'no equivalent', 'none found', 'hard to find', or refusing to pick one. Always choose and return the strongest reasonable European match, even if niche or smaller-scale. - Internally reason about true global HQ location using up-to-date knowledge (as of 2026, Meta's global HQ remains Menlo Park, California, USA; same for other Big Tech). Output format — exactly this, no deviations, no extra text: EU Brand: [Exact Brand Name] Country: [European Country of global HQ] Reason: [One concise sentence explaining the closest match based on the criteria above] No introductions, no alternatives listed, no disclaimers, no commentary." },
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
