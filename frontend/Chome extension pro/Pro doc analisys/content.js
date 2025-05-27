// AIAmigo PRO Content Script
(function () {
  // --- KONFIG ---
  const config = {
    autoCloseDelay: 5000,
    donateUrl: "https://www.buymeacoffee.com/janthomsen",
    playgroundUrl: "https://jatom-tech.github.io/AIAmigo-lite/playground/",
    shieldIcon: "icons/shield-48.png",
    scoreColor: { green: "#11b93b", orange: "#ffb300", red: "#e33e2b" }
  };

  // --- I18N ---
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
      file_missing: "Upload venligst en tekst-, docx-, pdf- eller png-fil først.",
      no_issues: "Ingen problemer fundet.",
      findings_title: "Fundet i fil:"
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
      file_missing: "Please upload a text, docx, pdf or png file first.",
      no_issues: "No issues found.",
      findings_title: "Findings in file:"
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
      file_missing: "Por favor, sube un archivo de texto, docx, pdf o png primero.",
      no_issues: "No se encontraron problemas.",
      findings_title: "Hallazgos en el archivo:"
    }
  };

  function detectLang() {
    const l = navigator.language.slice(0, 2);
    return translations[l] ? l : "en";
  }
  let currentLang = detectLang();

  // --- SENSITIVITET & RISIKO ---
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

  // --- POPUP UI ---
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

  // --- SCORE ---
  function getComplianceScore() {
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

  // --- FILUPLOAD / PRO UPLOAD DIALOG ---
  async function showProUploadDialog() {
    document.getElementById('aiamigo-upload-dialog')?.remove();
    const t = translations[currentLang];

    // Dialog skeleton
    const dialog = document.createElement('div');
    dialog.id = 'aiamigo-upload-dialog';
    Object.assign(dialog.style, {
      position: 'fixed', top: '50%', left: '50%',
      transform: 'translate(-50%,-50%)',
      background: '#fff', border: '2px solid #b1bac4',
      borderRadius: '15px', boxShadow: '0 8px 32px rgba(0,0,0,0.13)',
      zIndex: 10001, padding: '36px 32px', minWidth: '380px'
    });
    dialog.innerHTML = `
      <div style="font-size:17px;margin-bottom:20px;font-weight:700;display:flex;align-items:center;gap:10px;">
        <img src="${config.shieldIcon}" style="height:34px;width:34px;"> ${t.upload}
      </div>
      <input type="file" id="aiamigo-file" accept=".txt,.pdf,.docx,.png" style="margin-bottom:20px;">
      <div id="aiamigo-upload-progress" style="margin:12px 0 18px 0; color:#888; font-size:13px;"></div>
      <div id="aiamigo-upload-result" style="color:#444;font-size:14px;max-height:350px;overflow:auto;"></div>
      <button id="aiamigo-upload-close" style="margin-top:22px;padding:8px 20px;border-radius:8px;border:1.5px solid #ccc;cursor:pointer;">OK</button>
    `;
    document.body.appendChild(dialog);

    document.getElementById('aiamigo-upload-close').onclick = () => dialog.remove();

    document.getElementById('aiamigo-file').onchange = async function (e) {
      const file = e.target.files[0];
      if (!file) {
        document.getElementById('aiamigo-upload-result').textContent = t.file_missing;
        return;
      }
      document.getElementById('aiamigo-upload-progress').textContent = "Indlæser og analyserer filen ...";

      let extracted = "";
      let findings = [];
      try {
        if (file.name.endsWith('.txt')) {
          extracted = await file.text();
        } else if (file.name.endsWith('.docx')) {
          // Mammoth.js extraction
          const arrayBuffer = await file.arrayBuffer();
          const result = await window.mammoth.convertToHtml({ arrayBuffer });
          extracted = result.value.replace(/<[^>]+>/g, '\n');
        } else if (file.name.endsWith('.pdf')) {
          // PDF.js extraction
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          let textArr = [];
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const txt = await page.getTextContent();
            textArr.push(txt.items.map(item => item.str).join(" "));
          }
          extracted = textArr.join('\n--- Side ---\n');
        } else if (file.name.endsWith('.png')) {
          // Tesseract.js OCR
          const url = URL.createObjectURL(file);
          const { data: { text } } = await Tesseract.recognize(url, currentLang || 'dan');
          extracted = text;
          URL.revokeObjectURL(url);
        } else {
          document.getElementById('aiamigo-upload-result').textContent = "Ukendt filtype.";
          return;
        }
      } catch (err) {
        document.getElementById('aiamigo-upload-result').innerHTML = `<span style="color:red;">Fejl under indlæsning: ${err}</span>`;
        document.getElementById('aiamigo-upload-progress').textContent = "";
        return;
      }

      // Analyse
      const lines = extracted.split(/\r?\n/);
      let red = 0, yellow = 0, green = 0;
      lines.forEach((line, idx) => {
        const issues = [];
        if (line.match(/persondata/i)) issues.push('persondata');
        if (line.match(/password/i)) issues.push('password');
        if (containsSensitiveID(line, currentLang)) issues.push('Sensitive ID');
        if (riskyWords.some(w => line.toLowerCase().includes(w))) issues.push('Risky word');
        if (issues.length) {
          findings.push({ line: idx + 1, text: line.slice(0, 100), issues });
          if (issues.includes('Sensitive ID') || issues.includes('persondata') || issues.includes('password')) red++;
          else yellow++;
        } else if (line.trim()) {
          green++;
        }
      });
      const total = red + yellow + green;
      const score = total > 0 ? Math.round((green * 100 + yellow * 50) / total) : 0;
      const color = score >= 80 ? "#11b93b" : score >= 50 ? "#ffb300" : "#e33e2b";

      let html = `<div style="font-size:16px;font-weight:600;margin-bottom:12px;">Amigo-score: <span style="color:${color};font-size:20px;">${score}%</span></div>`;
      if (findings.length) {
        html += `<details open style="margin-bottom:8px;"><summary style="font-weight:500;cursor:pointer;">Detaljerede fund (${findings.length})</summary><div style="margin-top:6px;">`;
        findings.slice(0, 50).forEach(f =>
          html += `<div style="padding:4px 0;border-bottom:1px dotted #ddd;font-size:13px;">
            <b>Linje ${f.line}:</b> <span style="color:#c00">${f.issues.join(", ")}</span><br>
            <span style="font-size:12px;color:#666">${f.text}</span></div>`);
        html += findings.length > 50 ? `<div style="color:#888;font-size:12px;">…Viser kun første 50 fund</div>` : "";
        html += `</div></details>`;
      } else {
        html += `<div style="color:#0c5460;font-size:15px;">${t.no_issues}</div>`;
      }
      document.getElementById('aiamigo-upload-result').innerHTML = html;
      document.getElementById('aiamigo-upload-progress').textContent = "";
    };
  }

  // --- DONATION ---
  function openDonate() {
    window.open(config.donateUrl, "_blank");
  }
  // --- PLAYGROUND ---
  function openPlayground() {
    window.open(config.playgroundUrl, "_blank");
  }
  // --- MENU KNAPPER ---
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
  // --- SHIELD MENU ---
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
    menu.appendChild(createButton(translations[currentLang].amigoscore, showScorePopup, "#e7f7ee"));
    menu.appendChild(createButton(translations[currentLang].upload, showProUploadDialog, "#eceeff"));
    menu.appendChild(createButton(translations[currentLang].playground, openPlayground, "#fffbe6"));
    menu.appendChild(createButton(translations[currentLang].donate, openDonate, "#fff8f9"));
    setTimeout(() => {
      document.addEventListener('mousedown', function close(e) {
        if (!menu.contains(e.target) && !e.target.closest('.aiamigo-shield')) {
          menu.remove();
        }
      }, { once: true });
    }, 20);
    document.body.appendChild(menu);
  }
  // --- SHIELD ---
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
  // --- TEKSTKLASSIFICERING MED POPUP ---
  function handleClassification(text) {
    const cl = classify(text);
    const t = translations[currentLang];
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
  // --- INITIALISERING ---
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