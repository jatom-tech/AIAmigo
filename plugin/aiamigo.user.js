// ==UserScript==
// @name         AIAmigo Prompt Logger
// @namespace    http://aiamigo.local/
// @version      0.1
// @description  Capture prompts and send to AIAmigo backend
// @match        *://chat.openai.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const backendUrl = "http://localhost:8000/prompts/analyze";

    const sendPrompt = async (prompt) => {
        await fetch(backendUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt })
        });
    };

    const observer = new MutationObserver((mutations) => {
        for (let m of mutations) {
            if (m.addedNodes.length && m.addedNodes[0].textContent) {
                const text = m.addedNodes[0].textContent;
                if (text.length > 10) sendPrompt(text);
            }
        }
    });

    const target = document.querySelector("main");
    if (target) {
        observer.observe(target, { childList: true, subtree: true });
    }
})();
