console.log("DialogModul er korrekt indlæst.");
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
     * Klassificér prompt baseret på risk-module.js
     */
    function classifyPrompt(promptText) {
        try {
            const result = window.AIAmigo.fetchRiskFromModel(promptText) || { label: 'Ukendt' };
            const riskLevel = result.label.toLowerCase(); // Antag "Lav", "Mellem", "Høj"
            return riskLevel === 'lav' ? 'green' : riskLevel === 'mellem' ? 'yellow' : 'red';
        } catch (error) {
            console.error("Fejl i classifyPrompt:", error);
            return 'green'; // Standard risikoniveau
        }
    }

    /**
     * Vis popup med venlig besked
     */
    function showPopup(riskLevel) {
        const popup = document.createElement('div');
        popup.classList.add('dialog-popup'); // Tilføjet CSS-klasse for styling
        popup.style.border = `2px solid ${colors[riskLevel]}`;

        popup.innerHTML = `
            <p style="font-size: 16px; margin: 0 0 10px 0; font-weight: bold;">Amigo Score</p>
            <p style="font-size: 14px; margin: 0;">${messages[riskLevel]}</p>
            <span id="dialog-close" style="position: absolute; top: 5px; right: 8px; cursor: pointer;">✖</span>
        `;

        popup.querySelector('#dialog-close').onclick = () => popup.remove();

        document.body.appendChild(popup);

        // Luk popup automatisk efter 5 sekunder
        setTimeout(() => popup.remove(), 5000);
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

// Eksempel CSS til popup
const style = document.createElement('style');
style.textContent = `
    .dialog-popup {
        position: fixed;
        bottom: 10%;
        right: 10px;
        background-color: black;
        color: white;
        padding: 15px;
        border-radius: 10px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
        width: 220px;
        text-align: center;
        z-index: 10001;
    }
`;
document.head.appendChild(style);

// Gør DialogModul globalt tilgængeligt
window.DialogModul = DialogModul;