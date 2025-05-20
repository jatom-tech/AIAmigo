console.log("riskmodul indlæst...");

// Lokale nøgleord
const riskyWords = ['CPR', 'sygdom', 'løn', 'afskedigelse', 'diskrimination'];
const cprPattern = /\b\d{6}-?\d{4}\b/;

// Indbygget risikomodel
const modelData = {
  "overvåge ai-interaktioner for personfølsomme oplysninger i realtid": { label: "Lav", score: 0.1, source: "Admin vurdering" },
  "analysere trends i afdelingens ai-brug over tid": { label: "Lav", score: 0.1, source: "Admin vurdering" },
  "modtage automatiske advarsler ved brug af følsomme udtryk i prompts": { label: "Lav", score: 0.1, source: "Admin vurdering" },
  "generere månedlige rapporter om ai-aktivitet pr. afdeling": { label: "Lav", score: 0.1, source: "Admin vurdering" },
  "filtrere ai-prompting i kundeservice for at undgå datalæk": { label: "Lav", score: 0.1, source: "Admin vurdering" },
  "eksportere en revisionsklar log til tilsyn": { label: "Lav", score: 0.1, source: "Admin vurdering" },
  "se en oversigt over hvilke teams bruger hvilke ai-værktøjer": { label: "Høj", score: 0.9, source: "Admin vurdering" },
  "vurdere risikoen for gdpr-brud baseret på brugsmønstre": { label: "Høj", score: 0.9, source: "Admin vurdering" },
  "oprette politikker for hvilke afdelinger må bruge ai": { label: "Mellem", score: 0.5, source: "Admin vurdering" },
  "administrere brugerrettigheder og adgang til ai-tools": { label: "Lav", score: 0.1, source: "Admin vurdering" },
  "spore effektiviteten af ai-assisterede arbejdsopgaver": { label: "Lav", score: 0.1, source: "Admin vurdering" },
  "optimere prompts baseret på tidligere resultater": { label: "Lav", score: 0.1, source: "Admin vurdering" },
  "tilpasse dashboards til specifikke forretningsmål": { label: "Mellem", score: 0.5, source: "Admin vurdering" },
  "aktivere promptfiltrering på tværs af systemer": { label: "Lav", score: 0.1, source: "Admin vurdering" },
  "oprette onboarding-flow for ai-brugere": { label: "Lav", score: 0.1, source: "Admin vurdering" },
  "logge sagsbehandlinger hvor ai har assisteret": { label: "Lav", score: 0.1, source: "Admin vurdering" },
  "definere roller for adgang til følsomme ai-logs": { label: "Lav", score: 0.1, source: "Admin vurdering" },
  "identificere fejl i prompts der udløser advarsler": { label: "Lav", score: 0.1, source: "Admin vurdering" },
  "filtrere ai-anvendelse i forbindelse med sagsnumre": { label: "Høj", score: 0.9, source: "Admin vurdering" },
  "benchmarke ai-brug mod interne retningslinjer": { label: "Høj", score: 0.9, source: "Admin vurdering" },
  "gennemføre stikprøver på genererede ai-svar": { label: "Høj", score: 0.9, source: "Admin vurdering" },
  "oprette ai-adfærdsmønstre der udløser notifikationer": { label: "Høj", score: 0.9, source: "Admin vurdering" },
  "etablere baseline for ai-anvendelse ved projektstart": { label: "Høj", score: 0.9, source: "Admin vurdering" },
  "oploader dokumenter med personfølsomme oplysninger til at hjælpe med resume": { label: "Høj", score: 0.9, source: "Admin vurdering" }
};

// Lokal analysefunktion
function analyzeText(text) {
  const matches = riskyWords.filter(word => text.toLowerCase().includes(word.toLowerCase()));
  if (cprPattern.test(text)) matches.push('CPR-lignende nummer');
  return matches;
}

// Lookup-funktion uden Fuse
function fetchRiskFromModel(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  console.log("Analyserer prompt:", lowerPrompt);

  let bestMatch = null;

  for (const key in modelData) {
      if (lowerPrompt.includes(key.toLowerCase())) {
          const match = modelData[key];
          console.log("Match fundet:", key, "=>", match);

          if (!bestMatch || match.score > bestMatch.score) {
              bestMatch = {
                  matchPrompt: key,
                  score: match.score,
                  label: match.label,
                  source: match.source
              };
          }
      }
  }

  if (bestMatch) {
      console.log("Bedste match:", bestMatch);
      return bestMatch;
  }

  console.log("Ingen match fundet for prompt:", lowerPrompt);
  return {
      matchPrompt: null,
      score: 0,
      label: 'Ukendt',
      source: 'Ingen match'
  };
}

// Gør funktionerne globale
window.analyzeText = analyzeText;
window.fetchRiskFromModel = fetchRiskFromModel;
