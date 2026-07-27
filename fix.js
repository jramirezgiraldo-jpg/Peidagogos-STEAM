const fs = require('fs');
let c = fs.readFileSync('server.js', 'utf8');
c = c.replace(/`mermaid`/g, "'mermaid'");
c = c.replace(/`graph TD`/g, "'graph TD'");
c = c.replace(/`abc`/g, "'abc'");
fs.writeFileSync('server.js', c, 'utf8');
