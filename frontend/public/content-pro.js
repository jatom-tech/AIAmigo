console.log('content-pro.js LOADED');

if (localStorage.getItem("aiamigoPro") === "true") {
  console.log("[AIAmigo PRO] Pro-funktioner aktiveret!");

  // Tilføj ALLE tre PRO-knapper hver gang menuen åbnes
  function injectProMenuButtons() {
    const menu = document.getElementById('aiamigo-buttons');
    if (!menu || !window.DialogModul) return;

    function addBtn(variant, label, icon) {
      // Undgå duplikater
      if (menu.querySelector(`.pro-dialog-btn-${variant}`)) return;
      const btn = document.createElement('button');
      btn.textContent = `${icon} PRO (${label})`;
      btn.className = `pro-dialog-btn-${variant}`;
      Object.assign(btn.style, {
        display: 'block', width: '100%', padding: '8px 12px',
        margin: '5px 0', borderRadius: '6px', border: '1px solid #21c973',
        background: '#eafff7', color: '#222', cursor: 'pointer',
        fontWeight: 'bold'
      });
      btn.onclick = () => {
        window.DialogModul.setProType(variant);
        window.DialogModul.showProDialog();
      };
      menu.appendChild(btn);
    }

    addBtn('humor', 'Humor', '😎');
    addBtn('legal', 'Legal', '⚖️');
    addBtn('standard', 'Standard', '🚀');
  }

  // Lyt på DOM-mutationer for at fange når menuen åbnes (hver gang)
  const observer = new MutationObserver(() => {
    setTimeout(injectProMenuButtons, 0);
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Hvis menuen allerede findes (fx reload), tilføj straks
  injectProMenuButtons();
}