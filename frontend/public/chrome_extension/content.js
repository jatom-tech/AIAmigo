console.log("AIAmigo kører i baggrunden diskret...");

// Dynamisk indlæsning af eksterne moduler
function loadScript(src, onLoadCallback) {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL(src); // Gør brug af Chrome's runtime-URL
    script.onload = () => {
        console.log(`${src} er korrekt indlæst.`);
        if (onLoadCallback) onLoadCallback();
    };
    script.onerror = () => {
        console.error(`Kunne ikke indlæse ${src}`);
    };
    document.head.appendChild(script);
}

// Indlæsning af DialogModul.js og risk-module.js
loadScript('scripts/DialogModul.js', () => {
    if (typeof DialogModul !== "undefined") {
        console.log("DialogModul er korrekt indlæst.");
    } else {
        console.error("DialogModul blev ikke indlæst korrekt.");
    }
});

loadScript('scripts/risk-module.js', () => {
    if (typeof window.analyzeText === "function") {
        console.log("Risk-modul er korrekt indlæst.");
    } else {
        console.error("Risk-modul blev ikke indlæst korrekt.");
    }
});

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
        if (existingPopup) existingPopup.remove(); // Remove any existing popup to avoid duplicates

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

        // Make the popup visible
        setTimeout(() => {
            popup.style.visibility = 'visible';
            popup.style.opacity = '1';
        }, 100);

        // Automatically hide the popup after 5 seconds
        setTimeout(() => {
            popup.style.opacity = '0'; // Start fade-out transition
            setTimeout(() => popup.remove(), 500); // Remove from DOM after fade-out
        }, 5000);
    }

    // Eksponér showPopup via postMessage
    window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SHOW_POPUP') {
            const { message, popupType } = event.data;
            showPopup(message, popupType);
        }
    });

    console.log("showPopup er nu eksponeret globalt via postMessage.");

    function analyzeAndHandle(text) {
        if (typeof window.analyzeText !== 'function') {
            console.error("Risk-modul er ikke korrekt indlæst.");
            return;
        }

        const matches = window.analyzeText(text);

        // Tilføjet kontrol for at sikre, at matches er et array
        if (Array.isArray(matches) && matches.length > 0) {
            riskyPromptCount++;
            saveToLocalStorage();
            showPopup(
                `⚠️ Din tekst indeholder potentielt følsomt indhold: ${matches.join(', ')}.`,
                'warning'
            );
        } else if (Array.isArray(matches) && matches.length === 0) {
            showPopup("✅ Din tekst ser fin ud – ingen følsomt indhold fundet.", "info");
        } else {
            console.error("`matches` er ikke et array eller er ikke korrekt defineret:", matches);
        }
    }

    function monitorUserInput() {
        console.log("AIAmigo overvåger diskret brugerens input...");

        document.addEventListener('input', (event) => {
            if (event.target.tagName === 'TEXTAREA' || event.target.tagName === 'INPUT') {
                const userInput = event.target.value;
                if (userInput && userInput.trim().length > 0) {
                    if (typeof DialogModul !== "undefined" && typeof DialogModul.analyse === "function") {
                        DialogModul.analyse(userInput); // Kalder DialogModul.analyse
                    } else {
                        console.error("DialogModul eller analyse-funktionen er ikke korrekt indlæst.");
                    }
                    lastDetectedPrompt = userInput;
                    promptList.push(userInput);
                    saveToLocalStorage();
                }
            }
        });

        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        const userBubble = node.querySelector?.('[data-message-author-role="user"]');
                        if (userBubble) {
                            const promptText = userBubble.innerText?.trim();
                            if (promptText && promptText !== lastDetectedPrompt) {
                                lastDetectedPrompt = promptText;
                                analyzeAndHandle(promptText);
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

    function monitorFileUpload() {
        document.body.addEventListener('change', (event) => {
            const target = event.target;
            if (target.tagName === 'INPUT' && target.type === 'file') {
                const fileName = target.files[0]?.name;
                if (fileName) {
                    showPopup(`📎 Du har uploadet: ${fileName}. Vær opmærksom på personfølsomt indhold.`, 'warning');
                }
            }
        }, true);
    }

    function createShield() {
        const existingShield = document.querySelector('.aiamigo-shield');
        if (existingShield) return;

        const shield = document.createElement('div');
        shield.className = 'aiamigo-shield';

        const shieldImage = document.createElement('img');
        shieldImage.src = 'https://i.imgur.com/nzP3gLM.png';
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
    monitorFileUpload();
    createShield();
})();