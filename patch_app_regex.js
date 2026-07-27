const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

appJs = appJs.replace(/usuario_actual = data\.usuario; \/\/ Guardar ID del usuario actual/g, 'window.rol_actual = data.rol; usuario_actual = data.usuario; // Guardar ID del usuario actual');

appJs = appJs.replace(/let maxSemanaUnlocked = parseInt\(localStorage\.getItem\(key\)\) \|\| 1;/g, 'let maxSemanaUnlocked = parseInt(localStorage.getItem(key)) || 1; if (window.rol_actual === "admin" || window.rol_actual === "docente") { maxSemanaUnlocked = 8; }');

fs.writeFileSync('app.js', appJs, 'utf8');
console.log('Parcheado exitosamente app.js');
