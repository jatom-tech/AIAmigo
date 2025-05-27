(function() {
  // ======= KONFIGURATION ======= //
  const config = {
    autoCloseDelay: 5000,
    donateUrl: "https://www.buymeacoffee.com/janthomsen",
    playgroundUrl: "https://jatom-tech.github.io/AIAmigo-lite/playground/",
    shieldIcon: "https://i.imgur.com/nzP3gLM.png" // Original Imgur-link bibeholdt
  };

  // ======= INTERNATIONALISERING ======= //
  const translations = {
    da: {
      playground: "💡 Playground", 
      donate: "💙 Donér",
      popup_red: "Advarsel: Din tekst indeholder følsomme data! 🚨",
      popup_yellow: "⚠️ Overvej at forbedre din tekst.",
      popup_green: "✅ Din tekst ser stærk ud.",
      popup_none: "⚠️ Ingen klassificering muligt"
    },
    en: {
      playground: "💡 Playground", 
      donate: "💙 Donate",
      popup_red: "Warning: Your text contains sensitive data! 🚨",
      popup_yellow: "⚠️ Consider improving your text.",
      popup_green: "✅ Your text looks strong.",
      popup_none: "⚠️ No classification possible"
    },
    es: {
      playground: "💡 Playground", 
      donate: "💙 Donar",
      popup_red: "¡Advertencia: Tu texto contiene datos sensibles! 🚨",
      popup_yellow: "⚠️ Considera mejorar tu texto.",
      popup_green: "✅ Tu texto parece correcto.",
      popup_none: "⚠️ Clasificación no posible"
    }
  };

  // ======= DATADETEKTION ======= //
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

  // ======= STATEFUL VARIABLER ======= //
  let currentLang = navigator.language.slice(0,2) in translations ? 
                   navigator.language.slice(0,2) : 'en';
  let lastClassification = null;
  let menuTimeout = null;

  // ======= KERNE FUNKTIONER ======= //
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

  // ======= UI KOMPONENTER ======= //
  function showPopup(msg, type="info") {
    const existing = document.querySelector('.aiamigo-popup');
    if (existing) existing.remove();
    
    const popup = document.createElement('div');
    popup.className = 'aiamigo-popup';
    Object.assign(popup.style, {
      position: 'fixed', 
      bottom: '60px', 
      right: '10px',
      background: type === 'warning' ? '#f8d7da' : '#d1ecf1',
      color: type === 'warning' ? '#721c24' : '#0c5460',
      padding: '10px', 
      borderRadius: '6px', 
      boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
      zIndex: 10000, 
      opacity: '0', 
      transition: 'opacity 0.5s'
    });
    
    popup.textContent = msg;
    document.body.appendChild(popup);
    
    setTimeout(() => popup.style.opacity = '1', 50);
    setTimeout(() => {
      popup.style.opacity = '0';
      setTimeout(() => popup.remove(), 500);
    }, config.autoCloseDelay);
  }

  function handleClassification(text) {
    const cl = classify(text);
    if (cl === lastClassification) return;
    lastClassification = cl;
    
    if (!text.trim()) return;
    const t = translations[currentLang];
    
    if (cl === 'red') showPopup(t.popup_red, "warning");
    else if (cl === 'yellow') showPopup(t.popup_yellow, "warning");
    else if (cl === 'green') showPopup(t.popup_green, "info");
    else showPopup(t.popup_none, "info");
  }

  function createButton(text, onClick, isPrimary = false) {
    const btn = document.createElement('button');
    btn.textContent = text;
    Object.assign(btn.style, {
      display: 'block',
      width: '100%',
      padding: '8px 12px',
      margin: '5px 0',
      borderRadius: '6px',
      border: isPrimary ? '1px solid #0073bd' : '1px solid #ddd',
      background: isPrimary ? '#0073bd' : '#fff',
      color: isPrimary ? '#fff' : '#333',
      cursor: 'pointer',
      transition: 'all 0.2s'
    });
    btn.addEventListener('click', onClick);
    return btn;
  }

  function createShieldMenu() {
    const existing = document.getElementById('aiamigo-buttons');
    if (existing) {
      clearTimeout(menuTimeout);
      existing.remove();
      return;
    }

    const menu = document.createElement('div');
    menu.id = 'aiamigo-buttons';
    Object.assign(menu.style, {
      position: 'fixed', 
      bottom: '60px', 
      right: '10px',
      background: '#fff', 
      borderRadius: '10px',
      padding: '14px', 
      boxShadow: '0 4px 14px rgba(0,0,0,0.13)',
      zIndex: 9999, 
      minWidth: '160px'
    });

    // Knapper
    menu.appendChild(createButton(
      translations[currentLang].playground,
      () => window.open(config.playgroundUrl, '_blank'),
      true
    ));

    menu.appendChild(createButton(
      translations[currentLang].donate,
      () => window.open(config.donateUrl, '_blank')
    ));

    document.body.appendChild(menu);

    // Auto-lukning
    menuTimeout = setTimeout(() => {
      menu.style.opacity = '0';
      setTimeout(() => menu.remove(), 300);
    }, config.autoCloseDelay);

    // Luk ved klik udenfor
    const clickHandler = (e) => {
      if (!menu.contains(e.target) && !e.target.closest('.aiamigo-shield')) {
        menu.remove();
        document.removeEventListener('click', clickHandler);
      }
    };
    setTimeout(() => document.addEventListener('click', clickHandler), 0);
  }

  function createShield() {
    if (document.querySelector('.aiamigo-shield')) return;
    
    const shield = document.createElement('div');
    shield.className = 'aiamigo-shield';
    shield.innerHTML = `<img src="${config.shieldIcon}" alt="AIAmigo Shield" style="width:100%;height:100%;object-fit:contain;">`;
    
    Object.assign(shield.style, {
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      width: '40px',
      height: '40px',
      zIndex: 9999,
      cursor: 'pointer',
      background: '#fff',
      boxShadow: '0px 4px 10px rgba(0,0,0,0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%' // Beholdt original styling
    });
    
    shield.addEventListener('click', createShieldMenu);
    document.body.appendChild(shield);
  }

  // ======= INITIALISERING ======= //
  function initialize() {
    // Debounced input-håndtering
    let inputTimeout;
    document.addEventListener('input', (e) => {
      clearTimeout(inputTimeout);
      inputTimeout = setTimeout(() => {
        const el = e.target;
        const text = el.isContentEditable ? el.innerText : (el.value || "");
        handleClassification(text);
      }, 300);
    }, true);

    // Sikker DOM-indlæsning
    if (document.readyState === 'complete') {
      createShield();
    } else {
      window.addEventListener('load', createShield);
    }
  }

  initialize();
})();