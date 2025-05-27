// ==UserScript==
// @name         AIAmigo PRO Robust (txt only)
// @namespace    http://tampermonkey.net/
// @version      2024.05.24
// @description  Robust .txt-analyse, popup, findings og UI. Kun .txt-upload. Ingen eksterne connections!
// @author       jatom-tech
// @match        *://*/*
// @grant        none
// ==/UserScript==

// Best practice: kun fortsæt hvis Pro-flag er sat
if (localStorage.getItem("aiamigoPro") !== "true") {
  // Hvis bruger ikke er Pro, stop scriptet
  // Du kan evt. logge til konsollen:
  // console.log("[AIAmigo PRO] Ikke pro-bruger - kører ikke pro-script.");
  return;
}

// Herunder kommer dit PRO-specifikke kode...
console.log("[AIAmigo PRO] Pro-funktioner aktiveret!");

// Efter pro-tjek
const version = chrome?.runtime?.getManifest ? chrome.runtime.getManifest().version : "ukendt";
console.log("[AIAmigo PRO] Extension version:", version);

(function () {
  // --- KONFIGURATION ---
  const config = {
    autoCloseDelay: 5000,
    donateUrl: "https://www.buymeacoffee.com/janthomsen",
    playgroundUrl: "https://jatom-tech.github.io/AIAmigo-lite/playground/",
    shieldIcon: "https://i.imgur.com/nzP3gLM.png",
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
      file_missing: "Upload venligst en fil først.",
      no_issues: "Ingen problemer fundet.",
      findings_title: "Fundet i fil:",
      donate_desc: "Støt udviklingen",
      upload_analyze: "AIAmigo analyserer din fil...",
      upload_ready: "Analyse færdig! Du kan nu kopiere eller bruge filens tekst.",
      upload_accept: "Accepter og fortsæt",
      upload_reject: "Luk",
      upload_warning: "Vil du fortsætte med at uploade filen?",
      findings_header: "⚠️ Fundne problemer:",
      upload_reminder: "Husk at rette ovenstående problemer, før du uploader filen til ChatGPT.",
      ocr_notice: "Bemærk: Linjenumre er vejledende ved OCR-analyse af billeder.",
      filetype_error: "Kun .txt-filer understøttes direkte.<br>PDF, Word og andre formater virker ikke pga. browserbegrænsninger.<br><br><span style='color:#666;font-weight:400;'>TIP: Åbn filen, kopier indholdet og indsæt det i feltet her – så kan du få AIAmigo analyse af teksten!</span>",
      prompt_detected_filetype: "Din tekst ligner indhold kopieret direkte fra en PDF, Word eller billede-fil.<br><b>OBS:</b> Det anbefales at kopiere ren tekst fra filen og undgå sideskift, sidesignaturer, headers/footers mv. for bedst analyse.",
      prompt_detected_encoding: "Din tekst indeholder mange ikke-læselige tegn – tjek om det er korrekt tekst eller et forkert filformat.",
      file_button: "Vælg txt-fil..."
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
      file_missing: "Please upload a file first.",
      no_issues: "No issues found.",
      findings_title: "Findings in file:",
      donate_desc: "Support development",
      upload_analyze: "AIAmigo is analyzing your file...",
      upload_ready: "Analysis complete! You can now copy or use the file text.",
      upload_accept: "Accept and continue",
      upload_reject: "Close",
      upload_warning: "Do you want to continue uploading this file?",
      findings_header: "⚠️ Issues found:",
      upload_reminder: "Please resolve the above issues before uploading the file to ChatGPT.",
      ocr_notice: "Note: Line numbers are approximate for OCR analysis.",
      filetype_error: "Only .txt files are supported directly.<br>PDF, Word and other formats do not work due to browser security.<br><br><span style='color:#666;font-weight:400;'>TIP: Open your file, copy the content, and paste it here for AIAmigo analysis!</span>",
      prompt_detected_filetype: "Your text looks like it was pasted directly from a PDF, Word or image file.<br><b>NOTE:</b> For best analysis, copy only the actual text and avoid page breaks, headers/footers, and signatures.",
      prompt_detected_encoding: "Your text contains many unreadable characters – check if you pasted actual text or a wrong file format.",
      file_button: "Choose txt file..."
    }
  };
  function detectLang() {
    const l = navigator.language.slice(0, 2);
    return translations[l] ? l : "en";
  }
  let currentLang = detectLang();
  const t = translations[currentLang];

  // --- SCORE INIT ---
  function initScoreLocalStorage() {
    if (localStorage.getItem('aiamigo_r') === null) localStorage.setItem('aiamigo_r', '0');
    if (localStorage.getItem('aiamigo_y') === null) localStorage.setItem('aiamigo_y', '0');
    if (localStorage.getItem('aiamigo_g') === null) localStorage.setItem('aiamigo_g', '1');
  }
  initScoreLocalStorage();

  // --- RISIKOLOGIK ---
  const sensitivePatterns = {
    da: [/\b\d{6}-?\d{4}\b/i, /\bcpr\b/i],
    en: [/\b\d{3}-\d{2}-\d{4}\b/i, /\bssn\b/i, /\bsocial\s*security\s*(number|no)?\b/i]
  };
  const riskyWords = [
    'sygdom', 'afskedigelse', 'diskrimination', 'løn',
    'illness', 'dismissal', 'discrimination', 'salary'
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
  function updateScore(cl) {
    if (cl === 'red') localStorage.setItem('aiamigo_r', String(parseInt(localStorage.getItem('aiamigo_r')||'0')+1));
    else if (cl === 'yellow') localStorage.setItem('aiamigo_y', String(parseInt(localStorage.getItem('aiamigo_y')||'0')+1));
    else if (cl === 'green') localStorage.setItem('aiamigo_g', String(parseInt(localStorage.getItem('aiamigo_g')||'0')+1));
  }

  // --- FINDINGS LOGIK ---
  function analyzeTextContent(rawText, lang = currentLang, isOCR = false) {
    const lines = rawText.split(/\r?\n| {2,}/);
    let findings = [];
    let worst = 'green';
    lines.forEach((line, idx) => {
      let issues = [];
      if (line.match(/persondata/i)) issues.push('Brug af ordet <b>persondata</b> – brug hellere "følsomme oplysninger"');
      if (line.match(/password/i)) issues.push('Brug af ordet <b>password</b> – fjern adgangskoder!');
      if ((sensitivePatterns[lang]||[]).some(pat => pat.test(line))) issues.push('Sensitive ID fundet (fx CPR-nr eller lign.)');
      if (riskyWords.some(w => line.toLowerCase().includes(w))) issues.push('Risikofyldt emne fundet (fx sygdom, løn, afskedigelse)');
      if (issues.length > 0) {
        findings.push({
          line: idx+1,
          text: line.trim().slice(0,80),
          issues,
          raw: line
        });
        if (issues.some(i => i.includes('Sensitive ID'))) worst = 'red';
        else if (worst !== 'red') worst = 'yellow';
      }
    });
    return { findings, worst };
  }

  function renderFindingsPanel(findings, worst, isOCR = false) {
    let html = "";
    if (findings.length === 0) {
      html += `<div style="color:#0c5460;font-size:15px;">${t.no_issues}</div>`;
    } else {
      html += `<div style="font-weight:600;color:#b17b00;margin-bottom:5px;">${t.findings_header || "⚠️ Fundne problemer:"}</div>`;
      findings.slice(0,50).forEach(f =>
        html += `<div style="padding:3px 0;border-bottom:1px dotted #ddd;font-size:13px;">
          <b>Linje ${f.line}:</b> <span style="color:#c00">${f.issues.join(", ")}</span><br>
          <span style="font-size:12px;color:#666">${f.text}</span></div>`);
      html += findings.length>50 ? `<div style="color:#888;font-size:12px;">…Viser kun første 50 fund</div>` : "";
      if (isOCR) html += `<div style="color:#447;font-size:12px;margin-top:6px;">${t.ocr_notice || "Bemærk: Linjenumre er vejledende ved OCR-analyse af billeder."}</div>`;
    }
    return html;
  }

  // --- ROBUST POPUP ---
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
    popup.innerHTML = msg;
    document.body.appendChild(popup);
    setTimeout(() => { if (popup && popup.style) popup.style.opacity = '1'; }, 30);
    setTimeout(() => {
      if (document.body.contains(popup)) {
        popup.style.opacity = '0';
        setTimeout(() => {
          if (document.body.contains(popup)) popup.remove();
        }, 600);
      }
    }, config.autoCloseDelay);
  }

  // --- AMIGO SCORE POPUP ---
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
    setTimeout(() => { if (popup && popup.style) popup.style.opacity = '1'; }, 30);
    setTimeout(() => {
      if (document.body.contains(popup)) {
        popup.style.opacity = '0';
        setTimeout(() => {
          if (document.body.contains(popup)) popup.remove();
        }, 600);
      }
    }, 3500);
  }

  // --- UPLOAD-DIALOG ---
  function showUploadDialog() {
    document.getElementById('aiamigo-upload-dialog')?.remove();
    const dialog = document.createElement('div');
    dialog.id = 'aiamigo-upload-dialog';
    Object.assign(dialog.style, {
      position: 'fixed', top: '50%', left: '50%',
      transform: 'translate(-50%,-50%)',
      background: '#fff', border: '1.5px solid #b1bac4',
      borderRadius: '12px', boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
      zIndex: 10001, padding: '30px 24px', minWidth: '380px', maxWidth: '98vw'
    });
    dialog.innerHTML = `
      <div style="font-size:17px;margin-bottom:16px;font-weight:700;display:flex;align-items:center;gap:10px;">
        <img src="https://i.imgur.com/nzP3gLM.png" style="height:30px;width:30px;"> ${t.upload}
      </div>
      <button id="aiamigo-file-btn" style="padding:8px 16px;border-radius:8px;border:1.5px solid #3b59b6;background:#eaf1fd;color:#234;font-weight:600;cursor:pointer;margin-bottom:10px;">
        ${t.file_button}
      </button>
      <input type="file" id="aiamigo-file" accept=".txt" style="display:none;">
      <div id="aiamigo-upload-progress" style="margin:8px 0 10px 0; color:#888; font-size:13px;"></div>
      <div id="aiamigo-upload-result" style="color:#444;font-size:14px;max-height:230px;overflow:auto;border-bottom:1px solid #eee;margin-bottom:10px;padding-bottom:8px;"></div>
      <div style="display:flex;gap:12px;margin-top:9px;">
        <button id="aiamigo-upload-accept" style="padding:7px 14px;border-radius:7px;border:1.5px solid #11b93b;background:#e7f7ee;color:#11b93b;font-weight:600;cursor:pointer;display:none;">${t.upload_accept}</button>
        <button id="aiamigo-upload-copy" style="padding:7px 14px;border-radius:7px;border:1.5px solid #888;background:#f3f3f3;color:#222;font-weight:500;cursor:pointer;display:none;">Kopier tekst</button>
        <button id="aiamigo-upload-reject" style="padding:7px 14px;border-radius:7px;border:1.5px solid #e33e2b;background:#fff0f0;color:#e33e2b;font-weight:600;cursor:pointer;">${t.upload_reject}</button>
      </div>
      <div id="aiamigo-upload-guide" style="margin-top:14px;display:none;color:#2b3845;font-size:13px;font-style:italic;">
        ${t.upload_ready}<br><span style="color:#e33e2b" id="aiamigo-upload-reminder"></span>
      </div>
    `;
    document.body.appendChild(dialog);

    document.getElementById('aiamigo-file-btn').onclick = function() {
      document.getElementById('aiamigo-file').value = ""; // Slet evt. tidligere valgt fil
      document.getElementById('aiamigo-file').click();
    };
    document.getElementById('aiamigo-upload-reject').onclick = () => dialog.remove();
    document.getElementById('aiamigo-upload-accept').onclick = () => {
      showPopup("Du kan nu kopiere teksten eller indsætte den i ChatGPT.", "info");
      dialog.remove();
    };
    document.getElementById('aiamigo-upload-copy').onclick = () => {
      if (window.aiamigo_extractedText) {
        navigator.clipboard.writeText(window.aiamigo_extractedText)
          .then(() => showPopup("Tekst kopieret til clipboard.", "info"))
          .catch(() => showPopup("Kunne ikke kopiere tekst.", "warning"));
      }
    };

    document.getElementById('aiamigo-file').onchange = async function (e) {
      const fileInput = e.target;
      const file = fileInput.files[0];
      if (!file) {
        document.getElementById('aiamigo-upload-result').textContent = t.file_missing;
        return;
      }
      const ext = file.name.split('.').pop().toLowerCase();
      if (ext !== "txt") {
        document.getElementById('aiamigo-upload-result').innerHTML = `<span style="color:red;font-weight:600;">${t.filetype_error}</span>`;
        document.getElementById('aiamigo-upload-progress').textContent = "";
        fileInput.value = ""; // Slet evt. forkert filvalg
        return;
      }
      document.getElementById('aiamigo-upload-progress').textContent = t.upload_analyze;
      let extracted = await file.text();
      window.aiamigo_extractedText = extracted;

      // FINDINGS ANALYSE
      const { findings, worst } = analyzeTextContent(extracted, currentLang);
      document.getElementById('aiamigo-upload-result').innerHTML = renderFindingsPanel(findings, worst, false);

      updateScore(worst);
      document.getElementById('aiamigo-upload-guide').style.display = "block";
      document.getElementById('aiamigo-upload-accept').style.display = "inline-block";
      document.getElementById('aiamigo-upload-copy').style.display = "inline-block";
      const reminder = document.getElementById('aiamigo-upload-reminder');
      if (findings.length > 0) {
        reminder.textContent = t.upload_reminder;
      } else {
        reminder.textContent = '';
      }
      document.getElementById('aiamigo-upload-progress').textContent = "";
      fileInput.value = ""; // Slet filen fra input (så samme fil kan vælges igen)
    };
  }

  // --- UI: Shield-menu ---
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
  function openDonate() { window.open(config.donateUrl, "_blank"); }
  function openPlayground() { window.open(config.playgroundUrl, "_blank"); }
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
    menu.appendChild(createButton(t.amigoscore, showScorePopup, "#e7f7ee"));
    menu.appendChild(createButton(t.upload, showUploadDialog, "#eceeff"));
    menu.appendChild(createButton(t.playground, openPlayground, "#fffbe6"));
    menu.appendChild(createButton(t.donate, openDonate, "#fff8f9"));
    setTimeout(() => {
      document.addEventListener('mousedown', function close(e) {
        if (!menu.contains(e.target) && !e.target.closest('.aiamigo-shield')) {
          menu.remove();
        }
      }, { once: true });
    }, 20);
    let autoCloseTimer = setTimeout(() => { menu.remove(); }, config.autoCloseDelay);
    menu.addEventListener('mouseenter', () => { clearTimeout(autoCloseTimer); });
    menu.addEventListener('mouseleave', () => {
      autoCloseTimer = setTimeout(() => menu.remove(), config.autoCloseDelay);
    });
    document.body.appendChild(menu);
  }
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

  // --- PROMPT-ANALYSE: FANG FILTYPER OG KODET/CRAP ---
  function detectPromptFiletype(text) {
    // Heuristik: ser det ud som PDF/Word/scan?
    if (
      /Page \d+ of \d+/i.test(text) || // PDF sidefødder
      /This is a digitally signed document/i.test(text) ||
      /Document ID:|File name:/i.test(text) ||
      /[\r\n]{2,}.{0,70}(Copyright|All rights reserved|Proprietary)/i.test(text) ||
      /[^\x00-\x7F]{8,}/.test(text) // mange unicode-tegn i træk
    ) {
      showPopup(t.prompt_detected_filetype, "warning");
      return true;
    }
    // Mange rå binære eller ikke-tekstlige tegn
    if ((text.match(/[\uFFFD\u25A1\uFFFD]/g)||[]).length > 5 || /[^\x09\x0A\x0D\x20-\x7E]/.test(text.substr(0, 400))) {
      showPopup(t.prompt_detected_encoding, "warning");
      return true;
    }
    return false;
  }

  // --- TEKSTKLASSIFICERING VED INPUT (nu med filtype-detektion) ---
  function handleClassification(text) {
    if (detectPromptFiletype(text)) return;
    const cl = classify(text);
    if (!text.trim()) return;
    updateScore(cl);
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
  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(createShield, 200);
    setTimeout(addInputListeners, 400);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(createShield, 200);
      setTimeout(addInputListeners, 400);
    });
  }
})();