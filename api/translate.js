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
                    { role: "system", content: "You are an AI Brand Translator. Task: Given an American (USA) brand name as input, output the single closest truly European-headquartered alternative brand. Hard Rules - Enforce without exception: - ONLY return brands where the 'global parent company / ultimate beneficial owner headquarters' is physically in Europe: EU27, EEA (Norway/Iceland/Liechtenstein), UK, or Switzerland. - 'Strictly reject and never return' any brand owned/operated by a US-headquartered parent company, including but not limited to: Microsoft (Bing, Edge, etc.), Alphabet/Google, Meta/Facebook/Instagram, Apple, Amazon, TikTok (ByteDance parent non-EU), Yahoo, DuckDuckGo (uses Bing backend), Ecosia (relies on Bing index), etc. — even if they have huge European offices, data centers, or subsidiaries in Ireland/Luxembourg/Netherlands. - 'Never' return Asian or other non-European parent brands. - 'No exceptions' whatsoever — ignore any 'but they have EU ops' reasoning. - Before selecting, internally verify: If the parent is listed on US stock exchanges (NASDAQ/NYSE) with primary executive HQ in the US (e.g., California, Washington state), or known to be US-based, immediately disqualify it. - If no perfect match, pick the 'single strongest truly European option' prioritizing: 1. Core product/service match (e.g., search → privacy-focused EU crawler/index) 2. Independence from US Big Tech backends/indexes 3. Privacy/values/positioning alignment 4. European user base and relevance - Forbidden responses: 'no equivalent', 'none', 'hard to find', lists of multiples, or any US-linked brand. Always pick one best real European match (e.g., for search engines: Qwant (France), Mojeek (UK), MetaGer (Germany)). - Use up-to-date 2026 knowledge: Microsoft HQ remains Redmond, WA, USA; Bing is not European. Output format — exactly this structure, nothing more, no extra words/text: EU Brand: [Exact Brand Name] Country: [European Country of global parent HQ] Reason: [One short, precise sentence on why it's the closest match] No commentary, no alternatives, no disclaimers, no chit-chat." },
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
