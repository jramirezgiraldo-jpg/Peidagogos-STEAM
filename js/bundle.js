// PEIDAGOGOS STEAM BUNDLE AUTO-CONTENIDO (CERO ERRORES DE CORS EN FILE:///)
(function() {
// Catálogo completo de las 22 actividades pedagógicas con metadatos y prompts
const COMMON_PHASE_3 = `

FASE 3: LECTURA TEÓRICA Y TALLER DE REPASO (SIEMPRE VISIBLES DEBAJO DEL JUEGO)
Para consolidar el aprendizaje, debes generar e incrustar estáticamente en el HTML una sección pedagógica que esté SIEMPRE VISIBLE en la página, ubicada exactamente debajo del contenedor del juego interactivo. NO la ocultes, NO la pongas dentro de modales y NO esperes a que termine el juego para mostrarla. El estudiante debe poder ver el juego arriba y simplemente hacer scroll hacia abajo para leer el texto en cualquier momento.

Estructura HTML esperada:
<main>
  <section id="zona-juego">...</section>
  <section id="zona-lectura">...</section>
</main>

Esta sección debe contener:
1. Un artículo teórico profundo, bien redactado y estructurado sobre el tema principal (MÍNIMO 500 PALABRAS). Usa encabezados (h2, h3), párrafos claros y viñetas para facilitar la lectura.
2. Un 'Taller de Repaso' consistente en 10 actividades basadas estrictamente en el artículo teórico generado.

IMPORTANTE PARA EL TALLER:
- Añade un mensaje inicial destacando la siguiente instrucción: "Escribe y resuelve estas actividades en tu cuaderno".
- Las 10 preguntas/actividades deben alternarse obligatoriamente entre diferentes formatos: responder directamente, analizar críticamente, dibujar o ilustrar conceptos, y elaborar mapas mentales o conceptuales.

Diseño de la Fase 3: Fondo claro, tipografía orientada a la lectura (buen tamaño e interlineado amplio), márgenes amplios (padding) y un contenedor tipo 'artículo' que sea responsivo y encaje perfectamente en móviles.

REQUISITO TÉCNICO CRÍTICO 1 (MODO OFFLINE 100%):
El archivo HTML generado DEBE funcionar perfectamente SIN conexión a internet en los computadores del colegio. 
- ESTRICTAMENTE PROHIBIDO usar CDNs o enlaces externos para estilos, iconos o fuentes (ej. CERO Google Fonts, FontAwesome, Bootstrap, o Tailwind por CDN).
- Todo el CSS debe estar incrustado. Usa EXCLUSIVAMENTE tipografías seguras y estándar del sistema operativo (ej. font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif).
- Si necesitas iconos visuales, dibújalos obligatoriamente usando código SVG incrustado directamente dentro del HTML.

REQUISITO TÉCNICO CRÍTICO 2 (DISEÑO 100% RESPONSIVO Y PREVENCIÓN DE BUGS):
- Es OBLIGATORIO usar <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">.
- PROHIBIDO usar anchos fijos en píxeles (ej. width: 800px). Los contenedores del juego DEBEN tener un 'max-width' (ej. 800px o 600px) y 'margin: 0 auto' para centrarse en monitores de PC sin deformarse, y usar 'width: 100%' para dispositivos móviles.
- Tipografía elástica: Usa funciones matemáticas CSS como 'clamp(12px, 3vw, 18px)' para los textos de los juegos, de modo que escalen perfectamente.
- CRÍTICO: Todos los tableros de juego, cuadrículas o lienzos táctiles DEBEN incluir en su CSS 'touch-action: none' y 'user-select: none' para evitar el scroll o zoom accidental al arrastrar el dedo en celulares.

REGLA SUPREMA DE GENERACIÓN Y DESARROLLO (ESTRICTA Y OBLIGATORIA):
1. EL JUEGO INTERACTIVO ES LA MÁXIMA PRIORIDAD: Debes programar TODO el código JavaScript completo y 100% funcional del juego dentro de la etiqueta <script>. ESTÁ TERMINANTEMENTE PROHIBIDO omitir código, usar '// código aquí', '// implementar lógica más tarde', 'TODO', o dejar funciones a medias. El juego DEBE ser 100% interactivo y jugable desde el primer segundo (con eventos táctiles y de ratón, cuadrícula dinámica o cartas/elementos interactivos, validación de aciertos y errores, cronómetro, puntuación y modal o mensaje de felicitación al completar).
2. FORMATO DE ENTREGA: Entrega ÚNICAMENTE el archivo HTML completo y autocontenido dentro de un solo bloque de código (\`\`\`html ... \`\`\`), sin texto conversacional previo ni explicaciones posteriores.`;

const ACTIVITIES = [
  {
    id: "sopa-de-letras",
    number: 1,
    title: "Sopa de Letras",
    category: "palabras",
    badge: "Léxico y Reconocimiento",
    icon: "grid",
    description: "Cuadrícula táctil 15x15 con trazo continuo, palabras en direcciones válidas y badges tachables.",
    gradeRecommended: "Primaria y Secundaria",
    suggestedInstructions: "Encuentra las 10 palabras sobre el tema buscando en horizontal, vertical y diagonal.",
    buildPrompt: ({ topic, grade, keywords, instruction }) => `TEMA: [${topic}]
NIVEL EDUCATIVO: [${grade}]
INSTRUCCIÓN: [${instruction || "Encuentra las 10 palabras sobre el tema"}]

PALABRAS CLAVE (Exactamente 10):
${keywords}

Actúa como un desarrollador frontend senior y genera un archivo único e interactivo en formato .html (HTML5, CSS3, JS).

FASE 1 y 2: REQUISITOS TÉCNICOS Y FUNCIONALES:
Construcción y Lógica Dinámica (CERO BUGS):
- Toma las 10 palabras y normalízalas (mayúsculas, sin tildes).
- CRÍTICO: Usa un grid amplio (mínimo 15x15). El algoritmo de posicionamiento DEBE usar un ciclo exhaustivo para garantizar matemáticamente que LAS 10 PALABRAS SE COLOQUEN EXITOSAMENTE. Si el algoritmo falla en acomodar una palabra, debe reintentar. NINGUNA palabra puede quedar fuera.
- Rellena espacios con letras aleatorias.
Diseño Mobile-First y Responsivo:
- Usa CSS Grid con 'aspect-ratio: 1' en las celdas para que siempre sean cuadradas sin importar la pantalla.
- Texto fluido usando 'clamp()'. 
Interacción Táctil y Arrastre:
- Selección continua fluida mediante pointerdown, pointermove (usando document.elementFromPoint) y pointerup.
- Validar trazo en línea recta. 
Interfaz y Marcadores:
- Encabezado con: Título, Instrucción, Cronómetro y Contador. Sistema de Calificación (1 a 5).${COMMON_PHASE_3}`
  },
  {
    id: "crucigrama",
    number: 2,
    title: "Crucigrama",
    category: "palabras",
    badge: "Definiciones y Cruces",
    icon: "crossword",
    description: "Crucigrama tradicional auto-recortado con numeración en esquina, pistas horizontales y verticales.",
    gradeRecommended: "Secundaria y Media",
    suggestedInstructions: "Lee las pistas y completa el crucigrama tocando las casillas para escribir.",
    buildPrompt: ({ topic, grade, keywords, instruction }) => `TEMA: [${topic}]
NIVEL EDUCATIVO: [${grade}]
INSTRUCCIÓN: [${instruction || "Lee las pistas y completa el crucigrama tocando las casillas para escribir."}]
${keywords ? `PALABRAS CLAVE SUGERIDAS: [${keywords}]` : ""}

Actúa como un desarrollador frontend senior.

FASE 1: GENERACIÓN DE CONTENIDO EDUCATIVO
Define exactamente 10 palabras relevantes y redacta 10 pistas educativas claras.

FASE 2: DESARROLLO DEL INTERACTIVO (ALGORITMO Y DISEÑO ESTRICTO DE CRUCIGRAMA)
- LÓGICA CRÍTICA DE GENERACIÓN: Es un crucigrama clásico. ESTÁ ESTRICTAMENTE PROHIBIDO colocar palabras en diagonal. Las palabras SOLO pueden ir en horizontal (izquierda a derecha) o vertical (arriba a abajo), y DEBEN cruzarse matemáticamente compartiendo letras comunes.
- AUTO-RECORTE (Bounding Box): Después de cruzar las palabras en una matriz grande, el algoritmo JS DEBE recortar y eliminar TODAS las filas y columnas vacías de los extremos. La matriz final debe ser estrictamente del tamaño del crucigrama para que los cuadros se rendericen grandes.
- ESTÉTICA DE LA CUADRÍCULA: Usa CSS Grid. IMPORTANTE: Las celdas de la matriz que NO contienen letras deben ser 100% INVISIBLES (background: transparent; border: none; box-shadow: none). SOLO las celdas válidas (que forman parte de una palabra) deben tener fondo blanco, borde oscuro, 'aspect-ratio: 1' y la numeración en la esquina superior izquierda.
- Diseño Mobile-First: Gestionar entradas para evitar el zoom automático en celulares (font-size: 16px).
- Interacción: Tocar una casilla resalta la palabra activa. Auto-avance de foco al escribir. Aceptar solo mayúsculas.
- Sección inferior: Pistas separadas en Horizontales y Verticales. Tachar pista al acertar toda la palabra. Modal de victoria.${COMMON_PHASE_3}`
  },
  {
    id: "emparejar",
    number: 3,
    title: "Emparejar Columnas",
    category: "clasificacion",
    badge: "Asociación Directa",
    icon: "columns",
    description: "Dos columnas independientes barajadas (conceptos vs definiciones) con selección táctil fluida.",
    gradeRecommended: "Primaria y Secundaria",
    suggestedInstructions: "Toca un concepto en la columna izquierda y luego su definición correspondiente en la derecha.",
    buildPrompt: ({ topic, grade, keywords, instruction }) => `TEMA: [${topic}]
NIVEL EDUCATIVO: [${grade}]
INSTRUCCIÓN: [${instruction || "Toca un concepto en la columna izquierda y luego su definición correspondiente en la derecha para emparejarlos."}]
${keywords ? `CONCEPTOS SUGERIDOS: [${keywords}]` : ""}

Actúa como un desarrollador frontend senior.

FASE 1: GENERACIÓN DE CONTENIDO EDUCATIVO
Define exactamente 8 a 10 conceptos clave y redacta sus definiciones precisas y pedagógicas.

FASE 2: DESARROLLO DEL INTERACTIVO (JUEGO DE EMPAREJAR COLUMNAS)
- Renderiza Columna A (Conceptos) y Columna B (Definiciones). Mezcla el orden de forma independiente.
- Diseño UI Perfecto: En móviles, usar grid de 2 columnas donde los textos encajen sin desbordarse.
- Mecánica de Selección: Tocar tarjeta A, luego B.
- Validación: Correcto (verde, deshabilitan). Incorrecto (rojo, shake, deseleccionan).
- Encabezado: Cronómetro y Contador. Calificación (1 a 5).${COMMON_PHASE_3}`
  },
  {
    id: "concentrese",
    number: 4,
    title: "Concéntrese (Memoria)",
    category: "clasificacion",
    badge: "Memoria y Retención",
    icon: "cards",
    description: "Tablero de 20 cartas (grid 4x5) con animación 3D de volteo y conceptos emparejables.",
    gradeRecommended: "Todos los niveles",
    suggestedInstructions: "Toca las cartas para voltearlas y encuentra los pares correspondientes.",
    buildPrompt: ({ topic, grade, keywords, instruction }) => `TEMA: [${topic}]
NIVEL EDUCATIVO: [${grade}]
INSTRUCCIÓN: [${instruction || "Toca las cartas para voltearlas y encuentra los pares de conceptos idénticos."}]
${keywords ? `CONCEPTOS: [${keywords}]` : ""}

Actúa como un desarrollador frontend senior y diseñador instruccional.

FASE 1: GENERACIÓN DE CONTENIDO EDUCATIVO
Define exactamente 10 conceptos clave del tema. Para cada concepto se crea una pareja de cartas con el concepto (mazo total de 20 cartas: 10 parejas).

FASE 2: DESARROLLO DEL INTERACTIVO
- Crea un arreglo con las 10 parejas (20 cartas) y mézclalas aleatoriamente.
- Animación fluida de volteo (flip 3D).
- Validación de Parejas: Si coinciden, acierto inmediato (verde, se bloquean). Si no, error (se voltean boca abajo tras 1s).
- Panel Superior: Cronómetro, intentos y calificación (1 a 5).${COMMON_PHASE_3}`
  },
  {
    id: "laberinto-decisiones",
    number: 5,
    title: "Laberinto de Decisiones",
    category: "aventura",
    badge: "Pensamiento Crítico",
    icon: "branch",
    description: "Historia interactiva ramificada con 8 o más escenas, decisiones con peso y múltiples finales pedagógicos.",
    gradeRecommended: "Secundaria y Media",
    suggestedInstructions: "Lee atentamente cada situación y elige la mejor decisión para avanzar.",
    buildPrompt: ({ topic, grade, keywords, instruction }) => `TEMA O ESCENARIO: [${topic}]
NIVEL EDUCATIVO: [${grade}]
INSTRUCCIÓN: [${instruction || "Lee atentamente cada situación y elige la mejor decisión para avanzar."}]

Actúa como un desarrollador frontend senior.

FASE 1: GENERACIÓN DE CONTENIDO EDUCATIVO
Crea una historia interactiva con al menos 8 nodos (1 inicio, intermedios de 2-3 opciones, y al menos 3 finales).

FASE 2: DESARROLLO DEL INTERACTIVO
- Estructura JSON (id, texto, target_id, puntos) y renderizado dinámico.
- Tarjeta central clara, botones de decisión amplios y táctiles.
- Pantallas Finales: Exitoso o Aprendizaje/Fracaso con nota de 1.0 a 5.0 y botón reiniciar.${COMMON_PHASE_3}`
  },
  {
    id: "tap-and-sort",
    number: 6,
    title: "Clasificador Tap & Sort",
    category: "clasificacion",
    badge: "Taxonomía y Grupos",
    icon: "boxes",
    description: "Mecánica táctil limpia (sin arrastrar): toca el concepto central y luego la categoría correspondiente.",
    gradeRecommended: "Primaria y Secundaria",
    suggestedInstructions: "Toca un elemento de la lista central y luego toca el contenedor correcto.",
    buildPrompt: ({ topic, grade, keywords, instruction }) => `TEMA PRINCIPAL: [${topic}]
NIVEL EDUCATIVO: [${grade}]
INSTRUCCIÓN: [${instruction || "Toca un elemento de la lista central y luego toca el contenedor correcto."}]
${keywords ? `ELEMENTOS O CATEGORÍAS: [${keywords}]` : ""}

Actúa como desarrollador frontend senior.

FASE 1: GENERACIÓN DE CONTENIDO EDUCATIVO
Define 12 a 15 conceptos distribuidos equitativamente entre categorías.

FASE 2: DESARROLLO DEL INTERACTIVO
- CERO Drag & Drop: Toca elemento -> Toca contenedor de Categoría.
- Validación Inmediata: Correcto (desaparece, suma punto). Incorrecto (shake, rojo).
- Sistema de Calificación (1 a 5) basado en errores.${COMMON_PHASE_3}`
  },
  {
    id: "escape-room",
    number: 7,
    title: "Escape Room Digital",
    category: "aventura",
    badge: "Gamificación y Reto",
    icon: "lock",
    description: "4 salas temáticas estilo Cyberpunk/Laboratorio con acertijos numéricos y teclado Keypad en pantalla.",
    gradeRecommended: "Secundaria y Media",
    suggestedInstructions: "Resuelve los acertijos para obtener el código numérico y escapar.",
    buildPrompt: ({ topic, grade, keywords, instruction }) => `TEMA: [${topic}]
NIVEL EDUCATIVO: [${grade}]
INSTRUCCIÓN: [${instruction || "Resuelve los acertijos para obtener el código numérico y escapar."}]

Actúa como Desarrollador Frontend Senior.

FASE 1: CONTENIDO EDUCATIVO
Genera 4 salas secuenciales. Cada sala con un acertijo retador. La respuesta DEBE ser un código de 3-4 dígitos.

FASE 2: REQUISITOS TÉCNICOS
- Estructura: Área de Acertijo, Display (_ _ _ _) y Teclado Keypad (0-9). PROHIBIDO usar inputs nativos.
- Validación: Éxito (Siguiente sala). Fallo (Shake, limpia display). Calificación 1.0 a 5.0.${COMMON_PHASE_3}`
  },
  {
    id: "completar-parrafo",
    number: 8,
    title: "Completar el Párrafo",
    category: "palabras",
    badge: "Comprensión Textual",
    icon: "text",
    description: "Párrafo con huecos en línea y banco de chips con distractores para afianzar conceptos clave.",
    gradeRecommended: "Primaria y Secundaria",
    suggestedInstructions: "Toca una palabra del banco inferior y luego toca el espacio vacío en el texto.",
    buildPrompt: ({ topic, grade, keywords, instruction }) => `TEMA DEL TEXTO: [${topic}]
NIVEL EDUCATIVO: [${grade}]
INSTRUCCIÓN: [${instruction || "Toca una palabra del banco inferior y luego toca el espacio vacío en el texto."}]
${keywords ? `PALABRAS CLAVE: [${keywords}]` : ""}

Actúa como desarrollador frontend senior.

FASE 1: GENERACIÓN DE CONTENIDO EDUCATIVO
Redacta un párrafo educativo. Extrae 5 a 8 palabras clave. Crea banco con las claves + 3 distractoras.

FASE 2: DESARROLLO DEL INTERACTIVO
- Mecánica Táctil: Toca palabra (Activa) -> Toca hueco (Se inserta). Toca hueco lleno -> Regresa al banco.
- Validación automática y sistema de calificación de 1.0 a 5.0.${COMMON_PHASE_3}`
  },
  {
    id: "anagrama",
    number: 9,
    title: "Anagrama (Ordenar Letras)",
    category: "palabras",
    badge: "Ortografía y Deducción",
    icon: "shuffle",
    description: "Fichas tipo Scrabble desordenadas para adivinar 10 palabras nivel a nivel leyendo pistas didácticas.",
    gradeRecommended: "Primaria y Secundaria",
    suggestedInstructions: "Lee la pista y toca las letras en el orden correcto.",
    buildPrompt: ({ topic, grade, keywords, instruction }) => `TEMA: [${topic}]
NIVEL EDUCATIVO: [${grade}]
INSTRUCCIÓN: [${instruction || "Lee la pista y toca las letras en el orden correcto."}]
${keywords ? `PALABRAS: [${keywords}]` : ""}

Actúa como un desarrollador frontend senior.

FASE 1: GENERACIÓN DE CONTENIDO EDUCATIVO
Define EXACTAMENTE 10 palabras clave (sin espacios) y redacta 10 pistas cortas.

FASE 2: DESARROLLO DEL INTERACTIVO
- Mecánica Tap: Tocar letra abajo -> salta a casilla vacía arriba. Tocar arriba -> regresa abajo.
- Validación automática al completar la palabra. Nota 1.0 a 5.0.${COMMON_PHASE_3}`
  },
  {
    id: "ordenar-secuencia",
    number: 10,
    title: "Ordenar la Secuencia",
    category: "clasificacion",
    badge: "Procesos y Cronología",
    icon: "list-ordered",
    description: "Organización secuencial de procesos y ciclos mediante botones interactivos ⬆️ y ⬇️.",
    gradeRecommended: "Todos los niveles",
    suggestedInstructions: "Usa las flechas para organizar los pasos en orden cronológico o lógico.",
    buildPrompt: ({ topic, grade, keywords, instruction }) => `PROCESO O SECUENCIA: [${topic}]
NIVEL EDUCATIVO: [${grade}]
INSTRUCCIÓN: [${instruction || "Usa las flechas para organizar los pasos en orden cronológico."}]

Actúa como desarrollador frontend senior.

FASE 1: GENERACIÓN DE CONTENIDO EDUCATIVO
Define el proceso en EXACTAMENTE 6 a 8 pasos cronológicos desordenados.

FASE 2: DESARROLLO DEL INTERACTIVO
- Lista vertical con botones amplios de Subir/Bajar.
- Validación automática en tiempo real tras cada movimiento.${COMMON_PHASE_3}`
  },
  {
    id: "etiquetar-diagrama",
    number: 11,
    title: "Etiquetar Diagrama (Hotspots)",
    category: "diagramas",
    badge: "Identificación Espacial",
    icon: "map-pin",
    description: "Diagrama visual esquemático en SVG inline con puntos calientes parpadeantes y menú selector.",
    gradeRecommended: "Secundaria y Media",
    suggestedInstructions: "Toca los puntos parpadeantes en el diagrama y selecciona la etiqueta correcta.",
    buildPrompt: ({ topic, grade, keywords, instruction }) => `TEMA DEL DIAGRAMA: [${topic}]
NIVEL EDUCATIVO: [${grade}]
INSTRUCCIÓN: [${instruction || "Toca los puntos parpadeantes en el diagrama y selecciona la etiqueta correcta."}]

Actúa como desarrollador frontend senior.

FASE 1: GENERACIÓN DE CONTENIDO EDUCATIVO
Define 6 a 8 partes. Crea banco de etiquetas (+4 distractoras).

FASE 2: DESARROLLO DEL INTERACTIVO
- SVG inline en HTML esquemático. Hotspots interactivos sobre el SVG.
- Toca hotspot -> Toca etiqueta inferior para asignar.${COMMON_PHASE_3}`
  },
  {
    id: "tarjetas-swipe",
    number: 12,
    title: "Tarjetas Swipe (Verdadero / Falso)",
    category: "arcade",
    badge: "Estilo Tinder / Mitos",
    icon: "swipe",
    description: "Mazo de afirmaciones con arrastre gestual o botones para clasificar rápidamente en Verdadero o Falso.",
    gradeRecommended: "Primaria y Secundaria",
    suggestedInstructions: "Desliza a la derecha si es verdadero, o a la izquierda si es falso.",
    buildPrompt: ({ topic, grade, keywords, instruction }) => `TEMA DE LAS AFIRMACIONES: [${topic}]
NIVEL EDUCATIVO: [${grade}]
INSTRUCCIÓN: [${instruction || "Desliza a la derecha si es verdadero, o a la izquierda si es falso."}]

Actúa como desarrollador frontend senior.

FASE 1: GENERACIÓN DE CONTENIDO EDUCATIVO
Define 8 a 12 afirmaciones con justificación.

FASE 2: DESARROLLO DEL INTERACTIVO
- Lógica de mazo con botones masivos inferiores (Cruz / Check). Toast de justificación al responder.${COMMON_PHASE_3}`
  },
  {
    id: "mision-rescate",
    number: 13,
    title: "Misión Rescate (Ahorcado)",
    category: "palabras",
    badge: "Vocabulario Dinámico",
    icon: "shield",
    description: "Variante amigable del ahorcado: un escudo de energía o batería se descarga con cada fallo.",
    gradeRecommended: "Primaria y Secundaria",
    suggestedInstructions: "Lee la pista y usa el teclado virtual para adivinar la palabra antes de que se agote la energía.",
    buildPrompt: ({ topic, grade, keywords, instruction }) => `TEMA DEL VOCABULARIO: [${topic}]
NIVEL EDUCATIVO: [${grade}]
INSTRUCCIÓN: [${instruction || "Lee la pista y usa el teclado virtual para adivinar la palabra."}]
${keywords ? `PALABRAS CLAVE: [${keywords}]` : ""}

Actúa como desarrollador frontend senior.

FASE 1: GENERACIÓN DE CONTENIDO EDUCATIVO
Define 6 a 8 conceptos cortos con pista pedagógica.

FASE 2: DESARROLLO DEL INTERACTIVO
- Visual temático (batería o escudo perdiendo energía). Teclado QWERTY virtual adaptado a móviles.${COMMON_PHASE_3}`
  },
  {
    id: "lluvia-conceptos",
    number: 14,
    title: "Lluvia de Conceptos (Arcade)",
    category: "arcade",
    badge: "Reflejos y Discriminación",
    icon: "cloud-rain",
    description: "Conceptos cayendo en cascada por la pantalla: toca los correctos y esquiva las trampas.",
    gradeRecommended: "Secundaria y Media",
    suggestedInstructions: "Toca y explota solo las palabras de la categoría indicada antes de que caigan.",
    buildPrompt: ({ topic, grade, keywords, instruction }) => `CATEGORÍA OBJETIVO: [${topic}]
NIVEL EDUCATIVO: [${grade}]
INSTRUCCIÓN: [${instruction || "Toca y explota solo las palabras de la categoría indicada antes de que caigan."}]

Actúa como desarrollador frontend senior.

FASE 1: GENERACIÓN DE CONTENIDO EDUCATIVO
Define 10-15 palabras correctas y 10-15 distractoras.

FASE 2: DESARROLLO DEL INTERACTIVO
- Bucle de animación y caída vertical. HUD con puntuación y vidas.${COMMON_PHASE_3}`
  },
  {
    id: "rompecabezas-frases",
    number: 15,
    title: "Rompecabezas de Frases",
    category: "palabras",
    badge: "Estructura Argumental",
    icon: "puzzle",
    description: "Bloques de palabras desordenados para reconstruir leyes científicas, citas o axiomas.",
    gradeRecommended: "Secundaria y Media",
    suggestedInstructions: "Toca los fragmentos en orden para reconstruir la definición correcta.",
    buildPrompt: ({ topic, grade, keywords, instruction }) => `TEMA O LEYES: [${topic}]
NIVEL EDUCATIVO: [${grade}]
INSTRUCCIÓN: [${instruction || "Toca los fragmentos en orden para reconstruir la definición correcta."}]

Actúa como desarrollador frontend senior.

FASE 1: GENERACIÓN DE CONTENIDO EDUCATIVO
Define 3 citas/leyes largas divididas en 5-7 fragmentos.

FASE 2: DESARROLLO DEL INTERACTIVO
- Panel de casillas vacías y banco de fragmentos con interacción táctil fluida.${COMMON_PHASE_3}`
  },
  {
    id: "trivia-reloj",
    number: 16,
    title: "Trivia Contra Reloj (Racha)",
    category: "arcade",
    badge: "Velocidad y Rachas",
    icon: "zap",
    description: "Preguntas con temporizador de 15 segundos y medidor de racha con fuego multiplicador (x1, x2, x3).",
    gradeRecommended: "Todos los niveles",
    suggestedInstructions: "Elige la opción correcta antes de que se acabe el tiempo. ¡Activa el multiplicador!",
    buildPrompt: ({ topic, grade, keywords, instruction }) => `TEMA DEL CUESTIONARIO: [${topic}]
NIVEL EDUCATIVO: [${grade}]
INSTRUCCIÓN: [${instruction || "Elige la opción correcta antes de que se acabe el tiempo. ¡Activa el multiplicador!"}]

Actúa como desarrollador frontend senior.

FASE 1: GENERACIÓN DE CONTENIDO EDUCATIVO
Define 8 a 10 preguntas con justificación breve.

FASE 2: DESARROLLO DEL INTERACTIVO
- Temporizador regresivo estricto (15s). Sistema de rachas (x1, x2, x3).${COMMON_PHASE_3}`
  },
  {
    id: "ruleta-saber",
    number: 17,
    title: "Ruleta del Saber",
    category: "arcade",
    badge: "Categorías y Giro",
    icon: "disc",
    description: "Ruleta giratoria con conic-gradient, cálculo de ángulo y preguntas por categorías temáticas.",
    gradeRecommended: "Secundaria y Media",
    suggestedInstructions: "Gira la ruleta y responde para llenar los medidores de cada categoría.",
    buildPrompt: ({ topic, grade, keywords, instruction }) => `TEMA PRINCIPAL: [${topic}]
NIVEL EDUCATIVO: [${grade}]
INSTRUCCIÓN: [${instruction || "Gira la ruleta y responde para llenar los medidores de cada categoría."}]

Actúa como desarrollador frontend senior.

FASE 1: GENERACIÓN DE CONTENIDO EDUCATIVO
Define 3-4 categorías con 4-5 preguntas cada una.

FASE 2: DESARROLLO DEL INTERACTIVO
- Animación de giro con conic-gradient y modal de pregunta estilo bottom sheet.${COMMON_PHASE_3}`
  },
  {
    id: "criptograma",
    number: 18,
    title: "Criptograma Científico",
    category: "aventura",
    badge: "Cifrado y Misterio",
    icon: "key",
    description: "Frase enigmática con símbolos que se decodifica respondiendo preguntas de conocimiento pedagógico.",
    gradeRecommended: "Secundaria y Media",
    suggestedInstructions: "Resuelve las preguntas para decodificar los símbolos y revelar el mensaje secreto.",
    buildPrompt: ({ topic, grade, keywords, instruction }) => `TEMA DEL CRIPTOGRAMA: [${topic}]
NIVEL EDUCATIVO: [${grade}]
INSTRUCCIÓN: [${instruction || "Resuelve las preguntas para decodificar los símbolos y revelar el mensaje secreto."}]

Actúa como desarrollador frontend senior.

FASE 1: GENERACIÓN DE CONTENIDO EDUCATIVO
1 frase secreta corta y 3-4 preguntas de desbloqueo.

FASE 2: DESARROLLO DEL INTERACTIVO
- Asignación de runas a letras y animación flip 3D al revelar aciertos.${COMMON_PHASE_3}`
  },
  {
    id: "jeopardy",
    number: 19,
    title: "Tablero de Pistas (Jeopardy)",
    category: "arcade",
    badge: "Puntajes Progresivos",
    icon: "table",
    description: "Grid estilo concurso con preguntas de 100, 200 y 300 puntos organizadas por categorías.",
    gradeRecommended: "Secundaria y Media",
    suggestedInstructions: "Toca una casilla, lee la pista y selecciona la respuesta correcta.",
    buildPrompt: ({ topic, grade, keywords, instruction }) => `TEMA DEL TABLERO: [${topic}]
NIVEL EDUCATIVO: [${grade}]
INSTRUCCIÓN: [${instruction || "Toca una casilla, lee la pista y selecciona la respuesta correcta."}]

Actúa como desarrollador frontend senior.

FASE 1: GENERACIÓN DE CONTENIDO EDUCATIVO
3-4 categorías con 3 pistas progresivas cada una (100, 200, 300 pts).

FASE 2: DESARROLLO DEL INTERACTIVO
- Grid fluido de casillas que se desactivan al ser respondidas.${COMMON_PHASE_3}`
  },
  {
    id: "piano-interactivo",
    number: 20,
    title: "Simulador de Piano Interactivo",
    category: "simuladores",
    badge: "Música y Acústica",
    icon: "music",
    description: "Piano cromático virtual de 2 octavas (Do4 a Do6) con sintetizador Web Audio API ADSR y lección musical.",
    gradeRecommended: "Todos los niveles",
    suggestedInstructions: "Toca las teclas del piano para explorar notas, frecuencias y completar la lección musical.",
    buildPrompt: ({ topic, grade, keywords, instruction }) => `[CONFIGURACIÓN INICIAL DEL OVA - LECCIÓN DE MÚSICA CON PIANO]

TEMA DEL OVA: [${topic || "Fundamentos de la Acústica y Escalas Musicales"}]
GRADO / EDAD: [${grade || "6° a 11° Grado"}]
SIMULADOR: Piano Acústico Virtual Interactivo de 2 Octavas (Do4 a Do6) con Pentagrama y Síntesis ADSR

Actúa como un Desarrollador Web Senior y Diseñador Instruccional experto en EpC (Enseñanza para la Comprensión).
Tu misión es programar una "Estación de Aprendizaje Musical con Simulador de Piano" en un ÚNICO archivo HTML de alto nivel, 100% funcional y listo para ejecutarse sin conexión a internet.

REQUISITOS TÉCNICOS CRÍTICOS:
- 100% OFFLINE: Cero CDNs. Tipografía system-ui e iconos SVG inline.
- Piano de 2 octavas (24 teclas cromáticas, Do4 a Do6) con diseño flexbox responsivo y posicionamiento absoluto para teclas negras.
- Audio Web Audio API con síntesis avanzada (sawtooth + triangle, filtro BiquadFilterNode y envolvente ADSR) para un sonido de piano realista sin archivos externos.
- 4 Fases: Exploración, Teoría (artículo 500 palabras), Taller de 10 actividades y Bitácora con reporte imprimible (@media print).${COMMON_PHASE_3}`
  },
  {
    id: "lectoescritura-adaptada",
    number: 21,
    title: "Lectoescritura Adaptada (Neuroeducación)",
    category: "lectoescritura",
    badge: "Inclusión y Accesibilidad",
    icon: "accessibility",
    description: "OVA inclusivo con lectura silábica coloreada, regleta de lectura para evitar saltos y sintetizador de voz nativo.",
    gradeRecommended: "Dificultades lectoras / Primaria",
    suggestedInstructions: "Activa la regleta o la lectura por sílabas coloreadas para facilitar la comprensión lectora.",
    buildPrompt: ({ topic, grade, keywords, instruction }) => `[CONFIGURACIÓN INICIAL DEL RECURSO - DIFICULTADES DE LECTOESCRITURA Y COMPRENSIÓN]

TEMA CURRICULAR: [${topic || "Las plantas y la fotosíntesis"}]
POBLACIÓN OBJETIVO: [${grade || "Estudiantes con dificultades en decodificación, dislexia o bajo nivel de vocabulario"}]

Actúa como un Diseñador Instruccional Senior especialista en Neuroeducación y Pautas de Lectura Fácil combinado con Desarrollador Frontend Senior.
Tu misión es generar un Objeto Virtual de Aprendizaje (OVA) accesible en un ÚNICO archivo .html (HTML5, CSS3, JS).

HERRAMIENTAS INCLUIDAS EN TIEMPO REAL:
1. Selector de Lectura Silábica (alterna entre texto normal y separación por sílabas coloreadas).
2. Foco de Renglón / Regleta de lectura para evitar saltos involuntarios.
3. Lectura asistida por voz nativa (window.speechSynthesis en español).
4. Estructura en 5 Fases: Vocabulario clave, Microtarjetas de lectura con preguntas de autocomprobación, Gimnasio interactivo de habilidades, Taller escolar para el cuaderno y Reporte imprimible adaptado.${COMMON_PHASE_3}`
  },
  {
    id: "lectoescritura-desde-cero",
    number: 22,
    title: "Lectoescritura Inicial (Desde Cero)",
    category: "lectoescritura",
    badge: "Alfabetización Inicial",
    icon: "book-open",
    description: "Laboratorio para aprender a leer y escribir desde cero con sonidos de palmas, tren de sílabas y pizarra mágica con renglón ferrocarril.",
    gradeRecommended: "Transición, 1°, 2° y Alfabetización",
    suggestedInstructions: "Toca las fichas para escuchar los sonidos, armar palabras y trazar en la pizarra mágica.",
    buildPrompt: ({ topic, grade, keywords, instruction }) => `[CONFIGURACIÓN INICIAL DEL OVA - LABORATORIO DE LECTOESCRITURA INICIAL DESDE CERO]

TEMA GENERADOR (CUALQUIER ÁREA): [${topic || "Los animales de la granja y la naturaleza"}]
NIVEL EDUCATIVO: [${grade || "Grado Transición, 1°, 2° o personas que aprenden a leer y escribir desde cero"}]
PROPÓSITO SUPREMO (100% ALFABETIZACIÓN INICIAL): Usar el TEMA GENERADOR para enseñar a leer y escribir DESDE CERO (sonidos, vocales, sílabas con palmas, palabras cortas con dibujos y frases de máximo 4 a 6 palabras). PROHIBIDO poner párrafos largos. Absolutamente todo debe tener botón de VOZ (🔊) y APOYO VISUAL (emojis gigantes) para autonomía total.

Actúa como Especialista en Alfabetización Inicial y Desarrollador Frontend Senior. Genera un OVA en 1 archivo HTML 100% offline.

ARQUITECTURA OBLIGATORIA:
1. Barra superior persistente: Botón de LETRA (MAYÚSCULA / minúscula), SÍLABAS EN COLOR y VOZ DE AYUDA (speechSynthesis).
2. 5 Estaciones interactivas:
   - Estación 1: Sonidos, vocales y conteo de palmas (👏) de 6 palabras clave. Juego de adivinar vocal inicial.
   - Estación 2: El Tren de las Sílabas (tocar fichas que hablan en voz alta para armar palabras).
   - Estación 3: Cuento pictográfico en 3 escenas con frases cortas y preguntas con dibujo.
   - Estación 4: Comprensión lectora inicial (leer palabra/frase y tocar dibujo correcto, verdaderos y falsos).
   - Estación 5: Escritura inicial con fichas para armar oraciones y Pizarra Mágica (<canvas>) con renglón ferrocarril azul para trazo guiado de letras punteadas + botón de impresión.
3. Taller para el cuaderno (5 retos con dibujos y letra grande para colorear y trazar).${COMMON_PHASE_3}`
  }
];

const CATEGORIES = [
  { id: "all", name: "Todas las Actividades", count: 22 },
  { id: "palabras", name: "Juegos de Palabras", count: 6 },
  { id: "clasificacion", name: "Memoria y Clasificación", count: 4 },
  { id: "aventura", name: "Narrativa y Desafíos", count: 3 },
  { id: "arcade", name: "Arcade y Velocidad", count: 5 },
  { id: "diagramas", name: "Diagramas e Imágenes", count: 1 },
  { id: "simuladores", name: "Música y Simuladores", count: 1 },
  { id: "lectoescritura", name: "Lectoescritura e Inclusión", count: 2 }
];

// Iconos SVG 100% autocontenidos con dimensiones fijas de 20x20px para máxima estabilidad
const svgAttr = 'width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;flex-shrink:0;"';

const ICONS = {
  grid: `<svg ${svgAttr}><path d="M4 6h16M4 12h16M4 18h16M6 4v16M12 4v16M18 4v16"/></svg>`,
  crossword: `<svg ${svgAttr}><path d="M9 3v18m6-18v18M3 9h18M3 15h18"/></svg>`,
  columns: `<svg ${svgAttr}><path d="M8 7h8m-8 5h8m-8 5h8M4 5a2 2 0 012-2h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5z"/></svg>`,
  cards: `<svg ${svgAttr}><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>`,
  branch: `<svg ${svgAttr}><path d="M8 9l4-4 4 4m0 6l-4 4-4-4"/></svg>`,
  boxes: `<svg ${svgAttr}><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>`,
  lock: `<svg ${svgAttr}><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>`,
  text: `<svg ${svgAttr}><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`,
  shuffle: `<svg ${svgAttr}><path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>`,
  "list-ordered": `<svg ${svgAttr}><path d="M4 6h16M4 12h16M4 18h7"/></svg>`,
  "map-pin": `<svg ${svgAttr}><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><circle cx="12" cy="11" r="3"/></svg>`,
  swipe: `<svg ${svgAttr}><path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/></svg>`,
  shield: `<svg ${svgAttr}><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`,
  "cloud-rain": `<svg ${svgAttr}><path d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>`,
  puzzle: `<svg ${svgAttr}><path d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"/></svg>`,
  zap: `<svg ${svgAttr}><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`,
  disc: `<svg ${svgAttr}><circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 3"/></svg>`,
  key: `<svg ${svgAttr}><path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>`,
  table: `<svg ${svgAttr}><path d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`,
  music: `<svg ${svgAttr}><path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>`,
  accessibility: `<svg ${svgAttr}><circle cx="12" cy="4" r="2"/><path d="M4 9h16M12 9v11m0-11l-4 7m4-7l4 7"/></svg>`,
  "book-open": `<svg ${svgAttr}><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>`,
  sparkles: `<svg ${svgAttr}><path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>`,
  download: `<svg ${svgAttr}><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>`,
  play: `<svg ${svgAttr}><path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><circle cx="12" cy="12" r="9"/></svg>`,
  copy: `<svg ${svgAttr}><path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>`,
  devicePhone: `<svg ${svgAttr}><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>`,
  deviceDesktop: `<svg ${svgAttr}><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/></svg>`,
  refresh: `<svg ${svgAttr}><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>`,
  openTab: `<svg ${svgAttr}><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6m4-3h6v6m-11 5L21 3"/></svg>`,
  trash: `<svg ${svgAttr}><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>`
};

function getIcon(name) {
  return ICONS[name] || ICONS["grid"];
}

// Módulo de persistencia local y biblioteca de actividades creadas
const STORAGE_KEY_HISTORY = "Peidagogos_activities_history";

function getSavedActivities() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Error al leer actividades guardadas:", e);
    return [];
  }
}

function saveActivityToHistory({ id, activityTypeId, activityTitle, topic, grade, htmlContent }) {
  try {
    const list = getSavedActivities();
    const newEntry = {
      id: id || ("act_" + Date.now()),
      activityTypeId,
      activityTitle,
      topic,
      grade,
      htmlContent,
      createdAt: new Date().toISOString()
    };

    // Agrega al inicio y guarda hasta las últimas 50 actividades
    const updated = [newEntry, ...list.filter(item => item.id !== newEntry.id)].slice(0, 50);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
    return newEntry;
  } catch (e) {
    console.error("Error al guardar actividad:", e);
    return null;
  }
}

function deleteActivityFromHistory(activityId) {
  try {
    const list = getSavedActivities().filter(item => item.id !== activityId);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(list));
    return true;
  } catch (e) {
    console.error("Error al eliminar actividad:", e);
    return false;
  }
}

function downloadHtmlFile(fileName, htmlContent) {
  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName.endsWith(".html") ? fileName : `${fileName}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Cliente de conexiÃ³n con OpenRouter API para Peidagogos
const OPENROUTER_MODELS = [
  {
    id: "deepseek/deepseek-chat",
    name: "DeepSeek V3 (Recomendado)",
    badge: "Ultra EconÃ³mico y RÃ¡pido",
    cost: "~$0.001 USD / actividad",
    description: "Excelente generaciÃ³n de cÃ³digo frontend, JavaScript y lÃ³gica educativa sin truncamiento."
  },
  {
    id: "google/gemini-2.0-flash-001",
    name: "Google Gemini 2.0 Flash",
    badge: "MÃ¡xima Velocidad",
    cost: "~$0.0014 USD / actividad",
    description: "Ultra rÃ¡pido, contexto amplio y muy buena respuesta para estructuras HTML."
  },
  {
    id: "openai/gpt-4o-mini",
    name: "OpenAI GPT-4o Mini",
    badge: "Alta PrecisiÃ³n",
    cost: "~$0.002 USD / actividad",
    description: "Gran seguimiento de instrucciones pedagÃ³gicas complejas y diseÃ±o visual."
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct",
    name: "Meta Llama 3.3 70B",
    badge: "CÃ³digo Abierto",
    cost: "~$0.002 USD / actividad",
    description: "Gran capacidad didÃ¡ctica y estructuraciÃ³n de contenido teÃ³rico."
  }
];

const STORAGE_KEY_API_KEY = "Peidagogos_openrouter_api_key";
const STORAGE_KEY_MODEL = "Peidagogos_openrouter_model";

function getStoredApiKey() {
  return localStorage.getItem(STORAGE_KEY_API_KEY) || "";
}

function setStoredApiKey(key) {
  if (key) {
    localStorage.setItem(STORAGE_KEY_API_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_API_KEY);
  }
}

function getStoredModel() {
  return localStorage.getItem(STORAGE_KEY_MODEL) || "deepseek/deepseek-chat";
}

function setStoredModel(modelId) {
  localStorage.setItem(STORAGE_KEY_MODEL, modelId);
}

// Extrae y normaliza el HTML limpiando bloques de markdown tipo ```html ... ```
function extractCleanHtml(rawText) {
  if (!rawText) return "";
  let clean = rawText.trim();
  
  // Si viene envuelto en markdown ```html ... ```
  const codeBlockMatch = clean.match(/```(?:html)?\s*([\s\S]*?)```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    clean = codeBlockMatch[1].trim();
  }

  // Asegura que empiece en <!DOCTYPE html> si hay texto conversacional previo
  const doctypeIndex = clean.indexOf("<!DOCTYPE html>");
  if (doctypeIndex !== -1) {
    clean = clean.substring(doctypeIndex);
  } else {
    const htmlTagIndex = clean.indexOf("<html");
    if (htmlTagIndex !== -1) {
      clean = "<!DOCTYPE html>\n" + clean.substring(htmlTagIndex);
    }
  }

  // Corta cualquier texto conversacional posterior a </html>
  const closeHtmlIndex = clean.lastIndexOf("</html>");
  if (closeHtmlIndex !== -1) {
    clean = clean.substring(0, closeHtmlIndex + 7);
  }

  return clean;
}

// Genera la actividad completa conectando primero con el servidor seguro o con OpenRouter
async function generateActivityWithOpenRouter({
  prompt,
  model = "deepseek/deepseek-chat",
  apiKey,
  onChunk,
  onStatus
}) {
  // 1. Intentar primero a travÃ©s del backend seguro de Render (/api/generate)
  try {
    if (onStatus) onStatus("Conectando con el servidor Peidagogos...");
    const serverRes = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, model })
    });

    if (serverRes.ok) {
      const data = await serverRes.json();
      if (data.html) {
        if (onStatus) onStatus("Â¡Actividad lista!");
        return data.html;
      }
    }
  } catch (serverErr) {
    console.log("Servidor backend no disponible, intentando modo cliente directo...");
  }

  // 2. Modo Cliente Directo (si no hay servidor o para desarrollo local)
  const effectiveKey = apiKey || getStoredApiKey();
  if (!effectiveKey) {
    throw new Error("No hay conexiÃ³n con el servidor ni clave configurada. Por favor recarga la pÃ¡gina o ingresa tu clave en ConfiguraciÃ³n.");
  }

  if (onStatus) onStatus("Conectando con OpenRouter...");

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${effectiveKey}`,
      "HTTP-Referer": "https://Peidagogos.app",
      "X-Title": "Peidagogos - Creador de Actividades para Maestros",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: model,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: `Eres un desarrollador Frontend Senior y DiseÃ±ador Instruccional de clase mundial.
Tu trabajo es generar un archivo HTML Ãºnico, completo y 100% funcional que integre HTML5, CSS3 y JavaScript vanilla embebidos.
REGLAS SUPREMAS:
1. No escribas NINGÃšN texto conversacional de saludo ni despedida.
2. Devuelve EXCLUSIVAMENTE el cÃ³digo HTML dentro de un solo bloque \`\`\`html ... \`\`\` que comience con <!DOCTYPE html> y termine con </html>.
3. No uses CDNs externos ni librerÃ­as externas (cero Google Fonts, cero FontAwesome, cero frameworks externos). Todo debe funcionar 100% OFFLINE.
4. Programa todo el cÃ³digo JS completo, sin 'TODO' ni 'implementar mÃ¡s tarde'.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      stream: true
    })
  });

  if (!response.ok) {
    let errMessage = `Error ${response.status}: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson && errJson.error && errJson.error.message) {
        errMessage = errJson.error.message;
      }
    } catch (e) {
      // Ignorar fallo de parseo JSON de error
    }
    throw new Error(errMessage);
  }

  if (onStatus) onStatus("Generando cÃ³digo del juego y taller pedagÃ³gico...");

  // Procesamiento por Streaming (SSE)
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let accumulatedText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("data: ")) {
        const dataStr = trimmed.substring(6).trim();
        if (dataStr === "[DONE]") continue;

        try {
          const parsed = JSON.parse(dataStr);
          const deltaContent = parsed.choices?.[0]?.delta?.content;
          if (deltaContent) {
            accumulatedText += deltaContent;
            if (onChunk) onChunk(accumulatedText);
          }
        } catch (e) {
          // Ignorar chunks intermedios con formato no JSON
        }
      }
    }
  }

  const cleanHtml = extractCleanHtml(accumulatedText);
  if (!cleanHtml || !cleanHtml.includes("<html")) {
    throw new Error("La respuesta recibida no contiene una estructura HTML vÃ¡lida. Intenta nuevamente.");
  }

  return cleanHtml;
}

// FunciÃ³n asistida para que el maestro obtenga 10 palabras clave con 1 clic
async function suggestKeywordsWithIA({ topic, grade, apiKey, model = "deepseek/deepseek-chat" }) {
  // 1. Intentar primero a travÃ©s del backend seguro de Render
  try {
    const serverRes = await fetch("/api/suggest-keywords", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, grade, model })
    });

    if (serverRes.ok) {
      const data = await serverRes.json();
      if (data.keywords) return data.keywords;
    }
  } catch (e) {
    console.log("Servidor backend no disponible para sugerir palabras, intentando modo cliente...");
  }

  // 2. Modo Cliente Directo
  const effectiveKey = apiKey || getStoredApiKey();
  if (!effectiveKey) {
    throw new Error("Se requiere conexiÃ³n con el servidor o clave API de OpenRouter.");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${effectiveKey}`,
      "HTTP-Referer": "https://Peidagogos.app",
      "X-Title": "Peidagogos",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: model,
      temperature: 0.5,
      messages: [
        {
          role: "system",
          content: "Eres un asistente pedagÃ³gico. Tu tarea es listar exactamente 10 palabras clave o conceptos cortos sobre el tema solicitado, adaptadas al grado indicado. Devuelve Ãºnicamente las 10 palabras separadas por comas, sin numeraciÃ³n ni comentarios."
        },
        {
          role: "user",
          content: `Tema: ${topic}. Grado: ${grade}. Dame exactamente 10 palabras o conceptos clave.`
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error("No se pudieron sugerir las palabras clave.");
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";
  return text.trim();
}






// Estado de la aplicaciÃ³n
const state = {
  currentTab: "generator", // "generator", "catalog", "library", "settings"
  selectedCategory: "all",
  selectedActivityId: "sopa-de-letras",
  currentHtmlOutput: "",
  currentActivityMetadata: null,
  isGenerating: false,
  previewMode: "mobile", // "mobile" o "desktop"
  searchQuery: ""
};

// Elementos DOM
const dom = {};

function cacheDom() {
  dom.navTabs = document.querySelectorAll(".nav-tab");
  dom.tabPanels = document.querySelectorAll(".tab-panel");
  
  // Generador
  dom.topicInput = document.getElementById("topic-input");
  dom.gradeSelect = document.getElementById("grade-select");
  dom.keywordsInput = document.getElementById("keywords-input");
  dom.instructionInput = document.getElementById("instruction-input");
  dom.suggestKeywordsBtn = document.getElementById("suggest-keywords-btn");
  dom.generateBtn = document.getElementById("generate-btn");
  dom.activitySelectDropdown = document.getElementById("activity-select-dropdown");
  dom.activitiesGrid = document.getElementById("activities-selector-grid");
  dom.selectedActivitySummary = document.getElementById("selected-activity-summary");

  // Barra de progreso y generaciÃ³n
  dom.generatingStatus = document.getElementById("generating-status");
  dom.generatingText = document.getElementById("generating-text");
  dom.progressBar = document.getElementById("progress-bar");

  // Simulador / PrevisualizaciÃ³n
  dom.previewSection = document.getElementById("preview-section");
  dom.previewFrame = document.getElementById("preview-iframe");
  dom.previewWrapper = document.getElementById("preview-wrapper");
  dom.previewModeMobileBtn = document.getElementById("preview-mode-mobile");
  dom.previewModeDesktopBtn = document.getElementById("preview-mode-desktop");
  dom.downloadBtn = document.getElementById("download-btn");
  dom.copyHtmlBtn = document.getElementById("copy-html-btn");
  dom.openNewTabBtn = document.getElementById("open-new-tab-btn");
  dom.refreshPreviewBtn = document.getElementById("refresh-preview-btn");
  dom.previewTitle = document.getElementById("preview-title");
  dom.previewSubtitle = document.getElementById("preview-subtitle");

  // CatÃ¡logo completo
  dom.catalogGrid = document.getElementById("catalog-grid");
  dom.categoryPills = document.getElementById("category-pills");
  dom.catalogSearch = document.getElementById("catalog-search");

  // Biblioteca / Historial
  dom.libraryGrid = document.getElementById("library-grid");
  dom.libraryEmpty = document.getElementById("library-empty");

  // ConfiguraciÃ³n
  dom.apiKeyInput = document.getElementById("api-key-input");
  dom.modelSelect = document.getElementById("model-select");
  dom.saveSettingsBtn = document.getElementById("save-settings-btn");
  dom.apiStatusPill = document.getElementById("api-status-pill");
  dom.headerApiKeyModalBtn = document.getElementById("header-api-key-btn");

  // Modal de Prompts
  dom.promptModal = document.getElementById("prompt-modal");
  dom.promptModalTitle = document.getElementById("prompt-modal-title");
  dom.promptModalCode = document.getElementById("prompt-modal-code");
  dom.promptModalCopyBtn = document.getElementById("prompt-modal-copy-btn");
  dom.promptModalCloseBtn = document.getElementById("prompt-modal-close-btn");

  // Toast
  dom.toastContainer = document.getElementById("toast-container");
}

// InicializaciÃ³n de la app
document.addEventListener("DOMContentLoaded", () => {
  cacheDom();
  initApiStatus();
  renderActivitySelectors();
  renderCategoryPills();
  renderCatalog();
  renderModelOptions();
  renderSavedActivities();
  attachEvents();

  // Seleccionar la primera actividad por defecto
  selectActivity("sopa-de-letras");
});

function initApiStatus() {
  const key = getStoredApiKey();
  if (key) {
    dom.apiStatusPill.className = "api-pill connected";
    dom.apiStatusPill.innerHTML = `<span class="pulse-dot"></span> OpenRouter Conectado`;
  } else {
    dom.apiStatusPill.className = "api-pill disconnected";
    dom.apiStatusPill.innerHTML = `<span class="pulse-dot"></span> Conectar OpenRouter`;
  }
  dom.apiKeyInput.value = key;
}

function renderModelOptions() {
  const currentModel = getStoredModel();
  dom.modelSelect.innerHTML = OPENROUTER_MODELS.map(m => `
    <option value="${m.id}" ${m.id === currentModel ? "selected" : ""}>
      ${m.name} (${m.badge} - ${m.cost})
    </option>
  `).join("");
}

function attachEvents() {
  // NavegaciÃ³n por pestaÃ±as
  dom.navTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      switchTab(target);
    });
  });

  // Selector desplegable de actividades
  if (dom.activitySelectDropdown) {
    dom.activitySelectDropdown.addEventListener("change", e => {
      selectActivity(e.target.value);
    });
  }

  // Selector de actividades en el generador (si existe)
  if (dom.activitiesGrid) {
    dom.activitiesGrid.addEventListener("click", e => {
      const card = e.target.closest(".activity-card");
      if (card) {
        const id = card.dataset.id;
        selectActivity(id);
      }
    });
  }

  // Sugerir palabras clave
  dom.suggestKeywordsBtn.addEventListener("click", async () => {
    const topic = dom.topicInput.value.trim();
    const grade = dom.gradeSelect.value;
    if (!topic) {
      showToast("Ingresa primero un tema para poder sugerir palabras clave.", "warning");
      dom.topicInput.focus();
      return;
    }

    const key = getStoredApiKey();
    if (!key) {
      showToast("Por favor configura tu clave de OpenRouter en ConfiguraciÃ³n.", "warning");
      switchTab("settings");
      return;
    }

    try {
      dom.suggestKeywordsBtn.disabled = true;
      dom.suggestKeywordsBtn.innerHTML = `
        <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
        <span>Generando...</span>
      `;
      const keywords = await suggestKeywordsWithIA({ topic, grade, apiKey: key, model: getStoredModel() });
      dom.keywordsInput.value = keywords;
      showToast("Â¡10 Palabras clave sugeridas con Ã©xito!", "success");
    } catch (err) {
      showToast(err.message || "Error al sugerir palabras.", "error");
    } finally {
      dom.suggestKeywordsBtn.disabled = false;
      dom.suggestKeywordsBtn.innerHTML = `
        ${getIcon("sparkles")}
        <span>Sugerir con IA</span>
      `;
    }
  });

  // BotÃ³n principal Generar Actividad
  dom.generateBtn.addEventListener("click", handleGenerateActivity);

  // Controles del simulador
  dom.previewModeMobileBtn.addEventListener("click", () => setPreviewMode("mobile"));
  dom.previewModeDesktopBtn.addEventListener("click", () => setPreviewMode("desktop"));

  dom.downloadBtn.addEventListener("click", () => {
    if (!state.currentHtmlOutput) return;
    const topicName = (state.currentActivityMetadata?.topic || "actividad").replace(/[^a-zA-Z0-9_-]/g, "_");
    const actType = (state.currentActivityMetadata?.activityTypeId || "juego");
    const fileName = `Peidagogos_${actType}_${topicName}.html`;
    downloadHtmlFile(fileName, state.currentHtmlOutput);
    showToast(`Archivo "${fileName}" descargado con Ã©xito.`, "success");
  });

  dom.copyHtmlBtn.addEventListener("click", () => {
    if (!state.currentHtmlOutput) return;
    navigator.clipboard.writeText(state.currentHtmlOutput).then(() => {
      showToast("Â¡CÃ³digo HTML completo copiado al portapapeles!", "success");
    });
  });

  dom.openNewTabBtn.addEventListener("click", () => {
    if (!state.currentHtmlOutput) return;
    const newWindow = window.open();
    newWindow.document.open();
    newWindow.document.write(state.currentHtmlOutput);
    newWindow.document.close();
  });

  dom.refreshPreviewBtn.addEventListener("click", () => {
    if (state.currentHtmlOutput) {
      loadIntoPreview(state.currentHtmlOutput);
      showToast("Juego reiniciado.", "info");
    }
  });

  // Filtros del catÃ¡logo
  dom.categoryPills.addEventListener("click", e => {
    const pill = e.target.closest(".cat-pill");
    if (pill) {
      state.selectedCategory = pill.dataset.cat;
      document.querySelectorAll(".cat-pill").forEach(p => p.classList.remove("active", "bg-blue-600", "text-white"));
      pill.classList.add("active", "bg-blue-600", "text-white");
      renderCatalog();
    }
  });

  dom.catalogSearch.addEventListener("input", e => {
    state.searchQuery = e.target.value.toLowerCase().trim();
    renderCatalog();
  });

  // Guardar configuraciÃ³n
  dom.saveSettingsBtn.addEventListener("click", () => {
    const key = dom.apiKeyInput.value.trim();
    const model = dom.modelSelect.value;
    setStoredApiKey(key);
    setStoredModel(model);
    initApiStatus();
    showToast("ConfiguraciÃ³n de OpenRouter guardada correctamente.", "success");
  });

  // Pill del header abre configuraciÃ³n
  dom.apiStatusPill.addEventListener("click", () => switchTab("settings"));

  // Modal de prompt
  dom.promptModalCloseBtn.addEventListener("click", closePromptModal);
  dom.promptModal.addEventListener("click", e => {
    if (e.target === dom.promptModal) closePromptModal();
  });
}

function switchTab(tabName) {
  state.currentTab = tabName;
  dom.navTabs.forEach(t => {
    t.classList.toggle("active", t.dataset.tab === tabName);
  });

  dom.tabPanels.forEach(panel => {
    panel.classList.toggle("hidden", panel.id !== `tab-${tabName}`);
  });

  if (tabName === "library") {
    renderSavedActivities();
  }
}

function selectActivity(activityId) {
  state.selectedActivityId = activityId;
  const act = ACTIVITIES.find(a => a.id === activityId);
  if (!act) return;

  // Sincronizar el menÃº desplegable si cambiÃ³ desde afuera
  if (dom.activitySelectDropdown && dom.activitySelectDropdown.value !== activityId) {
    dom.activitySelectDropdown.value = activityId;
  }

  // Actualizar clases de tarjetas si existen
  document.querySelectorAll(".activity-card").forEach(c => {
    c.classList.toggle("selected", c.dataset.id === activityId);
  });

  // Actualizar resumen
  dom.selectedActivitySummary.innerHTML = `
    <div class="card-icon">
      ${getIcon(act.icon)}
    </div>
    <div style="flex:1;">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
        <span class="card-badge" style="background:#e0f2fe; padding:2px 8px; border-radius:4px;">Actividad #${act.number}</span>
        <span style="font-size:11px; font-weight:700; color:var(--slate-500);">${act.badge}</span>
      </div>
      <h4 style="font-size:16px; font-weight:800; color:var(--slate-900); margin-bottom:2px;">${act.title}</h4>
      <p style="font-size:12px; color:var(--slate-600); line-height:1.4;">${act.description}</p>
    </div>
  `;

  // Autocompletar instrucciÃ³n sugerida si estÃ¡ vacÃ­a
  if (!dom.instructionInput.value || dom.instructionInput.dataset.autoFilled === "true") {
    dom.instructionInput.value = act.suggestedInstructions || "";
    dom.instructionInput.dataset.autoFilled = "true";
  }
}

function renderActivitySelectors() {
  dom.activitiesGrid.innerHTML = ACTIVITIES.map(act => `
    <div data-id="${act.id}" class="activity-card">
      <div>
        <div class="card-top">
          <div class="card-icon">
            ${getIcon(act.icon)}
          </div>
          <span class="card-num">#${act.number}</span>
        </div>
        <h5 class="card-title">${act.title}</h5>
      </div>
      <div class="card-badge">${act.badge}</div>
    </div>
  `).join("");
}

function renderCategoryPills() {
  dom.categoryPills.innerHTML = CATEGORIES.map(cat => `
    <button data-cat="${cat.id}" class="cat-pill ${cat.id === "all" ? "active" : ""}">
      ${cat.name} (${cat.count})
    </button>
  `).join("");
}

function renderCatalog() {
  let list = ACTIVITIES;
  if (state.selectedCategory !== "all") {
    list = list.filter(a => a.category === state.selectedCategory);
  }
  if (state.searchQuery) {
    list = list.filter(a => 
      a.title.toLowerCase().includes(state.searchQuery) || 
      a.description.toLowerCase().includes(state.searchQuery) ||
      a.badge.toLowerCase().includes(state.searchQuery)
    );
  }

  dom.catalogGrid.innerHTML = list.map(act => `
    <div class="catalog-card">
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <div class="card-icon" style="background:#e0f2fe; color:var(--primary); width:44px; height:44px; border-radius:10px;">
            ${getIcon(act.icon)}
          </div>
          <span style="font-size:11px; font-weight:800; color:var(--slate-400); background:var(--slate-100); padding:3px 8px; border-radius:12px;">#${act.number}</span>
        </div>
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
          <span class="card-badge" style="background:#f0fdf4; color:#15803d; padding:2px 8px; border-radius:4px;">${act.badge}</span>
          <span style="font-size:11px; color:var(--slate-500);">${act.gradeRecommended}</span>
        </div>
        <h4 style="font-size:17px; font-weight:800; color:var(--slate-900); margin-bottom:6px;">${act.title}</h4>
        <p style="font-size:13px; color:var(--slate-600); line-height:1.5; margin-bottom:16px;">${act.description}</p>
      </div>

      <div style="padding-top:14px; border-top:1px solid var(--slate-100); display:flex; gap:8px;">
        <button onclick="window.useActivityInGenerator('${act.id}')" class="btn-action" style="flex:1; background:var(--primary); color:white; border:none; justify-content:center;">
          ${getIcon("play")}
          <span>Crear con este Formato</span>
        </button>
        <button onclick="window.showPromptModal('${act.id}')" class="btn-action" title="Ver Prompt Maestro">
          ${getIcon("copy")}
        </button>
      </div>
    </div>
  `).join("");
}

window.useActivityInGenerator = function(activityId) {
  selectActivity(activityId);
  switchTab("generator");
  dom.topicInput.focus();
  showToast("Formato cargado en el generador.", "info");
};

window.showPromptModal = function(activityId) {
  const act = ACTIVITIES.find(a => a.id === activityId);
  if (!act) return;

  const samplePrompt = act.buildPrompt({
    topic: dom.topicInput.value.trim() || "[Tema de clase]",
    grade: dom.gradeSelect.value || "[Nivel Educativo]",
    keywords: dom.keywordsInput.value.trim() || "[10 Palabras clave]",
    instruction: dom.instructionInput.value.trim() || act.suggestedInstructions
  });

  dom.promptModalTitle.textContent = `Prompt Maestro: ${act.title}`;
  dom.promptModalCode.textContent = samplePrompt;
  dom.promptModalCopyBtn.onclick = () => {
    navigator.clipboard.writeText(samplePrompt).then(() => {
      showToast("Â¡Prompt copiado al portapapeles!", "success");
      closePromptModal();
    });
  };

  dom.promptModal.classList.remove("hidden");
  dom.promptModal.classList.add("flex");
};

function closePromptModal() {
  dom.promptModal.classList.add("hidden");
  dom.promptModal.classList.remove("flex");
}

async function handleGenerateActivity() {
  const topic = dom.topicInput.value.trim();
  const grade = dom.gradeSelect.value;
  const keywords = dom.keywordsInput.value.trim();
  const instruction = dom.instructionInput.value.trim();

  if (!topic) {
    showToast("Por favor ingresa el tema de la actividad.", "warning");
    dom.topicInput.focus();
    return;
  }

  const key = getStoredApiKey();
  if (!key) {
    showToast("Por favor configura tu clave API de OpenRouter.", "warning");
    switchTab("settings");
    return;
  }

  const act = ACTIVITIES.find(a => a.id === state.selectedActivityId);
  if (!act) return;

  const compiledPrompt = act.buildPrompt({
    topic,
    grade,
    keywords: keywords || "[Genera 10 conceptos acordes al tema y grado]",
    instruction: instruction || act.suggestedInstructions
  });

  try {
    state.isGenerating = true;
    updateGeneratingUI(true, "Iniciando conexiÃ³n con OpenRouter...");
    
    let receivedHtml = "";
    receivedHtml = await generateActivityWithOpenRouter({
      prompt: compiledPrompt,
      model: getStoredModel(),
      apiKey: key,
      onStatus: statusMsg => {
        dom.generatingText.textContent = statusMsg;
      },
      onChunk: accumulatedText => {
        // Actualizar barra de progreso estimada
        const progress = Math.min(95, Math.floor(accumulatedText.length / 50));
        dom.progressBar.style.width = `${progress}%`;
      }
    });

    state.currentHtmlOutput = receivedHtml;
    state.currentActivityMetadata = {
      activityTypeId: act.id,
      activityTitle: act.title,
      topic,
      grade
    };

    // Guardar en historial local
    saveActivityToHistory({
      activityTypeId: act.id,
      activityTitle: act.title,
      topic,
      grade,
      htmlContent: receivedHtml
    });

    // Cargar en el simulador
    loadIntoPreview(receivedHtml);
    dom.previewTitle.textContent = `${act.title}: ${topic}`;
    dom.previewSubtitle.textContent = `Nivel: ${grade} â€¢ Generado con ${getStoredModel()}`;
    
    // Desplazar vista hacia el simulador
    dom.previewSection.scrollIntoView({ behavior: "smooth" });
    showToast("Â¡Actividad interactiva generada con Ã©xito!", "success");

  } catch (err) {
    console.error(err);
    showToast(err.message || "Error durante la generaciÃ³n de la actividad.", "error");
  } finally {
    state.isGenerating = false;
    updateGeneratingUI(false);
  }
}

function updateGeneratingUI(isGenerating, message = "") {
  dom.generateBtn.disabled = isGenerating;
  if (isGenerating) {
    dom.generateBtn.innerHTML = `
      <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
      <span>Creando Actividad Interactiva...</span>
    `;
    dom.generatingStatus.classList.remove("hidden");
    dom.generatingText.textContent = message;
    dom.progressBar.style.width = "15%";
  } else {
    dom.generateBtn.innerHTML = `
      ${getIcon("sparkles")}
      <span>Generar Actividad Interactiva con IA</span>
    `;
    dom.generatingStatus.classList.add("hidden");
    dom.progressBar.style.width = "0%";
  }
}

function loadIntoPreview(htmlContent) {
  dom.previewSection.classList.remove("hidden");
  
  // Usar srcdoc para aislamiento seguro y ejecuciÃ³n perfecta
  dom.previewFrame.srcdoc = htmlContent;
}

function setPreviewMode(mode) {
  state.previewMode = mode;
  const isMobile = mode === "mobile";
  
  dom.previewWrapper.className = isMobile 
    ? "phone-mockup-wrapper" 
    : "desktop-view-wrapper";

  dom.previewFrame.className = isMobile 
    ? "phone-mockup" 
    : "desktop-view";

  dom.previewModeMobileBtn.classList.toggle("active", isMobile);
  dom.previewModeDesktopBtn.classList.toggle("active", !isMobile);
}

function renderSavedActivities() {
  const list = getSavedActivities();
  if (list.length === 0) {
    dom.libraryGrid.innerHTML = "";
    dom.libraryEmpty.classList.remove("hidden");
    return;
  }

  dom.libraryEmpty.classList.add("hidden");
  dom.libraryGrid.innerHTML = list.map(item => {
    const act = ACTIVITIES.find(a => a.id === item.activityTypeId) || { icon: "grid", badge: "Juego" };
    const dateFormatted = new Date(item.createdAt).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });

    return `
      <div class="catalog-card">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <div class="card-icon" style="background:#e0f2fe; color:var(--primary); width:40px; height:40px; border-radius:8px;">
              ${getIcon(act.icon)}
            </div>
            <span style="font-size:11px; color:var(--slate-400);">${dateFormatted}</span>
          </div>
          <span class="card-badge" style="background:#f0fdf4; color:#15803d; padding:2px 8px; border-radius:4px;">${item.activityTitle}</span>
          <h4 style="font-size:17px; font-weight:800; color:var(--slate-900); margin-top:8px; margin-bottom:4px;">${item.topic}</h4>
          <p style="font-size:12px; color:var(--slate-500); margin-bottom:16px;">Nivel: ${item.grade}</p>
        </div>

        <div style="padding-top:12px; border-top:1px solid var(--slate-100); display:flex; gap:8px;">
          <button onclick="window.loadSavedActivity('${item.id}')" class="btn-action" style="flex:1; background:var(--primary); color:white; border:none; justify-content:center;">
            ${getIcon("play")}
            <span>Jugar</span>
          </button>
          <button onclick="window.downloadSavedActivity('${item.id}')" class="btn-action" title="Descargar HTML">
            ${getIcon("download")}
          </button>
          <button onclick="window.deleteSavedActivity('${item.id}')" class="btn-action" style="color:#b91c1c; border-color:#fecaca;" title="Eliminar">
            ${getIcon("trash")}
          </button>
        </div>
      </div>
    `;
  }).join("");
}

window.loadSavedActivity = function(id) {
  const list = getSavedActivities();
  const found = list.find(item => item.id === id);
  if (!found) return;

  state.currentHtmlOutput = found.htmlContent;
  state.currentActivityMetadata = {
    activityTypeId: found.activityTypeId,
    activityTitle: found.activityTitle,
    topic: found.topic,
    grade: found.grade
  };

  loadIntoPreview(found.htmlContent);
  dom.previewTitle.textContent = `${found.activityTitle}: ${found.topic}`;
  dom.previewSubtitle.textContent = `Nivel: ${found.grade} â€¢ Guardado en tu biblioteca`;
  
  switchTab("generator");
  dom.previewSection.scrollIntoView({ behavior: "smooth" });
  showToast("Actividad cargada en el simulador.", "success");
};

window.downloadSavedActivity = function(id) {
  const list = getSavedActivities();
  const found = list.find(item => item.id === id);
  if (!found) return;

  const fileName = `Peidagogos_${found.activityTypeId}_${found.topic.replace(/[^a-zA-Z0-9_-]/g, "_")}.html`;
  downloadHtmlFile(fileName, found.htmlContent);
  showToast("Descarga iniciada.", "success");
};

window.deleteSavedActivity = function(id) {
  if (confirm("Â¿EstÃ¡s seguro de que deseas eliminar esta actividad de tu biblioteca?")) {
    deleteActivityFromHistory(id);
    renderSavedActivities();
    showToast("Actividad eliminada.", "info");
  }
};

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  dom.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

})();
