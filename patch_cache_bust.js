const fs = require('fs');
let html = fs.readFileSync('d:/Peidagogos_Local/login.html', 'utf8');

const timestamp = Date.now();
// Reemplazamos <script src="app.js"></script> por <script src="app.js?v=timestamp"></script>
html = html.replace(/<script src="app\.js(\?v=\d+)?"(.*?)><\/script>/g, `<script src="app.js?v=${timestamp}"$2></script>`);

fs.writeFileSync('d:/Peidagogos_Local/login.html', html, 'utf8');
console.log('Cache busting applied to login.html!');
