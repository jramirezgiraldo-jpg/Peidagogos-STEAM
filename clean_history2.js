const fs = require('fs');
let html = fs.readFileSync('login.html', 'utf8');

const oldMostrarVista = `        function mostrarVista(id) {
            // Ocultar todas
            const vistas = [`;

const newMostrarVista = `        function mostrarVista(id, pushState = true) {
            if (pushState && id !== 'login-screen-container') {
                history.pushState({ vistaId: id }, '', '?view=' + id);
            }

            // Ocultar todas
            const vistas = [`;

html = html.replace(oldMostrarVista, newMostrarVista);

const oldDOM = `        document.addEventListener('DOMContentLoaded', () => {`;
const newDOM = `        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.vistaId) {
                mostrarVista(e.state.vistaId, false);
            } else {
                mostrarVista('login-screen-container', false);
            }
        });

        document.addEventListener('DOMContentLoaded', () => {`;

html = html.replace(oldDOM, newDOM);

fs.writeFileSync('login.html', html, 'utf8');
