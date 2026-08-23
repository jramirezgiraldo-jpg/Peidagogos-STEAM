const fs = require('fs');
let html = fs.readFileSync('login.html', 'utf8');

html = html.replace('function mostrarVista(id) {', `function mostrarVista(id, pushState = true) {
            if (pushState && id !== 'login-screen-container') {
                history.pushState({ vistaId: id }, '', '?view=' + id);
            }`);

const popStateCode = `
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.vistaId) {
                mostrarVista(e.state.vistaId, false);
            } else {
                mostrarVista('login-screen-container', false);
            }
        });
`;
html = html.replace("document.addEventListener('DOMContentLoaded', () => {", "document.addEventListener('DOMContentLoaded', () => {" + popStateCode);

fs.writeFileSync('login.html', html, 'utf8');
