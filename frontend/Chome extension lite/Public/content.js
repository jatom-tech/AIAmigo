
// === RISIKOORD + CPR-DETEKTION ===
const riskyWords = ['cpr', 'sygdom', 'afskedigelse', 'diskrimination', 'løn'];
const cprPattern = /\b\d{6}-?\d{4}\b/;

let lastObservedText = '';

function classify(text) {
    console.log("[AIAmigo] Observeret tekst:", text);
    if (cprPattern.test(text)) {
        console.log("[AIAmigo] CPR-format detekteret");
        return 'red';
    }
    const lower = text.toLowerCase();
    if (riskyWords.some(w => lower.includes(w))) {
        console.log("[AIAmigo] Risikord detekteret");
        return 'yellow';
    }
    if (text.trim().length > 0) {
        console.log("[AIAmigo] Ingen risiko – klassificeret som grøn");
        return 'green';
    }
    console.log("[AIAmigo] Tom eller ugyldig tekst");
    return 'unknown';
}

function showPopup(message, color = '#0c5460', background = '#d1ecf1', border = '#bee5eb') {
    document.querySelector('.aiamigo-popup')?.remove();
    const popup = document.createElement('div');
    popup.className = 'aiamigo-popup';
    popup.textContent = message;
    Object.assign(popup.style, {
        position: 'fixed',
        bottom: '80px',
        right: '10px',
        backgroundColor: background,
        color: color,
        padding: '10px',
        border: `1px solid ${border}`,
        borderRadius: '6px',
        fontSize: '14px',
        zIndex: 10000,
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
        fontFamily: 'Arial, sans-serif'
    });
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 5000);
    console.log("[AIAmigo] Popup vist:", message);
}

function monitorInput() {
    const observer = new MutationObserver(() => {
        const el = document.activeElement;
        if (el && (el.isContentEditable || el.tagName === 'TEXTAREA' || el.tagName === 'INPUT')) {
            lastObservedText = el.innerText || el.value || '';
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });

    document.addEventListener('input', () => {
        const el = document.activeElement;
        if (el && (el.isContentEditable || el.tagName === 'TEXTAREA' || el.tagName === 'INPUT')) {
            lastObservedText = el.innerText || el.value || '';
        }
    });
}

function listenForEnter() {
    document.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter') return;

        setTimeout(() => {
            const text = lastObservedText.trim();
            if (!text) {
                showPopup("⚠️ Ingen tekst registreret", '#856404', '#fff3cd', '#ffeeba');
                return;
            }

            const classification = classify(text);
            if (classification === 'red') {
                showPopup("Advarsel: Din prompt indeholder følsomme data! 🚨", '#721c24', '#f8d7da', '#f5c6cb');
            } else if (classification === 'yellow') {
                showPopup("Overvej at forbedre din prompt for bedre resultater. ⚠️", '#856404', '#fff3cd', '#ffeeba');
            } else if (classification === 'green') {
                showPopup("Din prompt ser stærk ud. Fortsæt roligt! 🌟", '#155724', '#d4edda', '#c3e6cb');
            } else {
                showPopup("⚠️ Ingen klassificering muligt", '#6c757d', '#e2e3e5', '#d6d8db');
            }
        }, 50);
    });
}

function createShieldWithButtons() {
    const existing = document.querySelector('.aiamigo-shield');
    if (existing) return;

    const shield = document.createElement('div');
    shield.className = 'aiamigo-shield';
    const img = document.createElement('img');
    img.src = 'https://i.imgur.com/nzP3gLM.png';
    img.alt = 'AIAmigo Shield';
    Object.assign(img.style, {
        width: '100%',
        height: '100%',
        objectFit: 'contain'
    });
    Object.assign(shield.style, {
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        width: '40px',
        height: '40px',
        zIndex: 9999,
        backgroundColor: '#fff',
        cursor: 'pointer',
        boxShadow: '0px 4px 10px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    });
    shield.appendChild(img);
    document.body.appendChild(shield);

    shield.addEventListener('click', () => {
        const existingBox = document.getElementById('aiamigo-buttons');
        if (existingBox) {
            existingBox.remove();
            return;
        }
        const box = document.createElement('div');
        box.id = 'aiamigo-buttons';
        Object.assign(box.style, {
            position: 'fixed',
            bottom: '60px',
            right: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            zIndex: 9999
        });

        const btn1 = document.createElement('button');
        btn1.textContent = '💡 Playground';
        btn1.onclick = () => alert('Har du forslag? Send dem her! (Funktion kommer snart)');

        const btn2 = document.createElement('button');
        btn2.textContent = '💙 Donér';
        btn2.onclick = () => window.open('https://www.buymeacoffee.com/janthomsen', '_blank');

        [btn1, btn2].forEach(btn => {
            Object.assign(btn.style, {
                backgroundColor: '#ffffff',
                color: '#333',
                border: '1px solid #ccc',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0px 2px 6px rgba(0,0,0,0.1)',
            });
            box.appendChild(btn);
        });

        document.body.appendChild(box);

        // Auto-luk knapper efter 5 sekunder
        setTimeout(() => {
            document.getElementById('aiamigo-buttons')?.remove();
        }, 5000);
    });
}

monitorInput();
listenForEnter();
createShieldWithButtons();
