/**
 * js/gameTemplates.js — Peidagogos STEAM
 * Plantillas de prompt para los 10 juegos dinámicos de la Caja 2.
 */
window.GAME_TEMPLATES = {
    juego_sopa_letras: `Actúa como un desarrollador frontend senior y genera un archivo único e interactivo en formato .html (que integre HTML5, CSS3 y JavaScript vanilla sin librerías externas) basado estrictamente en estos datos:
TEMA: {{TEMA}}
INSTRUCCIÓN: {{INSTRUCCION}}

REQUISITOS TÉCNICOS Y FUNCIONALES:
1. Construcción y Lógica Dinámica: Construye una cuadrícula proporcional óptima (12x12 o 13x13). Coloca 10 palabras relacionadas al tema de forma aleatoria en direcciones válidas (horizontal, vertical y diagonal, directo e inverso). Rellena los espacios vacíos con letras aleatorias.
2. Diseño Mobile-First y Responsivo: Interfaz adaptable a smartphones (360px a 420px) sin scroll horizontal. Estilo moderno de alto contraste. Bloquear desplazamiento al jugar con touch-action: none y user-select: none.
3. Interacción Táctil y Arrastre: Selección fluida compatible con dedos y cursor. Validar trazos en línea recta. Si coincide con una palabra, fijarla con color permanente y marcarla en la lista. Si no, limpiar selección.
4. Interfaz y Marcadores: Encabezado con Título, Instrucción, Cronómetro y Contador. Lista inferior con las 10 palabras en formato de etiquetas. Modal de victoria con confeti, tiempo final y botón de Reiniciar.`,

    juego_crucigrama: `Actúa como un desarrollador frontend senior y experto en pedagogía.
TEMA Y/O PALABRAS CLAVE: {{TEMA}}
NIVEL EDUCATIVO: {{NIVEL}}
INSTRUCCIÓN: {{INSTRUCCION}}

FASE 1: Genera 10 palabras clave y 10 pistas educativas adaptadas al nivel.
FASE 2: Crea un archivo único .html (HTML5, CSS3, JS vanilla).
REQUISITOS TÉCNICOS:
1. Construcción y Lógica: Acomoda automáticamente las palabras en intersecciones. Cuadrícula individual con celdas cuadradas y bordes visibles. Numeración clara en la primera celda de cada palabra.
2. Diseño Mobile-First: Fondo claro (#fff o #f9f9f9). Estilo de crucigrama tradicional nítido. Adaptable a smartphones (360px-420px). Evitar zoom automático en inputs.
3. Interacción: Al tocar una casilla, resaltar todas las celdas de la palabra activa. Alternar dirección con segundo toque en intersecciones. Auto-avance al escribir y conversión a mayúsculas.
4. Interfaz: Encabezado con Título, Instrucción, Cronómetro y Progreso. Lista inferior dividida en Horizontales y Verticales con las pistas. Validación en tiempo real con color de éxito. Modal de victoria con confeti y tiempo. Código comentado en español.`,

    juego_emparejar: `Actúa como un desarrollador frontend senior y experto en pedagogía.
TEMA Y/O PALABRAS CLAVE: {{TEMA}}
NIVEL EDUCATIVO: {{NIVEL}}
INSTRUCCIÓN: {{INSTRUCCION}}

FASE 1: Define 8 a 10 conceptos clave y sus definiciones adaptadas al nivel.
FASE 2: Crea un archivo único .html (HTML5, CSS3, JS vanilla).
REQUISITOS TÉCNICOS:
1. Lógica Dinámica: Arreglo de objetos vinculando concepto y definición. Renderizar Columna A (Conceptos) y Columna B (Definiciones). Mezclar (shuffle) independientemente al cargar.
2. Diseño Mobile-First: Fondo claro (#f9f9f9). Elementos en "tarjetas" con sombra suave. Grid de 2 columnas adaptable a móviles (360px-420px) sin scroll horizontal.
3. Interacción: Tocar una tarjeta de A y luego una de B. Al seleccionar la primera, resaltar (esperando pareja). Validación: si es correcto, cambian a color de éxito y se deshabilitan. Si es incorrecto, color rojo temporal, animación shake y deselección automática tras 800ms.
4. Interfaz: Encabezado con Título, Instrucción, Cronómetro y Contador de parejas. Modal de victoria con confeti, tiempo final y botón de Reiniciar.`,

    juego_concentrese: `Actúa como un desarrollador frontend senior y experto en pedagogía.
TEMA Y/O PALABRAS CLAVE: {{TEMA}}
NIVEL EDUCATIVO: {{NIVEL}}
INSTRUCCIÓN: {{INSTRUCCION}}

FASE 1: Define 10 conceptos clave y 10 definiciones cortas (20 cartas en total).
FASE 2: Crea un archivo único .html (HTML5, CSS3, JS vanilla).
REQUISITOS TÉCNICOS:
1. Lógica Dinámica: Mezclar (shuffle) el orden de las 20 cartas aleatoriamente. Estructura 3D con doble cara (frente oculto, dorso con texto).
2. Diseño Mobile-First: CSS Grid. En móviles (360px-420px) usar 4 columnas x 5 filas. Cartas modernas, texto legible. Transición suave de flip 3D (rotateY).
3. Interacción: Voltear máximo 2 cartas a la vez. Validación: si hacen pareja, quedan boca arriba en color de éxito y se deshabilitan. Si no, se muestran brevemente (1.5s), leve efecto de error y se voltean boca abajo. Bloquear clics mientras se evalúa.
4. Interfaz: Encabezado con Título, Instrucción, Cronómetro, Contador de Movimientos y Parejas. Modal de victoria con confeti, tiempo, movimientos y botón de Reiniciar.`,

    juego_laberinto: `Actúa como desarrollador frontend senior, diseñador UX y experto en pedagogía.
TEMA Y/O ESCENARIO: {{TEMA}}
NIVEL EDUCATIVO: {{NIVEL}}
INSTRUCCIÓN: {{INSTRUCCION}}

FASE 1: Crea un árbol de decisiones con al menos 8 nodos (1 inicio, intermedios con 2-3 opciones, al menos 3 finales: 1 exitoso y 2 de aprendizaje). Textos inmersivos.
FASE 2: Crea un archivo único .html (HTML5, CSS3, JS vanilla).
REQUISITOS TÉCNICOS:
1. Lógica Dinámica: Estructura JSON (id, texto, tipo, opciones con id destino). Función para renderizar la escena activa.
2. Diseño Mobile-First: Tarjeta central amplia y limpia sobre fondo suave. Tipografía grande y legible para móviles. Botones de decisión anchos y táctiles.
3. Interacción: Transiciones fade-out/fade-in entre escenas. Auto-scroll top al cambiar de escena.
4. Interfaz: Encabezado minimalista con Título e indicador de progreso. Pantallas finales destacadas (Verde para éxito, Naranja para aprendizaje con retroalimentación). Botón para volver a intentar.`,

    juego_tap_sort: `Actúa como desarrollador frontend senior y experto en interfaces educativas.
TEMA PRINCIPAL: {{TEMA}}
CATEGORÍAS: Genera entre 2 y 4 categorías lógicas basadas en el tema.
NIVEL EDUCATIVO: {{NIVEL}}
INSTRUCCIÓN: {{INSTRUCCION}}

FASE 1: Define 12-15 conceptos/elementos distribuidos en las categorías, adaptados al nivel (usa emojis si aplica).
FASE 2: Crea un archivo único .html (HTML5, CSS3, JS vanilla).
REQUISITOS TÉCNICOS:
1. Lógica Dinámica: Arreglo de objetos (texto, categoriaCorrecta). Aleatorizar orden de aparición.
2. Diseño Mobile-First: Fondo claro. Adaptable a móviles sin scroll horizontal. Botones grandes y distintos para las Categorías. Elementos a clasificar mostrados como "chips" en el centro.
3. Interacción (Mecánica Tap, CERO Drag & Drop): Paso 1: Tocar elemento para activarlo (resaltado). Paso 2: Tocar categoría. Validación: si es correcto, desaparece o vuela a la categoría y suma punto. Si es incorrecto, animación shake, color rojo temporal y registra error.
4. Interfaz: Encabezado con Título, Instrucción, Cronómetro, Aciertos y Errores. Modal de victoria con confeti, tiempo, errores cometidos y botón de Reiniciar.`,

    juego_anagrama: `Actúa como desarrollador frontend senior y experto en interfaces educativas.
TEMA Y/O PALABRAS CLAVE: {{TEMA}}
NIVEL EDUCATIVO: {{NIVEL}}
INSTRUCCIÓN: {{INSTRUCCION}}

FASE 1: Define 10 palabras clave (sin espacios) y 10 pistas cortas correspondientes.
FASE 2: Crea un archivo único .html (HTML5, CSS3, JS vanilla).
REQUISITOS TÉCNICOS:
1. Lógica Dinámica: Desordenar (shuffle) letras de la palabra actual. Avanzar nivel por nivel automáticamente tras resolver.
2. Diseño Mobile-First: Fondo claro, adaptable a móviles. Área superior con pista, área central con casillas vacías, área inferior con letras desordenadas como botones estilo Scrabble.
3. Interacción (Mecánica Tap, CERO Drag & Drop): Tocar letra inferior la mueve a primera casilla vacía superior. Tocar letra superior la regresa abajo. Validación automática al llenar: si correcto, luz verde y avance en 1s. Si incorrecto, animación shake, luz roja y letras regresan abajo.
4. Interfaz: Encabezado con Título, Instrucción, Cronómetro y Progreso. Modal de victoria final con confeti, tiempo y Reiniciar.`,

    juego_ordenar_secuencias: `Actúa como desarrollador frontend senior y experto en interfaces educativas.
PROCESO O SECUENCIA: {{TEMA}}
NIVEL EDUCATIVO: {{NIVEL}}
INSTRUCCIÓN: {{INSTRUCCION}}

FASE 1: Define el proceso dividiéndolo en 6 a 8 pasos cronológicos/lógicos claros.
FASE 2: Crea un archivo único .html (HTML5, CSS3, JS vanilla).
REQUISITOS TÉCNICOS:
1. Lógica Dinámica: Arreglo de objetos (id, texto). Desordenar aleatoriamente al inicio. Renderizar en lista vertical.
2. Diseño Mobile-First: Fondo claro (#f4f6f8). Tarjetas horizontales con texto a la izquierda y botones táctiles grandes (⬆️ ⬇️) a la derecha.
3. Interacción (Mecánica Táctil, CERO Drag & Drop): Botones intercambian posición de tarjeta actual con la superior o inferior. Transición CSS suave. Validación automática: evaluar si el orden actual coincide 100% con el original en cada movimiento.
4. Interfaz: Encabezado con Título, Instrucción, Cronómetro y Contador de Movimientos. Modal de victoria con confeti, tiempo, movimientos y Reiniciar.`,

    juego_escape_room: `Actúa como desarrollador frontend senior, diseñador UX y experto en gamificación.
TEMA Y/O MISIÓN: {{TEMA}}
NIVEL EDUCATIVO: {{NIVEL}}
INSTRUCCIÓN: {{INSTRUCCION}}

FASE 1: Diseña misión de 3 a 4 salas secuenciales. Para cada una, redacta un acertijo retador y un código secreto numérico (3 a 4 dígitos) como respuesta.
FASE 2: Crea un archivo único .html (HTML5, CSS3, JS vanilla).
REQUISITOS TÉCNICOS:
1. Lógica Dinámica: Gestionar estado para avanzar sala por sala.
2. Diseño Mobile-First (Laboratorio/Misterio): Fondo oscuro, alta legibilidad, acentos neón. Pantalla de acertijo arriba, Display del candado (_ _ _ _) en el centro, y Teclado Táctil (Keypad numérico 0-9, Borrar y Desbloquear) abajo. IMPORTANTE: No usar <input type="number"> para evitar teclado virtual.
3. Interacción: Tocar números refleja en el display. Botón Desbloquear valida: si correcto, brilla verde, éxito y avanza. Si incorrecto, parpadeo rojo, shake y limpia entrada.
4. Interfaz: Encabezado con Título, Cronómetro y Progreso. Modal de victoria con confeti, tiempo total de escape y Reiniciar.`,

    juego_completar_parrafo: `Actúa como desarrollador frontend senior y experto en diseño instruccional.
TEMA DEL TEXTO: {{TEMA}}
NIVEL EDUCATIVO: {{NIVEL}}
INSTRUCCIÓN: {{INSTRUCCION}}

FASE 1: Redacta un párrafo educativo y coherente. Extrae 5-8 palabras clave (huecos). Crea un banco de palabras con las extraídas + 2-3 distractoras.
FASE 2: Crea un archivo único .html (HTML5, CSS3, JS vanilla).
REQUISITOS TÉCNICOS:
1. Lógica Dinámica: Separar texto con identificadores de huecos y banco de palabras mezclado aleatoriamente.
2. Diseño Mobile-First: Fondo claro (#f4f6f8). Texto grande (min 16px) interlineado amplio. Huecos como casillas en línea. Banco de palabras como "chips" inferiores.
3. Interacción (Mecánica Táctil, CERO Drag & Drop): Tocar chip lo activa (resalta). Tocar hueco vacío inserta chip activo. Tocar hueco lleno regresa chip al banco. Validación automática al llenar todo: si correcto, verde y victoria. Si hay errores, las incorrectas hacen shake, rojo y regresan al banco; las correctas se quedan fijas.
4. Interfaz: Encabezado con Título, Instrucción, Cronómetro y Progreso. Modal de victoria con confeti, tiempo y Reiniciar.`
};

// Aliases para los 18 juegos interactivos de Caja 2
[
    'juego_sopa_letras', 'juego_crucigrama', 'juego_emparejar', 'juego_concentrese',
    'juego_laberinto', 'juego_tap_sort', 'juego_escape_room', 'juego_completar_parrafo',
    'juego_anagrama', 'juego_ordenar_secuencias', 'juego_etiquetar_diagrama',
    'juego_tarjetas_deslizamiento', 'juego_ahorcado', 'juego_lluvia_conceptos',
    'juego_rompecabezas_frases', 'juego_trivia', 'juego_ruleta', 'juego_criptograma'
].forEach(id => {
    if (!window.GAME_TEMPLATES[id]) {
        window.GAME_TEMPLATES[id] = true;
    }
});

// Ensambla el prompt reemplazando los marcadores o llamando al generador maestro
window.ensamblarPromptJuego = function(juegoId, tema, nivel, instruccion) {
    if (typeof window.obtenerPromptJuego === 'function') {
        return window.obtenerPromptJuego(juegoId, tema, nivel, instruccion);
    }
    const rawTpl = (window.GAME_TEMPLATES && window.GAME_TEMPLATES[juegoId]) || "";
    let basePrompt = (typeof rawTpl === 'function') ? rawTpl(tema, nivel, instruccion) : String(rawTpl).trim();
    if (!basePrompt || basePrompt === 'true') {
        basePrompt = `Eres un experto pedagógico STEAM. Genera un interactivo HTML5 para el juego "${juegoId}" sobre el tema "{{TEMA}}" para un nivel educativo de {{NIVEL}}.\nInstrucción para el estudiante: {{INSTRUCCION}}.\nDevuelve ÚNICAMENTE código HTML5 puro.`;
    }
    return basePrompt
        .replace(/\{\{TEMA\}\}/g, tema || 'el tema indicado')
        .replace(/\{\{NIVEL\}\}/g, nivel || 'grado escolar')
        .replace(/\{\{INSTRUCCION\}\}/g, instruccion || 'Completa la actividad con atención.');
};