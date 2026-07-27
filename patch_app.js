const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

// 1. Modificar el bloque de Login para guardar window.rol_actual
const loginOriginal = `                    usuario_actual = data.usuario; // Guardar ID del usuario actual

                    if (data.rol === 'admin') {`;
const loginNuevo = `                    window.rol_actual = data.rol;
                    usuario_actual = data.usuario; // Guardar ID del usuario actual

                    if (data.rol === 'admin') {`;

appJs = appJs.replace(loginOriginal, loginNuevo);

// 2. Modificar aplicarRestriccionesProgreso
const aplicarRestriccionesOriginal = `    const key = \`prog_\${window.usuario_actual || 'default'}_\${asignatura}_p\${periodo}\`;
    let maxSemanaUnlocked = parseInt(localStorage.getItem(key)) || 1;
    
    const selectSemana = document.getElementById("student-select-semana");
    if (!selectSemana) return;`;

const aplicarRestriccionesNuevo = `    const key = \`prog_\${window.usuario_actual || 'default'}_\${asignatura}_p\${periodo}\`;
    let maxSemanaUnlocked = parseInt(localStorage.getItem(key)) || 1;
    
    if (window.rol_actual === 'admin' || window.rol_actual === 'docente') {
        maxSemanaUnlocked = 8; // Desbloquear todas las semanas para admin y docente
    }
    
    const selectSemana = document.getElementById("student-select-semana");
    if (!selectSemana) return;`;

appJs = appJs.replace(aplicarRestriccionesOriginal, aplicarRestriccionesNuevo);

// 3. Modificar renderizarGuiaProfesor
const renderizarGuiaOriginal = `    const key = \`prog_\${window.usuario_actual || 'default'}_\${asignatura}_p\${periodo}\`;
    let maxSemanaUnlocked = parseInt(localStorage.getItem(key)) || 1;
    
    const selectSemana = document.getElementById("student-select-semana");
    if (!selectSemana) return;`;

const renderizarGuiaNuevo = `    const key = \`prog_\${window.usuario_actual || 'default'}_\${asignatura}_p\${periodo}\`;
    let maxSemanaUnlocked = parseInt(localStorage.getItem(key)) || 1;
    
    if (window.rol_actual === 'admin' || window.rol_actual === 'docente') {
        maxSemanaUnlocked = 8;
    }
    
    const selectSemana = document.getElementById("student-select-semana");
    if (!selectSemana) return;`;

appJs = appJs.replace(renderizarGuiaOriginal, renderizarGuiaNuevo);

// 4. Modificar completarMisionActual 
const completarMisionOriginal = `    const key = \`prog_\${window.usuario_actual || 'default'}_\${asignatura}_p\${periodo}\`;
    let maxSemanaUnlocked = parseInt(localStorage.getItem(key)) || 1;
    let semanaActual = parseInt(semanaStr);`;

const completarMisionNuevo = `    const key = \`prog_\${window.usuario_actual || 'default'}_\${asignatura}_p\${periodo}\`;
    let maxSemanaUnlocked = parseInt(localStorage.getItem(key)) || 1;
    if (window.rol_actual === 'admin' || window.rol_actual === 'docente') {
        maxSemanaUnlocked = 8;
    }
    let semanaActual = parseInt(semanaStr);`;
    
appJs = appJs.replace(completarMisionOriginal, completarMisionNuevo);

fs.writeFileSync('app.js', appJs, 'utf8');
console.log('Parcheado exitosamente app.js');
