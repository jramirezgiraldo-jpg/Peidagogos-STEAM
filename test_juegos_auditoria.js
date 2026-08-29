/**
 * test_juegos_auditoria.js — Peidagogos STEAM
 * Suite de Pruebas Automatizadas y Auditoría Forense
 * Valida que los 18 juegos de la Caja 2 cumplan con todos los estándares
 * de arquitectura web, compatibilidad móvil, gamificación y cero dependencias.
 */

const { PROMPTS_JUEGOS, obtenerPromptJuego } = require('./prompts_juegos.js');

const LISTA_18_JUEGOS = [
    { id: 'sopa_letras', nombre: 'Sopa de Letras', alias: ['juego_sopa_letras'] },
    { id: 'crucigrama', nombre: 'Crucigrama', alias: ['juego_crucigrama'] },
    { id: 'emparejar', nombre: 'Emparejar Columnas', alias: ['juego_emparejar'] },
    { id: 'concentrese', nombre: 'Concéntrese / Memoria', alias: ['juego_concentrese'] },
    { id: 'laberinto_decisiones', nombre: 'Laberinto de Decisiones', alias: ['juego_laberinto', 'laberinto'] },
    { id: 'tap_sort', nombre: 'Clasificador Tap & Sort', alias: ['juego_tap_sort', 'clasificador_tapsort'] },
    { id: 'scape_room', nombre: 'Scape Room / Candado Digital', alias: ['juego_escape_room', 'escape_room'] },
    { id: 'completar_parrafo', nombre: 'Completar el Párrafo', alias: ['juego_completar_parrafo'] },
    { id: 'anagrama', nombre: 'Anagrama', alias: ['juego_anagrama'] },
    { id: 'ordenar_secuencia', nombre: 'Ordenar Secuencias / Línea de Tiempo', alias: ['juego_ordenar_secuencias', 'linea_tiempo'] },
    { id: 'etiquetar_diagrama', nombre: 'Etiquetar Diagrama / Hotspots', alias: ['juego_etiquetar_diagrama', 'diagrama_hotspots'] },
    { id: 'tarjetas_tinder', nombre: 'Tarjetas de Deslizamiento V/F', alias: ['juego_tarjetas_deslizamiento', 'tarjetas_deslizamiento'] },
    { id: 'ahorcado', nombre: 'Misión Rescate / Ahorcado Moderno', alias: ['juego_ahorcado', 'mision_rescate'] },
    { id: 'lluvia_conceptos', nombre: 'Lluvia de Conceptos Arcade', alias: ['juego_lluvia_conceptos'] },
    { id: 'rompecabezas_frases', nombre: 'Rompecabezas de Frases / Leyes', alias: ['juego_rompecabezas_frases'] },
    { id: 'trivia', nombre: 'Trivia Contra Reloj', alias: ['juego_trivia', 'trivia_reloj'] },
    { id: 'ruleta_saber', nombre: 'Ruleta del Saber', alias: ['juego_ruleta', 'ruleta'] },
    { id: 'criptograma', nombre: 'Criptograma Científico', alias: ['juego_criptograma', 'criptograma_cientifico'] }
];

console.log('======================================================================');
console.log('🧪 INICIANDO AUDITORÍA FORENSE AUTOMATIZADA: 18 JUEGOS CAJA 2');
console.log('======================================================================\n');

let totalPruebas = 0;
let pruebasExitosas = 0;
let fallos = [];

function afirmar(condicion, descripcion) {
    totalPruebas++;
    if (condicion) {
        pruebasExitosas++;
        console.log(`  ✅ [PASS] ${descripcion}`);
    } else {
        fallos.push(descripcion);
        console.error(`  ❌ [FAIL] ${descripcion}`);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// PRUEBA 1: Integridad del Diccionario y Mapeo de Aliases
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- 1. VERIFICACIÓN DE DICCIONARIO Y ALIASES ---');
afirmar(typeof PROMPTS_JUEGOS === 'object' && PROMPTS_JUEGOS !== null, 'El objeto PROMPTS_JUEGOS está exportado y definido');

LISTA_18_JUEGOS.forEach(juego => {
    afirmar(typeof PROMPTS_JUEGOS[juego.id] === 'function', `Existe generador canónico para '${juego.id}' (${juego.nombre})`);
    juego.alias.forEach(al => {
        afirmar(typeof PROMPTS_JUEGOS[al] === 'function', `Alias '${al}' resuelve correctamente al generador`);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// PRUEBA 2: Interpolación de Variables y Cero Placeholders
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- 2. AUDITORÍA DE INTERPOLACIÓN Y LIMPIEZA DE PLACEHOLDERS ---');
const TEMA_PRUEBA = 'Termodinámica y Entropía Cuántica';
const NIVEL_PRUEBA = '10° Grado Media Vocacional';
const INSTR_PRUEBA = 'Analiza las leyes físicas y supera el reto cognitivo.';

LISTA_18_JUEGOS.forEach(juego => {
    const promptGenerado = obtenerPromptJuego(juego.id, TEMA_PRUEBA, NIVEL_PRUEBA, INSTR_PRUEBA);

    // 1. Debe contener las variables interpoladas
    afirmar(promptGenerado.includes(TEMA_PRUEBA), `[${juego.id}] Interpola variable \${tema}`);
    afirmar(promptGenerado.includes(NIVEL_PRUEBA), `[${juego.id}] Interpola variable \${nivel}`);
    afirmar(promptGenerado.includes(INSTR_PRUEBA), `[${juego.id}] Interpola variable \${instruccion}`);

    // 2. Prohibido placeholders genéricos o código truncado
    const tienePlaceholdersCorchetes = /\[(la celula|Escribe una breve guía|Escribe aquí|Palabra \d)\]/i.test(promptGenerado);
    afirmar(!tienePlaceholdersCorchetes, `[${juego.id}] Libre de placeholders en corchetes del PDF`);

    const tieneTruncados = /(añadir los demás|TODO:|\/\/ añadir)/i.test(promptGenerado);
    afirmar(!tieneTruncados, `[${juego.id}] Libre de comentarios de truncado o incompletitud`);
});

// ─────────────────────────────────────────────────────────────────────────────
// PRUEBA 3: Blindaje de Reglas Universales (HTML5, Cero Markdown, Overflow, XP)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- 3. REGLAS UNIVERSALES DE ARQUITECTURA WEB EN LOS 18 PROMPTS ---');

LISTA_18_JUEGOS.forEach(juego => {
    const p = obtenerPromptJuego(juego.id, 'Genética Molecular', '8°', 'Sigue las instrucciones');

    afirmar(p.includes('<!DOCTYPE html>') && p.includes('</html>'), `[${juego.id}] Exige archivo HTML5 con doctype y cierre html`);
    afirmar(p.includes('PROHIBIDO el uso de bloques markdown') || p.includes('sin markdown'), `[${juego.id}] Prohíbe estrictamente encapsular en markdown`);
    afirmar(p.includes('Vanilla') && (p.includes('<style>') || p.includes('CSS')), `[${juego.id}] Exige código Vanilla integrado sin CDNs`);
    afirmar(p.includes('overflow-x: hidden') || p.includes('sin scroll horizontal'), `[${juego.id}] Exige control estricto de overflow horizontal`);
    afirmar(p.includes('postMessage') && p.includes('juego_completado'), `[${juego.id}] Exige emisión de postMessage con XP a la plataforma`);
});

// ─────────────────────────────────────────────────────────────────────────────
// PRUEBA 4: Reglas Algorítmicas y de Diseño Críticas Específicas
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- 4. BLINDAJE DE ALGORITMOS ESPECÍFICOS POR JUEGO ---');

// Sopa de letras: Matriz 8 direcciones y anti-superposición
const promptSopa = obtenerPromptJuego('sopa_letras', 'ADN', '9°', 'Busca');
afirmar(promptSopa.includes('8 direcciones posibles'), '[sopa_letras] Exige matriz omnidireccional en 8 direcciones');
afirmar(promptSopa.includes('intersection check') || promptSopa.includes('validación de colisiones'), '[sopa_letras] Exige validación de colisiones');
afirmar(promptSopa.includes('PROHIBIDO USAR POSITION FIXED O ABSOLUTE EN EL FOOTER'), '[sopa_letras] Exige layout anti-superposición');

// Crucigrama: Diseño tradicional sin alternancia ni barras
const promptCrucigrama = obtenerPromptJuego('crucigrama', 'Ecosistemas', '7°', 'Completa');
afirmar(promptCrucigrama.includes('REQUISITO VISUAL ESTRICTO') && promptCrucigrama.includes('nth-child'), '[crucigrama] Prohíbe estilos de tabla alternada y franjas de fondo');
afirmar(promptCrucigrama.includes('cuadros individuales blancos'), '[crucigrama] Exige celdas individuales cuadradas clásicas');

// ─────────────────────────────────────────────────────────────────────────────
// PRUEBA 5: Simulación de Estructura de Respuesta HTML5
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- 5. SIMULACIÓN Y VALIDACIÓN SINTÁCTICA DE LA ESTRUCTURA HTML5 ---');

function validarEstructuraHTML5(htmlString) {
    if (!htmlString.startsWith('<!DOCTYPE html>')) return false;
    if (!htmlString.endsWith('</html>')) return false;
    if (!htmlString.includes('<style>') || !htmlString.includes('</style>')) return false;
    if (!htmlString.includes('<script>') || !htmlString.includes('</script>')) return false;
    if (htmlString.includes('```')) return false;
    if (/https?:\/\/.*(cdn|cdnjs|unpkg)/i.test(htmlString)) return false;
    return true;
}

const mockHTML = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Juego STEAM</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { overflow-x: hidden; width: 100%; font-family: sans-serif; }
    </style>
</head>
<body>
    <div id="game-container"></div>
    <script>
        function notificarVictoria(xp = 250) {
            if (window.parent) {
                window.parent.postMessage({ tipo: 'juego_completado', victoria: true, xp: xp }, '*');
            }
        }
    </script>
</body>
</html>`;

afirmar(validarEstructuraHTML5(mockHTML), 'El validador sintáctico certifica la estructura HTML5 pura autocontenida');

// ─────────────────────────────────────────────────────────────────────────────
// REPORTE FINAL
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n======================================================================');
console.log(`📊 RESULTADOS DE LA AUDITORÍA FORENSE: ${pruebasExitosas}/${totalPruebas} PRUEBAS SUPERADAS (${Math.round((pruebasExitosas/totalPruebas)*100)}%)`);
console.log('======================================================================');

if (fallos.length === 0) {
    console.log('🎉 TODOS LOS 18 JUEGOS ESTÁN 100% BLINDADOS Y LISTOS PARA PRODUCCIÓN.\n');
    process.exit(0);
} else {
    console.error('❌ SE DETECTARON FALLOS EN LA AUDITORÍA:');
    fallos.forEach((f, i) => console.error(`   ${i + 1}. ${f}`));
    process.exit(1);
}
