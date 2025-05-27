// === AMIGOLITE FINAL v1.3 – ROBUST ENTER POPUP ===
console.log("AmigoLite Final kører...");

// === RISIKOORD + CPR-DETEKTION ===
const riskyWords = ['cpr', 'sygdom', 'afskedigelse', 'diskrimination', 'løn'];
const cprPattern = /\b\d{6}-?\d{4}\b/;

function classify(text) {
    if (cprPattern.test(text)) return 'red';
    const lower = text.toLowerCase();
    if (riskyWords.some(w => lower.includes(w))) return 'yellow';
    return 'green';
}

// === POPUP VISNING ===
function showAmigoPopup(riskLevel) {
    const existing = document.querySelector('.amigo-popup');
    if (existing) existing.remove();

    const popup = document.createElement('div');
    popup.className = 'amigo-popup';
    const color = riskLevel === 'red' ? '#ff3333' : riskLevel === 'yellow' ? '#ffcc00' : '#00cc66';
    const message = riskLevel === 'red'
        ? '⚠️ Følsomme data fundet. Overvej at beskytte dem bedre.'
        : riskLevel === 'yellow'
        ? '🟡 Der er småting du kan styrke. Overvej en forbedring?'
        : '✅ Din prompt ser stærk ud. Fortsæt roligt!';

    Object.assign(popup.style, {
        position: 'fixed',
        bottom: '100px',
        right: '20px',
        backgroundColor: 'black',
        border: `3px solid ${color}`,
        color: 'white',
        padding: '15px',
        borderRadius: '12px',
        fontSize: '15px',
        maxWidth: '280px',
        zIndex: 10000,
        boxShadow: '0 0 12px rgba(0,0,0,0.4)',
        transition: 'opacity 0.5s ease',
    });

    popup.innerHTML = message;
    document.body.appendChild(popup);

    setTimeout(() => {
        popup.style.opacity = '0';
        setTimeout(() => popup.remove(), 500);
    }, 5000);
}

// === SHIELD VISNING ===
function createShield() {
    const existing = document.querySelector('.aiamigo-shield');
    if (existing) return;

    const shield = document.createElement('div');
    shield.className = 'aiamigo-shield';

    const shieldImage = document.createElement('img');
    shieldImage.src = 'https://i.imgur.com/nzP3gLM.png';
    shieldImage.alt = 'AmigoLite Shield';
    Object.assign(shield.style, {
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        width: '30px',
        height: '30px',
        backgroundColor: '#fff',
        borderRadius: '6px',
        boxShadow: '0 0 5px rgba(0,0,0,0.2)',
        zIndex: 9999,
        cursor: 'pointer',
    });
    Object.assign(shieldImage.style, {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
    });

    shield.appendChild(shieldImage);

    shield.addEventListener('click', () => {
        const prompts = JSON.parse(localStorage.getItem('aiamigo_prompts') || '[]');
        let r = 0, y = 0, g = 0;
        prompts.forEach(p => {
            const risk = classify(p);
            if (risk === 'red') r++;
            else if (risk === 'yellow') y++;
            else g++;
        });
        const total = r + y + g;
        const toPct = x => total ? Math.round((x / total) * 100) : 0;

        const panel = document.createElement('div');
        panel.className = 'amigo-popup';
        Object.assign(panel.style, {
            position: 'fixed',
            bottom: '50px',
            right: '10px',
            backgroundColor: 'black',
            border: '2px solid red',
            color: 'white',
            padding: '12px',
            fontSize: '14px',
            borderRadius: '10px',
            textAlign: 'left',
            zIndex: 10001,
        });

        panel.innerHTML = `
            <b>Din Amigo Status</b><br>
            🔴 Rød: ${r} (${toPct(r)}%)<br>
            🟡 Gul: ${y} (${toPct(y)}%)<br>
            🟢 Grøn: ${g} (${toPct(g)}%)<br>
            <span style="font-size:13px;">📊 I alt: ${total} prompts</span>
        `;

        document.body.appendChild(panel);
        setTimeout(() => panel.remove(), 5000);
    });

    document.body.appendChild(shield);
}

// === BIND ENTER-DOWN PÅ FELTER ===
function bindEnterDetection() {
    const prompts = JSON.parse(localStorage.getItem('aiamigo_prompts') || '[]');

    const bindToField = (el) => {
        if (el._amigoBound) return;
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                const val = el.value.trim();
                if (!val) return;
                prompts.push(val);
                localStorage.setItem('aiamigo_prompts', JSON.stringify(prompts));
                const risk = classify(val);
                showAmigoPopup(risk);
            }
        });
        el._amigoBound = true;
    };

    const scanAndBind = () => {
        document.querySelectorAll('textarea, input[type="text"]').forEach(bindToField);
    };

    // Første scanning + mutation observer
    scanAndBind();
    const observer = new MutationObserver(scanAndBind);
    observer.observe(document.body, { childList: true, subtree: true });
}

createShield();
bindEnterDetection();
