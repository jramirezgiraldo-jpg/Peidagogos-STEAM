const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

// The replacement string
const str1 = 'guideContent.innerHTML = htmlRenderizado;';
const rep1 = 'guideContent.innerHTML = htmlRenderizado;\\n    window.renderizarBloquesEspeciales(guideContent);';

appJs = appJs.replace('guideContent.innerHTML = htmlRenderizado;', 'guideContent.innerHTML = htmlRenderizado;\n    window.renderizarBloquesEspeciales(guideContent);');

appJs = appJs.replace('document.getElementById("student-guide-content").innerHTML = htmlRenderizado;', 'const guideContentProf = document.getElementById("student-guide-content");\n    guideContentProf.innerHTML = htmlRenderizado;\n    window.renderizarBloquesEspeciales(guideContentProf);');

fs.writeFileSync('app.js', appJs, 'utf8');
console.log('Parche aplicado.');
