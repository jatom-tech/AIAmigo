// content.js
console.log("AIAmigo initialiserer...");

// ======================
// MODULIMPORTER
// ======================
import { analyzeText } from './riskmodul.js';
import DialogModul from './DialogModul.js';

// Importér analyzeText fra riskmodul.js
import { analyzeText } from './riskmodul.js';

// Test analyzeText-funktionen
console.log("Test af analyzeText-funktionen:");
const testText = "Dette er en test med CPR og løn.";
const result = analyzeText(testText);
console.log("Resultat:", result)
// ======================
// KERNEVARIABLER
// ======================
let lastDetectedPrompt = '';
let promptList = [];
let riskyPromptCount = 0;

// ======================
// LOCALSTORAGE-HÅNDTERING
// ======================
async function loadStorage() {
  const result = await chrome.storage.local.get(['aiamigo_prompts', 'aiamigo_risky_prompts']);
  promptList = result.aiamigo_prompts || [];
  riskyPromptCount = result.aiamigo_risky_prompts || 0;
}

async function saveStorage() {
  await chrome.storage.local.set({
    aiamigo_prompts: promptList,
    aiamigo_risky_prompts: riskyPromptCount
  });
}

// ======================
// INPUT-DETEKTION
// ======================
function setupMutationObserver() {
  const observer = new MutationObserver(mutations => {
    for(const mutation of mutations) {
      for(const node of mutation.addedNodes) {
        if(node.nodeType === 1) { // Kun element-noder
          const userInput = node.querySelector?.('[contenteditable="true"], [role="textbox"]');
          if(userInput) monitorInput(userInput);
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function monitorInput(element) {
  element.addEventListener('input', () => {
    const text = element.innerText.trim();
    if(text && text !== lastDetectedPrompt) {
      handlePrompt(text);
    }
  });
}

// ======================
// PROMPT-HÅNDTERING
// ======================
async function handlePrompt(promptText) {
  try {
    lastDetectedPrompt = promptText;
    
    // Analysér tekst
    const matches = analyzeText(promptText);
    
    // Gem data
    promptList.push(promptText);
    if(matches.length > 0) riskyPromptCount++;
    
    await saveStorage();

    // Vis feedback
    if(matches.length > 0) {
      DialogModul.showWarning(
        `Potentielle risici: ${matches.join(', ')}`,
        calculateAmigoScore()
      );
    }

  } catch(error) {
    console.error('Fejl i prompt-håndtering:', error);
  }
}

// ======================
// AMIGO-SCORE
// ======================
function calculateAmigoScore() {
  const total = promptList.length;
  return total > 0 
    ? Math.max(0, 100 - Math.round((riskyPromptCount / total) * 100))
    : 100;
}

// ======================
// UI-ELEMENTER
// ======================
function createStatusShield() {
  const shield = document.createElement('div');
  shield.innerHTML = `
    <style>
      .aiamigo-shield {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #2c3e50;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        transition: transform 0.2s;
      }
      .aiamigo-shield:hover {
        transform: scale(1.1);
      }
    </style>
    <div class="aiamigo-shield">🛡️</div>
  `;
  
  shield.querySelector('.aiamigo-shield').addEventListener('click', () => {
    DialogModul.showStatus(`Din aktuelle Amigo Score: ${calculateAmigoScore()}%`);
  });

  document.body.appendChild(shield);
}

// ======================
// INITIALISERING
// ======================
(async function init() {
  await loadStorage();
  setupMutationObserver();
  createStatusShield();
  console.log("AIAmigo klar til brug");
})();