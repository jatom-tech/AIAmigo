(function () {
  // === KONFIGURATION ===
  const config = {
    autoCloseDelay: 5000,
    donateUrl: "https://www.buymeacoffee.com/janthomsen",
    playgroundUrl: "https://jatom-tech.github.io/AIAmigo-lite/playground/",
    shieldIcon: "https://i.imgur.com/nzP3gLM.png",
    scoreColor: { green: "#11b93b", orange: "#ffb300", red: "#e33e2b" }
  };

  // === INTERNATIONALISERING ===
  const translations = {
    da: {
      amigoscore: "🔰 Amigo-score",
      upload: "📂 Tjek prompt upload",
      playground: "💡 Playground",
      donate: "💙 Donér",
      popup_red: "Advarsel: Din tekst indeholder følsomme data! 🚨",
      popup_yellow: "⚠️ Overvej at forbedre din tekst.",
      popup_green: "✅ Din tekst ser stærk ud.",
      popup_none: "⚠️ Ingen klassificering muligt",
      score_label: "Din Amigo-score",
      file_missing: "Upload venligst en tekstfil først.",
      no_issues: "Ingen problemer fundet.",
      findings_title: "Fundet i fil:",
      donate_desc: "Støt udviklingen"
    },
    en: {
      amigoscore: "🔰 Amigo Score",
      upload: "📂 Check prompt upload",
      playground: "💡 Playground",
      donate: "💙 Donate",
      popup_red: "Warning: Your text contains sensitive data! 🚨",
      popup_yellow: "⚠️ Consider improving your text.",
      popup_green: "✅ Your text looks strong.",
      popup_none: "⚠️ No classification possible",
      score_label: "Your Amigo Score",
      file_missing: "Please upload a text file first.",
      no_issues: "No issues found.",
      findings_title: "Findings in file:",
      donate_desc: "Support development"
    },
    es: {
      amigoscore: "🔰 Puntuación Amigo",
      upload: "📂 Revisar subida de prompt",
      playground: "💡 Playground",
      donate: "💙 Donar",
      popup_red: "¡Advertencia: Tu texto contiene datos sensibles! 🚨",
      popup_yellow: "⚠️ Considera mejorar tu texto.",
      popup_green: "✅ Tu texto parece correcto.",
      popup_none: "⚠️ Clasificación no posible",
      score_label: "Tu puntuación Amigo",
      file_missing: "Por favor, sube un archivo de texto primero.",
      no_issues: "No se encontraron problemas.",
      findings_title: "Hallazgos en el archivo:",
      donate_desc: "Apoya el desarrollo"
    }
  };

  function detectLang() {
    const l = navigator.language.slice(0, 2);
    return translations[l] ? l : "en";
  }
  let currentLang = detectLang();

  // === SENSITIVITETS- OG RISIKOLOGIK ===
  const sensitivePatterns = {
    da: [/\b\d{6}-?\d{4}\b/i, /\bcpr\b/i],
    en: [/\b\d{3}-\d{2}-\d{4}\b/i, /\bssn\b/i, /\bsocial\s*security\s*(number|no)?\b/i],
    es: [/\b\d{8}[A-Za-z]\b/i, /\bdni\b/i, /\bnie\b/i, /\bn[ie] number\b/i]
  };
  const riskyWords = [
    'sygdom', 'afskedigelse', 'diskrimination', 'løn',
    'illness', 'dismissal', 'discrimination', 'salary',
    'enfermedad', 'despido', 'discriminación', 'salario'
  ];

  function containsSensitiveID(text, lang) {
    const patterns = sensitivePatterns[lang] || [];
    return patterns.some(pattern => pattern.test(text));
  }
  function classify(text) {
    if (containsSensitiveID(text, currentLang)) return 'red';
    if (riskyWords.some(w => text.toLowerCase().includes(w))) return 'yellow';
    if (text.trim()) return 'green';
    return 'unknown';
  }

  // === UI POPUP ===
  function showPopup(msg, type = "info") {
    document.querySelector('.aiamigo-popup')?.remove();
    const popup = document.createElement('div');
    popup.className = 'aiamigo-popup';
    Object.assign(popup.style, {
      position: 'fixed', bottom: '60px', right: '10px',
      background: type === 'warning' ? '#f8d7da' : '#d1ecf1',
      color: type === 'warning' ? '#721c24' : '#0c5460',
      border: '1px solid #bee5eb', padding: '10px 18px',
      borderRadius: '6px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
      fontFamily: 'Arial', fontSize: '15px',
      zIndex: 10000, opacity: '0', transition: 'opacity 0.5s'
    });
    popup.textContent = msg;
    document.body.appendChild(popup);
    setTimeout(() => { popup.style.opacity = '1'; }, 30);
    setTimeout(() => {
      popup.style.opacity = '0';
      setTimeout(() => popup.remove(), 500);
    }, config.autoCloseDelay);
  }

  // === AMIGO SCORE (PRO) ===
  function getComplianceScore() {
    // Dummy logic: could be replaced with real stats
    const r = parseInt(localStorage.getItem('aiamigo_r') || '0', 10);
    const y = parseInt(localStorage.getItem('aiamigo_y') || '0', 10);
    const g = parseInt(localStorage.getItem('aiamigo_g') || '0', 10);
    const total = r + y + g;
    let score = 0;
    if (total > 0) score = Math.round(((g * 100) + (y * 50)) / total);
    let color = config.scoreColor.red;
    if (score >= 80) color = config.scoreColor.green;
    else if (score >= 50) color = config.scoreColor.orange;
    return { score, color };
  }
  function showScorePopup() {
    const { score, color } = getComplianceScore();
    const t = translations[currentLang];
    // Let the popup stay longer for score
    document.querySelector('.aiamigo-popup')?.remove();
    const popup = document.createElement('div');
    popup.className = 'aiamigo-popup';
    Object.assign(popup.style, {
      position: 'fixed', bottom: '60px', right: '10px',
      background: '#f6fafd',
      color: color,
      border: `2px solid ${color}`,
      padding: '15px 26px',
      borderRadius: '10px',
      boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
      fontFamily: 'Arial', fontSize: '22px',
      fontWeight: 'bold',
      zIndex: 10000, opacity: '0', transition: 'opacity 0.5s'
    });
    popup.innerHTML = `<div style="font-size:16px;margin-bottom:6px;">${t.score_label}</div>
      <div style="font-size:38px;">${score}%</div>`;
    document.body.appendChild(popup);
    setTimeout(() => { popup.style.opacity = '1'; }, 30);
    setTimeout(() => {
      popup.style.opacity = '0';
      setTimeout(() => popup.remove(), 600);
    }, 3500);
  }

  // === FILUPLOAD / PROMPT CHECK ===
  function showUploadDialog() {
    // Clean up any existing
    document.getElementById('aiamigo-upload-dialog')?.remove();
    const t = translations[currentLang];

    // Dialog
    const dialog = document.createElement('div');
    dialog.id = 'aiamigo-upload-dialog';
    Object.assign(dialog.style, {
      position: 'fixed', top: '50%', left: '50%',
      transform: 'translate(-50%,-50%)',
      background: '#fff', border: '1.5px solid #b1bac4',
      borderRadius: '12px', boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
      zIndex: 10001, padding: '30px 24px', minWidth: '320px'
    });
    dialog.innerHTML = `
      <div style="font-size:15px;margin-bottom:14px;font-weight:600;">${t.upload}</div>
      <input type="file" id="aiamigo-file" accept=".txt" style="margin-bottom:12px;">
      <div id="aiamigo-upload-result" style="margin-top:14px;color:#444;font-size:14px;"></div>
      <button id="aiamigo-upload-close" style="margin-top:22px;padding:6px 18px;border-radius:6px;border:1px solid #ccc;cursor:pointer;">OK</button>
    `;
    document.body.appendChild(dialog);

    document.getElementById('aiamigo-upload-close').onclick = () => dialog.remove();

    document.getElementById('aiamigo-file').onchange = function (e) {
      const file = e.target.files[0];
      if (!file) {
        document.getElementById('aiamigo-upload-result').textContent = t.file_missing;
        return;
      }
      const reader = new FileReader();
      reader.onload = function (evt) {
        const content = evt.target.result;
        const lines = content.split(/\r?\n/);
        let findings = [];
        lines.forEach((line, idx) => {
          if (line.match(/persondata/i)) {
            findings.push(`Line ${idx + 1}: "persondata" → Suggest 'følsomme oplysninger'`);
          }
          if (line.match(/password/i)) {
            findings.push(`Line ${idx + 1}: "password" → Remove passwords from document`);
          }
          if (containsSensitiveID(line, currentLang)) {
            findings.push(`Line ${idx + 1}: Sensitive ID detected`);
          }
        });
        document.getElementById('aiamigo-upload-result').innerHTML =
          findings.length ? `<strong>${t.findings_title}</strong><br>${findings.join("<br>")}` : t.no_issues;
      };
      reader.readAsText(file);
    };
  }

  // === DONATION LINK ===
  function openDonate() {
    window.open(config.donateUrl, "_blank");
  }

  // === PLAYGROUND LINK ===
  function openPlayground() {
    window.open(config.playgroundUrl, "_blank");
  }

  // === MENU KNAPPER ===
  function createButton(text, onClick, color = "#fff") {
    const btn = document.createElement('button');
    btn.textContent = text;
    Object.assign(btn.style, {
      display: 'block', width: '100%',
      padding: '10px 14px', margin: '5px 0',
      borderRadius: '7px', border: '1px solid #b1bac4',
      background: color, color: "#222",
      fontSize: '15px', fontWeight: 600,
      cursor: 'pointer', transition: 'all 0.22s'
    });
    btn.addEventListener('click', (e) => { e.stopPropagation(); onClick(); });
    return btn;
  }

  // === SHIELD MENU ===
  function createShieldMenu() {
    const existing = document.getElementById('aiamigo-buttons');
    if (existing) { existing.remove(); return; }

    const menu = document.createElement('div');
    menu.id = 'aiamigo-buttons';
    Object.assign(menu.style, {
      position: 'fixed', bottom: '60px', right: '10px',
      background: '#fff', borderRadius: '13px',
      padding: '18px 16px 14px 16px',
      boxShadow: '0 4px 18px rgba(0,0,0,0.18)',
      zIndex: 9999, minWidth: '180px'
    });

    // Knapper
    menu.appendChild(createButton(translations[currentLang].amigoscore, showScorePopup, "#e7f7ee"));
    menu.appendChild(createButton(translations[currentLang].upload, showUploadDialog, "#eceeff"));
    menu.appendChild(createButton(translations[currentLang].playground, openPlayground, "#fffbe6"));
    menu.appendChild(createButton(translations[currentLang].donate, openDonate, "#fff8f9"));

    // Luk ved klik udenfor
    setTimeout(() => {
      document.addEventListener('mousedown', function close(e) {
        if (!menu.contains(e.target) && !e.target.closest('.aiamigo-shield')) {
          menu.remove();
        }
      }, { once: true });
    }, 20);

    document.body.appendChild(menu);
  }

  // === SHIELD ===
  function createShield() {
    if (document.querySelector('.aiamigo-shield')) return;
    const shield = document.createElement('div');
    shield.className = 'aiamigo-shield';
    shield.innerHTML = `<img src="${config.shieldIcon}" alt="AIAmigo Shield" style="width:100%;height:100%;object-fit:contain;">`;
    Object.assign(shield.style, {
      position: 'fixed', bottom: '10px', right: '10px',
      width: '44px', height: '44px',
      zIndex: 9999, cursor: 'pointer',
      background: '#fff',
      boxShadow: '0px 4px 10px rgba(0,0,0,0.2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: '50%'
    });
    shield.onclick = createShieldMenu;
    document.body.appendChild(shield);
  }

  // === TEKSTKLASSIFICERING MED POPUP ===
  function handleClassification(text) {
    const cl = classify(text);
    const t = translations[currentLang];
    // Vis popup hver gang!
    if (!text.trim()) return;
    if (cl === 'red') showPopup(t.popup_red, "warning");
    else if (cl === 'yellow') showPopup(t.popup_yellow, "warning");
    else if (cl === 'green') showPopup(t.popup_green, "info");
    else showPopup(t.popup_none, "info");
  }
  function onInput(e) {
    const el = e.target;
    const text = el.isContentEditable ? el.innerText : (el.value || "");
    handleClassification(text);
  }
  function addInputListeners() {
    document.querySelectorAll('textarea, input[type="text"], [contenteditable="true"]').forEach(el => {
      if (!el.aiamigo_hasListener) {
        el.addEventListener('input', onInput, true);
        el.aiamigo_hasListener = true;
      }
    });
  }

  // === INITIALISERING ===
  setInterval(() => {
    if (!document.querySelector('.aiamigo-shield')) createShield();
    addInputListeners();
  }, 1500);

  function startAIAmigo() {
    setTimeout(createShield, 200);
    setTimeout(addInputListeners, 400);
  }
  if (document.readyState === "complete" || document.readyState === "interactive") {
    startAIAmigo();
  } else {
    document.addEventListener('DOMContentLoaded', startAIAmigo);
  }
})();