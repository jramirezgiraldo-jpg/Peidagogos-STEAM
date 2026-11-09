// Catálogo completo de las 22 actividades pedagógicas con metadatos y prompts
export const COMMON_PHASE_3 = `

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

export const ACTIVITIES = [
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

export const CATEGORIES = [
  { id: "all", name: "Todas las Actividades", count: 22 },
  { id: "palabras", name: "Juegos de Palabras", count: 6 },
  { id: "clasificacion", name: "Memoria y Clasificación", count: 4 },
  { id: "aventura", name: "Narrativa y Desafíos", count: 3 },
  { id: "arcade", name: "Arcade y Velocidad", count: 5 },
  { id: "diagramas", name: "Diagramas e Imágenes", count: 1 },
  { id: "simuladores", name: "Música y Simuladores", count: 1 },
  { id: "lectoescritura", name: "Lectoescritura e Inclusión", count: 2 }
];
