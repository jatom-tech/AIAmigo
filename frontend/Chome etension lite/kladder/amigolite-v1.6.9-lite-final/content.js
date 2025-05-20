(function() {
  // --- Sprog og knap-tekster ---
  const translations = {
    da: {
      lang: "Sprog:", playground: "💡 Playground", donate: "💙 Donér",
      popup_red: "Advarsel: Din tekst indeholder følsomme data! 🚨",
      popup_yellow: "⚠️ Overvej at forbedre din tekst.",
      popup_green: "✅ Din tekst ser stærk ud.",
      popup_none: "⚠️ Ingen klassificering muligt"
    },
    en: {
      lang: "Language:", playground: "💡 Playground", donate: "💙 Donate",
      popup_red: "Warning: Your text contains sensitive data! 🚨",
      popup_yellow: "⚠️ Consider improving your text.",
      popup_green: "✅ Your text looks strong.",
      popup_none: "⚠️ No classification possible"
    },
    es: {
      lang: "Idioma:", playground: "💡 Playground", donate: "💙 Donar",
      popup_red: "¡Advertencia: Tu texto contiene datos sensibles! 🚨",
      popup_yellow: "⚠️ Considera mejorar tu texto.",
      popup_green: "✅ Tu texto parece correcto.",
      popup_none: "⚠️ Clasificación no posible"
    }
  };

  // --- Følsomme mønstre pr. sprog (både nøgleord og nummerformater!) ---
  const sensitivePatterns = {
    da: [
      /\b\d{6}-?\d{4}\b/i,   // CPR
      /\bcpr\b/i
    ],
    en: [
      /\b\d{3}-\d{2}-\d{4}\b/i, // US SSN: 123-45-6789
      /\bssn\b/i,
      /\bsocial\s*security\s*(number|no)?\b/i
    ],
    es: [
      /\b\d{8}[A-Za-z]\b/i,     // DNI: 12345678A
      /\bdni\b/i,
      /\bnie\b/i,
      /\bn[ie] number\b/i
    ]
  };

  // --- Automatisk sprogdetektion + overstyring ---
  function detectLang() {
    const lang = navigator.language.slice(0,2);
    return ['da','en','es'].includes(lang) ? lang : 'en';
  }
  let currentLang = detectLang();

  // --- ID-følsomheds-tjek (slår både på nøgleord og nummerformater) ---
  function containsSensitiveID(text, lang) {
    const patterns = sensitivePatterns[lang] || [];
    return patterns.some(pattern => pattern.test(text));
  }

  // --- Anden klassificering (ord på alle sprog) ---
  const riskyWords = [
    // Dansk
    'sygdom', 'afskedigelse', 'diskrimination', 'løn',
    // Engelsk
    'illness', 'dismissal', 'discrimination', 'salary', 
    // Spansk
    'enfermedad', 'despido', 'discriminación', 'salario'
  ];

  // --- Klassificeringsfunktion ---
  let lastClassification = null;
  function classify(text) {
    if (containsSensitiveID(text, currentLang)) return 'red';
    if (riskyWords.some(w => text.toLowerCase().includes(w))) return 'yellow';
    if (text.trim()) return 'green';
    return 'unknown';
  }

  // --- Popup ---
  function showPopup(msg, type="info") {
    document.querySelector('.aiamigo-popup')?.remove();
    const popup = document.createElement('div');
    popup.className = 'aiamigo-popup';
    Object.assign(popup.style, {
      position: 'fixed', bottom: '60px', right: '10px',
      background: type==='warning'?'#f8d7da':'#d1ecf1',
      color: type==='warning'?'#721c24':'#0c5460',
      border: '1px solid #bee5eb', padding: '10px',
      borderRadius: '6px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
      fontFamily: 'Arial', fontSize: '14px',
      zIndex: 10000, opacity: '0', transition:'opacity 0.5s'
    });
    popup.textContent = msg;
    document.body.appendChild(popup);
    setTimeout(()=>{ popup.style.opacity='1'; },50);
    setTimeout(()=>{ popup.style.opacity='0'; setTimeout(()=>popup.remove(),500); },5000);
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

  // --- Lyt på input (alle tekstfelter/contenteditable) ---
  document.addEventListener('input', e => {
    const el = e.target;
    let text = el.isContentEditable ? el.innerText : (el.value || "");
    handleClassification(text);
  }, true);

  // --- Skjold med dropdown og knapper ---
  function createShieldWithButtons() {
    if (document.querySelector('.aiamigo-shield')) return;
    const shield = document.createElement('div');
    shield.className = 'aiamigo-shield';
    shield.innerHTML = `<img src="https://i.imgur.com/nzP3gLM.png" alt="AIAmigo Shield" style="width:100%;height:100%;object-fit:contain;">`;
    Object.assign(shield.style, {
      position:'fixed',bottom:'10px',right:'10px',
      width:'40px',height:'40px',zIndex:9999,background:'#fff',
      cursor:'pointer',boxShadow:'0px 4px 10px rgba(0,0,0,0.2)',
      display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'50%'
    });
    document.body.appendChild(shield);
    shield.onclick = () => {
      const existingBox = document.getElementById('aiamigo-buttons');
      if (existingBox) { existingBox.remove(); return; }
      const box = document.createElement('div');
      box.id = 'aiamigo-buttons';
      Object.assign(box.style, {
        position:'fixed',bottom:'60px',right:'10px',
        display:'flex',flexDirection:'column',gap:'8px',zIndex:9999,
        background:'#f7f8fa',borderRadius:'10px',boxShadow:'0 4px 14px rgba(0,0,0,0.13)',
        padding:'14px 20px 12px 16px',minWidth:'140px'
      });
      // Sprog
      const langLabel = document.createElement('label');
      langLabel.textContent = translations[currentLang].lang;
      langLabel.style.marginRight = "5px";
      const langSelect = document.createElement('select');
      [["da","Dansk"],["en","English"],["es","Español"]].forEach(([val,label])=>{
        const opt = document.createElement('option'); opt.value=val; opt.textContent=label;
        if(val===currentLang) opt.selected=true; langSelect.appendChild(opt);
      });
      langSelect.onchange = function() {
        currentLang = langSelect.value;
        btn1.textContent = translations[currentLang].playground;
        btn2.textContent = translations[currentLang].donate;
        langLabel.textContent = translations[currentLang].lang;
      };
      const langBox = document.createElement('div');
      langBox.style.display="flex"; langBox.appendChild(langLabel); langBox.appendChild(langSelect);
      box.appendChild(langBox);
      // Playground knap
      const btn1 = document.createElement('button');
      btn1.textContent = translations[currentLang].playground;
      btn1.onclick = () => window.open('https://din-playground-url.dk/', '_blank');
      // Donér knap
      const btn2 = document.createElement('button');
      btn2.textContent = translations[currentLang].donate;
      btn2.onclick = () => window.open('https://www.buymeacoffee.com/janthomsen', '_blank');
      [btn1, btn2].forEach(btn => {
        Object.assign(btn.style, {
          background:'#fff',color:'#333',border:'1px solid #ccc',
          borderRadius:'6px',padding:'6px 12px',fontSize:'13px',
          cursor:'pointer',boxShadow:'0 2px 6px rgba(0,0,0,0.1)',marginTop:'7px'
        });
        box.appendChild(btn);
      });
      setTimeout(()=>{document.addEventListener('mousedown',function close(e){if(!box.contains(e.target)&&e.target!==shield){box.remove();}}, {once:true});},0);
      document.body.appendChild(box);
    };
  }
  createShieldWithButtons();
})();