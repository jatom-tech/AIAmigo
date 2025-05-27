window.DialogModul = {
  analyse: function(promptText) {
    alert("Analyse: " + promptText);

    const popup = document.createElement("div");
    popup.textContent = "Analyse: " + promptText;
    Object.assign(popup.style, {
      position: "fixed",
      bottom: "100px",
      right: "10px",
      background: "#f8d7da",
      color: "#721c24",
      padding: "12px 18px",
      borderRadius: "6px",
      fontFamily: "sans-serif",
      fontSize: "16px",
      zIndex: 999999
    });

    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 4000);
  },
  setProType: function(type) {
    window._dialogmodul_protype = type;
  },
  showProDialog: function() {
    let modal = document.getElementById('dialogmodul-modal');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = "dialogmodul-modal";
    Object.assign(modal.style, {
      position: "fixed",
      top: "50%", left: "50%",
      transform: "translate(-50%, -50%)",
      background: "#fff",
      border: "2px solid #21c973",
      boxShadow: "0 4px 24px rgba(0,0,0,0.21)",
      padding: "2em 2em 1.2em",
      borderRadius: "1.2em",
      zIndex: 10010,
      minWidth: "340px",
      textAlign: "center",
      fontFamily: "inherit"
    });
    const header = document.createElement('h2');
    header.textContent = "DialogPro (" + (window._dialogmodul_protype || "standard") + ")";
    header.style.marginBottom = "1em";
    modal.appendChild(header);

    const msg = document.createElement('div');
    msg.textContent = "Her vises en rigtig DialogPro-dialog! (Variant: " + (window._dialogmodul_protype || "standard") + ")";
    msg.style.fontSize = "1.1em";
    msg.style.marginBottom = "2em";
    modal.appendChild(msg);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = "Luk";
    closeBtn.onclick = () => modal.remove();
    closeBtn.style.padding = "0.7em 2em";
    closeBtn.style.background = "#21c973";
    closeBtn.style.color = "#fff";
    closeBtn.style.border = "none";
    closeBtn.style.borderRadius = "1em";
    closeBtn.style.fontWeight = "bold";
    closeBtn.style.fontSize = "1em";
    modal.appendChild(closeBtn);

    document.body.appendChild(modal);
  },
  showProBanner: function() {
    alert("Pro banner vises!");
  }
};

// ===== Lyt på postMessage fra content-script =====
window.addEventListener("message", function(event) {
  if (event.data && event.data.type === "AIAMIGO_DIALOGPRO") {
    if (window.DialogModul && typeof window.DialogModul.setProType === "function") {
      window.DialogModul.setProType(event.data.variant);
      if (typeof window.DialogModul.showProDialog === "function") {
        window.DialogModul.showProDialog();
      }
    }
  }
});