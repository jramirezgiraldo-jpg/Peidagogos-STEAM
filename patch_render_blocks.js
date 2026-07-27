const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

// 1. Agregar la función renderizarBloquesEspeciales al final de app.js
const nuevaFuncion = `
// ==========================================
// RENDERIZADO DE BLOQUES ESPECIALES (MERMAID Y ABC)
// ==========================================
window.renderizarBloquesEspeciales = function(containerElement) {
    if (!containerElement) return;

    // Renderizar Mermaid
    const mermaidBlocks = containerElement.querySelectorAll('pre code.language-mermaid');
    mermaidBlocks.forEach((block, index) => {
        const text = block.textContent;
        const pre = block.parentElement;
        const div = document.createElement('div');
        div.className = 'mermaid';
        div.style.background = 'white';
        div.style.padding = '20px';
        div.style.borderRadius = '8px';
        div.style.marginBottom = '20px';
        div.style.textAlign = 'center';
        div.style.overflowX = 'auto';
        div.textContent = text;
        pre.parentNode.replaceChild(div, pre);
    });
    
    if (mermaidBlocks.length > 0 && window.mermaid) {
        try {
            mermaid.init(undefined, containerElement.querySelectorAll('.mermaid'));
        } catch (e) {
            console.error("Error renderizando mermaid:", e);
        }
    }

    // Renderizar ABC
    const abcBlocks = containerElement.querySelectorAll('pre code.language-abc');
    abcBlocks.forEach((block, index) => {
        const text = block.textContent;
        const pre = block.parentElement;
        const div = document.createElement('div');
        const uniqueId = 'abc-render-' + Date.now() + '-' + index;
        div.id = uniqueId;
        div.className = 'abcjs-container';
        div.style.background = 'white';
        div.style.padding = '20px';
        div.style.borderRadius = '8px';
        div.style.marginBottom = '20px';
        div.style.overflowX = 'auto';
        pre.parentNode.replaceChild(div, pre);
        
        if (window.ABCJS) {
            try {
                ABCJS.renderAbc(uniqueId, text, { responsive: 'resize' });
            } catch (e) {
                console.error("Error renderizando abc:", e);
            }
        }
    });
};
`;

if (!appJs.includes('window.renderizarBloquesEspeciales')) {
    appJs += nuevaFuncion;
}

// 2. Llamar a renderizarBloquesEspeciales después de inyectar html en las guías
appJs = appJs.replace(
    /guideContent\.innerHTML = htmlRenderizado;[\s\n]*if \(window\.juegosPendientes/g,
    `guideContent.innerHTML = htmlRenderizado;\n            window.renderizarBloquesEspeciales(guideContent);\n            if (window.juegosPendientes`
);

// 3. También en renderizarGuiaProfesor
appJs = appJs.replace(
    /document\.getElementById\("student-guide-content"\)\.innerHTML = htmlRenderizado;[\s\n]*if \(window\.juegosPendientes/g,
    `const guideContentProf = document.getElementById("student-guide-content");\n    guideContentProf.innerHTML = htmlRenderizado;\n    window.renderizarBloquesEspeciales(guideContentProf);\n    if (window.juegosPendientes`
);

fs.writeFileSync('app.js', appJs, 'utf8');
console.log('Parcheado renderizarBloquesEspeciales en app.js exitosamente.');
