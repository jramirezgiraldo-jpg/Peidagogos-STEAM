const fs = require('fs');
let html = fs.readFileSync('login.html', 'utf8');

const oldMostrarVista = `        function mostrarVista(id, pushState = true) {
            if (pushState && id !== 'login-screen-container') {
                history.pushState({ vistaId: id }, '', '?view=' + id);
            }`;

const newMostrarVista = `        function mostrarVista(id, pushState = true) {
            if (pushState && id !== 'login-screen-container') {
                const currentSearch = window.location.search;
                if (currentSearch.includes('reg=')) {
                    // Do not overwrite URL if we are in a special registration link
                } else {
                    history.pushState({ vistaId: id }, '', '?view=' + id);
                }
            }`;

html = html.replace(oldMostrarVista, newMostrarVista);
fs.writeFileSync('login.html', html, 'utf8');
