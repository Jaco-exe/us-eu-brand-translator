// Add this at the very top to verify the file is working
console.log("Brand Translator Script Loaded");

async function findBrand() {
    console.log("Button clicked!"); // This will show in console when you click
    
    const brandInput = document.getElementById('brandInput');
    const resultText = document.getElementById('resultText');
    
    if (!brandInput.value.trim()) {
        resultText.innerText = "Please enter a brand name.";
        return;
    }

    resultText.innerText = "Searching for European equivalent...";

    try {
        const response = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ brand: brandInput.value.trim() })
        });

        const data = await response.json();
        
        if (data.answer) {
            resultText.innerText = data.answer;
        } else {
            resultText.innerText = "AI Response: " + (data.error || "No equivalent found.");
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        resultText.innerText = "Error connecting to the translator.";
    }
}

// Manually attach the function to the window to ensure HTML can see it
window.findBrand = findBrand;
