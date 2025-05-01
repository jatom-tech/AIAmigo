// riskmodul.js
console.log("riskmodul indlæst...");

// Risikodata
const riskyWords = ['CPR', 'sygdom', 'løn', 'afskedigelse', 'diskrimination'];
const cprPattern = /\b\d{6}-?\d{4}\b/;

// Analysefunktion
function analyzeText(text) {
    const matches = riskyWords.filter(word => text.toLowerCase().includes(word.toLowerCase()));
    if (cprPattern.test(text)) matches.push('CPR-lignende nummer');
    return matches;
}

// Gør analyzeText global
window.analyzeText = analyzeText;
