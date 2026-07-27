const fs = require('fs');
let file = fs.readFileSync('d:/Peidagogos_Local/proyector_cron.js', 'utf8');

const targetStr = `"customHtml": "OPCIONAL. Solo si necesitas proyectar un grfico, esquema, o diagrama visual hecho con HTML/CSS/SVG. No lo pongas si no hace falta.",`;
const newStr = `"customHtml": "OPCIONAL PERO MUY RECOMENDADO. Si la actividad pide dibujar esquemas, diseos o diagramas, DEBES usar notacin de bloques Mermaid encerrados en <div class='mermaid'>...</div>. Si es msica (pentagramas, notas), usa formato ABC encerrado en <div class='abc-music'>...</div>. Si no hay dibujo, djalo vaco.",`;

if (file.includes(targetStr)) {
    file = file.replace(targetStr, newStr);
    fs.writeFileSync('d:/Peidagogos_Local/proyector_cron.js', file, 'utf8');
    console.log('Patched proyector_cron.js prompt!');
} else {
    console.log('Target string not found in proyector_cron.js');
}
