console.log("✅ Brand Translator Script Loaded");

async function findBrand() {
    console.log("1. Button clicked!"); 
    
    const brandInput = document.getElementById('brandInput');
    const resultText = document.getElementById('resultText');
    
    // Check if the HTML elements actually exist
    if (!brandInput) return console.error("❌ ERROR: Could not find the input box! Check your HTML ID.");
    if (!resultText) return console.error("❌ ERROR: Could not find the result box! Check your HTML ID.");

    const brandName = brandInput.value.trim();
    console.log("2. User typed:", brandName);

    if (!brandName) {
        resultText.innerText = "Please enter a brand name.";
        return;
    }

    resultText.innerText = "Searching for European equivalent...";
    console.log("3. Sending request to Mistral...");

    try {
        const response = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ brand: brandName })
        });

        console.log("4. Server responded with status:", response.status);

        const data = await response.json();
        console.log("5. Data received:", data);
        
        if (data.answer) {
            resultText.innerText = data.answer;
        } else {
            resultText.innerText = "AI Response: " + (data.error || "No equivalent found.");
        }
    } catch (error) {
        console.error("❌ Fetch Error:", error);
        resultText.innerText = "Error connecting to the translator.";
    }
}

window.findBrand = findBrand;
