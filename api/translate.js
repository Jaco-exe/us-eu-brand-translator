// api/translate.js
export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { brand } = req.body;

    if (!brand) {
        return res.status(400).json({ error: 'Brand name is required' });
    }

    try {
        // This calls the OpenAI API (or Gemini/Claude)
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.AI_API_KEY}`, // Uses the Vercel Env Variable
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{
                    role: "system",
                    content: "You are a brand expert. The user will provide an American brand. You will provide the closest European equivalent and a 1-sentence explanation of why."
                }, {
                    role: "user",
                    content: brand
                }],
                max_tokens: 100
            }),
        });

        const data = await response.json();
        const aiAnswer = data.choices[0].message.content;

        return res.status(200).json({ answer: aiAnswer });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to connect to AI' });
    }
}
