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
                    { role: "system", content: "You are an AI Brand Translator. Task: Given an American (USA) brand name as input, output the closest equivalent European (EU-based) alternative brand. Hard Rules: - You MUST always return a brand whose **global parent company headquarters** is physically located in a European country (EU member state, EEA, UK, or Switzerland). - **Never** return a US-headquartered company (e.g. Meta, Google/Alphabet, Apple, Amazon, Microsoft, etc.), even if they have large European subsidiaries or EMEA headquarters in Ireland, Luxembourg, etc. - **Never** return an Asian-headquartered company or any brand whose ultimate parent is headquartered outside Europe. - The only allowed exception is if the input brand itself is Meta — but even then, prefer a truly European alternative when a reasonable match exists. - If no direct 1:1 equivalent exists, choose the **closest comparable European brand** based on: - product/service category - price segment - brand positioning & values - target audience & market focus - You are **not allowed** to say 'no equivalent exists', 'none', or similar. Always select and return the single best-match European brand. - Do thorough reasoning internally, but never mention US companies with European HQs/subsidiaries as valid European brands. Output format (exactly this structure, nothing else): EU Brand: [Brand Name] Country: [European Country where global HQ is located] Reason: [One short, clear sentence explaining why it is the closest match] No extra commentary, no introductions, no alternatives, no disclaimers." },
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
