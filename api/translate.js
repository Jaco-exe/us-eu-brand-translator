// api/translate.js
// Powered by Grok (xAI) — best for this tool

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { brand } = req.body;
  if (!brand || typeof brand !== 'string') {
    return res.status(400).json({ error: 'Brand is required' });
  }

  try {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) throw new Error('API key missing');

    const systemPrompt = `You are the American → European Brand Translator.
Expert on every store, pharmacy, supermarket, drug, and product.
For the American brand "${brand}", give the closest European equivalent(s).
Rules:
- Mention countries (UK, France, Germany, Spain, Italy, Netherlands, etc.)
- If it's the same brand everywhere → "Same name everywhere in Europe."
- No perfect match? Give 1-3 best alternatives + one-sentence why.
- Keep it fun, short, and helpful. Max 130 words.
Format exactly like this:
**European equivalent:** Brand Name (countries) - short explanation.`;

    const aiResponse = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-4',           // or grok-4-0709 for newest
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Translate this American brand: ${brand}` }
        ],
        max_tokens: 200,
        temperature: 0.3,
      }),
    });

    const data = await aiResponse.json();
    const answer = data.choices[0].message.content.trim();

    res.status(200).json({ answer });

  } catch (error) {
    console.error(error);
    res.status(200).json({
      answer: "Oops! The AI is taking a quick nap. Try again in a few seconds."
    });
  }
};
