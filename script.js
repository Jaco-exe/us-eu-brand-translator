console.log("✅ Brand Translator Ready");

async function findBrand() {
    const brandInput = document.getElementById('brandInput');
    const resultText = document.getElementById('resultText');
    const resultBox = document.getElementById('resultBox'); // We need to grab the box itself!
    const searchBtn = document.querySelector('button');

    const brandName = brandInput.value.trim();

    if (!brandName) {
        resultBox.style.display = 'block'; // Unhide the box
        resultText.innerText = "Please enter a brand name.";
        return;
    }

    // 1. Show loading state & unhide the box
    searchBtn.disabled = true;
    searchBtn.innerText = "Translating...";
    resultBox.style.display = 'block'; 
    resultText.innerText = "Asking the AI...";

    try {
        const response = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ brand: brandName })
        });

        const data = await response.json();
        
        if (data.answer) {
            // Use innerHTML so Mistral's line breaks format nicely
            // We also replace the **bold** markers with actual HTML bold tags
            let formattedAnswer = data.answer.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            formattedAnswer = formattedAnswer.replace(/\n/g, '<br>');
            
            resultText.innerHTML = formattedAnswer;
        } else {
            resultText.innerText = "AI Response: " + (data.error || "No equivalent found.");
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        resultText.innerText = "Error connecting to the AI.";
    } finally {
        // Reset the button
        searchBtn.disabled = false;
        searchBtn.innerHTML = "Translate 🌍";
    }
}

window.findBrand = findBrand;
