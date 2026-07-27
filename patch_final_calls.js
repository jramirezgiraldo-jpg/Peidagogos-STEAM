const fs = require('fs');
let appJs = fs.readFileSync('d:/Peidagogos_Local/app.js', 'utf8');

if (!appJs.includes('window.renderizarBloquesEspeciales(innerContent)')) {
    appJs = appJs.replace(/innerContent\.innerHTML = htmlRenderizado;/g, 'innerContent.innerHTML = htmlRenderizado;\\n    if(window.renderizarBloquesEspeciales) window.renderizarBloquesEspeciales(innerContent);');
    fs.writeFileSync('d:/Peidagogos_Local/app.js', appJs, 'utf8');
    console.log('Patch successfully applied!');
} else {
    console.log('Already patched!');
}
