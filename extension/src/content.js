import { analyzeText } from './riskmodul.js';
import DialogModul from './DialogModul.js';

console.log("AIAmigo kører i baggrunden diskret...");

(function () {
    'use strict';

    let lastDetectedPrompt = '';

    let promptList = JSON.parse(localStorage.getItem('aiamigo_prompts')) || [];
    let riskyPromptCount = parseInt(localStorage.getItem('aiamigo_risky_prompts')) || 0;

    function saveToLocalStorage() {
        localStorage.setItem('aiamigo_prompts', JSON.stringify(promptList));
        localStorage.setItem('aiamigo_risky_prompts', riskyPromptCount.toString());
    }

    function calculateAmigoScore() {
        const totalPrompts = promptList.length;
        return totalPrompts > 0
            ? Math.max(0, 100 - Math.round((riskyPromptCount / totalPrompts) * 100))
            : 100;
    }

    function showPopup(message, type = "info") {
        const existingPopup = document.querySelector('.aiamigo-popup');
        if (existingPopup) existingPopup.remove();

        const popup = document.createElement('div');
        popup.className = 'aiamigo-popup';
        Object.assign(popup.style, {
            position: 'fixed',
            bottom: '60px',
            right: '10px',
            backgroundColor: type === 'warning' ? '#f8d7da' : '#d1ecf1',
            color: type === 'warning' ? '#721c24' : '#0c5460',
            border: type === 'warning' ? '1px solid #f5c6cb' : '1px solid #bee5eb',
            padding: '10px',
            borderRadius: '6px',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
            width: '250px',
            zIndex: '10000',
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            visibility: 'hidden',
            opacity: '0',
            transition: 'opacity 0.5s ease',
        });

        popup.innerHTML = `<p style="margin: 0;">${message}</p>`;
        document.body.appendChild(popup);

        setTimeout(() => {
            popup.style.visibility = 'visible';
            popup.style.opacity = '1';
        }, 100);

        setTimeout(() => {
            popup.style.opacity = '0';
            setTimeout(() => popup.remove(), 500);
        }, 5000);
    }

    window.showPopup = showPopup;

    function monitorUserInput() {
        console.log("AIAmigo overvåger diskret brugerens input...");
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        const userBubble = node.querySelector?.('[data-message-author-role="user"]');
                        if (userBubble) {
                            const promptText = userBubble.innerText?.trim();
                            if (promptText && promptText !== lastDetectedPrompt) {
                                lastDetectedPrompt = promptText;

                                const matches = analyzeText(promptText); // ← Kalder riskmodul.js
                                if (matches.length > 0) {
                                    riskyPromptCount++;
                                    saveToLocalStorage();
                                    showPopup(
                                        `⚠️ Din tekst indeholder potentielt følsomt indhold: ${matches.join(', ')}.`,
                                        'warning'
                                    );
                                }
                                promptList.push(promptText);
                                saveToLocalStorage();
                            }
                        }
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    function handleEnterKey() {
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                const activeElement = document.activeElement;
                const promptText = activeElement?.value?.trim();

                if (promptText && promptText !== lastDetectedPrompt) {
                    lastDetectedPrompt = promptText;

                    const matches = analyzeText(promptText); // ← Kalder riskmodul.js
                    if (matches.length > 0) {
                        riskyPromptCount++;
                        saveToLocalStorage();
                        showPopup(
                            `⚠️ Din tekst indeholder potentielt følsomt indhold: ${matches.join(', ')}.`,
                            'warning'
                        );
                    }
                    promptList.push(promptText);
                    saveToLocalStorage();
                }
            }
        });
    }

    function createShield() {
        const existingShield = document.querySelector('.aiamigo-shield');
        if (existingShield) return;

        const shield = document.createElement('div');
        shield.className = 'aiamigo-shield';

        const shieldImage = document.createElement('img');
        shieldImage.src = './assets/icon.png'; // Lokal reference til din icon.png
        shieldImage.alt = 'AIAmigo Shield';

        Object.assign(shield.style, {
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            width: '30px',
            height: '30px',
            zIndex: '9999',
            cursor: 'pointer',
            backgroundColor: '#ffffff',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
        });

        Object.assign(shieldImage.style, {
            width: '100%',
            height: '100%',
            objectFit: 'contain',
        });

        shield.appendChild(shieldImage);

        shield.addEventListener('click', () => {
            const amigoScore = calculateAmigoScore();
            showPopup(`🛡️ Din Amigo Score: ${amigoScore}%`, 'info');
        });

        document.body.appendChild(shield);
        console.log("AIAmigo-skjold tilføjet til dokumentet.");
    }

    monitorUserInput();
    handleEnterKey();
    createShield();
})();