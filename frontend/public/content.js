// === Inject DialogModul.js into page context ===
function injectScript(filename) {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL(filename);
  script.onload = function() { console.log(filename + " injected!"); this.remove(); };
  (document.head || document.documentElement).appendChild(script);
}
injectScript("DialogModul.js");

(function () {
  // ======= KONFIGURATION ======= //
  const config = {
    autoCloseDelay: 5000,
    playgroundUrl: "https://jatom-tech.github.io/AIAmigo-lite/playground/",
    donationUrl: "https://www.buymeacoffee.com/aiamigo",
    shieldIcon: "https://i.imgur.com/nzP3gLM.png"
  };

  const translations = {
    da: {
      amigoscore: "📊 AmigoScore",
      analyseTxt: "📂 Analyser TXT-fil",
      dialogpro: "🛡️ DialogPro",
      donation: "❤️ Donér",
      playground: "💡 Playground",
      popup_red: "Advarsel: Din tekst indeholder følsomme data! 🚨",
      popup_yellow: "⚠️ Overvej at forbedre din tekst.",
      popup_green: "✅ Din tekst ser stærk ud.",
      popup_none: "⚠️ Ingen klassificering muligt",
      txt_upload_title: "Risikolinjer i .txt fil",
      txt_upload_accept: "Accepter og fortsæt",
      txt_upload_retry: "Vælg ny fil",
      txt_upload_copyall: "Kopier alle",
      txt_upload_acceptall: "Accepter alle"
    },
    en: {
      amigoscore: "📊 AmigoScore",
      analyseTxt: "📂 Analyse TXT file",
      dialogpro: "🛡️ DialogPro",
      donation: "❤️ Donate",
      playground: "💡 Playground",
      popup_red: "Warning: Your text contains sensitive data! 🚨",
      popup_yellow: "⚠️ Consider improving your text.",
      popup_green: "✅ Your text looks strong.",
      popup_none: "⚠️ No classification possible",
      txt_upload_title: "Risky lines in .txt file",
      txt_upload_accept: "Accept and continue",
      txt_upload_retry: "Upload new file",
      txt_upload_copyall: "Copy all",
      txt_upload_acceptall: "Accept all"
    }
  };

  let currentLang = navigator.language.slice(0, 2) in translations
    ? navigator.language.slice(0, 2)
    : 'en';
  const t = translations[currentLang];

  // ======= DATADETEKTION ======= //
  const sensitivePatterns = [
    /\b\d{6}-?\d{4}\b/i, // Danish CPR
    /\bcpr\b/i,
    /\b\d{3}-\d{2}-\d{4}\b/i, // US SSN
    /\bssn\b/i,
    /\bsocial\s*security\s*(number|no)?\b/i
  ];
  const riskyWords = [
    'sygdom', 'afskedigelse', 'diskrimination', 'løn',
    'illness', 'dismissal', 'discrimination', 'salary'
  ];

  // ======= SESSION-SCORE (akkumuleret) ======= //
  function getSessionScore() {
    try {
      return JSON.parse(localStorage.getItem("amigoscoreSession")) || { green: 0, yellow: 0, red: 0 };
    } catch {
      return { green: 0, yellow: 0, red: 0 };
    }
  }
  function updateSessionScore(type, delta = 1) {
    const score = getSessionScore();
    if (type === 'green') score.green += delta;
    if (type === 'yellow') score.yellow += delta;
    if (type === 'red') score.red += delta;
    localStorage.setItem("amigoscoreSession", JSON.stringify(score));
  }
  function sessionScoreLabel() {
    const s = getSessionScore();
    return `Session: <span style="color:#21c973">${s.green}✓</span> <span style="color:#FFCC00">${s.yellow}⚠️</span> <span style="color:#ff3333">${s.red}⚡</span>`;
  }
  function resetSessionScore() {
    localStorage.removeItem("amigoscoreSession");
  }

  // ======= SCORING ======= //
  function getAmigoScore(text) {
    if (!text.trim()) return { score: 0, label: 'Ingen tekst', type: 'none' };
    if (sensitivePatterns.some(pattern => pattern.test(text))) return { score: 0, label: 'Sensitive', type: 'red' };
    if (riskyWords.some(word => text.toLowerCase().includes(word))) return { score: 50, label: 'Risky', type: 'yellow' };
    return { score: 100, label: 'Bedst', type: 'green' };
  }

  // ======= UI KOMPONENTER ======= //
  function amigoScoreBadge(score) {
    const badge = document.createElement('span');
    badge.textContent = score + "%";
    Object.assign(badge.style, {
      marginLeft: "10px",
      fontWeight: "bold",
      padding: "3px 10px",
      borderRadius: "10px",
      fontSize: "1em",
      background: score === 100 ? "#21c973" : (score === 50 ? "#FFCC00" : "#ff3333"),
      color: "#fff"
    });
    return badge;
  }

  // ======= POPUP (DialogModul.js eller fallback) ======= //
  function showPopup(msg, type = "info") {
    // Prøv DialogModul.js hvis muligt
    if (window.DialogModul && typeof window.DialogModul.popup === "function") {
      window.DialogModul.popup(msg, type);
      return;
    }
    // Ellers fallback egen popup
    const colorMap = {
      info: { bg: "#d1ecf1", fg: "#0c5460" },
      warning: { bg: "#f8d7da", fg: "#721c24" },
      error: { bg: "#f8d7da", fg: "#721c24" },
      success: { bg: "#d4edda", fg: "#155724" },
      red: { bg: "#f8d7da", fg: "#721c24" },
      yellow: { bg: "#fff3cd", fg: "#856404" },
      green: { bg: "#d4edda", fg: "#155724" }
    };
    const { bg, fg } = colorMap[type] || colorMap.info;
    document.getElementById('aiamigo-popup-iframe')?.remove();
    let iframe = document.createElement("iframe");
    iframe.id = "aiamigo-popup-iframe";
    iframe.srcdoc = `
      <html><body style='margin:0;padding:0;'>
        <div style="
          background:${bg};
          color:${fg};
          min-width:160px;max-width:350px;
          padding:12px 18px;font-family:sans-serif;
          font-size:15px;border-radius:8px;
          box-shadow:0 4px 16px rgba(0,0,0,0.11);
          margin:0;word-break:break-word;">${msg}</div>
      </body></html>
    `;
    Object.assign(iframe.style, {
      position: "fixed",
      bottom: "60px",
      right: "10px",
      width: "auto",
      height: "auto",
      border: "none",
      background: "transparent",
      zIndex: 10000,
      transition: 'opacity 0.5s',
      opacity: '0'
    });
    document.body.appendChild(iframe);
    setTimeout(() => { iframe.style.opacity = '1'; }, 30);
    setTimeout(() => {
      iframe.style.opacity = '0';
      setTimeout(() => iframe.remove(), 500);
    }, config.autoCloseDelay);
  }

  // ======= TXT-FIL ANALYSE MODAL (moderniseret) ======= //
  function analyzeTxtFileModal(file) {
    file.text().then(text => {
      const lines = text.split(/\r?\n/);
      let problemLines = [];
      let acceptedLines = [];

      lines.forEach((line, idx) => {
        const scoreObj = getAmigoScore(line);
        if (scoreObj.score === 0 || scoreObj.score === 50) {
          problemLines.push({ idx: idx + 1, text: line, scoreObj });
        } else if (scoreObj.score === 100) {
          acceptedLines.push(line);
        }
      });

      // Modal container
      const container = document.createElement('div');
      container.id = "aiamigo-txt-modal";
      Object.assign(container.style, {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: "#fff",
        boxShadow: "0 4px 24px rgba(0,0,0,0.21)",
        padding: "2em 2em 1.2em",
        borderRadius: "1.2em",
        minWidth: "370px",
        maxWidth: "90vw",
        maxHeight: "80vh",
        overflowY: "auto",
        zIndex: 10001,
        fontFamily: "inherit"
      });

      // Header og status
      const header = document.createElement('h2');
      header.textContent = t.txt_upload_title;
      header.style.marginBottom = "0.2em";
      container.appendChild(header);

      const session = document.createElement('div');
      session.innerHTML = sessionScoreLabel();
      session.style.margin = "0 0 18px 0";
      session.style.fontSize = "1.08em";
      container.appendChild(session);

      // Problematiske linjer, hver med knapper
      if (problemLines.length === 0) {
        const none = document.createElement('div');
        none.textContent = "Ingen problematiske linjer fundet!";
        none.style.color = "#21c973";
        none.style.fontWeight = "bold";
        none.style.marginBottom = "18px";
        container.appendChild(none);
      } else {
        problemLines.forEach(({ idx, text, scoreObj }) => {
          const lineDiv = document.createElement('div');
          Object.assign(lineDiv.style, {
            display: "flex", alignItems: "center", gap: "8px",
            marginBottom: "7px", padding: "5px 8px", borderRadius: "6px",
            background: scoreObj.score === 0 ? "#ffeaea" : "#fff7d6"
          });
          const textSpan = document.createElement('span');
          textSpan.textContent = idx + ". " + text;
          textSpan.style.flex = "1";
          textSpan.style.color = scoreObj.score === 0 ? "#c00" : "#9a7400";
          textSpan.style.fontWeight = "bold";
          lineDiv.appendChild(textSpan);

          // Acceptér denne linje
          const acceptBtn = document.createElement('button');
          acceptBtn.textContent = t.txt_upload_accept;
          acceptBtn.style.background = "#21c973";
          acceptBtn.style.color = "#fff";
          acceptBtn.style.border = "none";
          acceptBtn.style.padding = "3px 12px";
          acceptBtn.style.borderRadius = "7px";
          acceptBtn.style.cursor = "pointer";
          acceptBtn.onclick = () => {
            updateSessionScore(scoreObj.type); // Akkumuler session-score
            lineDiv.style.display = "none";
            acceptedLines.push(text);
            // fjern fra problemLines for evt accept all
            problemLines.splice(problemLines.findIndex(l => l.text === text), 1);
          };
          lineDiv.appendChild(acceptBtn);

          // Kopiér denne linje
          const copyBtn = document.createElement('button');
          copyBtn.textContent = "Kopier";
          copyBtn.style.background = "#eaeaea";
          copyBtn.style.marginLeft = "3px";
          copyBtn.style.padding = "3px 12px";
          copyBtn.style.border = "1px solid #ccc";
          copyBtn.style.borderRadius = "7px";
          copyBtn.style.cursor = "pointer";
          copyBtn.onclick = () => {
            navigator.clipboard.writeText(text);
            showPopup("Kopieret!");
          };
          lineDiv.appendChild(copyBtn);

          container.appendChild(lineDiv);
        });
      }

      // Knaprække forneden
      const btnRow = document.createElement('div');
      Object.assign(btnRow.style, {
        display: "flex", justifyContent: "center", gap: "12px", marginTop: "20px"
      });

      // Accepter alle
      const acceptAllBtn = document.createElement('button');
      acceptAllBtn.textContent = t.txt_upload_acceptall;
      Object.assign(acceptAllBtn.style, {
        background: "#21c973", color: "#fff", border: "none",
        padding: "0.7em 2em", borderRadius: "1em", fontWeight: "bold", cursor: "pointer"
      });
      acceptAllBtn.onclick = () => {
        problemLines.forEach(({ scoreObj }) => updateSessionScore(scoreObj.type));
        container.remove();
        showPopup("Alle linjer accepteret", "success");
      };
      btnRow.appendChild(acceptAllBtn);

      // Kopier alle
      const copyAllBtn = document.createElement('button');
      copyAllBtn.textContent = t.txt_upload_copyall;
      Object.assign(copyAllBtn.style, {
        background: "#eee", color: "#222", border: "1px solid #b1bac4",
        padding: "0.7em 2em", borderRadius: "1em", fontWeight: "bold", cursor: "pointer"
      });
      copyAllBtn.onclick = () => {
        navigator.clipboard.writeText(problemLines.map(l => l.text).join("\n"));
        showPopup("Kopieret alle linjer!", "info");
      };
      btnRow.appendChild(copyAllBtn);

      // Upload ny fil
      const retryBtn = document.createElement('button');
      retryBtn.textContent = t.txt_upload_retry;
      Object.assign(retryBtn.style, {
        background: "#eee", color: "#222", border: "1px solid #b1bac4",
        padding: "0.7em 2em", borderRadius: "1em", fontWeight: "bold", cursor: "pointer"
      });
      retryBtn.onclick = () => {
        container.remove();
        triggerTxtFileUpload();
      };
      btnRow.appendChild(retryBtn);

      // Luk
      const closeBtn = document.createElement('button');
      closeBtn.textContent = "Luk";
      Object.assign(closeBtn.style, {
        background: "#fff", color: "#222", border: "1px solid #ccc",
        padding: "0.7em 2em", borderRadius: "1em", fontWeight: "bold", cursor: "pointer"
      });
      closeBtn.onclick = () => container.remove();
      btnRow.appendChild(closeBtn);

      container.appendChild(btnRow);

      // Vis modal
      document.body.appendChild(container);
    });
  }

  function triggerTxtFileUpload() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.txt';
    fileInput.onchange = (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        analyzeTxtFileModal(file);
      }
    };
    fileInput.click();
  }

  // ======= DialogPro Modal (urettet) =======
  function openDialogProModal() {
    let dialog = document.getElementById('aiamigo-dialogpro-modal');
    if (dialog) dialog.remove();

    dialog = document.createElement('div');
    dialog.id = 'aiamigo-dialogpro-modal';

    Object.assign(dialog.style, {
      position: "fixed",
      top: "50%", left: "50%",
      transform: "translate(-50%, -50%)",
      background: "#fff",
      boxShadow: "0 4px 24px rgba(0,0,0,0.21)",
      padding: "2em 2em 1.2em",
      borderRadius: "1.2em",
      minWidth: "320px",
      zIndex: 10001,
      textAlign: "center"
    });

    // PRO Badge
    const proBadge = document.createElement('div');
    proBadge.textContent = "PRO";
    Object.assign(proBadge.style, {
      position: "absolute",
      top: "-22px",
      right: "-22px",
      background: "#21c973",
      color: "#fff",
      fontWeight: "bold",
      padding: "7px 22px",
      borderRadius: "18px",
      fontSize: "1.1em",
      boxShadow: "0 2px 8px rgba(33,201,115,0.18)",
      border: "2.5px solid #fff",
      letterSpacing: "0.13em",
      zIndex: 2
    });
    dialog.appendChild(proBadge);

    const header = document.createElement('h2');
    header.textContent = "Vælg Dialog-variant";
    dialog.appendChild(header);

    const btnRow = document.createElement('div');
    btnRow.style.display = "flex";
    btnRow.style.justifyContent = "center";
    btnRow.style.gap = "12px";
    btnRow.style.margin = "24px 0 18px 0";

    function dialogBtn(type, label, icon) {
      const b = document.createElement('button');
      b.textContent = icon + " " + label;
      Object.assign(b.style, {
        padding: "0.8em 1.3em",
        borderRadius: "9px",
        border: "1.5px solid #21c973",
        background: "#eafff7",
        color: "#222",
        fontWeight: "bold",
        fontSize: "1.05em",
        cursor: "pointer",
        transition: "background 0.2s"
      });
      b.onclick = () => {
        window.postMessage({ type: "AIAMIGO_DIALOGPRO", variant: type }, "*");
        showPopup("Du har valgt: " + label, "info");
        dialog.remove();
      };
      return b;
    }

    btnRow.appendChild(dialogBtn('standard', 'Standard', '🚀'));
    btnRow.appendChild(dialogBtn('legal', 'Legal', '⚖️'));
    btnRow.appendChild(dialogBtn('humor', 'Humor', '😎'));
    dialog.appendChild(btnRow);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = "Luk";
    closeBtn.style.marginTop = "1em";
    closeBtn.onclick = () => dialog.remove();
    dialog.appendChild(closeBtn);

    document.body.appendChild(dialog);
  }

  // ======= SHIELD IKON ======= //
  function createShield() {
    if (document.querySelector('.aiamigo-shield')) return;
    const shield = document.createElement('div');
    shield.className = 'aiamigo-shield';
    shield.innerHTML = `<img src="${config.shieldIcon}" alt="AIAmigo Shield" style="width:100%;height:100%;object-fit:contain;">`;
    Object.assign(shield.style, {
      position: 'fixed', bottom: '10px', right: '10px',
      width: '40px', height: '40px', zIndex: 9999, cursor: 'pointer',
      background: '#fff',
      boxShadow: '0px 4px 10px rgba(0,0,0,0.2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: '50%'
    });
    shield.addEventListener('click', createShieldMenu);
    document.body.appendChild(shield);
  }

  // ======= MENU ======= //
  let shieldMenuTimeout;
  function createButton(text, onClick, rightAddon) {
    const btn = document.createElement('button');
    btn.textContent = text;
    Object.assign(btn.style, {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      justifyContent: 'space-between',
      padding: '8px 12px',
      margin: '5px 0',
      borderRadius: '6px',
      border: '1px solid #ddd',
      background: '#fff',
      color: '#333',
      cursor: 'pointer',
      transition: 'all 0.2s'
    });
    btn.addEventListener('click', onClick);
    if (rightAddon) btn.appendChild(rightAddon);
    return btn;
  }

  function getLastScoreFromStorage() {
    try {
      const data = JSON.parse(localStorage.getItem("amigoscoreLast")) || null;
      return data && typeof data.score === "number" ? data.score : 100;
    } catch {
      return 100;
    }
  }

  function setLastScoreToStorage(score, text) {
    localStorage.setItem("amigoscoreLast", JSON.stringify({ score, text }));
  }

  function createShieldMenu() {
    const existing = document.getElementById('aiamigo-buttons');
    if (existing) existing.remove();

    const menu = document.createElement('div');
    menu.id = 'aiamigo-buttons';
    Object.assign(menu.style, {
      position: 'fixed', bottom: '60px', right: '10px',
      background: '#fff', borderRadius: '10px',
      padding: '14px', boxShadow: '0 4px 14px rgba(0,0,0,0.13)',
      zIndex: 9999, minWidth: '220px'
    });

    // ---- RÆKKEFØLGE: DialogPro, AmigoScore, Analyse TXT, Playground, Donate ----
    if (localStorage.getItem("aiamigoPro") === "true") {
      menu.appendChild(createButton(
        t.dialogpro,
        openDialogProModal
      ));
    }

    let amigoscore = getLastScoreFromStorage();
    menu.appendChild(createButton(
      t.amigoscore,
      () => {
        const input = document.activeElement;
        const text = (input && (input.value || input.innerText)) ? (input.value || input.innerText) : '';
        const scoreObj = getAmigoScore(text);
        setLastScoreToStorage(scoreObj.score, text);
        updateSessionScore(scoreObj.type);
        showPopup(`AmigoScore: ${scoreObj.score}%`, 
          scoreObj.score === 0 ? "warning" : 
          scoreObj.score === 50 ? "warning" : 
          "info"
        );
        if (window.DialogModul && typeof window.DialogModul.analyse === "function" && text) {
          window.DialogModul.analyse(text);
        }
      },
      amigoScoreBadge(amigoscore)
    ));

    menu.appendChild(createButton(
      t.analyseTxt,
      triggerTxtFileUpload
    ));

    menu.appendChild(createButton(
      t.playground,
      () => window.open(config.playgroundUrl, '_blank')
    ));

    menu.appendChild(createButton(
      t.donation,
      () => window.open(config.donationUrl, "_blank")
    ));

    // Session score status
    const sessionStatus = document.createElement('div');
    sessionStatus.innerHTML = sessionScoreLabel();
    sessionStatus.style.margin = "18px 0 0 0";
    sessionStatus.style.fontSize = "1.07em";
    menu.appendChild(sessionStatus);

    document.body.appendChild(menu);

    // Luk ved klik udenfor
    const clickHandler = (e) => {
      if (!menu.contains(e.target) && !e.target.closest('.aiamigo-shield')) {
        menu.remove();
        document.removeEventListener('click', clickHandler);
        clearTimeout(shieldMenuTimeout);
      }
    };
    setTimeout(() => document.addEventListener('click', clickHandler), 0);

    // Auto-close menu efter 5 sekunder
    clearTimeout(shieldMenuTimeout);
    shieldMenuTimeout = setTimeout(() => {
      menu.remove();
      document.removeEventListener('click', clickHandler);
    }, 5000);
  }

  // ======= ENTER & HISTORIK (pil op/ned) ======= //
  const fieldHistory = new WeakMap();
  function getFieldHistory(el) {
    if (!fieldHistory.has(el)) {
      fieldHistory.set(el, { arr: [], idx: 0 });
    }
    return fieldHistory.get(el);
  }

  function handleKeyDown(e) {
    const el = e.target;
    const isTextInput =
      el instanceof HTMLTextAreaElement ||
      (el instanceof HTMLInputElement && el.type === "text") ||
      (el.isContentEditable && el.getAttribute("role") !== "button") ||
      el.isContentEditable;

    if (!isTextInput) return;

    const hist = getFieldHistory(el);

    // ENTER: popup/scoring, men lad beskeden sendes normalt
    if (e.key === "Enter" && !e.shiftKey) {
      const value = (el.value !== undefined ? el.value : el.innerText).trim();
      if (value) {
        hist.arr.push(value);
        hist.idx = hist.arr.length;
        const scoreObj = getAmigoScore(value);
        updateSessionScore(scoreObj.type);
        showPopup(`AmigoScore: ${scoreObj.score}%`,
          scoreObj.score === 0 ? "warning" :
          scoreObj.score === 50 ? "warning" :
          "info"
        );
        setLastScoreToStorage(scoreObj.score, value);
      }
      return;
    }

    // Pil op/Ned: overtages
    if (e.key === "ArrowUp") {
      if (hist.arr.length === 0) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if (hist.idx > 0) hist.idx--;
      const prev = hist.arr[hist.idx] || "";
      if (el.value !== undefined) el.value = prev;
      else el.innerText = prev;
      const scoreObj = getAmigoScore(prev);
      showPopup(`AmigoScore: ${scoreObj.score}%`,
        scoreObj.score === 0 ? "warning" :
        scoreObj.score === 50 ? "warning" :
        "info"
      );
      setLastScoreToStorage(scoreObj.score, prev);
      return;
    }

    if (e.key === "ArrowDown") {
      if (hist.arr.length === 0) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if (hist.idx < hist.arr.length - 1) hist.idx++;
      else hist.idx = hist.arr.length;
      const next = hist.arr[hist.idx] || "";
      if (el.value !== undefined) el.value = next;
      else el.innerText = next;
      const scoreObj = getAmigoScore(next);
      showPopup(`AmigoScore: ${scoreObj.score}%`,
        scoreObj.score === 0 ? "warning" :
        scoreObj.score === 50 ? "warning" :
        "info"
      );
      setLastScoreToStorage(scoreObj.score, next);
      return;
    }
  }

  // ======= CHATGPT/CONTENTEDITABLE-ROBUST LYTTER ======= //
  function addPromptListener() {
    // Find alle relevante inputfelter (også contenteditable som ChatGPT bruger)
    const prompts = document.querySelectorAll('[contenteditable="true"]:not([data-aiamigo-listener])');
    prompts.forEach(prompt => {
      prompt.addEventListener("keydown", handleKeyDown, true);
      prompt.setAttribute("data-aiamigo-listener", "true");
    });
  }
  addPromptListener();
  const observer = new MutationObserver(addPromptListener);
  observer.observe(document.body, { childList: true, subtree: true });

  // ======= INITIALISERING ======= //
  function initialize() {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      createShield();
    } else {
      window.addEventListener('DOMContentLoaded', createShield);
    }
    console.log("riskmodul indlæst...");
  }
  initialize();
})();