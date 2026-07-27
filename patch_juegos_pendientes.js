const fs = require('fs');
let appJs = fs.readFileSync('d:/Peidagogos_Local/app.js', 'utf8');

const targetStr = `    if(window.renderizarBloquesEspeciales) window.renderizarBloquesEspeciales(innerContent);`;
const replacementStr = `    if(window.renderizarBloquesEspeciales) window.renderizarBloquesEspeciales(innerContent);
    
    setTimeout(() => {
        if (window.juegosPendientes && window.juegosPendientes.length > 0) {
            window.juegosPendientes.forEach(j => j());
            window.juegosPendientes = [];
        }
    }, 200);`;

if (appJs.includes(targetStr)) {
    // Only replace the first occurrence (which is inside abrirGuiaProfesor if we check properly, actually there are two: one in abrirGuiaProfesor, one in ingresarAGuia)
    // Wait, let's just replace all occurrences. If it runs twice, it's fine because it empties the array.
    appJs = appJs.split(targetStr).join(replacementStr);
    fs.writeFileSync('d:/Peidagogos_Local/app.js', appJs, 'utf8');
    console.log('Successfully patched juegosPendientes into all render flows');
} else {
    console.log('Target string not found for juegosPendientes patch');
}
