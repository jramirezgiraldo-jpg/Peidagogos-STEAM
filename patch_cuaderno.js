const fs = require('fs');
let appJs = fs.readFileSync('d:/Peidagogos_Local/app.js', 'utf8');

const strReemplazoOriginal = `    let html = marked.parse(textoMarkdown);
    
    // Buscar [JUEGO:TIPO:DATOS]
    const regex = /\\[JUEGO:(ORDENAR_LETRAS|ORDENAR_FRASE|SOPA_LETRAS|CRUCIGRAMA):(.*?)\\]/g;`;

const strReemplazoNuevo = `    // Pre-procesar ACTIVIDAD:CUADERNO
    let textoProcesado = textoMarkdown;
    let matchCuaderno;
    const regexCuaderno = /\\[ACTIVIDAD:CUADERNO:([\\s\\S]*?)\n\\]/g;
    textoProcesado = textoProcesado.replace(regexCuaderno, (match, contenido) => {
        let instruction = contenido;
        let codeBlock = "";
        
        if (contenido.includes('mermaid\\n')) {
            let parts = contenido.split('mermaid\\n');
            instruction = parts[0].trim();
            codeBlock = '<div class="mermaid" style="background:white; padding:10px; border-radius:4px; margin-top:10px; overflow-x:auto; text-align:center;">' + parts[1].trim() + '</div>';
            window.juegosPendientes.push(() => {
                if (window.mermaid) {
                    try { mermaid.init(undefined, document.querySelectorAll('.mermaid')); } catch(e){}
                }
            });
        } else if (contenido.includes('abc\\n')) {
            let parts = contenido.split('abc\\n');
            instruction = parts[0].trim();
            let uniqueId = 'abc-' + Math.random().toString(36).substr(2, 9);
            codeBlock = '<div id="' + uniqueId + '" class="abcjs-container" style="background:white; padding:10px; border-radius:4px; margin-top:10px; overflow-x:auto; text-align:center;"></div>';
            window.juegosPendientes.push(() => {
                if (window.ABCJS) {
                    try { ABCJS.renderAbc(uniqueId, parts[1].trim(), { responsive: 'resize' }); } catch(e){}
                }
            });
        }
        
        return \`<div style="background:#FEF3C7; border:2px dashed #D97706; padding:15px; margin:15px 0; border-radius:8px;">
            <h5 style="color:#92400E; margin-top:0;">📓 Actividad en Cuaderno</h5>
            <p style="color:#92400E;">\${instruction}</p>\${codeBlock}
        </div>\`;
    });
    
    // Y también por si el LLM no puso el salto de línea antes del bracket final
    const regexCuaderno2 = /\\[ACTIVIDAD:CUADERNO:([\\s\\S]*?)\\](?=\\n\\n|$)/g;
    textoProcesado = textoProcesado.replace(regexCuaderno2, (match, contenido) => {
        if (match.includes('mermaid\\n') || match.includes('abc\\n')) return match; // ya procesado
        return \`<div style="background:#FEF3C7; border:2px dashed #D97706; padding:15px; margin:15px 0; border-radius:8px;">
            <h5 style="color:#92400E; margin-top:0;">📓 Actividad en Cuaderno</h5>
            <p style="color:#92400E;">\${contenido}</p>
        </div>\`;
    });

    let html = marked.parse(textoProcesado);
    
    // Buscar [JUEGO:TIPO:DATOS]
    const regex = /\\[JUEGO:(ORDENAR_LETRAS|ORDENAR_FRASE|SOPA_LETRAS|CRUCIGRAMA):(.*?)\\]/g;`;

if (appJs.includes('// Buscar [JUEGO:TIPO:DATOS]')) {
    appJs = appJs.replace(strReemplazoOriginal, strReemplazoNuevo);
    fs.writeFileSync('d:/Peidagogos_Local/app.js', appJs, 'utf8');
    console.log('app.js patched for ACTIVIDAD:CUADERNO');
} else {
    console.log('Target string not found!');
}
