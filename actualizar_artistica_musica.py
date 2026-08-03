import json

with open("proyectorData.json", "r", encoding="utf-8") as f:
    db = json.load(f)

# Definición pedagógica de las 8 semanas de Música (Educación Artística)
musica_semanas = {
    "1": [
        [
            {
                "title": "Música: Taller de Ritmo y Pulso",
                "sub": "1/6 - Preparación y Bitácora Sonora",
                "content": "📅 <b>Fecha:</b> Hoy<br>📌 <b>Título:</b> 'El Pulso Musical y la Percusión Corporal'<br>🎯 <b>Meta:</b> Sentir, mantener y representar el pulso constante de la música usando nuestro cuerpo como instrumento.",
                "icon": "ph-music-notes",
                "timer": 120,
                "customHtml": ""
            },
            {
                "title": "Concepto Clave: Pulso vs. Acento",
                "sub": "2/6 - Fundamentos del Ritmo",
                "content": "<b>Ideas Fundamentales:</b><br>1. <b>El Pulso:</b> Es el latido constante e invisible de la música (como los latidos del corazón).<br>2. <b>El Acento:</b> Es el golpe con mayor fuerza o énfasis que ordena los tiempos (ej. ¡UN-dos-tres-cuatro!).<br>3. <b>Percusión Corporal:</b> Palmas (agudo), Pecho (grave), Muslos y Pies (base).",
                "icon": "ph-heartbeat",
                "timer": 180,
                "customHtml": ""
            },
            {
                "title": "Simulador Interactivo de Pulso (Nivel 1)",
                "sub": "3/6 - Sigue el compás en pantalla",
                "content": "Sigue la secuencia de golpes proyectada. Sincroniza tus palmas (Rojo) y el golpe en la mesa (Azul) al compás exacto:",
                "icon": "ph-hand-clapping",
                "timer": 240,
                "customHtml": "<div class=\"rhythm-container\" style=\"display:flex; justify-content:center; gap:25px; margin:20px 0;\"><div id=\"pad-1\" class=\"rhythm-pad\" style=\"width:120px; height:120px; border-radius:50%; background:#F1F5F9; border:4px solid #CBD5E1; display:flex; justify-content:center; align-items:center; font-size:2.5rem; color:#475569;\"><i class=\"ph ph-hand-clapping\"></i></div><div id=\"pad-2\" class=\"rhythm-pad\" style=\"width:120px; height:120px; border-radius:50%; background:#F1F5F9; border:4px solid #CBD5E1; display:flex; justify-content:center; align-items:center; font-size:2.5rem; color:#475569;\"><i class=\"ph ph-hand-pointing\"></i></div></div><div style=\"text-align:center;\"><button class=\"btn-nav\" onclick=\"startRhythm(1)\" style=\"background:#3B82F6; color:white; padding:10px 20px; border-radius:10px; font-weight:bold; cursor:pointer;\">▶ Iniciar Simulador de Pulso 4/4</button></div>"
            },
            {
                "title": "⏱️ Reto en tu Cuaderno: Partitura de Colores",
                "sub": "4/6 - Creación de Código Rítmico",
                "content": "<b>Actividad en tu cuaderno:</b><br>Dibuja una tira de <b>8 casillas</b> (pulsos). Llena cada casilla con:<br>• 🔴 <b>Círculo Rojo:</b> Aplauso fuerte.<br>• 🔵 <b>Círculo Azul:</b> Golpe suave en la mesa.<br>• 🟡 <b>Círculo Amarillo:</b> Silencio absoluto (un segundo sin sonido).<br><br>✍️ <i>¡Crea tu propia secuencia rítmica original de 8 tiempos y enciérrala en un recuadro!</i>",
                "icon": "ph-pencil-line",
                "timer": 300,
                "customHtml": "<div style='background:#FEF3C7; border:1px solid #FDE68A; border-radius:8px; padding:10px; font-size:0.9rem; color:#92400E;'>⏱️ Tienes 5 minutos para diseñar tu partitura rítmica.</div>"
            },
            {
                "title": "Ensamble en Parejas: Interpretación Cruzada",
                "sub": "5/6 - Trabajo Colaborativo",
                "content": "Gírate con tu compañero de al lado:<br>1. Intercambien sus cuadernos y lean la partitura de colores del otro.<br>2. Toquen juntos ambas secuencias en bucle sincronizado.<br>3. ¿Lograron mantener el mismo tempo sin acelerarse?",
                "icon": "ph-users-three",
                "timer": 240,
                "customHtml": ""
            },
            {
                "title": "Conclusión y Evaluación Sonora",
                "sub": "6/6 - Firma de Avance",
                "content": "✔️ <b>Logro:</b> Comprensión del pulso musical, el acento y la notación rítmica alternativa.<br>✔️ <b>Reflexión:</b> <i>'El silencio en la música no es la ausencia de sonido, es la respiración que le da sentido al ritmo.'</i><br><br>🌟 ¡Firma tu partitura en el cuaderno!",
                "icon": "ph-check-circle",
                "timer": 120,
                "customHtml": ""
            }
        ]
    ],
    "2": [
        [
            {
                "title": "Figuras Musicales y Notación Rítmica",
                "sub": "1/6 - Del Sonido al Pentagrama",
                "content": "📅 <b>Fecha:</b> Hoy<br>📌 <b>Título:</b> 'Figuras Musicales: Negra, Corcheas y Silencio'<br>🎯 <b>Meta:</b> Leer, escribir y percutir figuras de duración rítmica convencional.",
                "icon": "ph-music-notes",
                "timer": 120,
                "customHtml": ""
            },
            {
                "title": "Las Figuras y sus Equivalencias",
                "sub": "2/6 - Sistema Métrico Musical",
                "content": "<b>Código Rítmico Universal:</b><br>• 𝅘𝅥 <b>Negra (Ta):</b> Dura <b>1 pulso</b> (1 tiempo entero).<br>• 𝅘𝅥𝅮𝅘𝅥𝅮 <b>Dos Corcheas (Ti-Ti):</b> Entran <b>2 sonidos iguales en 1 solo pulso</b>.<br>• 𝄽 <b>Silencio de Negra (Shh):</b> <b>1 pulso</b> de silencio absoluto.<br>• 𝅗𝅥 <b>Blanca (Taa-aa):</b> Dura <b>2 pulsos</b> completos.",
                "icon": "ph-scales",
                "timer": 180,
                "customHtml": ""
            },
            {
                "title": "Lectura de Partitura Interactiva",
                "sub": "3/6 - Lectura rítmica a primera vista",
                "content": "Mira el pentagrama proyectado abajo. Vamos a solfearlo juntos: primero diciendo las sílabas (Ta, Ti-Ti, Shh) y luego dando palmas:",
                "icon": "ph-article",
                "timer": 240,
                "customHtml": "<div class=\"abc-music\" style=\"background:white; padding:15px; border-radius:12px; border:2px solid #E2E8F0; margin:15px auto; max-width:550px;\">X:1\nT:Estudio Rítmico de Negras y Corcheas\nM:4/4\nL:1/4\nK:C\nC C C C | c/c/c/c/ c/c/c/c/ | C z C z | c/c/c/c/ C2 |]</div>"
            },
            {
                "title": "⏱️ Reto en tu Cuaderno: Dictado Rítmico",
                "sub": "4/6 - Escritura Musical",
                "content": "<b>Misión en tu cuaderno:</b><br>Dibuja <b>4 compases de 4/4</b> separados por líneas divisorias. Escribe en cada compás una combinación que sume exactamente 4 tiempos:<br>• Compás 1: 4 Negras.<br>• Compás 2: 2 parejas de Corcheas y 2 Negras.<br>• Compás 3: 1 Negra, 1 Silencio, 2 Corcheas, 1 Negra.<br>• Compás 4: 2 Blancas.<br><br>✍️ <i>Escribe debajo de cada figura su sílaba correspondiente (Ta, Ti-ti, Shh).</i>",
                "icon": "ph-pencil-line",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Interpretación Colectiva por Filas",
                "sub": "5/6 - Polirritmia en el Aula",
                "content": "Dividimos el salón en dos bandos:<br>• <b>Fila Izquierda:</b> Percute en bucle el Compás 1 (Puras Negras marcando el pulso).<br>• <b>Fila Derecha:</b> Percute el Compás 2 (Corcheas a doble velocidad).<br>¡Escuchen cómo se entrelazan ambos ritmos!",
                "icon": "ph-users",
                "timer": 200,
                "customHtml": ""
            },
            {
                "title": "Cierre y Evaluación de Precisión",
                "sub": "6/6 - Conclusión",
                "content": "✔️ <b>Logro:</b> Lectura fluida de figuras rítmicas básicas y noción de compás de 4/4.<br>✔️ <b>Evidencia:</b> 4 compases métricamente correctos y firmados.<br><br>🌟 ¡Gran avance en la lectoescritura musical!",
                "icon": "ph-check-circle",
                "timer": 120,
                "customHtml": ""
            }
        ]
    ],
    "3": [
        [
            {
                "title": "La Altura y la Escala de Do Mayor",
                "sub": "1/6 - De lo Grave a lo Agudo",
                "content": "📅 <b>Fecha:</b> Hoy<br>📌 <b>Título:</b> 'La Altura del Sonido y la Escala Diatónica'<br>🎯 <b>Meta:</b> Reconocer auditivamente los tonos graves y agudos, y ubicar las 7 notas en el pentagrama con Clave de Sol.",
                "icon": "ph-music-notes-plus",
                "timer": 120,
                "customHtml": ""
            },
            {
                "title": "Concepto Clave: ¿Cómo viaja la Altura?",
                "sub": "2/6 - Frecuencia y Notas Musicales",
                "content": "<b>Fundamentos Físico-Musicales:</b><br>• <b>Sonido Grave:</b> Vibración lenta (frecuencia baja, notas hacia abajo del pentagrama).<br>• <b>Sonido Agudo:</b> Vibración rápida (frecuencia alta, notas hacia arriba).<br>• <b>Las 7 Notas Naturales:</b> DO - RE - MI - FA - SOL - LA - SI (y el DO agudo que corona la escala).",
                "icon": "ph-wave-sine",
                "timer": 180,
                "customHtml": ""
            },
            {
                "title": "Partitura: Escala de Do Mayor en Pentagrama",
                "sub": "3/6 - Visualización Sonora con ABCjs",
                "content": "Observa cómo cada nota sube peldaño a peldaño desde la línea adicional inferior hasta el tercer espacio:",
                "icon": "ph-chart-line-up",
                "timer": 240,
                "customHtml": "<div class=\"abc-music\" style=\"background:white; padding:15px; border-radius:12px; border:2px solid #E2E8F0; margin:15px auto; max-width:550px;\">X:1\nT:Escala de Do Mayor Ascendente y Descendente\nM:4/4\nL:1/4\nK:C\nC D E F | G A B c | c B A G | F E D C |]</div>"
            },
            {
                "title": "⏱️ Reto en tu Cuaderno: Dibuja tu Pentagrama",
                "sub": "4/6 - Trazado y Caligrafía Musical",
                "content": "<b>Instrucciones precisas:</b><br>1. Traza con tu regla <b>5 líneas horizontales paralelas</b> (el pentagrama).<br>2. Dibuja al inicio la <b>Clave de Sol</b> (comenzando desde la 2ª línea).<br>3. Dibuja las 8 cabezas de nota en orden ascendente (Do, Re, Mi, Fa, Sol, La, Si, Do) y escribe su nombre debajo de cada una.<br><br>✍️ <i>¡Usa lápiz para las notas y colores para encerrar el Do grave y el Do agudo!</i>",
                "icon": "ph-pencil-line",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Solfeo Cantado Colectivo",
                "sub": "5/6 - Entonación y Memoria Auditiva",
                "content": "Todos de pie con postura erguida:<br>1. El profesor canta el tono base 'DOOO'.<br>2. La clase sube la escalera nota por nota cantando: 'DO - RE - MI - FA - SOL - LA - SI - DO'.<br>3. Ahora bajamos en reversa sin perder la afinación.",
                "icon": "ph-microphone",
                "timer": 240,
                "customHtml": ""
            },
            {
                "title": "Cierre: La Brújula del Oído",
                "sub": "6/6 - Conclusión",
                "content": "✔️ <b>Logro:</b> Identificación de alturas tonales y trazado correcto del pentagrama en Clave de Sol.<br>✔️ <b>Evidencia:</b> Pentagrama dibujado con las 8 notas rotuladas.<br><br>🌟 ¡Tu oído musical se está afinando!",
                "icon": "ph-check-circle",
                "timer": 120,
                "customHtml": ""
            }
        ]
    ],
    "4": [
        [
            {
                "title": "Melodía y Canción: Lectura y Canto",
                "sub": "1/6 - Construyendo Frases Musicales",
                "content": "📅 <b>Fecha:</b> Hoy<br>📌 <b>Título:</b> 'La Estructura Melódica: Lectura de Canciones'<br>🎯 <b>Meta:</b> Integrar ritmo y altura para interpretar una canción tradicional en la partitura.",
                "icon": "ph-music-notes",
                "timer": 120,
                "customHtml": ""
            },
            {
                "title": "¿Qué hace memorable a una Melodía?",
                "sub": "2/6 - Anatomía de la Canción",
                "content": "<b>Conceptos de Composición:</b><br>• <b>Frase Musical:</b> Una idea musical con principio y fin (como una oración en un texto).<br>• <b>Pregunta y Respuesta:</b> La primera frase deja tensión en el aire y la segunda resuelve al tono de reposo (Do).<br>• <b>El Texto y la Música:</b> Cómo las sílabas coinciden con los acentos del compás.",
                "icon": "ph-lightbulb",
                "timer": 180,
                "customHtml": ""
            },
            {
                "title": "Partitura: Melodía 'Estrellita' (Tema Universal)",
                "sub": "3/6 - Lectura de Obra Completa",
                "content": "Lee la partitura a continuación. Fíjate cómo las notas saltan de Do a Sol y luego descienden paso a paso:",
                "icon": "ph-star",
                "timer": 240,
                "customHtml": "<div class=\"abc-music\" style=\"background:white; padding:15px; border-radius:12px; border:2px solid #E2E8F0; margin:15px auto; max-width:550px;\">X:1\nT:Estrellita Dónde Estás (Melodía de Mozart)\nM:4/4\nL:1/4\nK:C\nC C G G | A A G2 | F F E E | D D C2 |\nG G F F | E E D2 | G G F F | E E D2 |\nC C G G | A A G2 | F F E E | D D C2 |]</div>"
            },
            {
                "title": "⏱️ Reto en tu Cuaderno: Análisis de la Partitura",
                "sub": "4/6 - Ejercicio de Lectoescritura",
                "content": "<b>Preguntas para responder en tu cuaderno:</b><br>1. ¿Cuántos compases en total tiene la canción?<br>2. Escribe la secuencia de las primeras 7 notas del tema.<br>3. ¿Qué figura musical está al final del segundo compás (en la nota Sol con el número 2)?<br>4. Inventa una letra de 2 versos que rimen para cantarla sobre esa melodía.<br><br>✍️ <i>¡Responde con letra legible y encierra tu letra inventada!</i>",
                "icon": "ph-pencil-line",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Ensamble Vocal e Instrumental del Aula",
                "sub": "5/6 - Concierto en Vivo",
                "content": "Organizaremos dos grupos simultáneos:<br>• <b>Grupo 1 (Voz):</b> Cantan la melodía con afinación.<br>• <b>Grupo 2 (Percusión Corporal):</b> Acompañan marcando negras en los muslos.<br>¡Logremos que suene afinado y con ritmo exacto!",
                "icon": "ph-users-three",
                "timer": 240,
                "customHtml": ""
            },
            {
                "title": "Cierre: La Belleza de la Armonía",
                "sub": "6/6 - Conclusión",
                "content": "✔️ <b>Logro:</b> Interpretación y análisis de una melodía clásica en partitura formal.<br>✔️ <b>Evidencia:</b> Análisis de partitura y letra adaptada en el cuaderno.<br><br>🌟 ¡Felicitaciones a los músicos de la clase!",
                "icon": "ph-check-circle",
                "timer": 120,
                "customHtml": ""
            }
        ]
    ],
    "5": [
        [
            {
                "title": "Polirritmia y Coordinación Avanzada",
                "sub": "1/6 - Independencia Motriz",
                "content": "📅 <b>Fecha:</b> Hoy<br>📌 <b>Título:</b> 'Polirritmia: Disociación de Manos y Polimetría'<br>🎯 <b>Meta:</b> Ejecutar dos patrones rítmicos simultáneos con diferente acentuación e independencia de extremidades.",
                "icon": "ph-lightning",
                "timer": 120,
                "customHtml": ""
            },
            {
                "title": "¿Qué es la Polirritmia y dónde se usa?",
                "sub": "2/6 - Riqueza Rítmica del Mundo",
                "content": "<b>Fundamentos de Ritmos Complejos:</b><br>• <b>Polirritmia:</b> Superposición de dos o más ritmos independientes sonando a la vez.<br>• <b>Tradición Afrocolombiana e Indígena:</b> En la Cumbia, el Currulao y el Bullerengue, el tambor alegre, el llamador y las maracas tocan ritmos cruzados.<br>• <b>El Secreto:</b> No pensar en dos cosas separadas, sino en el 'engranaje' sonoro que forman juntas.",
                "icon": "ph-brain",
                "timer": 180,
                "customHtml": ""
            },
            {
                "title": "Simulador de Polirritmia (Nivel 2 - 3 Pads)",
                "sub": "3/6 - Desafío a doble velocidad",
                "content": "Sigue este reto de 3 tiempos asimétricos proyectados en pantalla. Concéntrate en el cambio de color:",
                "icon": "ph-game-controller",
                "timer": 240,
                "customHtml": "<div class=\"rhythm-container\" style=\"display:flex; justify-content:center; gap:20px; margin:20px 0;\"><div id=\"pad-3\" class=\"rhythm-pad\" style=\"width:100px; height:100px; border-radius:50%; background:#F1F5F9; border:4px solid #CBD5E1; display:flex; justify-content:center; align-items:center; font-size:2.2rem; color:#475569;\"><i class=\"ph ph-hand-clapping\"></i></div><div id=\"pad-4\" class=\"rhythm-pad\" style=\"width:100px; height:100px; border-radius:50%; background:#F1F5F9; border:4px solid #CBD5E1; display:flex; justify-content:center; align-items:center; font-size:2.2rem; color:#475569;\"><i class=\"ph ph-hand-pointing\"></i></div><div id=\"pad-5\" class=\"rhythm-pad\" style=\"width:100px; height:100px; border-radius:50%; background:#F1F5F9; border:4px solid #CBD5E1; display:flex; justify-content:center; align-items:center; font-size:2.2rem; color:#475569;\"><i class=\"ph ph-hands-clapping\"></i></div></div><div style=\"text-align:center;\"><button class=\"btn-nav\" onclick=\"startRhythm(2)\" style=\"background:#DC2626; color:white; padding:10px 20px; border-radius:10px; font-weight:bold; cursor:pointer;\">▶ Iniciar Simulador Nivel 2 (Polirritmia Rápida)</button></div>"
            },
            {
                "title": "⏱️ Reto en tu Cuaderno: Matriz de 2 Pistas",
                "sub": "4/6 - Esquema de Coordinación",
                "content": "<b>Dibuja en tu cuaderno una tabla de 2 filas y 8 columnas:</b><br>• <b>Fila 1 (Mano Izquierda):</b> Escribe 'GOLPE' en las columnas 1, 3, 5, 7 (Pulso a tierra).<br>• <b>Fila 2 (Mano Derecha):</b> Escribe 'GOLPE' en las columnas 2, 4, 6, 8 (Contratiempo).<br><br>✍️ <i>¡Practica sobre la mesa haciendo sonar la izquierda y luego la derecha en alternancia perfecta!</i>",
                "icon": "ph-pencil-line",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Batucada de Aula por Secciones",
                "sub": "5/6 - Práctica de Ensamble",
                "content": "Dividimos el salón en 3 secciones rítmicas:<br>• <b>Sección 1 (Pies):</b> Marcan el tiempo fuerte (Tum).<br>• <b>Sección 2 (Palmas):</b> Marcan el contratiempo (Cha).<br>• <b>Sección 3 (Chasquidos o Lápiz en el pupitre):</b> Marcan tresillos continuos.<br>¡Que empiece la fiesta del ritmo!",
                "icon": "ph-users-three",
                "timer": 240,
                "customHtml": ""
            },
            {
                "title": "Cierre: Plasticidad y Concentración",
                "sub": "6/6 - Conclusión",
                "content": "✔️ <b>Logro:</b> Disociación de hemisferios corporales y ejecución de patrones polirrítmicos.<br>✔️ <b>Evidencia:</b> Matriz rítmica de 2 pistas ejecutada y evaluada.<br><br>🌟 ¡Dominaste uno de los retos más exigentes de la música!",
                "icon": "ph-check-circle",
                "timer": 120,
                "customHtml": ""
            }
        ]
    ],
    "6": [
        [
            {
                "title": "El Timbre y las Familias de Instrumentos",
                "sub": "1/6 - La Personalidad del Sonido",
                "content": "📅 <b>Fecha:</b> Hoy<br>📌 <b>Título:</b> 'El Timbre y la Organología Musical'<br>🎯 <b>Meta:</b> Clasificar los instrumentos musicales por sus familias acústicas y diseñar un cotidiáfono.",
                "icon": "ph-music-notes",
                "timer": 120,
                "customHtml": ""
            },
            {
                "title": "¿Por qué cada instrumento suena único?",
                "sub": "2/6 - Acústica y Materiales",
                "content": "<b>Las 4 Grandes Familias Instrumentales:</b><br>• 🎻 <b>Cuerdas (Cordófonos):</b> Frotadas (Violín), Pulsadas (Guitarra, Tiple, Arpa), Percutidas (Piano).<br>• 🎺 <b>Vientos (Aerófonos):</b> Madera (Flauta, Clarinete) y Metal (Trompeta, Trombón).<br>• 🥁 <b>Percusión (Membranófonos e Idiófonos):</b> Tambor, Marimba, Güiro, Triángulo.<br>• 🎙️ <b>Voz Humana y Electrófonos:</b> El instrumento más natural y los sintetizadores modernos.",
                "icon": "ph-speaker-high",
                "timer": 180,
                "customHtml": ""
            },
            {
                "title": "Mapa Visual: La Orquesta Sinfónica y el Conjunto Folclórico",
                "sub": "3/6 - Distribución Espacial",
                "content": "Observa la distribución de la orquesta: las cuerdas al frente por su sonido dulce, los vientos en el centro y la percusión al fondo por su gran potencia sonora:",
                "icon": "ph-tree-structure",
                "timer": 200,
                "customHtml": "<div style=\"background:white; border:2px solid #E2E8F0; border-radius:12px; padding:15px; margin-top:10px; text-align:center;\"><div style=\"display:grid; grid-template-columns:repeat(2, 1fr); gap:10px; font-weight:bold;\"><div style=\"background:#EFF6FF; border:1px solid #BFDBFE; padding:10px; border-radius:8px; color:#1E40AF;\">🎻 CORDÓFONOS<br><span style=\"font-size:0.8rem; color:#6B7280; font-weight:normal;\">Guitarra, Violín, Tiple</span></div><div style=\"background:#FEF3C7; border:1px solid #FDE68A; padding:10px; border-radius:8px; color:#92400E;\">🎺 AERÓFONOS<br><span style=\"font-size:0.8rem; color:#6B7280; font-weight:normal;\">Flauta, Trompeta, Saxofón</span></div><div style=\"background:#ECFDF5; border:1px solid #A7F3D0; padding:10px; border-radius:8px; color:#065F46;\">🥁 PERCUSIÓN<br><span style=\"font-size:0.8rem; color:#6B7280; font-weight:normal;\">Marimba, Tambores, Batería</span></div><div style=\"background:#F5F3FF; border:1px solid #DDD6FE; padding:10px; border-radius:8px; color:#5B21B6;\">🎙️ VOZ & ELECTRÓNICA<br><span style=\"font-size:0.8rem; color:#6B7280; font-weight:normal;\">Coro, Teclados, Sintetizador</span></div></div></div>"
            },
            {
                "title": "⏱️ Reto en tu Cuaderno: Diseño de un Cotidiáfono",
                "sub": "4/6 - Creación e Innovación Acústica",
                "content": "<b>Misión de luthería ecológica en tu cuaderno:</b><br>1. Diseña y dibuja un <b>instrumento musical creado con materiales reciclables</b> del hogar (ej: tubos de PVC, tarros, elásticos, semillas o botellas con agua).<br>2. Dale un nombre creativo (ej: 'Marimbófono Ecológico').<br>3. Especifica a qué familia pertenece y cómo produce el sonido.<br><br>✍️ <i>¡Ponle colores y señala sus partes con flechas!</i>",
                "icon": "ph-pencil-line",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Debate Sonoro: Timbre y Emociones",
                "sub": "5/6 - Apreciación Estética",
                "content": "Reflexionemos en grupo:<br>• ¿Qué familia de instrumentos usarías para una escena de misterio en una película? ¿Y para una fiesta campesina?<br>• ¿Por qué el tiple y la guitarra son el alma de la música andina colombiana?",
                "icon": "ph-chat-circle-dots",
                "timer": 200,
                "customHtml": ""
            },
            {
                "title": "Cierre: El Color de la Música",
                "sub": "6/6 - Conclusión",
                "content": "✔️ <b>Logro:</b> Dominio del timbre acústico, organología y diseño de cotidiáfonos sostenibles.<br>✔️ <b>Evidencia:</b> Ficha técnica del cotidiáfono registrada en la bitácora musical.<br><br>🌟 ¡Gran trabajo de exploración sonora!",
                "icon": "ph-check-circle",
                "timer": 120,
                "customHtml": ""
            }
        ]
    ],
    "7": [
        [
            {
                "title": "Métrica y Compases: 2/4, 3/4 Vals y 4/4",
                "sub": "1/6 - La Danza del Tiempo",
                "content": "📅 <b>Fecha:</b> Hoy<br>📌 <b>Título:</b> 'Los Compases Musicales y la Dirección Orquestal'<br>🎯 <b>Meta:</b> Reconocer y marcar físicamente con las manos los compases de 2, 3 y 4 tiempos.",
                "icon": "ph-scales",
                "timer": 120,
                "customHtml": ""
            },
            {
                "title": "Tipos de Compás y su Carácter",
                "sub": "2/6 - Estructuras Rítmicas",
                "content": "<b>La Métrica en la Vida Real:</b><br>• <b>Compás 2/4 (Binario):</b> Marchas militares y Pasodobles (1-2, 1-2, como el paso al caminar).<br>• <b>Compás 3/4 (Ternario):</b> Valses y Pasillos colombianos (¡UN-dos-tres, UN-dos-tres, movimiento circular).<br>• <b>Compás 4/4 (Cuaternario):</b> El 90% del Pop, Rock, Balada y Reggaetón actual (¡UN-dos-TRES-cuatro).",
                "icon": "ph-compass",
                "timer": 180,
                "customHtml": ""
            },
            {
                "title": "Partitura: Melodía en 3/4 (Ritmo de Vals)",
                "sub": "3/6 - Lectura de Compás Ternario",
                "content": "Observa el compás de 3/4 al inicio. Cada compás tiene exactamente 3 tiempos de negra:",
                "icon": "ph-article",
                "timer": 240,
                "customHtml": "<div class=\"abc-music\" style=\"background:white; padding:15px; border-radius:12px; border:2px solid #E2E8F0; margin:15px auto; max-width:550px;\">X:1\nT:Pequeño Vals en Do Mayor\nM:3/4\nL:1/4\nK:C\nC E G | C E G | D F A | G3 |\nF A c | E G c | D F B | C3 |]</div>"
            },
            {
                "title": "⏱️ Reto en tu Cuaderno: El Gesto del Director",
                "sub": "4/6 - Patrones de Dirección",
                "content": "<b>Dibuja en tu cuaderno los esquemas de dirección con flechas:</b><br>1. <b>2/4:</b> Flecha 1 hacia ABAJO, Flecha 2 hacia ARRIBA.<br>2. <b>3/4:</b> Flecha 1 hacia ABAJO, Flecha 2 hacia AFUERA (derecha), Flecha 3 hacia ARRIBA.<br>3. <b>4/4:</b> 1 ABAJO, 2 ADENTRO (izquierda), 3 AFUERA (derecha), 4 ARRIBA.<br><br>✍️ <i>¡Memoriza el patrón del 3/4 porque lo dirigiremos en la siguiente diapositiva!</i>",
                "icon": "ph-pencil-line",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Taller de Directores de Orquesta",
                "sub": "5/6 - Práctica Corporal",
                "content": "Todos toman un lápiz como si fuera la <b>batuta</b> de un director:<br>1. Ponemos el vals en la mente y marcamos el triángulo en el aire: Abajo (1), Derecha (2), Arriba (3).<br>2. Variamos la intensidad: cuando el director hace el gesto pequeño, la clase canta bajito (piano); cuando abre los brazos, cantamos fuerte (forte).",
                "icon": "ph-sparkle",
                "timer": 240,
                "customHtml": ""
            },
            {
                "title": "Cierre y Evaluación de Métrica",
                "sub": "6/6 - Conclusión",
                "content": "✔️ <b>Logro:</b> Comprensión teórica y motriz de los compases 2/4, 3/4 y 4/4.<br>✔️ <b>Evidencia:</b> Diagramas de dirección orquestal dibujados con precisión.<br><br>🌟 ¡Ya sabes cómo lidera un director en el escenario!",
                "icon": "ph-check-circle",
                "timer": 120,
                "customHtml": ""
            }
        ]
    ],
    "8": [
        [
            {
                "title": "Taller de Creación y Gran Concierto Final",
                "sub": "1/6 - ¡Somos Compositores!",
                "content": "📅 <b>Fecha:</b> Hoy<br>📌 <b>Título:</b> 'Composición Musical y Presentación del Gran Ensamble'<br>🎯 <b>Meta:</b> Crear una estrofa musical con ritmo, melodía y letra propia, e interpretarla en el concierto de aula.",
                "icon": "ph-trophy",
                "timer": 120,
                "customHtml": ""
            },
            {
                "title": "Los 4 Pasos del Compositor",
                "sub": "2/6 - Metodología Creativa",
                "content": "<b>¿Cómo nace una canción?</b><br>1. <b>El Motivo / Idea:</b> Un mensaje o emoción que queremos transmitir.<br>2. <b>El Ritmo Base:</b> El pulso y compás que le darán el movimiento.<br>3. <b>La Letra rimada:</b> Palabras que encajen rítmicamente en los pulsos.<br>4. <b>El Arreglo:</b> Cómo combinamos voces, palmas e instrumentos.",
                "icon": "ph-lightbulb",
                "timer": 180,
                "customHtml": ""
            },
            {
                "title": "Partitura: Himno Creativo Peidagogos",
                "sub": "3/6 - Obra Final para el Ensamble",
                "content": "Esta es la partitura base sobre la cual montaremos nuestras letras y variaciones sonoras:",
                "icon": "ph-music-notes-plus",
                "timer": 240,
                "customHtml": "<div class=\"abc-music\" style=\"background:white; padding:15px; border-radius:12px; border:2px solid #E2E8F0; margin:15px auto; max-width:550px;\">X:1\nT:Himno del Ensamble Peidagogos\nM:4/4\nL:1/4\nK:C\n\"C\"C2 E2 | \"G\"G3 G | \"Am\"A A G F | \"C\"E2 D2 |\n\"F\"F2 A2 | \"C\"G3 E | \"G\"D E F D | \"C\"C4 |]</div>"
            },
            {
                "title": "⏱️ Reto en tu Cuaderno: Escribe tu Letra de Canción",
                "sub": "4/6 - Creación Lírica y Métrica",
                "content": "<b>Misión Final en tu Bitácora:</b><br>Escribe una <b>estrofa de 4 versos</b> que rimen (tema libre: la amistad, los sueños, la naturaleza o el colegio) con la métrica adecuada para cantarla sobre la melodía de 4 compases.<br><br>✍️ <i>¡Decora tu página con una portada de disco o concierto y ponle un título a tu canción!</i>",
                "icon": "ph-pencil-line",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "El Gran Concierto de Cierre de Aula",
                "sub": "5/6 - Presentación en Vivo",
                "content": "¡Luces, cámara, música!<br>1. Cada grupo o estudiante presenta su estrofa cantada o recitada.<br>2. Toda la clase realiza el acompañamiento rítmico con percusión corporal aprendida en las semanas 1 a 7.<br>3. Aplausos sonoros para todos los artistas.",
                "icon": "ph-microphone-stage",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "🌟 Muro de Honor Musical y Clausura del Periodo",
                "sub": "6/6 - Celebración del Aprendizaje",
                "content": "🏆 <b>¡Felicitaciones! Has completado el ciclo completo de 8 Semanas de Música:</b><br>• Semana 1: Pulso y Percusión Corporal.<br>• Semana 2: Figuras Rítmicas (Negra y Corcheas).<br>• Semana 3: Altura y Escala de Do Mayor.<br>• Semana 4: Melodía y Canción Tradicional.<br>• Semana 5: Polirritmia y Coordinación.<br>• Semana 6: Timbre y Familias Instrumentales.<br>• Semana 7: Métrica y Dirección Orquestal (3/4 Vals).<br>• Semana 8: Composición y Gran Ensamble Final.<br><br>🎼 <i>¡Sello de honor y firma de clausura en el cuaderno!</i>",
                "icon": "ph-crown",
                "timer": 120,
                "customHtml": ""
            }
        ]
    ]
}

db["clases"]["artistica"] = musica_semanas

with open("proyectorData.json", "w", encoding="utf-8") as f:
    json.dump(db, f, ensure_ascii=False, indent=2)

print("¡Artística actualizada exitosamente con 8 semanas 100% enfocadas en MÚSICA!")
