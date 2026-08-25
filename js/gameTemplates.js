/**
 * js/gameTemplates.js — Peidagogos STEAM
 * Plantillas de prompt para los 10 juegos dinámicos de la Caja 2.
 * Valores inicializados en "" para personalización del usuario.
 */
window.GAME_TEMPLATES = {
    juego_sopa_letras: "",          // 1. Sopa de Letras
    juego_crucigrama: "",            // 2. Crucigrama
    juego_emparejar: "",             // 3. Emparejar
    juego_concentrese: "",           // 4. Concéntrese (Memoria)
    juego_laberinto: "",             // 5. Laberinto de Decisiones
    juego_tap_sort: "",              // 6. Clasificador Tap & Sort
    juego_anagrama: "",              // 7. Anagrama
    juego_ordenar_secuencias: "",    // 8. Ordenar Secuencias
    juego_escape_room: "",           // 9. Escape Room
    juego_completar_parrafo: ""      // 10. Completar el Párrafo
};

// Ensambla el prompt reemplazando los marcadores {{TEMA}}, {{NIVEL}}, {{INSTRUCCION}}
window.ensamblarPromptJuego = function(juegoId, tema, nivel, instruccion) {
    const rawTpl = (window.GAME_TEMPLATES && window.GAME_TEMPLATES[juegoId]) || "";
    let basePrompt = rawTpl.trim();
    if (!basePrompt) {
        basePrompt = `Eres un experto pedagógico STEAM. Genera la estructura de datos para el juego "${juegoId}" sobre el tema "{{TEMA}}" para un nivel educativo de {{NIVEL}}.\nInstrucción para el estudiante: {{INSTRUCCION}}.\nDevuelve ÚNICAMENTE un JSON válido con los datos del juego.`;
    }
    return basePrompt
        .replace(/\{\{TEMA\}\}/g, tema || 'el tema indicado')
        .replace(/\{\{NIVEL\}\}/g, nivel || 'grado escolar')
        .replace(/\{\{INSTRUCCION\}\}/g, instruccion || 'Completa la actividad con atención.');
};

console.log('[GAME_TEMPLATES] 10 plantillas de juegos dinámicos listas.');
