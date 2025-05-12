async function loadModules() {
    const modulesDiv = document.getElementById('modules');
    try {
        const response = await fetch('https://aiamigo-backend.onrender.com/modules');
        const data = await response.json();
        if (data.active_modules) {
            modulesDiv.innerHTML = '<strong>Aktive moduler:</strong><br>' + data.active_modules.join('<br>');
        } else {
            modulesDiv.innerHTML = 'Ingen aktive moduler fundet.';
        }
    } catch (error) {
        modulesDiv.innerHTML = 'Fejl ved hentning af moduler.';
        console.error(error);
    }
}
loadModules();