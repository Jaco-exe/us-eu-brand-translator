async function findBrand() {
    const brandInput = document.getElementById('brandInput').value;
    const resultText = document.getElementById('resultText');
    
    // Show loading state...
    
    try {
        // Point to the local Vercel function path
        const response = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ brand: brandInput })
        });

        const data = await response.json();
        resultText.innerText = data.answer;
    } catch (error) {
        resultText.innerText = "Error connecting to the translator.";
    }
}