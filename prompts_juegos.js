/**
 * prompts_juegos.js — Peidagogos STEAM
 * Diccionario Maestro de Prompts para los 18 Juegos Interactivos de la Caja 2
 * Extraído íntegra y exhaustivamente del documento "Promt Maestros.pdf".
 * SIN placeholders, con las 18 especificaciones técnicas y pedagógicas completas.
 */

const PROMPTS_JUEGOS = {
    // 1. Sopa de letras (Páginas 1-2)
    sopa_letras: (tema, nivel, instruccion) => `1. Sopa de letras
TEMA: ${tema}
NIVEL EDUCATIVO: ${nivel}
INSTRUCCIÓN: ${instruccion || 'Encuentra las 10 palabras sobre el tema.'}

PALABRAS CLAVE (Exactamente 10):
Define 10 palabras clave fundamentales sobre el tema adaptadas al nivel educativo.

Actúa como un desarrollador frontend senior y genera un archivo único e interactivo en formato .html (que integre HTML5, CSS3 y JavaScript vanilla sin librerías externas) basado estrictamente en los datos configurados arriba.

REQUISITOS TÉCNICOS Y FUNCIONALES:
1. Construcción y Lógica Dinámica:
○ REQUISITO ALGORÍTMICO ESTRICTO: El código JavaScript del juego DEBE incluir un algoritmo de cálculo de matrices omnidireccional. Inserta las palabras aleatoriamente en las 8 direcciones posibles: horizontal (izq-der, der-izq), vertical (arriba-abajo, abajo-arriba) y diagonal (las 4 direcciones). Implementa obligatoriamente un sistema de validación de colisiones (intersection check) en los ejes X e Y antes de imprimir cada letra.
○ Toma directamente las 10 palabras clave configuradas al inicio, normalízalas (mayúsculas, sin espacios ni tildes) y construye una cuadrícula proporcional óptima (12x12 o 13x13).
○ Coloca las 10 palabras de forma aleatoria en direcciones válidas (horizontal, vertical y diagonal, tanto en sentido directo como inverso).
○ Rellena todos los espacios vacíos con letras aleatorias.
2. Diseño Mobile-First, Responsivo y Arquitectura de Layout (ANTI-SUPERPOSICIÓN):
○ PROHIBIDO USAR POSITION FIXED O ABSOLUTE EN EL FOOTER/LISTA DE PALABRAS: La lista de palabras/badges inferior NUNCA debe tener position: fixed ni position: absolute. Debe ser un elemento en el flujo normal (position: relative; flex-shrink: 0;) para evitar por completo que flote sobre la cuadrícula y tape las últimas filas.
○ ESTRUCTURA FLEXBOX VERTICAL: Estructura el contenedor principal de la página con:
  display: flex; flex-direction: column; min-height: 100vh; max-height: 100vh; box-sizing: border-box; overflow-y: auto;
○ CONTENEDOR DEL TABLERO (ZONA CENTRAL): El tablero debe residir en un contenedor intermedio con:
  flex: 1 1 auto; min-height: 0; display: flex; align-items: center; justify-content: center; padding: 6px; margin: 4px 0; overflow: auto;
○ TAMAÑO RESPONSIVO DEL TABLERO (CUADRÍCULA 100% VISIBLE):
  Para asegurar que la última fila NUNCA quede cortada ni oculta por los badges, dimensiona el tablero usando unidades duales responsivas:
  width: min(90vw, 50vh); height: min(90vw, 50vh); aspect-ratio: 1 / 1; margin: 0 auto;
  Las celdas deben estructurarse con CSS Grid: grid-template-columns: repeat(N, 1fr); grid-template-rows: repeat(N, 1fr); con font-size: clamp(10px, 3.2vw, 17px); font-weight: bold; para autoajustarse matemáticamente al espacio visible disponible.
○ ZONA INFERIOR DE PALABRAS (BADGES): Debe ubicarse siempre DEBAJO del tablero en el flujo natural con:
  flex-shrink: 0; max-height: 25vh; overflow-y: auto; padding: 10px; margin-top: 6px; padding-bottom: 20px; display: flex; flex-wrap: wrap; justify-content: center; gap: 6px;
○ BLOQUEO TÁCTIL EXCLUSIVO DEL TABLERO: Aplica touch-action: none; y user-select: none; ÚNICAMENTE sobre la cuadrícula del tablero, permitiendo scroll normal en el resto del contenedor si la pantalla es reducida.

3. Interacción Táctil y Arrastre:
○ Selección continua fluida mediante eventos de puntero (pointerdown, pointermove, pointerup o eventos táctiles touch*), compatible con dedos en móviles y cursor en PC.
○ Validar que el trazo sea en línea recta (horizontal, vertical o diagonal).
○ Si la selección coincide con una palabra de la lista: fijarla con un color permanente y marcarla automáticamente en la lista de palabras inferior.
○ Si no coincide: limpiar la selección inmediatamente.
4. Interfaz y Marcadores:
○ Encabezado con: Título del tema, Instrucción, Cronómetro activo y Contador de progreso (ej. "Encontradas: 0 / 10").
○ Lista inferior con las 10 palabras en formato de etiquetas (badges) que se tachen o cambien a verde conforme se descubran.
○ Sistema de Calificación (1 a 5): Al finalizar la actividad, el sistema debe calcular una nota numérica de 1.0 a 5.0 basándose en el tiempo tardado o selecciones erróneas (ej. desempeño perfecto = 5.0, nota mínima de 1.0). Muestra esta calificación de forma destacada.
○ Modal o pantalla de victoria con confeti o animación CSS al encontrar las 10 palabras, mostrando la calificación, el tiempo final y un botón de "Reiniciar juego". Todo el código debe estar comentado en español.`,

    // 2. Crucigrama (Páginas 2-3)
    crucigrama: (tema, nivel, instruccion) => `2. Crucigrama
TEMA Y/O PALABRAS CLAVE: ${tema}
NIVEL EDUCATIVO: ${nivel}
INSTRUCCIÓN: ${instruccion || 'Lee las pistas y completa el crucigrama tocando las casillas para escribir.'}

Actúa como un desarrollador frontend senior y experto en pedagogía.

FASE 1: GENERACIÓN DE CONTENIDO EDUCATIVO A partir del "TEMA Y/O PALABRAS CLAVE" y el "NIVEL EDUCATIVO" indicados arriba:
1. Define exactamente 10 palabras relevantes para el crucigrama.
2. Redacta 10 pistas educativas claras y precisas, adaptadas al nivel educativo.

FASE 2: DESARROLLO DEL INTERACTIVO (CORREGIDO - DISEÑO TRADICIONAL)
Con las 10 palabras y pistas generadas, crea un archivo único e interactivo en formato .html (que integre HTML5, CSS3 y JavaScript vanilla sin librerías externas ni CDNs).

REQUISITOS TÉCNICOS Y FUNCIONALES:
1. Construcción y Lógica Dinámica (Generación del Crucigrama):
○ Normaliza las 10 palabras (mayúsculas, sin tildes ni espacios).
○ Crea un algoritmo en JavaScript que acomode automáticamente las palabras en una cuadrícula cruzada (intersecciones).
○ CUADRÍCULA INDIVIDUAL: La cuadrícula debe consistir en celdas cuadradas individuales perfectamente definidas. Cada celda de letra debe tener bordes visibles para crear una cuadrícula tradicional. Eliminar cualquier efecto de barras continuas.
○ NUMERACIÓN CLARA: Numera de forma pequeña y legible en la esquina superior izquierda dentro de la primera celda cuadrada de cada palabra para relacionarla nítidamente con su pista.
2. Diseño Mobile-First, Responsivo y Estético (CORREGIDO):
○ REQUISITO VISUAL ESTRICTO: El crucigrama debe tener una apariencia tradicional clásica. ELIMINA por completo cualquier estilo de tabla con colores alternados o franjas de fondo (nada de nth-child even/odd). El contenedor de la cuadrícula debe tener un fondo liso uniforme (transparente o del color del body). Únicamente las celdas que contienen las letras deben ser cuadros individuales blancos con un borde sólido. Las celdas vacías (bloqueadas) no deben renderizarse con colores continuos en forma de barra.
○ FONDO CLARO: Usar un fondo de página claro y limpio (ej. blanco puro #fff o un gris muy claro #f9f9f9) en lugar de un fondo oscuro.
○ ESTILO TRADICIONAL: Implementar una cuadrícula de crucigrama tradicional y nítida. Cada celda activa es un cuadrado blanco con un borde gris claro definido. Celdas bloqueadas (sin letra) deben ser grises o del color del fondo para que no parezcan barras. El diseño general debe ser moderno pero respetar la forma clásica de un crucigrama.
○ ADAPTACIÓN: La interfaz debe adaptarse automáticamente a cualquier smartphone (360px a 420px de ancho), escalando el tamaño de las casillas cuadradas para evitar el scroll horizontal.
○ EVITAR ZOOM: Gestionar las entradas capturando eventos del teclado en un contenedor o usando inputs con font-size: 16px; para evitar el zoom automático en iOS/Android.
3. Interacción y Escritura (Navegación UX):
○ Al tocar una casilla, esta debe resaltarse junto con todas las celdas cuadradas individuales de la palabra activa actual. El trazo de resaltado debe seguir las celdas individuales, no ser una línea continua.
○ INTERSECCIONES: Si es una intersección, un segundo toque debe alternar entre dirección horizontal y vertical.
○ AUTO-AVANCE: Al escribir una letra, el foco debe saltar automáticamente a la siguiente casilla cuadrada. Permite borrar (tecla Backspace) regresando a la casilla anterior.
○ Las celdas deben aceptar solo letras y convertirlas automáticamente a mayúsculas. El color de la celda de entrada (ej. amarillo) está bien.
4. Interfaz de Pistas y Marcadores:
○ Encabezado con: Título del tema, Instrucción, Cronómetro activo y Contador de progreso.
○ Sección inferior (debajo de la cuadrícula) dividida en dos columnas: Horizontales y Verticales, mostrando el número y la pista generada en la Fase 1.
○ Validación en tiempo real: Si las letras ingresadas en una palabra son correctas, resalta las celdas de esa palabra de un color de éxito (ej. verde pastel suave) y tacha la pista correspondiente en la lista inferior.
○ Sistema de Calificación (1 a 5): Al finalizar la actividad, el sistema debe calcular una nota numérica de 1.0 a 5.0 basándose en los errores cometidos (ej. letras incorrectas ingresadas). Muestra esta calificación de forma destacada.
○ Modal de victoria con confeti o animación CSS al completar el 100%, mostrando la calificación, el tiempo final y un botón de "Reiniciar juego". Todo el código debe estar comentado en español.`,

    // 3. Emparejar (Páginas 3-5)
    emparejar: (tema, nivel, instruccion) => `3. Emparejar (Duelo de Emparejamiento de Columnas)
TEMA Y/O PALABRAS CLAVE: ${tema}
NIVEL EDUCATIVO: ${nivel}
INSTRUCCIÓN: ${instruccion || 'Toca un concepto en la columna izquierda y luego su definición correspondiente en la derecha para emparejarlos.'}

Actúa como un desarrollador frontend senior y experto en pedagogía conceptual y gamificación formativa.

FASE 1: GENERACIÓN DE CONTENIDO EDUCATIVO (ESTRUCTURA DE PARES):
A partir del "TEMA Y/O PALABRAS CLAVE" y el "NIVEL EDUCATIVO" indicados arriba:
1. Define EXACTAMENTE entre 8 y 10 conceptos clave relevantes para el tema adaptados rigurosamente al nivel educativo (${nivel}).
2. Redacta entre 8 y 10 definiciones o descripciones claras, concisas, precisas y pedagógicamente adaptadas para cada uno de esos conceptos.
3. El formato de datos base debe ser una estructura JSON / arreglo JavaScript estricto procesable por el frontend:
   [
     {"izquierda": "Concepto 1", "derecha": "Definición pedagógica adaptada 1"},
     {"izquierda": "Concepto 2", "derecha": "Definición pedagógica adaptada 2"}
     ... hasta completar exactamente entre 8 y 10 pares
   ]

FASE 2: DESARROLLO DEL INTERACTIVO (JUEGO DE EMPAREJAR COLUMNAS)
Con los conceptos y definiciones generados, crea un archivo único e interactivo en formato .html (que integre HTML5, CSS3 y JavaScript vanilla sin librerías externas ni CDNs).

REQUISITOS TÉCNICOS Y FUNCIONALES:
1. Construcción y Lógica Dinámica:
○ Arreglo de Objetos: Integra el arreglo de pares (8 a 10 elementos) vinculando cada concepto con su definición.
○ Columnas Independientes: Renderiza dos columnas visuales: Columna A (Conceptos) y Columna B (Definiciones).
○ Aleatorización Estricta: Mezcla (shuffle) el orden de los elementos en la Columna A y en la Columna B de forma totalmente independiente cada vez que se cargue el juego. REGLA INQUEBRANTABLE: La respuesta correcta NUNCA debe quedar en la misma fila (si alguna coincide al barajar, vuelve a mezclar o permútala).

2. Diseño Mobile-First, Responsivo y Estético:
○ FONDO Y TARJETAS: Fondo de pantalla claro (#f9f9f9 o blanco). Cada concepto y definición debe estar dentro de una "tarjeta" o botón estilizado (bordes redondeados de 12px, sombra suave, fondo blanco #ffffff, borde sutil #CBD5E1).
○ ADAPTACIÓN MÓVIL (360px a 420px): Grid de 2 columnas donde los conceptos y definiciones encajan sin scroll horizontal. Tamaño de texto adaptativo y legible (mínimo 14px, lineHeight 1.35) que se ajusta al contenido.

3. Interacción y Validación en Tiempo Real:
○ Mecánica de Selección Bidireccional: El usuario puede tocar/hacer clic en una tarjeta de la Columna A y luego en la B, o en la B y luego en la A (el orden no importa).
○ Estado Activo: Al primer clic, la tarjeta queda resaltada con borde azul grueso (ej. #2563EB) y fondo azul claro (#EFF6FF). Un segundo clic sobre la misma tarjeta la deselecciona inmediatamente. Si hace clic en otra de la misma columna, transfiere la selección.
○ Validación Inmediata al Elegir Pareja:
■ Acierto: Ambas tarjetas cambian permanentemente a color verde pastel (#DCFCE7, borde #16A34A, texto #15803D), se deshabilitan para futuros clics y suman una pareja encontrada.
■ Error: Ambas tarjetas se pintan de rojo (#FEE2E2, borde #DC2626), reproducen una animación CSS de sacudida (@keyframes shake) y se deseleccionan automáticamente tras 800ms. Registra el error para la calificación formativa.

4. Interfaz de Encabezado y Marcadores (HUD):
○ Panel superior limpio con: Título del tema, Instrucción breve, Cronómetro activo (formato 00:00) y Contador de progreso dinámico (ej. "Parejas: 0 / 10").

5. Evaluación Socioformativa (Escala 1.0 a 5.0) y Modal de Victoria:
○ Fórmula Formativa: Al completar todas las parejas, calcula una calificación numérica de 1.0 a 5.0:
  Nota = 5.0 - (errores * 0.25), con un piso mínimo absoluto de 1.0.
○ Modal de Victoria Superpuesto: Con animación de confeti CSS o transformaciones limpias al completar el 100% de las parejas, mostrando:
  - Calificación final obtenida (ej. "Nota: 4.8 / 5.0 - Desempeño Superior").
  - Tiempo total empleado.
  - Botón "Reiniciar juego".
  - Botón para reclamar XP / Guardar Progreso (integrado con postMessage y la plataforma principal).
Todo el código debe estar comentado en español.`,

    // 4. Concéntrese (Páginas 5-6)
    concentrese: (tema, nivel, instruccion) => `4. Concéntrese
TEMA Y/O PALABRAS CLAVE: ${tema}
NIVEL EDUCATIVO: ${nivel}
INSTRUCCIÓN: ${instruccion || 'Toca las cartas para voltearlas y encuentra los pares. Debes emparejar cada concepto con su definición exacta.'}

Actúa como un desarrollador frontend senior y experto en pedagogía.

FASE 1: GENERACIÓN DE CONTENIDO EDUCATIVO A partir del "TEMA Y/O PALABRAS CLAVE" y el "NIVEL EDUCATIVO" indicados arriba:
1. Define exactamente 10 conceptos clave relevantes para el tema.
2. Redacta 10 definiciones o descripciones cortas, claras y precisas. (Esto formará 10 pares, creando un mazo de 20 cartas en total para el juego).

FASE 2: DESARROLLO DEL INTERACTIVO (JUEGO DE CONCÉNTRESE / MEMORIA)
Con los conceptos y definiciones generados, crea un archivo único e interactivo en formato .html (que integre HTML5, CSS3 y JavaScript vanilla sin librerías externas ni CDNs).

REQUISITOS TÉCNICOS Y FUNCIONALES:
1. Construcción y Lógica Dinámica:
○ Crea un arreglo con los 20 elementos (10 textos de conceptos y 10 textos de definiciones).
○ Aleatorización: Mezcla (shuffle) el orden de las 20 cartas de forma totalmente aleatoria cada vez que se cargue la página o se reinicie el juego.
○ Estructura 3D: Cada carta debe tener una estructura de doble cara: un "frente" (oculto, mostrando un color, patrón o ícono de interrogación) y un "dorso" (la cara que revela el texto del concepto o definición al girar).
2. Diseño Mobile-First, Responsivo y Estético:
○ CUADRÍCULA (GRID): Usa CSS Grid para disponer las cartas. En móviles (360px a 420px), la cuadrícula debe ser de 4 columnas x 5 filas, ajustándose al ancho de la pantalla sin scroll horizontal.
○ ESTILO DE CARTAS: Diseño moderno y limpio. Las cartas deben tener bordes redondeados, sombra suave y un tamaño suficiente para que el texto (mínimo 13-14px) sea fácil de leer.
○ ANIMACIÓN: Implementa una transición CSS suave (flip 3D con transform: rotateY) para el giro de las cartas.
3. Interacción y Retroalimentación (Navegación UX):
○ Mecánica de Giro: Al tocar una carta, gira revelando su contenido. El usuario solo puede tener un máximo de 2 cartas volteadas simultáneamente.
○ Validación en Tiempo Real: Al voltear la segunda carta, evalúa si hacen pareja (Concepto y su Definición correspondiente):
■ Si es correcto: Las cartas permanecen boca arriba, cambian permanentemente a un color de éxito (ej. verde pastel) y se deshabilitan para más clics.
■ Si es incorrecto: Las cartas se muestran brevemente (aprox. 1 a 1.5 segundos), se pintan ligeramente de rojo, y luego se voltean boca abajo automáticamente. Cuenta este fallo.
○ Bloqueo: Mientras dos cartas se estén mostrando para evaluar, bloquea temporalmente los clics en el resto del tablero.
4. Interfaz de Encabezado y Marcadores:
○ Encabezado limpio con: Título del tema, Instrucción, Cronómetro activo, Contador de Movimientos y Contador de Parejas (ej. "Parejas: 0 / 10").
○ Sistema de Calificación (1 a 5): Al finalizar la actividad, el sistema debe calcular una nota numérica de 1.0 a 5.0 basándose en la cantidad de movimientos realizados vs el mínimo posible (20 movimientos). Muestra esta calificación de forma destacada.
○ Modal de victoria con confeti o animación CSS limpia al completar el 100% de los pares, mostrando la calificación, el tiempo final, el número de movimientos y un botón destacado para "Reiniciar juego". Todo el código debe estar comentado en español.`,

    // 5. Laberinto de decisiones (Páginas 6-7)
    laberinto_decisiones: (tema, nivel, instruccion) => `5. Laberinto de decisiones
TEMA Y/O ESCENARIO: ${tema}
NIVEL EDUCATIVO: ${nivel}
INSTRUCCIÓN: ${instruccion || 'Lee atentamente cada situación y elige la mejor decisión pedagógica para avanzar. ¡Tus elecciones tienen consecuencias!'}

Actúa como un desarrollador frontend senior, diseñador UX y experto en diseño instruccional y pedagogía.

FASE 1: GENERACIÓN DE CONTENIDO EDUCATIVO (EL ÁRBOL DE DECISIONES) A partir del "TEMA Y/O ESCENARIO" y el "NIVEL EDUCATIVO" indicados:
1. Crea una historia interactiva ramificada con al menos 8 nodos (escenas) en total.
2. Estructura narrativa:
○ 1 Nodo de inicio (Planteamiento del problema).
○ Nodos intermedios: Cada escena debe presentar una situación pedagógica clara y ofrecer entre 2 y 3 opciones de decisión.
○ Nodos finales (Al menos 3): Debe haber un final "Exitoso" (donde se tomaron las mejores decisiones) y finales "De aprendizaje/Fracaso" (explicando por qué las decisiones tomadas tuvieron un impacto negativo y qué se debería mejorar).
3. Redacta textos inmersivos, retadores y adaptados al nivel escolar. Asigna un valor o "peso" a cada decisión para calcular una calificación final.

FASE 2: DESARROLLO DEL INTERACTIVO (LABERINTO DE DECISIONES) Con la historia generada, crea un archivo único e interactivo en formato .html (que integre HTML5, CSS3 y JavaScript vanilla sin librerías externas ni CDNs).

REQUISITOS TÉCNICOS Y FUNCIONALES:
1. Construcción y Lógica Dinámica (El Motor del Juego):
○ Estructura la historia en un objeto o arreglo JSON dentro de JavaScript, donde cada nodo tenga un id, texto (la situación), un tipo (inicio, decisión, finalExito, finalFalla) y un arreglo de opciones (cada opción con su texto, el id del nodo al que dirige y un puntaje interno de penalización o éxito).
○ Crea una función que renderice dinámicamente la escena actual basándose en el estado del juego y el ID del nodo activo.
2. Diseño Mobile-First, Responsivo y Estético:
○ Diseño de Tarjetas: La interfaz principal debe centrarse en una tarjeta (card) amplia y limpia en el centro de la pantalla. Usa un fondo de página suave (ej. #f4f6f8). La tarjeta debe tener fondo blanco, bordes redondeados y sombra suave.
○ Tipografía y Espaciado: El texto de la situación debe ser grande, legible (mínimo 16px) y estar bien espaciado.
○ Botones de Decisión: Las opciones deben renderizarse como botones anchos, fáciles de tocar con el dedo pulgar (padding amplio, separación clara entre ellos).
3. Interacción y Animaciones (Navegación UX):
○ Transiciones: Al elegir una opción, la tarjeta actual debe desvanecerse suavemente (fade out) y la nueva escena debe aparecer (fade in).
○ Scroll Top: Si el texto es largo, al cambiar de escena el contenedor debe volver automáticamente arriba.
4. Interfaz, Finales y Marcadores:
○ Encabezado persistente pero minimalista con el Título del tema y un indicador visual de progreso o pasos tomados (ej. "Decisión 1", "Decisión 2").
○ Sistema de Calificación (1 a 5): Al llegar a un nodo final, el sistema debe calcular y mostrar una nota numérica de 1.0 a 5.0 basándose en las decisiones tomadas durante el recorrido (ej. ruta óptima = 5.0, final de falla = 1.0 a 3.0 dependiendo de la gravedad de la mala decisión).
○ Pantallas Finales: Al llegar a un nodo final, la interfaz debe cambiar para destacar el resultado.
■ Si es un final exitoso: Colores verdes/positivos, mensaje de felicitación, nota alta y animación CSS (ej. confeti).
■ Si es un final de aprendizaje: Colores cálidos/advertencia, retroalimentación constructiva sobre el error y nota baja.
○ Todo nodo final debe incluir un botón grande para "Volver a intentar / Reiniciar la historia". Todo el código debe estar comentado en español.`,

    // 6. Clasificador Tap & Sort (Páginas 8-9)
    tap_sort: (tema, nivel, instruccion) => `6. Clasificador Tap & Sort
TEMA PRINCIPAL: ${tema}
CATEGORÍAS: Genera entre 2 y 4 categorías pedagógicas para el tema.
NIVEL EDUCATIVO: ${nivel}
INSTRUCCIÓN: ${instruccion || 'Toca un elemento de la lista central y luego toca el contenedor correcto al que pertenece para clasificarlo.'}

Actúa como un desarrollador frontend senior y experto en diseño de interfaces educativas interactivas.

FASE 1: GENERACIÓN DE CONTENIDO EDUCATIVO A partir del "TEMA PRINCIPAL", las "CATEGORÍAS" y el "NIVEL EDUCATIVO" indicados:
1. Define entre 12 y 15 conceptos, características, ejemplos o elementos clave que correspondan equitativamente a las categorías proporcionadas.
2. Asegúrate de que los conceptos sean claros y pedagógicamente adecuados para el nivel educativo. Si aplica, acompaña el texto de cada concepto con un emoji representativo.

FASE 2: DESARROLLO DEL INTERACTIVO (CLASIFICADOR TAP & SORT) Crea un archivo único e interactivo en formato .html (que integre HTML5, CSS3 y JavaScript vanilla sin librerías externas ni CDNs).

REQUISITOS TÉCNICOS Y FUNCIONALES:
1. Construcción y Lógica Dinámica:
○ Estructura los datos en un arreglo de objetos en JavaScript (cada objeto con texto y categoriaCorrecta).
○ Aleatorización: Mezcla (shuffle) el orden de los elementos para que aparezcan de forma aleatoria en la zona de juego.
2. Diseño Mobile-First, Responsivo y Estético:
○ Usa un fondo de página claro (#f4f6f8). La interfaz debe encajar sin scroll horizontal en pantallas de smartphones.
○ Zona de Contenedores (Categorías): En la parte superior o inferior, coloca botones grandes y visualmente distintos que representen cada Categoría.
○ Zona de Elementos (Pool): En el centro, muestra los elementos a clasificar en formato de tarjetas o "chips" (etiquetas).
3. Interacción y Animaciones (Tap & Sort):
○ CERO Drag & Drop: La mecánica debe ser estrictamente de toques (Tap & Sort).
○ Paso 1 (Seleccionar): El usuario toca un elemento/concepto. Este elemento pasa a un estado "Activo" (ej. borde grueso azul). Un segundo toque lo deselecciona.
○ Paso 2 (Clasificar): Con el elemento activo, el usuario toca uno de los botones de Categoría.
○ Validación en Tiempo Real:
■ Si es correcto: El elemento desaparece suavemente de la zona central y suma un punto.
■ Si es incorrecto: El elemento se sacude (animación CSS shake), se pinta de rojo momentáneamente, pierde el estado de selección y se registra un error.
4. Interfaz de Marcadores y Pantalla Final:
○ Encabezado con: Título del tema, Instrucción, Cronómetro activo, Contador de Aciertos y Contador de Errores.
○ Sistema de Calificación (1 a 5): Al finalizar la actividad, el sistema debe calcular una nota numérica de 1.0 a 5.0 basándose en los errores de clasificación (ej. 0 errores = 5.0, restando puntos por cada clasificación errónea). Muestra esta calificación de forma destacada.
○ Modal de Victoria: Al clasificar correctamente todos los elementos, muestra una pantalla final con confeti, la calificación obtenida, el tiempo total, la cantidad de errores cometidos y un botón destacado para "Reiniciar juego". Todo el código debe estar comentado en español.`,

    // 7. Scape Room (Páginas 9-10)
    scape_room: (tema, nivel, instruccion) => `7. Scape Room
TEMA Y/O MISIÓN: ${tema}
NIVEL EDUCATIVO: ${nivel}
INSTRUCCIÓN: ${instruccion || 'Resuelve el acertijo científico de cada sala para descubrir el código secreto. Usa el teclado digital para abrir el candado y avanzar.'}

Actúa como un desarrollador frontend senior, diseñador UX y experto en diseño instruccional y gamificación educativa.

FASE 1: GENERACIÓN DE CONTENIDO EDUCATIVO (ACERTIJOS Y CÓDIGOS) A partir del "TEMA Y/O MISIÓN" y el "NIVEL EDUCATIVO" indicados:
1. Diseña una misión de Escape Room dividida en exactamente 3 a 4 salas o niveles secuenciales.
2. Para cada sala, redacta un acertijo científico, pista o cálculo retador pero adecuado para el nivel educativo.
3. Define un código secreto de 3 a 4 dígitos numéricos que sea la respuesta lógica a cada acertijo.

FASE 2: DESARROLLO DEL INTERACTIVO (ESCAPE ROOM / CANDADO DIGITAL)
Crea un archivo único e interactivo en formato .html (que integre HTML5, CSS3 y JavaScript vanilla sin librerías externas ni CDNs).

REQUISITOS TÉCNICOS Y FUNCIONALES:
1. Construcción y Lógica Dinámica:
○ Estructura los datos en un arreglo de objetos en JavaScript (cada objeto con sala, acertijo y codigoRespuesta).
○ El juego debe gestionar el "estado" para avanzar desde la primera sala hasta la sala final secuencialmente.
2. Diseño Mobile-First, Responsivo y Estético (Tema Misterio/Laboratorio):
○ Usa un fondo inmersivo (ej. colores oscuros, con acentos en colores llamativos como verde neón o cian).
○ Pantalla del Acertijo: Un panel superior claro y legible donde se muestre el texto del reto actual.
○ Pantalla del Candado (Display): Un contenedor central que muestre los dígitos ingresados (ej. _ _ _ _ que se van llenando).
○ Teclado Táctil en Pantalla (Keypad): En la parte inferior, diseña una cuadrícula estilo caja fuerte con botones grandes para los números del 0 al 9, "Borrar" (⌫) y "Desbloquear" (🔓). IMPORTANTE: No uses <input type="number"> ni campos de texto nativos.
3. Interacción y Animaciones (Mecánica Táctil):
○ Al tocar los números del teclado en pantalla, estos se reflejan en el Display.
○ Botón Desbloquear: Al presionarlo, el sistema valida la entrada contra el código secreto:
■ Si es correcto: El display brilla en verde y avanza a la siguiente sala.
■ Si es incorrecto: El display parpadea en rojo, la pantalla hace una animación CSS de vibración (shake), la entrada se limpia y se registra un error en los intentos.
4. Interfaz de Marcadores y Pantalla Final:
○ Encabezado con: Título de la Misión, Cronómetro activo y Progreso (ej. "Sala: 1 / 4").
○ Sistema de Calificación (1 a 5): Al finalizar la actividad, el sistema debe calcular una nota numérica de 1.0 a 5.0 basándose en los intentos fallidos de desbloqueo (ej. 0 intentos fallidos = 5.0, nota mínima de 1.0). Muestra esta calificación de forma destacada.
○ Modal de Victoria: Al superar la última sala, muestra una pantalla final de éxito, la calificación, el tiempo total de escape y un botón grande para "Reiniciar misión". Todo el código debe estar comentado en español.`,

    // 8. Completar el Párrafo (Páginas 10-11)
    completar_parrafo: (tema, nivel, instruccion) => `8. Completar el Párrafo
TEMA DEL TEXTO: ${tema}
NIVEL EDUCATIVO: ${nivel}
INSTRUCCIÓN: ${instruccion || 'Toca una palabra del banco inferior y luego toca el espacio vacío en el texto para completarlo.'}

Actúa como un desarrollador frontend senior, diseñador UX y experto en diseño instruccional y pedagogía.

FASE 1: GENERACIÓN DE CONTENIDO EDUCATIVO (TEXTO Y BANCO DE PALABRAS) A partir del "TEMA DEL TEXTO" y el "NIVEL EDUCATIVO" indicados:
1. Redacta un párrafo educativo, coherente y retador sobre el tema, adecuado para el nivel educativo.
2. Identifica y extrae entre 5 y 8 palabras clave del párrafo, dejando en su lugar "huecos" o espacios en blanco.
3. Crea un banco de palabras que contenga las palabras extraídas más 2 o 3 palabras "distractoras" para aumentar el nivel de análisis.

FASE 2: DESARROLLO DEL INTERACTIVO (COMPLETAR EL PÁRRAFO) Crea un archivo único e interactivo en formato .html (que integre HTML5, CSS3 y JavaScript vanilla sin librerías externas ni CDNs).

REQUISITOS TÉCNICOS Y FUNCIONALES:
1. Construcción y Lógica Dinámica:
○ Estructura los datos en JavaScript separando el texto (con identificadores para los huecos) y el banco de palabras (mezclado aleatoriamente al inicio de cada partida).
○ Renderiza el texto en la parte superior y el banco de palabras en la parte inferior.
2. Diseño Mobile-First, Responsivo y Estético:
○ Usa un fondo de página claro y limpio (#f4f6f8 o blanco). La interfaz debe adaptarse a smartphones sin scroll horizontal.
○ Área del Texto (Párrafo): El texto debe tener un tamaño de fuente legible (mínimo 16px) y un interlineado amplio.
○ Los Huecos (Blanks): Deben renderizarse como botones o casillas en línea con un ancho fijo mínimo y borde inferior marcado.
○ Banco de Palabras: Un contenedor en la parte inferior con las palabras disponibles presentadas como "chips".
3. Interacción y Animaciones (Mecánica Táctil Cero Drag & Drop):
○ Seleccionar Palabra: Al tocar una palabra en el banco, esta queda "Activa".
○ Llenar Hueco: Con una palabra activa, al tocar un hueco vacío en el texto, la palabra se inserta allí y el "chip" desaparece.
○ Deshacer (Vaciar Hueco): Al tocar un hueco que ya tiene una palabra, esta regresa automáticamente al banco.
○ Validación Automática: Cuando todos los huecos estén llenos, el sistema evalúa inmediatamente:
■ Si todo es correcto: Los huecos brillan en verde pastel y se activa la pantalla de victoria.
■ Si hay errores: Solo las palabras incorrectas se sacuden (shake), se pintan de rojo momentáneamente, registran un error y regresan al banco de palabras.
4. Interfaz de Marcadores y Pantalla Final:
○ Encabezado con: Título del tema, Instrucción, Cronómetro activo y Contador de Progreso (ej. "Palabras: 0 / 6").
○ Sistema de Calificación (1 a 5): Al finalizar la actividad, el sistema debe calcular una nota numérica de 1.0 a 5.0 basándose en los errores cometidos al colocar las palabras (ej. 0 errores = 5.0, descontando décimas por fallo). Muestra esta calificación de forma destacada.
○ Modal de Victoria: Al completar el párrafo correctamente, muestra un modal de éxito, la calificación final, el tiempo total y un botón grande para "Reiniciar juego". Todo el código debe estar debidamente comentado en español.`,

    // 9. Anagrama (Páginas 12-13)
    anagrama: (tema, nivel, instruccion) => `Anagrama
Actúa como un desarrollador frontend senior y experto en diseño de interfaces educativas interactivas.

TEMA Y/O PALABRAS CLAVE: ${tema}
NIVEL EDUCATIVO: ${nivel}
INSTRUCCIÓN: ${instruccion || 'Lee la pista y toca las letras en el orden correcto para descubrir la palabra oculta.'}

FASE 1: GENERACIÓN DE CONTENIDO EDUCATIVO
● Define EXACTAMENTE 10 palabras clave relacionadas con el tema (conceptos de una sola palabra, sin espacios, ej: NUCLEO, MITOCONDRIA).
● Redacta 10 pistas o descripciones cortas y pedagógicamente adecuadas que correspondan a cada una de esas palabras.
● IMPORTANTE: Debes generar y escribir explícitamente las 10 palabras. NO omitas ninguna.

FASE 2: DESARROLLO DEL INTERACTIVO (JUEGO DE ORDENAR LETRAS) Crea un archivo único e interactivo en formato .html (que integre HTML5, CSS3 y JavaScript vanilla sin librerías externas ni CDNs). El juego debe presentar 10 palabras por actividad (una por una en formato de niveles secuenciales).

REQUISITOS TÉCNICOS Y FUNCIONALES:
1. Construcción y Lógica Dinámica:
● Estructura los datos en un arreglo de EXACTAMENTE 10 objetos en JavaScript (cada objeto con la palabra en mayúsculas y su pista). ESTÁ ESTRICTAMENTE PROHIBIDO usar placeholders como "// añade las demás palabras aquí" o truncar el código. Tienes que escribir el arreglo con los 10 objetos completos.
● Crea una función para desordenar (shuffle) las letras de la palabra activa actual.
● El juego avanza nivel por nivel: se muestra la pista 1 y sus letras. Al resolverla, se pasa automáticamente a la 2, y así sucesivamente hasta la 10.
2. Diseño Mobile-First, Responsivo y Estético:
● Usa un fondo de página claro y moderno. La interfaz debe encajar sin scroll horizontal en pantallas de smartphones.
● Área de la Pista: Una tarjeta superior clara que muestre el texto de la pista.
● Área de Respuesta (Casillas vacías): En el centro, muestra una fila de casillas vacías (cuadros con borde) que coincidan con la cantidad de letras de la palabra oculta.
● Área de Letras Disponibles: En la parte inferior, muestra las letras desordenadas como botones individuales, estilizados como fichas de Scrabble.
3. Interacción y Animaciones (Mecánica Tap):
● CERO Drag & Drop: Para garantizar compatibilidad móvil, usa toques.
● Seleccionar Letra: Al tocar una letra desordenada en la parte inferior, esta salta a la primera casilla vacía disponible en el área de respuesta.
● Deshacer Letra: Al tocar una letra que ya está en el área de respuesta, esta regresa automáticamente al área inferior.
● Validación Automática: Cuando todas las casillas de respuesta se llenan, el sistema evalúa inmediatamente:
○ Si es correcto: Las letras se iluminan de verde pastel y el juego carga la siguiente palabra de forma automática.
○ Si es incorrecto: Las letras se sacuden (shake), se pintan de rojo por medio segundo y automáticamente regresan al área inferior, registrando un intento fallido en el sistema.
4. Interfaz de Marcadores y Pantalla Final:
● Encabezado con: Título del tema, Instrucción, Cronómetro activo y Contador de Progreso (ej. "Palabra: 1 / 10").
● Sistema de Calificación (1 a 5): Al finalizar la actividad, el sistema debe calcular una nota numérica de 1.0 a 5.0 basándose en los intentos incorrectos al formar las palabras (ej. 0 fallos = 5.0, nota mínima de 1.0). Muestra esta calificación de forma destacada.
● Modal de Victoria: Al completar las 10 palabras, muestra una pantalla final con confeti (hecho en CSS/JS), la calificación obtenida, el tiempo total logrado y un botón grande para "Reiniciar juego". Todo el código debe estar comentado en español.`,

    // 10. Ordenar la Secuencia (Línea de Tiempo) (Páginas 13-14)
    ordenar_secuencia: (tema, nivel, instruccion) => `9. Ordenar la Secuencia (Línea de Tiempo)
PROCESO O SECUENCIA: ${tema}
NIVEL EDUCATIVO: ${nivel}
INSTRUCCIÓN: ${instruccion || 'Lee los pasos desordenados y usa las flechas (⬆️ ⬇️) para organizarlos en el orden cronológico o lógico correcto.'}

Actúa como un desarrollador frontend senior y experto en diseño de interfaces educativas interactivas.

FASE 1: GENERACIÓN DE CONTENIDO EDUCATIVO A partir del "PROCESO O SECUENCIA" y el "NIVEL EDUCATIVO" indicados: Define el proceso dividiéndolo en EXACTAMENTE 6 a 8 pasos cronológicos o lógicos (secuenciales). Redacta el texto de cada paso de forma clara, precisa y pedagógicamente adecuada para el nivel educativo. ESTÁ ESTRICTAMENTE PROHIBIDO omitir pasos, debes escribir el contenido completo.

FASE 2: DESARROLLO DEL INTERACTIVO (JUEGO DE ORDENAR SECUENCIA) Crea un archivo único e interactivo en formato .html (que integre HTML5, CSS3 y JavaScript vanilla sin librerías externas ni CDNs).

REQUISITOS TÉCNICOS Y FUNCIONALES:
1. Construcción y Lógica Dinámica: Estructura los datos en un arreglo de objetos en JavaScript (cada objeto con su "id" de orden correcto [1, 2, 3...] y el "texto" del paso). Crea una función para desordenar (shuffle) aleatoriamente el arreglo al iniciar el juego, asegurando mediante un bucle de validación que el juego NUNCA empiece en el orden correcto ya resuelto. Renderiza los pasos en una lista vertical interactiva.
2. Diseño Mobile-First, Responsivo y Estético: Usa un fondo de página claro y moderno (#f4f6f8). La interfaz debe encajar sin scroll horizontal en pantallas de smartphones (360px a 420px de ancho). Tarjetas de Pasos: Cada paso debe ser una tarjeta (card) horizontal con fondo blanco, bordes redondeados y sombra suave. Distribución Interna (Flexbox): Lado izquierdo/centro: El texto del paso. Lado derecho: Un contenedor vertical con dos botones grandes y táctiles: ⬆️ (Subir) y ⬇️ (Bajar).
3. Interacción y Animaciones (Mecánica Táctil Cero Drag & Drop): Botón Subir (⬆️) / Bajar (⬇️): Al tocar, la tarjeta actual intercambia su posición con la tarjeta inmediatamente superior o inferior en el DOM y en el arreglo lógico. Añade una transición CSS suave (transform o translate) para que el intercambio no sea brusco. Validación Automática: Cada vez que el usuario mueve una tarjeta, el sistema evalúa inmediatamente si el orden actual del arreglo coincide al 100% con el orden cronológico original. Si es correcto: Todas las tarjetas se iluminan de verde pastel, los botones de flechas desaparecen y se activa el modal de victoria.
4. Interfaz de Marcadores y Pantalla Final: Encabezado con: Título del tema, Instrucción, Cronómetro activo y Contador de Movimientos (cada toque a una flecha suma 1). Sistema de Calificación (1 a 5): Al finalizar la actividad, el sistema debe calcular una nota numérica de 1.0 a 5.0 basándose en la cantidad de movimientos realizados frente a los movimientos ideales/mínimos calculados. Muestra esta calificación de forma destacada. Modal de Victoria: Al lograr el orden correcto, muestra una pantalla final con confeti (CSS puro), la calificación obtenida, el tiempo total, los movimientos realizados y un botón grande para "Reiniciar juego". Todo el código debe estar comentado en español.`,

    // 11. Etiquetar el Diagrama (Puntos Calientes / Hotspots) (Páginas 14-16)
    etiquetar_diagrama: (tema, nivel, instruccion) => `10. Etiquetar el Diagrama (Puntos Calientes / Hotspots)
TEMA DEL DIAGRAMA: ${tema}
NIVEL EDUCATIVO: ${nivel}
INSTRUCCIÓN: ${instruccion || 'Toca los puntos parpadeantes en el diagrama y selecciona la etiqueta correcta en la lista inferior.'}

Actúa como un desarrollador frontend senior, diseñador UX y experto en diseño instruccional y pedagogía.

FASE 1: GENERACIÓN DE CONTENIDO EDUCATIVO (DIAGRAMA Y ETIQUETAS) A partir del "TEMA DEL DIAGRAMA" y el "NIVEL EDUCATIVO" indicados:
● Define EXACTAMENTE entre 6 y 8 partes estructurales, anatómicas o geográficas clave correspondientes al tema.
● Escribe una lista con los nombres correctos de estas partes.
● Crea un banco de etiquetas que contenga los nombres correctos más 3 o 4 nombres "distractores" o erróneos para aumentar el nivel de análisis.

FASE 2: DESARROLLO DEL INTERACTIVO (ETIQUETAR DIAGRAMA)
● Crea un archivo único e interactivo en formato .html (que integre HTML5, CSS3 y JavaScript vanilla sin librerías externas ni CDNs).

REQUISITOS TÉCNICOS Y FUNCIONALES:
Construcción y Lógica Dinámica:
● Diseña un SVG puro inline dentro del HTML que represente esquemáticamente el tema (no uses URLs de imágenes externas para garantizar que funcione sin conexión). Si es muy complejo, haz una representación geométrica/esquemática clara.
● Dentro o sobre este SVG, ubica los "puntos calientes" (hotspots) en las posiciones correctas.
● Estructura los datos en JavaScript separando la información de los hotspots (id, nombre correcto, estado) y el banco general de etiquetas (nombres correctos + distractores).
Diseño Mobile-First, Responsivo y Estético:
● Usa un fondo de página claro (#f4f6f8). La interfaz debe encajar perfectamente en smartphones (360px a 420px de ancho) sin scroll horizontal.
● Área del Diagrama: El contenedor del SVG debe ser responsivo (usando viewBox).
● Los Hotspots: Deben ser marcadores visuales (ej. círculos con un punto central y un pulso o animación CSS de "parpadeo/respiración") que inviten a ser tocados.
● Menú Selector (Bottom Sheet): Un panel que aparece desde la parte inferior (o se muestra permanentemente abajo) con todas las etiquetas disponibles en forma de botones tipo "chip".
Interacción y Animaciones (Mecánica Táctil Cero Drag & Drop):
● Activar Hotspot: Al tocar un punto parpadeante, este queda "Seleccionado" (cambia de color/borde para indicar enfoque).
● Asignar Etiqueta: Con el punto seleccionado, el usuario toca una etiqueta del menú inferior.
● Validación Inmediata:
● Correcto: El hotspot asume el nombre de la etiqueta visualmente (aparece un pequeño cartel de texto junto a él), se pone verde, deja de parpadear y la etiqueta desaparece del menú inferior.
● Incorrecto: El hotspot se sacude (animación CSS shake), se pone rojo temporalmente, emite un error visual, suma un fallo lógico y vuelve a su estado normal. La etiqueta sigue en el menú.
● Deshacer: No es necesario deshacer si la validación es inmediata, pero el estudiante debe intentar hasta acertar.
Interfaz de Marcadores y Pantalla Final:
● Encabezado con: Título del tema, Instrucción, Cronómetro activo y Contador de Progreso (ej. "Partes etiquetadas: 0 / 6").
● Sistema de Calificación (1 a 5): Al finalizar (cuando todos los hotspots estén etiquetados correctamente), el sistema calcula una nota numérica de 1.0 a 5.0 basándose en los errores cometidos (ej. 0 errores = 5.0, descontando décimas por cada fallo).
● Modal de Victoria: Al completar el diagrama, muestra un modal central con confeti (CSS puro), la calificación final obtenida, el tiempo total, cantidad de errores cometidos y un botón grande para "Reiniciar juego".
● Todo el código debe estar debidamente comentado en español.`,

    // 12. Tarjetas de Deslizamiento (Estilo Tinder / Verdadero o Falso) (Páginas 16-17)
    tarjetas_tinder: (tema, nivel, instruccion) => `11. Tarjetas de Deslizamiento (Estilo Tinder / Verdadero o Falso)
TEMA DE LAS AFIRMACIONES: ${tema}
NIVEL EDUCATIVO: ${nivel}
INSTRUCCIÓN: ${instruccion || 'Lee la afirmación de la tarjeta. Desliza hacia la derecha (o toca "Verdadero") si es correcta, o hacia la izquierda (o toca "Falso") si es incorrecta.'}

Actúa como un desarrollador frontend senior, diseñador UX y experto en diseño instruccional y pedagogía.

FASE 1: GENERACIÓN DE CONTENIDO EDUCATIVO (AFIRMACIONES Y RESPUESTAS) A partir del "TEMA DE LAS AFIRMACIONES" y el "NIVEL EDUCATIVO" indicados:
1. Define EXACTAMENTE entre 8 y 12 afirmaciones cortas y directas relacionadas con el tema.
2. Asegúrate de que aproximadamente la mitad de las afirmaciones sean Verdaderas y la otra mitad sean Falsas.
3. Redacta una muy breve justificación (retroalimentación) de 1 o 2 líneas para cada afirmación, explicando por qué es verdadera o falsa.

FASE 2: DESARROLLO DEL INTERACTIVO (TARJETAS DE DESLIZAMIENTO) Crea un archivo único e interactivo en formato .html (que integre HTML5, CSS3 y JavaScript vanilla sin librerías externas ni CDNs).

REQUISITOS TÉCNICOS Y FUNCIONALES:
Construcción y Lógica Dinámica:
1. Estructura los datos en JavaScript creando un arreglo de objetos (cada objeto debe contener: id, texto de la afirmación, valor correcto [true/false], y justificación).
2. Implementa la lógica de un "mazo de cartas". Si el usuario se equivoca al clasificar una tarjeta, esta debe volver al fondo del mazo para que aparezca nuevamente más tarde. El juego solo termina cuando el mazo se vacía.
3. Mezcla (shuffle) el orden de las tarjetas al inicio de cada partida.

Diseño Mobile-First, Responsivo y Estético:
1. Usa un fondo de página claro (#f4f6f8). La interfaz debe encajar perfectamente en smartphones (360px a 420px de ancho) sin scroll horizontal ni vertical. Oculta el overflow del body.
2. Área del Mazo: En el centro de la pantalla, renderiza la tarjeta superior de forma destacada (con sombras estilo card de Material Design). Debe dar la ilusión visual de que hay más cartas debajo (usando un par de div apilados visualmente detrás).
3. Controles Táctiles (Botones): Debajo del mazo, incluye dos botones circulares grandes: uno rojo con una "X" (o cruz) a la izquierda, y uno verde con un "✓" (o check) a la derecha.

Interacción y Animaciones (Mecánica Swipe y Táctil):
1. Doble Método de Interacción:
○ Gestos (Swipe): Permite hacer drag (arrastrar) la tarjeta central usando eventos touch/mouse. Al soltarla, si superó un umbral a la izquierda, se marca como Falso; a la derecha, como Verdadero. Mientras se arrastra, la tarjeta debe rotar levemente y cambiar su opacidad o mostrar un tinte (verde/rojo) según la dirección.
○ Botones: Al tocar los botones inferiores, la tarjeta debe disparar la misma animación de salida hacia el lado correspondiente.
2. Validación Inmediata:
○ Correcto: La tarjeta sale disparada de la pantalla. Muestra temporalmente (tipo "toast" o cartel rápido) la justificación positiva, se elimina del mazo y aparece la siguiente carta.
○ Incorrecto: La tarjeta sale disparada pero se muestra un feedback rojo de error, suma un fallo lógico, y la tarjeta vuelve a insertarse al final del arreglo del mazo.

Interfaz de Marcadores y Pantalla Final:
1. Encabezado con: Título del tema, Instrucción, Cronómetro activo y Contador de Progreso (ej. "Tarjetas restantes: 8").
2. Sistema de Calificación (1 a 5): Al finalizar (cuando se vacíe el mazo), el sistema calcula una nota numérica de 1.0 a 5.0 basándose en los errores cometidos (ej. 0 errores = 5.0, descontando décimas por cada fallo).
3. Modal de Victoria: Al completar todas las tarjetas, muestra un modal central con confeti (CSS puro), la calificación final obtenida, el tiempo total, cantidad de errores cometidos y un botón grande para "Reiniciar juego".
Todo el código debe estar debidamente comentado en español.`,

    // 13. Misión Rescate (Ahorcado Educativo Moderno) (Páginas 17-19)
    ahorcado: (tema, nivel, instruccion) => `12. Misión Rescate (Ahorcado Educativo Moderno)
TEMA DEL VOCABULARIO: ${tema}
NIVEL EDUCATIVO: ${nivel}
INSTRUCCIÓN: ${instruccion || 'Lee la pista pedagógica y usa el teclado para adivinar la palabra antes de que el escudo de energía se agote por completo.'}

Actúa como un desarrollador frontend senior, diseñador UX y experto en diseño instruccional y pedagogía.

FASE 1: GENERACIÓN DE CONTENIDO EDUCATIVO (PALABRAS Y PISTAS) A partir del "TEMA DEL VOCABULARIO" y el "NIVEL EDUCATIVO" indicados:
● Define EXACTAMENTE entre 6 y 8 palabras clave o conceptos cortos relacionados con el tema. (Evita frases largas; prioriza términos técnicos precisos).
● Redacta una pista pedagógica clara, retadora y descriptiva (1 o 2 líneas) para cada palabra.
● La pista debe fomentar la deducción lógica y el recuerdo de conceptos, no solo ser una simple definición de diccionario.

FASE 2: DESARROLLO DEL INTERACTIVO (AHORCADO TEMÁTICO) Crea un archivo único e interactivo en formato .html (que integre HTML5, CSS3 y JavaScript vanilla sin librerías externas ni CDNs).

REQUISITOS TÉCNICOS Y FUNCIONALES:
Construcción y Lógica Dinámica:
● Estructura los datos en JavaScript creando un arreglo de objetos (cada objeto debe contener: id, palabra, y pista).
● Implementa la lógica de un juego por rondas: el jugador debe adivinar una palabra a la vez. Al adivinarla o fallar por completo, se pasa a la siguiente palabra del arreglo.
● El jugador tiene un máximo de 6 intentos fallidos por palabra.
● Mezcla (shuffle) el orden de las palabras al inicio de cada partida.

Diseño Mobile-First, Responsivo y Estético:
● Usa un fondo de página claro (#f4f6f8). La interfaz debe encajar perfectamente en smartphones (360px a 420px de ancho) sin scroll horizontal.
● Área Temática (Reemplazo del Ahorcado): En lugar del clásico hombre ahorcado, diseña usando CSS puro o SVG inline un elemento temático que represente las "vidas" (ej. un escudo de energía que pierde capas, una batería que se descarga o un cohete que pierde piezas/combustible). Debe actualizarse visualmente con cada error.
● Caja de Pista y Palabra: Muestra la pista pedagógica de forma destacada. Debajo, renderiza casillas o guiones bajos (_) por cada letra de la palabra a adivinar.
● Teclado Virtual: En la parte inferior, diseña un teclado interactivo estilo QWERTY con botones amplios y táctiles.

Interacción y Animaciones (Mecánica Táctil):
● Tocar Letra: Al presionar una tecla en el teclado virtual, esta se desactiva para no volver a ser presionada.
● Validación Inmediata:
○ Acierto: Si la letra está en la palabra, aparece en las casillas correspondientes con una leve animación de aparición (pop). La tecla presionada se pinta de verde.
○ Error: Si la letra no está, el elemento temático visual (batería/escudo) pierde un nivel con una animación de sacudida (shake CSS). La tecla se pinta de gris oscuro o rojo, y se resta un intento.
● Transición de Nivel: Al completar la palabra (éxito) o quedarse sin intentos (fracaso), muestra un mensaje rápido con la palabra correcta y pasa automáticamente al siguiente desafío restaurando las vidas.

Interfaz de Marcadores y Pantalla Final:
● Encabezado con: Título del tema, Instrucción, Cronómetro activo y Contador de Palabras (ej. "Palabra: 2 / 6").
● Sistema de Calificación (1 a 5): Al finalizar todas las palabras, el sistema calcula una nota numérica de 1.0 a 5.0. La máxima nota se otorga si no hubo errores totales o palabras falladas, descontando décimas por cada intento erróneo acumulado durante todo el juego.
● Modal de Victoria/Fin del Juego: Al completar la lista, muestra un modal central con confeti (CSS puro) si la nota es aprobatoria, la calificación final obtenida, el tiempo total, palabras correctas/incorrectas y un botón grande para "Reiniciar juego".
Todo el código debe estar debidamente comentado en español.`,

    // 14. Lluvia de Conceptos (Arcade de Caída) (Páginas 19-20)
    lluvia_conceptos: (tema, nivel, instruccion) => `13. Lluvia de Conceptos (Arcade de Caída)
CATEGORÍA OBJETIVO: ${tema}
NIVEL EDUCATIVO: ${nivel}
INSTRUCCIÓN: ${instruccion || 'Toca y explota solo las palabras que pertenezcan a la categoría indicada antes de que caigan al suelo. ¡No toques las palabras trampa!'}

Actúa como un desarrollador frontend senior, diseñador UX y experto en diseño instruccional y pedagogía.

FASE 1: GENERACIÓN DE CONTENIDO EDUCATIVO (PALABRAS CORRECTAS Y DISTRACTORAS) A partir de la "CATEGORÍA OBJETIVO" y el "NIVEL EDUCATIVO" indicados:
● Define EXACTAMENTE entre 10 y 15 palabras clave cortas que pertenezcan ESTRICTAMENTE a la categoría.
● Define EXACTAMENTE entre 10 y 15 palabras "distractoras" o trampa (conceptos similares o relacionados, pero que NO pertenecen a la categoría, para forzar la discriminación cognitiva).
● Asegúrate de que las palabras sean lo suficientemente cortas para caber en pequeñas etiquetas o "burbujas" en una pantalla móvil.

FASE 2: DESARROLLO DEL INTERACTIVO (LLUVIA DE CONCEPTOS)
● Crea un archivo único e interactivo en formato .html (que integre HTML5, CSS3 y JavaScript vanilla sin librerías externas ni CDNs).

REQUISITOS TÉCNICOS Y FUNCIONALES:
Construcción y Lógica Dinámica:
● Estructura los datos en JavaScript creando un arreglo principal que combine ambos grupos de palabras (cada objeto debe contener: id, texto, y un booleano isCorrect [true/false]).
● Mezcla (shuffle) el arreglo al inicio.
● Implementa un bucle o temporizador (setInterval o requestAnimationFrame) que "genere" periódicamente una palabra en la parte superior de la pantalla, en una posición horizontal aleatoria (X), y la haga caer hacia abajo.

Diseño Mobile-First, Responsivo y Estético:
● Usa un fondo de página claro (#f4f6f8) o un degradado sutil. La interfaz debe encajar perfectamente en smartphones (360px a 420px de ancho). El body debe tener overflow: hidden para que las palabras no generen scroll.
● Panel Superior (Fijo): Un encabezado destacado que muestre siempre la CATEGORÍA OBJETIVO en grande para recordar al jugador qué debe buscar.
● Las Etiquetas (Burbujas/Chips): Las palabras que caen deben verse como botones redondeados (pill-shape) con sombra suave, texto legible y colores neutros al caer.

Interacción y Animaciones (Mecánica Táctil Rápida):
● Animación de Caída: Usa animaciones CSS (@keyframes transform translateY) para que las palabras caigan fluidamente desde top 0 hasta bottom 100vh.
● Tocar una Palabra:
● Acierto (Toca Correcta): La etiqueta detiene su caída, se pinta de verde brillante, hace una animación de "explosión" o "pop" (aumenta escala y baja opacidad a 0) y suma un punto.
● Error (Toca Distractor): La etiqueta se pinta de rojo, hace una vibración (shake), resta un punto (o una "vida") y desaparece.
● Llegar al Fondo de la Pantalla:
● Si era Correcta y se dejó caer: El usuario falló por omisión. Se resta una "vida" o punto y la etiqueta desaparece.
● Si era Distractora y se dejó caer: El usuario hizo bien en ignorarla. Desaparece sin penalización.

Interfaz de Marcadores y Pantalla Final:
● Encabezado superior secundario con: Cronómetro, Puntuación actual y Vidas (ej. 3 corazones o escudos).
● Fin del Juego: El juego termina si el jugador pierde todas sus vidas o si caen todas las palabras del arreglo.
● Sistema de Calificación (1 a 5): Al finalizar, el sistema calcula una nota numérica de 1.0 a 5.0 basándose en los aciertos sobre el total de palabras correctas, descontando por errores (tocar distractores o dejar caer correctas).
● Modal de Victoria/Fin del Juego: Muestra un modal central con confeti (CSS puro) si aprobó, la calificación final, el porcentaje de precisión y un botón grande para "Jugar de nuevo".
● Todo el código debe estar debidamente comentado en español.`,

    // 15. Rompecabezas de Frases (Constructor de Leyes/Definiciones) (Página 21)
    rompecabezas_frases: (tema, nivel, instruccion) => `14. Rompecabezas de Frases (Constructor de Leyes/Definiciones)
TEMA Y/O LEYES A RECONSTRUIR: ${tema}
NIVEL EDUCATIVO: ${nivel}
INSTRUCCIÓN: ${instruccion || 'Toca los bloques de texto en el orden correcto para reconstruir la definición exacta o ley científica.'}

Actúa como un desarrollador frontend senior, diseñador UX y pedagogo conceptual.

FASE 1: GENERACIÓN DE CONTENIDO EDUCATIVO A partir del "TEMA" y el "NIVEL EDUCATIVO" indicados:
● Mecánica: Similar al anagrama, pero en lugar de letras sueltas, se presentan fragmentos de oraciones (bloques de 2 o 3 palabras) desordenados. El estudiante debe tocarlos en el orden correcto para reconstruir una definición exacta, una ley científica o una cita histórica.
● Uso pedagógico: Ayuda a interiorizar definiciones complejas y la estructura lógica de un argumento.
● Define EXACTAMENTE entre 6 y 8 definiciones, leyes científicas, principios o axiomas clave sobre el tema.
● Divide cada enunciado en 3 a 5 bloques sintácticos lógicos (de 2 a 4 palabras cada bloque).

FASE 2: DESARROLLO DEL INTERACTIVO (ROMPECABEZAS DE FRASES)
Crea un archivo único e interactivo en formato .html (que integre HTML5, CSS3 y JavaScript vanilla sin librerías externas ni CDNs).

REQUISITOS TÉCNICOS Y FUNCIONALES:
1. Construcción y Lógica Dinámica:
● Estructura los datos en un arreglo de objetos en JavaScript (id, fraseCompleta, arreglo de bloques en orden correcto).
● Avance por niveles: resuelve una frase a la vez. Al completar una frase correcta, avanza automáticamente a la siguiente.
● Crea una función para desordenar (shuffle) los bloques de la frase activa al cargar cada nivel.
2. Diseño Mobile-First, Responsivo y Estético:
● Fondo claro y moderno (#f4f6f8). Sin scroll horizontal en pantallas de 360px a 420px.
● Zona Superior: Tarjeta con el título temático y el área de ensamblaje (fila o contenedor de bloques colocados).
● Zona Inferior: Contenedor con los bloques desordenados en tarjetas táctiles tipo botón (estilo chips o bloques de construcción) con sombras suaves.
3. Interacción CERO Drag & Drop (Mecánica Tap):
● Tocar un bloque disponible abajo lo traslada automáticamente a la siguiente posición libre en el área de ensamblaje superior.
● Tocar un bloque en el área de ensamblaje lo retira y lo devuelve a las opciones inferiores.
● Validación Automática: Al colocar todos los bloques de la frase, evalúa inmediatamente:
○ Si es correcto: Los bloques brillan en verde pastel con animación de éxito y avanza a la siguiente frase en 1.5s.
○ Si es incorrecto: Los bloques vibran con animación shake CSS en rojo por 0.8s y regresan abajo, sumando un fallo.
4. Interfaz de Marcadores y Pantalla Final:
● Encabezado con: Título del tema, Instrucción, Cronómetro activo y Progreso ("Frase: 1 / 6").
● Sistema de Calificación (1 a 5): Calcula una nota de 1.0 a 5.0 basada en la cantidad de intentos fallidos (ej. 0 fallos = 5.0).
● Modal de Victoria: Al completar todas las frases, muestra un modal con confeti CSS, tiempo total, nota y botón grande para "Reiniciar juego". Todo el código debe estar comentado en español.`,

    // 16. Trivia Contra Reloj (Quiz Show) (Páginas 21-22)
    trivia: (tema, nivel, instruccion) => `15. Trivia Contra Reloj (Estilo Quiz Show)
TEMA DEL CUESTIONARIO: ${tema}
NIVEL EDUCATIVO: ${nivel}
INSTRUCCIÓN: ${instruccion || 'Lee la pregunta y elige la opción correcta antes de que se acabe el tiempo. ¡Responde varias bien seguidas para encender tu racha y multiplicar tus puntos!'}

Actúa como un desarrollador frontend senior, diseñador UX y experto en diseño instruccional y pedagogía.

FASE 1: GENERACIÓN DE CONTENIDO EDUCATIVO (PREGUNTAS Y OPCIONES) A partir del "TEMA DEL CUESTIONARIO" y el "NIVEL EDUCATIVO" indicados:
● Define EXACTAMENTE entre 8 y 10 preguntas claras, retadoras y directas relacionadas con el tema.
● Para cada pregunta, redacta 1 respuesta correcta y 3 respuestas "distractoras" (incorrectas, pero plausibles y comunes para fomentar el análisis profundo).
● Redacta una muy breve justificación de 1 o 2 líneas para mostrarla como retroalimentación rápida indicando por qué es la respuesta correcta.

FASE 2: DESARROLLO DEL INTERACTIVO (TRIVIA MULTIPLICADORA)
● Crea un archivo único e interactivo en formato .html (que integre HTML5, CSS3 y JavaScript vanilla sin librerías externas ni CDNs).

REQUISITOS TÉCNICOS Y FUNCIONALES:
Construcción y Lógica Dinámica:
● Estructura los datos en JavaScript creando un arreglo de objetos (cada objeto debe contener: id, texto de la pregunta, arreglo de 4 opciones, índice de la correcta y la justificación).
● Mezcla (shuffle) el orden de las preguntas al inicio de la partida y mezcla dinámicamente las 4 opciones al renderizar cada pregunta para que nunca estén en la misma posición.
● Temporizador: Implementa un temporizador regresivo estricto (ej. 15 segundos) por cada pregunta.
● Sistema de Racha (Streak): Cada respuesta correcta consecutiva aumenta un multiplicador (x1, x2, x3...). Un error o dejar agotar el tiempo reinicia el multiplicador a x1.

Diseño Mobile-First, Responsivo y Estético:
● Usa un fondo de página claro (#f4f6f8). La interfaz debe encajar perfectamente en smartphones (360px a 420px de ancho) sin scroll.
● Barra de Tiempo: En la parte superior, una barra de progreso horizontal que se vacíe animadamente a medida que pasan los segundos (cambiando a rojo en los últimos 3 segundos).
● Área de Pregunta: Una tarjeta superior destacada con texto grande y legible.
● Opciones de Respuesta: 4 botones muy grandes, con buen espaciado táctil, esquinas redondeadas y colores neutros antes de ser presionados.
● Medidor de Racha: Un indicador visual llamativo (ej. un icono de fuego 🔥 con el número del multiplicador) que reaccione visualmente cuando la racha aumente.

Interacción y Animaciones (Mecánica Táctil):
● Seleccionar Opción: Al tocar un botón, el temporizador se detiene y todos los botones se deshabilitan.
● Validación Inmediata:
● Acierto: El botón tocado se pinta de verde brillante. El medidor de racha hace una animación de escala (pop) y sube el multiplicador. Se suman puntos a la puntuación total (Puntos Base × Multiplicador).
● Error o Tiempo Agotado: El botón tocado se pinta de rojo y hace una vibración (shake CSS). Simultáneamente, la respuesta que SÍ era correcta se pinta de verde para dar feedback instruccional. El multiplicador se rompe (vuelve a x1).
● Transición: Aparece temporalmente la "justificación" y, tras 2.5 segundos, la pantalla hace una transición suave hacia la siguiente pregunta.

Interfaz de Marcadores y Pantalla Final:
● Encabezado secundario con: Puntuación Total, Medidor de Racha actual y Contador de Preguntas (ej. "3 / 10").
● Sistema de Puntos y Calificación: Al finalizar, muestra el puntaje total acumulado (gamificación). Adicionalmente, calcula una nota numérica clásica de 1.0 a 5.0 basada estrictamente en el número de aciertos vs errores.
● Modal de Victoria/Fin: Muestra un modal central con confeti (CSS puro) si aprobó, la puntuación total obtenida, la Racha Máxima alcanzada, la calificación de 1.0 a 5.0, y un botón grande para "Jugar de nuevo".
● Todo el código debe estar debidamente comentado en español.`,

    // 17. Ruleta del Saber (Páginas 22-24)
    ruleta_saber: (tema, nivel, instruccion) => `16. Ruleta del Saber
TEMA PRINCIPAL: ${tema}
NIVEL EDUCATIVO: ${nivel}
INSTRUCCIÓN: ${instruccion || 'Toca el botón para girar la ruleta. Responde preguntas de cada categoría para llenar los medidores. ¡Completa todas las categorías para ganar!'}

Actúa como un desarrollador frontend senior, diseñador UX y experto en diseño instruccional y pedagogía.

FASE 1: GENERACIÓN DE CONTENIDO EDUCATIVO (CATEGORÍAS, PREGUNTAS Y OPCIONES) A partir del "TEMA PRINCIPAL" y el "NIVEL EDUCATIVO" indicados:
1. Define EXACTAMENTE entre 3 y 4 categorías (subtemas) clave derivadas del tema principal.
2. Para cada categoría, redacta EXACTAMENTE entre 4 y 5 preguntas claras y retadoras.
3. Para cada pregunta, redacta 1 respuesta correcta y 3 respuestas "distractoras" (incorrectas, pero plausibles).
4. Redacta una muy breve justificación de 1 o 2 líneas para mostrarla como retroalimentación rápida indicando por qué es la respuesta correcta.

FASE 2: DESARROLLO DEL INTERACTIVO (RULETA DE CATEGORÍAS) Crea un archivo único e interactivo en formato .html (que integre HTML5, CSS3 y JavaScript vanilla sin librerías externas ni CDNs).

REQUISITOS TÉCNICOS Y FUNCIONALES:
Construcción y Lógica Dinámica:
● Estructura los datos en JavaScript creando un arreglo de categorías, donde cada categoría contenga su propio arreglo de objetos de preguntas (id, texto, 4 opciones, índice correcto, justificación).
● Implementa la lógica matemática del giro: al presionar "Girar", calcula un ángulo de rotación aleatorio múltiple de 360 grados más un excedente, determinando mediante cálculo de colisión angular en qué categoría se detiene el puntero.
● Condición de victoria: El estudiante debe lograr un mínimo de aciertos (ej. 2 o 3) en cada una de las categorías. Si cae en una categoría ya completada, puede mostrar un mensaje de "Categoría completa, gira de nuevo" o seleccionar otra automáticamente.
● Mezcla dinámicamente las 4 opciones al renderizar cada pregunta.

Diseño Mobile-First, Responsivo y Estético:
● Usa un fondo de página claro (#f4f6f8). La interfaz debe encajar perfectamente en smartphones (360px a 420px de ancho) sin scroll.
● Área de la Ruleta: Construye la ruleta visualmente usando conic-gradient en CSS puro o un SVG inline. Debe estar dividida equitativamente con colores distintos por categoría y tener un puntero estático en la parte superior. Incluye un botón central o inferior muy visible para "Girar".
● Medidores de Progreso: Debajo de la ruleta, muestra un indicador visual por cada categoría (ej. barras de progreso pequeñas o 3 círculos vacíos) que se irán llenando con los aciertos.
● Modal de Pregunta: Un panel (bottom sheet o modal superpuesto) que aparece cuando la ruleta se detiene, mostrando la pregunta y 4 botones de opciones grandes y táctiles.

Interacción y Animaciones (Mecánica Táctil):
● Animación de Giro: Usa la propiedad CSS transform: rotate con una transición de tiempo (transition: transform 3s cubic-bezier(0.25, 0.1, 0.25, 1)) para simular el impulso y la fricción realista de una ruleta.
● Validación Inmediata: Al seleccionar una opción en el modal de pregunta:
○ Acierto: El botón tocado se pinta de verde. Se suma un punto al medidor de esa categoría con una animación de escala (pop).
○ Error: El botón tocado se pinta de rojo y vibra (shake CSS). La respuesta correcta se ilumina en verde para dar feedback. Se registra el error para el cálculo final.
● Aparece temporalmente la "justificación" en el modal y, tras 2.5 segundos, el modal se cierra regresando a la vista de la ruleta para un nuevo giro.

Interfaz de Marcadores y Pantalla Final:
● Encabezado con: Título del tema y un pequeño contador de errores generales.
● Sistema de Calificación: Al completar todas las categorías, el sistema calcula una nota numérica clásica de 1.0 a 5.0 basándose en los aciertos sobre el total de intentos (incluyendo los errores cometidos a lo largo del juego).
● Modal de Victoria/Fin: Muestra un modal central con confeti (CSS puro) al llenar todos los medidores, la calificación final de 1.0 a 5.0, la cantidad total de giros/errores, y un botón grande para "Reiniciar juego". Todo el código debe estar debidamente comentado en español.`,

    // 18. Criptograma Científico (Mensaje Secreto) (Páginas 24-26)
    criptograma: (tema, nivel, instruccion) => `17. Criptograma Científico (Mensaje Secreto)
TEMA DEL CRIPTOGRAMA: ${tema}
NIVEL EDUCATIVO: ${nivel}
INSTRUCCIÓN: ${instruccion || 'Resuelve las preguntas de conocimiento para decodificar los símbolos y revelar el mensaje secreto paso a paso.'}

Actúa como un desarrollador frontend senior, diseñador UX y experto en diseño instruccional y pedagogía.

FASE 1: GENERACIÓN DE CONTENIDO EDUCATIVO (FRASE SECRETA Y PREGUNTAS) A partir del "TEMA DEL CRIPTOGRAMA" y el "NIVEL EDUCATIVO" indicados:
1. Define EXACTAMENTE 1 frase secreta corta, relevante e inspiradora relacionada con el tema (máximo 4 a 6 palabras para que encaje bien en pantallas móviles).
2. Define EXACTAMENTE entre 3 y 4 preguntas de opción múltiple claras y retadoras sobre el tema.
3. Para cada pregunta, redacta 1 respuesta correcta y 3 respuestas "distractoras" (incorrectas, pero plausibles).
4. Redacta una muy breve justificación de 1 o 2 líneas para mostrarla como retroalimentación tras responder.
5. Asigna a cada pregunta un "lote" de letras de la frase secreta (ej. la Pregunta 1 revelará las vocales, la Pregunta 2 revelará las letras M, S, R, etc.), asegurando que al responder todas las preguntas se revele el 100% del mensaje.

FASE 2: DESARROLLO DEL INTERACTIVO (CRIPTOGRAMA DECODIFICADOR) Crea un archivo único e interactivo en formato .html (que integre HTML5, CSS3 y JavaScript vanilla sin librerías externas ni CDNs).

REQUISITOS TÉCNICOS Y FUNCIONALES:
Construcción y Lógica Dinámica:
● Estructura los datos en JavaScript creando un diccionario/mapa que asigne un símbolo visual único (usando caracteres especiales, emojis monocromáticos o runas unicode como ⌘, 🜁, ⍟, ⎈) a cada letra única de la frase secreta.
● Crea un arreglo de preguntas, donde cada objeto contenga: id, texto, 4 opciones mezcladas dinámicamente, índice correcto, justificación, y el array de letras que esa pregunta desbloquea.
● Lógica de estado: El juego avanza pregunta por pregunta. El estudiante debe acertar la pregunta en pantalla para desbloquear su lote de letras en el criptograma superior antes de pasar a la siguiente.

Diseño Mobile-First, Responsivo y Estético:
● Usa un fondo de página claro (#f4f6f8). La interfaz debe ser compacta para encajar perfectamente en smartphones (360px a 420px de ancho), dividiendo la pantalla en dos zonas principales.
● Zona Superior (El Criptograma): Un contenedor tipo tablero que muestre la frase. Cada letra es una "casilla" (tile). Si la letra está bloqueada, la casilla muestra el símbolo extraño. Si está desbloqueada, muestra la letra real. Los espacios en blanco entre palabras deben respetarse visualmente (sin casillas).
● Zona Inferior (Panel de Preguntas): Una tarjeta destacada que muestra la pregunta actual, un indicador de progreso (ej. "Pregunta 1 de 4") y 4 botones de opciones grandes y táctiles.

Interacción y Animaciones (Mecánica Táctil):
● Validación Inmediata: Al seleccionar una opción:
○ Acierto: El botón se pinta de verde. Se muestra la justificación rápidamente. En la Zona Superior, las casillas correspondientes a las letras desbloqueadas hacen una animación de "volteo" (CSS 3D flip card) o escala, cambiando el símbolo por la letra revelada. Tras 2.5 segundos, aparece la siguiente pregunta.
○ Error: El botón tocado se pinta de rojo y vibra (shake CSS). El estudiante debe intentarlo de nuevo con otra opción (penalizando su calificación final por cada error).
● Animación del Criptograma: Es crucial que la revelación de las letras sea satisfactoria y fluida (ej. usando transition: transform 0.6s; transform-style: preserve-3d;).

Interfaz de Marcadores y Pantalla Final:
● Encabezado con: Título del tema y un pequeño contador de intentos fallidos.
● Condición de Victoria: El juego termina cuando se responden todas las preguntas y, por ende, el mensaje secreto queda 100% revelado y legible.
● Sistema de Calificación: Al finalizar, el sistema calcula una nota numérica clásica de 1.0 a 5.0 basándose en el número mínimo posible de intentos frente a los intentos reales realizados.
● Modal de Victoria/Fin: Muestra un modal central con confeti (CSS puro), la frase secreta destacada con su significado, la calificación final obtenida de 1.0 a 5.0, la cantidad total de errores, y un botón grande para "Jugar de nuevo". Todo el código debe estar debidamente comentado en español.`,

    // 19. Tablero de Pistas (Estilo Jeopardy o Panel de Detectives) (Páginas 26-27)
    tablero_pistas: (tema, nivel, instruccion) => `18. Tablero de Pistas (Estilo Jeopardy o Panel de Detectives)
TEMA DEL TABLERO: ${tema}
NIVEL EDUCATIVO: ${nivel}
INSTRUCCIÓN: ${instruccion || 'Toca una casilla según su valor, lee la pista cuidadosamente y selecciona la respuesta correcta para acumular la mayor cantidad de puntos posibles.'}

Actúa como un desarrollador frontend senior, diseñador UX y experto en diseño instruccional y pedagogía.

FASE 1: GENERACIÓN DE CONTENIDO EDUCATIVO (CATEGORÍAS Y PISTAS) A partir del "TEMA DEL TABLERO" y el "NIVEL EDUCATIVO" indicados:
1. Define EXACTAMENTE entre 3 y 4 categorías (columnas) fundamentales relacionadas con el tema.
2. Para cada categoría, define EXACTAMENTE 3 pistas/preguntas con niveles de dificultad progresiva (ej. 100 puntos para fácil, 200 puntos para intermedio, 300 puntos para difícil).
3. Para cada pista, redacta 1 respuesta correcta y 3 respuestas "distractoras" (incorrectas, pero plausibles). Nota: Usaremos selección múltiple para optimizar la experiencia móvil.
4. Redacta una muy breve justificación de 1 o 2 líneas para mostrarla como retroalimentación tras responder, afianzando el conocimiento.

FASE 2: DESARROLLO DEL INTERACTIVO (TABLERO JEOPARDY) Crea un archivo único e interactivo en formato .html (que integre HTML5, CSS3 y JavaScript vanilla sin librerías externas ni CDNs).

REQUISITOS TÉCNICOS Y FUNCIONALES:
Construcción y Lógica Dinámica:
● Estructura los datos en JavaScript creando un arreglo de categorías. Cada categoría debe contener un arreglo de objetos (pistas), donde cada objeto tenga: id, valor en puntos (100, 200, 300), texto de la pista, 4 opciones mezcladas dinámicamente, índice correcto, justificación, y un booleano isAnswered (iniciado en false).
● Lógica de estado: El sistema debe llevar el registro del "Puntaje Total" del estudiante. Al responder correctamente, se suma el valor de la casilla. Al equivocarse, no suma puntos (o resta la mitad, según decidas) y la casilla queda deshabilitada.

Diseño Mobile-First, Responsivo y Estético:
● Usa un fondo de página claro (#f4f6f8). La interfaz debe encajar en smartphones, pero aprovechando el espacio al máximo. Si es necesario, usa una cuadrícula (CSS Grid) compacta que muestre los encabezados de las categorías en la parte superior y las casillas de puntos debajo.
● Zona del Tablero (Grid): Un contenedor tipo tabla o grid. Los encabezados deben tener el nombre de la categoría. Las "casillas" deben ser botones prominentes mostrando su valor (ej. "100").
● Modal de Pregunta (Overlay): Cuando se toca una casilla, un modal central o de pantalla completa (bottom sheet) se superpone. Debe mostrar: El valor por el que se está jugando, la categoría, la pista a resolver, y 4 botones de opciones grandes y táctiles.

Interacción y Animaciones (Mecánica Táctil):
● Animación del Tablero: Al tocar una casilla en el tablero, esta puede hacer un leve efecto de hundimiento o "volteo" antes de abrir el modal de pregunta.
● Validación Inmediata (En el Modal): Al seleccionar una opción:
○ Acierto: El botón se pinta de verde. Se suma el puntaje al total con una animación (pop numérico). Se muestra la justificación.
○ Error: El botón tocado se pinta de rojo y vibra (shake CSS). Se resalta el correcto en verde.
● Retorno al Tablero: Tras 2.5 segundos de ver la retroalimentación, el modal se cierra. La casilla original en el tablero debe cambiar de estado visual (ej. opacidad reducida, color gris, o mostrar un check "✓") y quedar inactiva.

Interfaz de Marcadores y Pantalla Final:
● Encabezado permanente con: Título del tema y el Puntaje Actual destacado visualmente.
● Condición de Victoria: El juego termina cuando todas las casillas del tablero han sido respondidas (es decir, el tablero entero está inactivo).
● Sistema de Calificación: Al finalizar, el sistema calcula una nota numérica clásica de 1.0 a 5.0 basándose en el porcentaje de puntos obtenidos frente al puntaje máximo posible del tablero.
● Modal de Victoria/Fin: Muestra un modal central con confeti (CSS puro), la calificación final obtenida (1.0 a 5.0), el puntaje total acumulado, un mensaje de felicitación según el rendimiento, y un botón grande para "Jugar de nuevo" que reinicie el tablero y el puntaje. Todo el código debe estar debidamente comentado en español.`,

    // 20. Bingo Pedagógico STEAM (Balotera Digital Proyectable + Generador de 30 Cartones PDF 5x5)
    bingo_steam: (tema, nivel, instruccion) => `Bingo Pedagógico STEAM (Balotera Digital Proyectable + Generador de Cartones 5x5)
TEMA PRINCIPAL: ${tema}
NIVEL EDUCATIVO: ${nivel}
INSTRUCCIÓN: ${instruccion || 'El docente canta la definición analítica y los estudiantes deben deducir y marcar el concepto correspondiente en su cartón 5x5.'}

Actúa como un desarrollador frontend senior, diseñador UX y pedagogo especialista en gamificación STEAM.

FASE 1: GENERACIÓN DE CONTENIDO EDUCATIVO (CONCEPTOS Y DEFINICIONES)
1. Define EXACTAMENTE 25 conceptos clave, términos científicos o principios fundamentales sobre "${tema}".
2. Para cada concepto, redacta una definición pedagógica analítica y profunda (1 o 2 oraciones) que desafíe al estudiante a inferir el concepto sin que la respuesta sea obvia.

FASE 2: DESARROLLO DEL INTERACTIVO EN ARCHIVO ÚNICO .html (HTML5, CSS3 y JS Vanilla sin librerías externas ni CDNs)

REQUISITOS TÉCNICOS Y FUNCIONALES:
1. Estructura y Lógica Dinámica (Balotera Digital en Pantalla - Vista Docente):
   - Escenario interactivo para el docente proyectable en pantalla gigante:
     * Título: "🎯 Gran Bingo Pedagógico STEAM: ${tema}".
     * VISOR CENTRAL DE BALOTERA COGNITIVA: Muestra en tamaño grande y alta legibilidad LA DEFINICIÓN (el concepto permanece oculto para obligar al análisis cognitivo de los estudiantes).
     * BOTÓN MAESTRO DE AVANCE: "⏩ Cantar Siguiente Definición". El juego avanza exclusivamente cuando el docente lo presiona.
     * Panel de historial lateral o inferior que registra cronológicamente los pares ya cantados (concepto y definición) para verificación rápida.
     * Selector de Patrón de Victoria: Cartón Lleno, Cuatro Esquinas, Línea Recta, Letra X, Letra L.
     * Módulo de Celebración Festivo: Banner animado con confeti que grita "¡BINGO STEAM!" al verificarse un ganador, con botón manual de activación docente.

2. GENERADOR MATEMÁTICO DE CARTONES IMPRIMIBLES 5x5 (REQUISITO ESTRICTO):
   - Botón: "📄 Imprimir Cartones PDF".
   - Ejecuta un algoritmo de barajado matemático (Fisher-Yates) que distribuye los 25 conceptos para construir 30 matrices únicas (cartones 5x5) distintas e irrepetibles con casilla central "⭐ STEAM LIBRE".
   - Cada cartón generado dentro de #print-area debe contener:
     * Encabezado: "🎯 BINGO PEDAGÓGICO STEAM — ${tema}".
     * Subtítulo: "Estudiante: _______________________ Grado: ${nivel} • Cartón N.° [1 al 40]".
     * Cuadrícula 5x5 con bordes sólidos y tipografía clara.

3. CSS DE IMPRESIÓN ESTRICTO (@media print):
   - Oculta la interfaz del juego y muestra únicamente #print-area (2 cartones por hoja).
     @media print {
       body > *:not(#print-area) { display: none !important; }
       #print-area { display: block !important; position: absolute; left: 0; top: 0; width: 100%; }
       .carton-bingo { page-break-inside: avoid; break-inside: avoid; border: 2px solid #000; padding: 8px; box-sizing: border-box; width: 48%; display: inline-block; vertical-align: top; margin-bottom: 12px; }
     }

4. Gamificación y Evaluación Formativa:
   - Emisión de postMessage({ tipo: 'juego_completado', victoria: true, xp: 500, calificacion: 5.0 }, '*') al declarar victoria.
   - Evaluación formativa automática (escala 1.0 a 5.0) basada en precisión de aciertos vs errores.`
};

// Aliases para soportar todos los identificadores posibles (con prefijo 'juego_', abreviaciones y nombres exactos)
PROMPTS_JUEGOS['bingo_steam'] = PROMPTS_JUEGOS.bingo_steam;
PROMPTS_JUEGOS['juego_bingo_steam'] = PROMPTS_JUEGOS.bingo_steam;
PROMPTS_JUEGOS['bingo'] = PROMPTS_JUEGOS.bingo_steam;
PROMPTS_JUEGOS['juego_bingo'] = PROMPTS_JUEGOS.bingo_steam;

PROMPTS_JUEGOS['juego_sopa_letras'] = PROMPTS_JUEGOS.sopa_letras;
PROMPTS_JUEGOS['juego_crucigrama'] = PROMPTS_JUEGOS.crucigrama;
PROMPTS_JUEGOS['juego_emparejar'] = PROMPTS_JUEGOS.emparejar;
PROMPTS_JUEGOS['juego_concentrese'] = PROMPTS_JUEGOS.concentrese;
PROMPTS_JUEGOS['juego_laberinto'] = PROMPTS_JUEGOS.laberinto_decisiones;
PROMPTS_JUEGOS['laberinto'] = PROMPTS_JUEGOS.laberinto_decisiones;
PROMPTS_JUEGOS['juego_tap_sort'] = PROMPTS_JUEGOS.tap_sort;
PROMPTS_JUEGOS['clasificador_tapsort'] = PROMPTS_JUEGOS.tap_sort;
PROMPTS_JUEGOS['juego_escape_room'] = PROMPTS_JUEGOS.scape_room;
PROMPTS_JUEGOS['escape_room'] = PROMPTS_JUEGOS.scape_room;
PROMPTS_JUEGOS['juego_completar_parrafo'] = PROMPTS_JUEGOS.completar_parrafo;
PROMPTS_JUEGOS['juego_anagrama'] = PROMPTS_JUEGOS.anagrama;
PROMPTS_JUEGOS['juego_ordenar_secuencias'] = PROMPTS_JUEGOS.ordenar_secuencia;
PROMPTS_JUEGOS['linea_tiempo'] = PROMPTS_JUEGOS.ordenar_secuencia;
PROMPTS_JUEGOS['juego_etiquetar_diagrama'] = PROMPTS_JUEGOS.etiquetar_diagrama;
PROMPTS_JUEGOS['diagrama_hotspots'] = PROMPTS_JUEGOS.etiquetar_diagrama;
PROMPTS_JUEGOS['juego_tarjetas_deslizamiento'] = PROMPTS_JUEGOS.tarjetas_tinder;
PROMPTS_JUEGOS['tarjetas_deslizamiento'] = PROMPTS_JUEGOS.tarjetas_tinder;
PROMPTS_JUEGOS['juego_ahorcado'] = PROMPTS_JUEGOS.ahorcado;
PROMPTS_JUEGOS['mision_rescate'] = PROMPTS_JUEGOS.ahorcado;
PROMPTS_JUEGOS['juego_lluvia_conceptos'] = PROMPTS_JUEGOS.lluvia_conceptos;
PROMPTS_JUEGOS['juego_rompecabezas_frases'] = PROMPTS_JUEGOS.rompecabezas_frases;
PROMPTS_JUEGOS['juego_trivia'] = PROMPTS_JUEGOS.trivia;
PROMPTS_JUEGOS['trivia_reloj'] = PROMPTS_JUEGOS.trivia;
PROMPTS_JUEGOS['juego_ruleta'] = PROMPTS_JUEGOS.ruleta_saber;
PROMPTS_JUEGOS['ruleta'] = PROMPTS_JUEGOS.ruleta_saber;
PROMPTS_JUEGOS['ruleta_saber'] = PROMPTS_JUEGOS.ruleta_saber;
PROMPTS_JUEGOS['juego_criptograma'] = PROMPTS_JUEGOS.criptograma;
PROMPTS_JUEGOS['criptograma_cientifico'] = PROMPTS_JUEGOS.criptograma;
PROMPTS_JUEGOS['juego_jeopardy'] = PROMPTS_JUEGOS.tablero_pistas;
PROMPTS_JUEGOS['jeopardy'] = PROMPTS_JUEGOS.tablero_pistas;
PROMPTS_JUEGOS['memory_cards'] = PROMPTS_JUEGOS.emparejar;
PROMPTS_JUEGOS['duelo_parejas'] = PROMPTS_JUEGOS.emparejar;
PROMPTS_JUEGOS['duelo_emparejamiento'] = PROMPTS_JUEGOS.emparejar;

// 21. Dominó Conceptual de Saberes (Motor PvE Estudiante vs Computadora con 28 Fichas)
PROMPTS_JUEGOS['domino_conceptual'] = (tema, nivel, instruccion) => `Dominó Conceptual de Saberes STEAM (Motor PvE Estudiante vs Computadora con 28 Fichas)
TEMA PRINCIPAL: ${tema}
NIVEL EDUCATIVO: ${nivel}
INSTRUCCIÓN: ${instruccion || 'Juega dominó conectando conceptos científicos con sus definiciones exactas contra la computadora.'}

Actúa como un desarrollador senior de motores de juegos de mesa educativos y especialista pedagógico STEAM.

REGLA DE GENERACIÓN FUNDAMENTAL:
La IA NO debe intentar generar las 28 fichas. En su lugar, debe generar EXACTAMENTE 7 pares ordenados (7 Conceptos y sus 7 Definiciones adaptadas al nivel escolar) sobre "${tema}".
Estas 7 duplas actuarán matemáticamente como los números del 0 al 6 de un dominó tradicional (Doble-6), permitiendo al motor combinatorio de Peidagogos STEAM generar el set estándar completo de 28 fichas únicas (7 para el estudiante, 7 para la computadora y 14 en el pozo).

1. Define EXACTAMENTE 7 conceptos clave, términos científicos o principios fundamentales sobre "${tema}".
2. Para cada concepto, redacta una definición pedagógica analítica y profunda (1 o 2 oraciones) adaptada a grado ${nivel}.
3. Provee la estructura en formato JSON estricto con los 7 pares para alimentar el motor PvE.`;

PROMPTS_JUEGOS['domino'] = PROMPTS_JUEGOS['domino_conceptual'];
PROMPTS_JUEGOS['juego_domino'] = PROMPTS_JUEGOS['domino_conceptual'];
PROMPTS_JUEGOS['juego_domino_conceptual'] = PROMPTS_JUEGOS['domino_conceptual'];

const DIRECTIVAS_UNIVERSALES_STEAM = `
================================================================================
REGLAS UNIVERSALES DE ARQUITECTURA Y CÓDIGO (OBLIGATORIAS PARA TODOS LOS JUEGOS):
1. FORMATO DE ENTREGA ESTRICTO (CERO MARKDOWN):
   - Devuelve ÚNICAMENTE código HTML5 puro que empiece estrictamente con <!DOCTYPE html> y termine con </html>.
   - PROHIBIDO el uso de bloques markdown (NUNCA uses \`\`\`html ni \`\`\` ni texto explicativo antes o después).
   - TODO el CSS debe ir en <style> y todo el JavaScript en <script> en el mismo archivo.
   - CERO dependencias externas ni CDNs (código 100% Vanilla autocontenido, seguro y offline).
2. CONTROL ESTRICTO DE OVERFLOW Y LAYOUT MOBILE-FIRST:
   - Diseño optimizado para pantallas táctiles desde 360px de ancho hasta proyección en aula sin scroll horizontal.
   - Aplica "box-sizing: border-box; margin: 0; padding: 0;" y "overflow-x: hidden;" en html y body.
   - Ningún contenedor inferior (footer, badges, botones, barras o teclados) debe tener position: fixed o absolute que cubra, tape o mutile el tablero o contenido de juego superior.
3. GAMIFICACIÓN, CALIFICACIÓN (1.0 A 5.0) Y TRANSMISIÓN DE XP:
   - Al finalizar o ganar la partida, el juego debe calcular una calificación numérica de 1.0 a 5.0 y desplegar un modal de victoria con confeti CSS y botón de "Reiniciar juego".
   - OBLIGATORIO: En el momento de la victoria, el JavaScript del juego DEBE emitir el evento postMessage hacia la plataforma principal para acreditar los puntos:
     try {
       if (window.parent && window.parent !== window) {
         window.parent.postMessage({ tipo: 'juego_completado', victoria: true, xp: 250 }, '*');
       }
     } catch (e) {}
================================================================================
`;

function obtenerPromptJuego(tipoJuego, tema, nivel, instruccion) {
    const key = String(tipoJuego || '').trim().toLowerCase();
    const generator = PROMPTS_JUEGOS[key] || PROMPTS_JUEGOS['sopa_letras'];
    const t = tema || 'Conceptos clave de la temática';
    const n = nivel || 'Estudiantes de secundaria, grados 6 a 11';
    const i = instruccion || 'Resuelve la actividad interactiva analizando cuidadosamente cada concepto.';
    const promptBase = typeof generator === 'function' ? generator(t, n, i) : String(generator);
    return `${promptBase}\n\n${DIRECTIVAS_UNIVERSALES_STEAM}`;
}

function obtenerPromptJsonEmparejamiento(tema, nivel, instruccion) {
    const t = tema || 'Conceptos clave de la temática';
    const n = nivel || 'Estudiantes de secundaria, grados 6 a 11';
    const i = instruccion || 'Toca un concepto en la columna izquierda y luego su definición correspondiente en la derecha para emparejarlos.';
    return `Actúa como un Arquitecto de Software Educativo y Especialista en Pedagogía Conceptual del MEN Colombia.
Genera EXACTAMENTE entre 8 y 10 pares de Conceptos y Definiciones adaptados rigurosamente al nivel educativo: "${n}".
TEMA Y/O PALABRAS CLAVE: "${t}"
INSTRUCCIÓN: "${i}"

Devuelve ÚNICAMENTE un objeto JSON estricto procesable directamente por el frontend (sin bloques markdown, sin explicaciones fuera del JSON):
{
  "titulo": "Duelo de Emparejamiento: ${t}",
  "tipo_herramienta": "emparejar",
  "tema": "${t}",
  "nivel": "${n}",
  "instruccion": "${i}",
  "pares": [
    {"izquierda": "Concepto 1", "derecha": "Definición pedagógica adaptada 1"},
    {"izquierda": "Concepto 2", "derecha": "Definición pedagógica adaptada 2"},
    {"izquierda": "Concepto 3", "derecha": "Definición pedagógica adaptada 3"},
    {"izquierda": "Concepto 4", "derecha": "Definición pedagógica adaptada 4"},
    {"izquierda": "Concepto 5", "derecha": "Definición pedagógica adaptada 5"},
    {"izquierda": "Concepto 6", "derecha": "Definición pedagógica adaptada 6"},
    {"izquierda": "Concepto 7", "derecha": "Definición pedagógica adaptada 7"},
    {"izquierda": "Concepto 8", "derecha": "Definición pedagógica adaptada 8"}
  ]
}`;
}

function obtenerPromptJsonBingo(tema, nivel, instruccion) {
    const t = tema || 'Conceptos Fundamentales STEAM';
    const n = nivel || 'Secundaria / Bachillerato';
    const i = instruccion || 'Deduce el concepto a partir de la definición y márcalo en tu cartón.';
    return `Actúa como especialista pedagógico en evaluación socioformativa y gamificación educativa STEAM.
Tu tarea es generar un objeto JSON estricto (SIN bloques markdown, SIN texto antes ni después) que contenga EXACTAMENTE 25 pares ordenados de conceptos y definiciones sobre "${t}" adaptados a nivel ${n} para un Bingo Pedagógico STEAM con cuadrícula de 5x5.

REGLAS PEDAGÓGICAS ESTRICTAS:
1. "pares" debe contener exactamente 25 objetos.
2. "concepto": Término clave corto (1 a 3 palabras).
3. "definicion": Definición analítica y conceptual profunda (1 o 2 oraciones) que desafíe al estudiante a inferir el término sin que aparezca la palabra en la definición.

ESTRUCTURA JSON EXACTA OBLIGATORIA:
{
  "tema": "${t}",
  "nivel": "${n}",
  "instruccion": "${i}",
  "pares": [
    {"concepto": "Concepto 1", "definicion": "Definición analítica pedagógica 1..."},
    {"concepto": "Concepto 2", "definicion": "Definición analítica pedagógica 2..."},
    {"concepto": "Concepto 3", "definicion": "Definición analítica pedagógica 3..."},
    {"concepto": "Concepto 4", "definicion": "Definición analítica pedagógica 4..."},
    {"concepto": "Concepto 5", "definicion": "Definición analítica pedagógica 5..."},
    {"concepto": "Concepto 6", "definicion": "Definición analítica pedagógica 6..."},
    {"concepto": "Concepto 7", "definicion": "Definición analítica pedagógica 7..."},
    {"concepto": "Concepto 8", "definicion": "Definición analítica pedagógica 8..."},
    {"concepto": "Concepto 9", "definicion": "Definición analítica pedagógica 9..."},
    {"concepto": "Concepto 10", "definicion": "Definición analítica pedagógica 10..."},
    {"concepto": "Concepto 11", "definicion": "Definición analítica pedagógica 11..."},
    {"concepto": "Concepto 12", "definicion": "Definición analítica pedagógica 12..."},
    {"concepto": "Concepto 13", "definicion": "Definición analítica pedagógica 13..."},
    {"concepto": "Concepto 14", "definicion": "Definición analítica pedagógica 14..."},
    {"concepto": "Concepto 15", "definicion": "Definición analítica pedagógica 15..."},
    {"concepto": "Concepto 16", "definicion": "Definición analítica pedagógica 16..."},
    {"concepto": "Concepto 17", "definicion": "Definición analítica pedagógica 17..."},
    {"concepto": "Concepto 18", "definicion": "Definición analítica pedagógica 18..."},
    {"concepto": "Concepto 19", "definicion": "Definición analítica pedagógica 19..."},
    {"concepto": "Concepto 20", "definicion": "Definición analítica pedagógica 20..."},
    {"concepto": "Concepto 21", "definicion": "Definición analítica pedagógica 21..."},
    {"concepto": "Concepto 22", "definicion": "Definición analítica pedagógica 22..."},
    {"concepto": "Concepto 23", "definicion": "Definición analítica pedagógica 23..."},
    {"concepto": "Concepto 24", "definicion": "Definición analítica pedagógica 24..."},
    {"concepto": "Concepto 25", "definicion": "Definición analítica pedagógica 25..."}
  ]
}`;
}

function obtenerPromptJsonDomino(tema, nivel, instruccion) {
    const t = tema || 'Conceptos Fundamentales STEAM';
    const n = nivel || 'Educación Básica/Media';
    const i = instruccion || 'Juega dominó conectando conceptos con sus definiciones en el tablero contra la IA.';
    return `Actúa como especialista pedagógico en evaluación socioformativa y gamificación educativa STEAM.
Tu tarea es generar un objeto JSON estricto (SIN bloques markdown, SIN texto antes ni después) que contenga EXACTAMENTE 7 pares ordenados de conceptos y definiciones sobre "${t}" adaptados a nivel ${n} para alimentar un motor de juego de Dominó Conceptual PvE de 28 fichas (Doble-6).

REGLAS PEDAGÓGICAS ESTRICTAS:
1. "pares" debe contener EXACTAMENTE 7 objetos (representando los valores del 0 al 6 del dominó).
2. "concepto": Término clave corto (1 a 3 palabras).
3. "definicion": Definición analítica y conceptual adaptada al nivel escolar (1 oración clara).

ESTRUCTURA JSON EXACTA OBLIGATORIA:
{
  "tema": "${t}",
  "nivel": "${n}",
  "instruccion": "${i}",
  "pares": [
    {"concepto": "Concepto 0", "definicion": "Definición conceptual pedagógica 0..."},
    {"concepto": "Concepto 1", "definicion": "Definición conceptual pedagógica 1..."},
    {"concepto": "Concepto 2", "definicion": "Definición conceptual pedagógica 2..."},
    {"concepto": "Concepto 3", "definicion": "Definición conceptual pedagógica 3..."},
    {"concepto": "Concepto 4", "definicion": "Definición conceptual pedagógica 4..."},
    {"concepto": "Concepto 5", "definicion": "Definición conceptual pedagógica 5..."},
    {"concepto": "Concepto 6", "definicion": "Definición conceptual pedagógica 6..."}
  ]
}`;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PROMPTS_JUEGOS, obtenerPromptJuego, obtenerPromptJsonEmparejamiento, obtenerPromptJsonBingo, obtenerPromptJsonDomino };
}
if (typeof window !== 'undefined') {
    window.PROMPTS_JUEGOS = PROMPTS_JUEGOS;
    window.obtenerPromptJuego = obtenerPromptJuego;
    window.obtenerPromptJsonEmparejamiento = obtenerPromptJsonEmparejamiento;
    window.obtenerPromptJsonBingo = obtenerPromptJsonBingo;
    window.obtenerPromptJsonDomino = obtenerPromptJsonDomino;
}
