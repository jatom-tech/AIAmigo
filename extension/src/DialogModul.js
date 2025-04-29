const DialogModul = (function () {
    'use strict';

    // Farver til popup (Manifest principper)
    const colors = {
        green: '#00cc66',
        yellow: '#ffcc00',
        red: '#ff3333',
    };

    // Healing beskeder (fra Manifest.md)
    const messages = {
        green: "Din prompt ser stærk ud. Fortsæt roligt!",
        yellow: "Der er småting du kan styrke. Overvej en forbedring?",
        red: "Følsomme data fundet. Overvej at beskytte dem bedre.",
    };

    /**
     * Klassificér input baseret på simple nøgleord
     */
    function classifyPrompt(promptText) {
        const lowerText = promptText.toLowerCase();
        
        if (lowerText.includes('cpr') || lowerText.includes('personnummer') || lowerText.includes('sygdom')) {
            return 'red';
        } else if (lowerText.includes('kontrakt') || lowerText.includes('aftale') || lowerText.includes('pris')) {
            return 'yellow';
        } else {
            return 'green';
        }
    }

    /**
     * Vis popup med venlig besked
     */
    function showPopup(riskLevel) {
        const popup = document.createElement('div');
        popup.style.position = 'fixed';
        popup.style.bottom = '80px';
        popup.style.right = '10px';
        popup.style.backgroundColor = 'black';
        popup.style.color = 'white';
        popup.style.padding = '15px';
        popup.style.borderRadius = '10px';
        popup.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.4)';
        popup.style.border = `2px solid ${colors[riskLevel]}`;
        popup.style.width = '220px';
        popup.style.textAlign = 'center';
        popup.style.zIndex = '10001';

        popup.innerHTML = `
            <p style="font-size: 16px; margin: 0 0 10px 0; font-weight: bold;">Amigo Score</p>
            <p style="font-size: 14px; margin: 0;">${messages[riskLevel]}</p>
            <span id="dialog-close" style="position: absolute; top: 5px; right: 8px; cursor: pointer;">✖</span>
        `;

        popup.querySelector('#dialog-close').onclick = () => popup.remove();
        document.body.appendChild(popup);
    }

    /**
     * Offentlig funktion: Analysér prompt og vis popup
     */
    function analyse(promptText) {
        const riskLevel = classifyPrompt(promptText);
        showPopup(riskLevel);
    }

    // Gør analysefunktionen tilgængelig
    return {
        analyse,
    };
})();