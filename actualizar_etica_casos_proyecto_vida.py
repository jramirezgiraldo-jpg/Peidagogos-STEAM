import json

with open("proyectorData.json", "r", encoding="utf-8") as f:
    db = json.load(f)

# 8 Semanas de Ética y Valores orientadas al desarrollo de valores mediante Estudios de Casos y Proyecto de Vida
# 10 diapositivas por semana, todas con temporizador de 5 minutos (300 segundos)

etica_semanas = {
    "1": [
        [
            {
                "title": "Ética: Autoconocimiento y Autoestima",
                "sub": "1/10 - Preparación y Bitácora de Vida",
                "content": "📅 <b>Fecha:</b> Hoy<br>📌 <b>Título:</b> 'Mi Identidad y el Espejo Interior'<br>🎯 <b>Meta:</b> Reconocer nuestras fortalezas y valores propios, fortaleciendo el autoconcepto frente a la presión social.",
                "icon": "ph-user-focus",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Estudio de Caso: La Decisión de Mateo",
                "sub": "2/10 - El Dilema Moral",
                "content": "<b>Lee con atención la situación:</b><br>Mateo ingresó a un nuevo colegio. Para ser aceptado en el grupo popular, le exigen burlarse de un compañero tímido y cambiar su forma de vestir. Mateo sabe que eso está mal, pero teme quedarse solo en los recreos y ser excluido.",
                "icon": "ph-book-open-text",
                "timer": 300,
                "customHtml": "<div style='background:#FEF2F2; border-left:4px solid #EF4444; padding:12px; border-radius:6px; margin-top:10px; color:#991B1B;'><b>Pregunta detonante:</b> ¿Vale la pena traicionar nuestros propios principios solo por pertenecer a un grupo?</div>"
            },
            {
                "title": "Análisis de Perspectivas y Presión de Grupo",
                "sub": "3/10 - Reflexión en Profundidad",
                "content": "<b>Analicemos las 3 fuerzas en juego:</b><br>1. <b>El Deseo de Pertenencia:</b> Es natural querer encajar, pero no a cualquier costo.<br>2. <b>La Pérdida de Identidad:</b> Fingir ser alguien que no eres genera ansiedad y vacío.<br>3. <b>La Valentía Moral:</b> Decir 'no' a tiempo atrae a amigos verdaderos que te respetan.",
                "icon": "ph-users",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Marco de Valores: La Integridad Personal",
                "sub": "4/10 - Concepto Fundamental",
                "content": "<b>¿Qué significa ser Íntegro?</b><br><i>'La integridad es hacer lo correcto incluso cuando nadie te está mirando.'</i><br><br>La autoestima no depende de cuántos 'likes' o aprobaciones recibas, sino de la coherencia entre lo que piensas, lo que dices y lo que haces.",
                "icon": "ph-shield-check",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "⏱️ Reto en tu Cuaderno: El Árbol de mi Identidad",
                "sub": "5/10 - Ejercicio de Autodiagnóstico",
                "content": "<b>Dibuja en tu cuaderno un árbol grande con 3 partes:</b><br>• 🪵 <b>Raíces:</b> Escribe los 3 valores que te enseñaron en tu hogar.<br>• 🌳 <b>Tronco:</b> Escribe tus 3 mayores fortalezas y habilidades.<br>• 🍎 <b>Frutos:</b> Escribe 3 metas que sueñas cosechar en el futuro.<br><br>✍️ <i>¡Colorea tu árbol y ponle tu nombre completo como título!</i>",
                "icon": "ph-pencil-line",
                "timer": 300,
                "customHtml": "<div style='background:#FEF3C7; border:1px solid #FDE68A; border-radius:8px; padding:10px; font-size:0.9rem; color:#92400E;'>⏱️ Tienes 5 minutos cronometrados para diseñar tu Árbol de Identidad.</div>"
            },
            {
                "title": "Reflexión Personal: Mis No Negociables",
                "sub": "6/10 - Pensamiento Crítico",
                "content": "Escribe en tu cuaderno una lista titulada <b>'Mis 3 Límites No Negociables'</b>:<br>1. Cosas que jamás permitiré que me hagan.<br>2. Acciones dañinas que jamás haré a otros.<br>3. Principios que defenderé aunque los demás opinen distinto.",
                "icon": "ph-hand-palm",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Debate en Parejas: Aprender a Decir 'NO'",
                "sub": "7/10 - Dinámica Práctica",
                "content": "Gírate con tu compañero de al lado y practiquen una respuesta asertiva:<br>• Uno de ustedes interpretará a alguien que insiste en hacer algo incorrecto.<br>• El otro responderá con firmeza, amabilidad y sin agresividad diciendo 'NO'.<br>Luego intercambien roles.",
                "icon": "ph-chat-circle-dots",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Proyecto de Vida: Declaración de Principios",
                "sub": "8/10 - Mi Primera Piedra Angular",
                "content": "Redacta en tu bitácora tu <b>Declaración de Principios</b> en un párrafo de 4 renglones:<br><i>'Yo, [Tu Nombre], me comprometo a respetarme, valorar mis talentos y actuar con honestidad en cada decisión de mi vida.'</i>",
                "icon": "ph-scroll",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Plenaria: La Fuerza de la Autenticidad",
                "sub": "9/10 - Puesta en Común",
                "content": "¿Quién desea compartir con el curso su árbol o su declaración de principios?<br><br><b>Reflexión grupal:</b> ¿Cómo cambia el ambiente del salón cuando cada uno se siente libre de ser auténtico sin miedo a ser juzgado?",
                "icon": "ph-megaphone",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Cierre y Evaluación: Mi Compromiso Semanal",
                "sub": "10/10 - Firma de Avance",
                "content": "✔️ <b>Logro:</b> Fortalecimiento de la autoestima, la integridad y el autoconocimiento.<br>✔️ <b>Evidencia:</b> Árbol de Identidad y Declaración de Principios en el cuaderno.<br><br>🌟 ¡Firma tu hoja y ponle el sello de compromiso con tu vida!",
                "icon": "ph-check-circle",
                "timer": 300,
                "customHtml": ""
            }
        ]
    ],
    "2": [
        [
            {
                "title": "Empatía y Convivencia Saludable",
                "sub": "1/10 - En los Zapatos del Otro",
                "content": "📅 <b>Fecha:</b> Hoy<br>📌 <b>Título:</b> 'La Empatía y el Cuidado de las Relaciones'<br>🎯 <b>Meta:</b> Desarrollar la capacidad de comprender las emociones ajenas y actuar con compasión y responsabilidad digital.",
                "icon": "ph-heart",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Estudio de Caso: El Rumor en Redes Sociales",
                "sub": "2/10 - El Dilema de Lucía",
                "content": "<b>Lee con atención:</b><br>Alguien creó una cuenta anónima para compartir fotos privadas y burlarse de Lucía. Varios compañeros compartieron los mensajes y dejaron comentarios hirientes. Lucía dejó de comer, bajó sus calificaciones y no quiere volver a la escuela.",
                "icon": "ph-warning-circle",
                "timer": 300,
                "customHtml": "<div style='background:#FEF2F2; border-left:4px solid #EF4444; padding:12px; border-radius:6px; margin-top:10px; color:#991B1B;'><b>Dilema:</b> ¿Quién tiene más culpa: el que crea el rumor o los que lo comparten y guardan silencio?</div>"
            },
            {
                "title": "Análisis del Impacto Emocional y Digital",
                "sub": "3/10 - Consecuencias Reales",
                "content": "<b>Los 3 roles en el acoso escolar:</b><br>1. <b>El Agresor:</b> Quien daña para ocultar sus propias inseguridades.<br>2. <b>La Víctima:</b> Quien sufre el aislamiento y dolor emocional.<br>3. <b>Los Testigos Pasivos:</b> Quienes al callar o reírse, le dan poder al agresor.",
                "icon": "ph-users-three",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Marco de Valores: La Empatía y la Compasión",
                "sub": "4/10 - Principio Humano",
                "content": "<b>La Regla de Oro Universal:</b><br><i>'Trata a los demás como te gustaría que te traten a ti.'</i><br><br>La empatía no es solo sentir lástima; es ponerse activamente en el lugar del otro y extenderle una mano de apoyo cuando más lo necesita.",
                "icon": "ph-handshake",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "⏱️ Reto en tu Cuaderno: El Mapa de Empatía",
                "sub": "5/10 - Ejercicio de Conexión Humana",
                "content": "<b>Dibuja en tu cuaderno una silueta humana y responde a su alrededor:</b><br>• 👁️ <b>¿Qué ve?</b> (Las burlas y miradas en los pasillos).<br>• 👂 <b>¿Qué escucha?</b> (Comentarios y murmullos hirientes).<br>• 💭 <b>¿Qué piensa y siente?</b> (Miedo, soledad, tristeza).<br>• 🤝 <b>¿Qué puedo hacer yo para ayudarla?</b> (Defenderla, escucharla, no compartir el rumor).",
                "icon": "ph-pencil-line",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Reflexión de Vida: El Valor del Perdón",
                "sub": "6/10 - Sanar Heridas",
                "content": "Responde con honestidad en tu cuaderno:<br>• ¿Alguna vez lastimaste a alguien sin querer o por impulso? ¿Tuviste el valor de pedir disculpas?<br>• ¿Qué se necesita para perdonar y soltar el rencor en el corazón?",
                "icon": "ph-sparkle",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Taller en Parejas: Mediación y Escucha Activa",
                "sub": "7/10 - Role-Playing",
                "content": "Durante 3 minutos, uno de los dos le contará al otro una situación difícil que haya vivido. El compañero debe <b>escuchar en silencio total, mirándolo a los ojos, sin juzgar y sin interrumpir</b>. Luego le dirá: <i>'Te comprendo y te agradezco por compartirlo.'</i>",
                "icon": "ph-ear",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Proyecto de Vida: Mi Decálogo de Buen Trato",
                "sub": "8/10 - Relaciones Constructivas",
                "content": "Escribe en tu cuaderno <b>3 compromisos de convivencia</b> que aplicarás en tu familia y colegio:<br>1. En mis redes sociales solo publicaré mensajes que edifiquen y no dañen.<br>2. Apoyaré a quien vea solo o excluido.<br>3. Hablaré directamente con la persona antes de creer o esparcir un chisme.",
                "icon": "ph-list-checks",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Plenaria: La Cultura del Abrazo y el Respeto",
                "sub": "9/10 - Compromiso Colectivo",
                "content": "¿Cómo podemos convertir nuestro salón de clases en un lugar seguro donde nadie tenga miedo a ser rechazado?<br><br>Escribe una palabra de aliento en un papel y entrégasela a un compañero.",
                "icon": "ph-hands-clapping",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Cierre y Evaluación: Firma de Paz",
                "sub": "10/10 - Firma de Avance",
                "content": "✔️ <b>Logro:</b> Comprensión de la empatía, el respeto en redes sociales y la convivencia sana.<br>✔️ <b>Evidencia:</b> Mapa de Empatía y Compromiso de Buen Trato firmados.<br><br>🌟 ¡Gran lección de humanidad y empatía!",
                "icon": "ph-check-circle",
                "timer": 300,
                "customHtml": ""
            }
        ]
    ],
    "3": [
        [
            {
                "title": "Responsabilidad y Toma de Decisiones",
                "sub": "1/10 - Causa y Efecto en la Vida",
                "content": "📅 <b>Fecha:</b> Hoy<br>📌 <b>Título:</b> 'La Libertad y la Cadena de Consecuencias'<br>🎯 <b>Meta:</b> Asumir la responsabilidad de nuestras acciones y comprender el impacto del esfuerzo honesto frente al camino fácil.",
                "icon": "ph-scales",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Estudio de Caso: El Examen de Julián",
                "sub": "2/10 - El Dilema de la Trampa",
                "content": "<b>Situación para reflexionar:</b><br>Julián necesita pasar Matemáticas para no perder el año. Un amigo le ofrece las respuestas del examen final robadas de la sala de profesores. Julián no estudió porque prefirió jugar videojuegos todo el fin de semana. Si acepta, sacará 5.0; si no, arriesga reprobar.",
                "icon": "ph-exam",
                "timer": 300,
                "customHtml": "<div style='background:#FEF2F2; border-left:4px solid #EF4444; padding:12px; border-radius:6px; margin-top:10px; color:#991B1B;'><b>Dilema:</b> ¿Una buena calificación obtenida con trampa tiene verdadero valor? ¿A quién engaña realmente Julián?</div>"
            },
            {
                "title": "Análisis: El Atajo vs. El Mérito Propio",
                "sub": "3/10 - El Costo Oculto",
                "content": "<b>Consecuencias de elegir el atajo deshonesto:</b><br>• Pierdes el aprendizaje real que necesitarás en la vida adulta.<br>• Te acostumbras a depender del fraude, dañando tu autoestima profesional.<br>• Si te descubren, pierdes la confianza de tu familia, tus maestros y amigos.",
                "icon": "ph-traffic-cone",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Marco de Valores: La Responsabilidad y la Madurez",
                "sub": "4/10 - Principio Ético",
                "content": "<b>La Ecuación de la Libertad:</b><br><i>Libertad = Capacidad de elegir + Madurez para asumir las consecuencias.</i><br><br>Ser responsable es no culpar a otros por nuestros errores y tener la entereza de corregir el rumbo con valentía.",
                "icon": "ph-medal",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "⏱️ Reto en tu Cuaderno: El Árbol de Consecuencias",
                "sub": "5/10 - Mapeo de Decisiones",
                "content": "<b>Dibuja en tu cuaderno dos caminos divergentes:</b><br>• 🛑 <b>Camino A (La Trampa):</b> Qué pasa en 1 día, en 1 año y en 10 años.<br>• 🟢 <b>Camino B (La Honestidad y el Estudio):</b> Qué pasa en 1 día, en 1 año y en 10 años.<br><br>✍️ <i>¡Compara cuál de los dos caminos construye un futuro sólido y con orgullo!</i>",
                "icon": "ph-pencil-line",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Reflexión de Vida: Mi Profesión Soñada",
                "sub": "6/10 - Ética y Vocación",
                "content": "Piensa en el trabajo o carrera que sueñas ejercer (médico, ingeniero, docente, policía, artista, emprendedor):<br>• ¿Te gustaría que un médico que te va a operar haya pasado sus materias copiando?<br>• ¿Qué tipo de profesional quieres ser tú para tu país?",
                "icon": "ph-briefcase",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Debate Grupal: '¿El Fin Justifica los Medios?'",
                "sub": "7/10 - Dilema Clásico",
                "content": "Dividimos el salón para debatir:<br>¿Es válido hacer cosas incorrectas para lograr un fin aparentemente bueno? ¿Por qué la ética exige que tanto el fin como los medios sean limpios y justos?",
                "icon": "ph-chat-centered-dots",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Proyecto de Vida: Mi Plan de Hábitos de Excelencia",
                "sub": "8/10 - Hábitos para el Éxito",
                "content": "Diseña en tu cuaderno tu <b>Plan Semanal de Disciplina</b>:<br>1. Horario diario fijo de estudio y lectura (sin celular al lado).<br>2. Lista de prioridades antes del descanso o videojuegos.<br>3. Compromiso de pedir ayuda al profesor cuando no entienda un tema.",
                "icon": "ph-calendar-check",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Plenaria: La Dignidad del Trabajo Honesto",
                "sub": "9/10 - Puesta en Común",
                "content": "Compartan en voz alta:<br><i>'Prefiero un 3.0 ganado con mi propio sudor que un 5.0 manchado con deshonestidad.'</i><br>¿Por qué el orgullo del mérito propio duerme con la conciencia tranquila?",
                "icon": "ph-sun",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Cierre y Evaluación: Contrato de Integridad",
                "sub": "10/10 - Firma de Avance",
                "content": "✔️ <b>Logro:</b> Reconocimiento de la responsabilidad, el mérito personal y la ética académica.<br>✔️ <b>Evidencia:</b> Árbol de Consecuencias y Plan de Hábitos firmado en el cuaderno.<br><br>🌟 ¡Estás forjando el carácter de un líder íntegro!",
                "icon": "ph-check-circle",
                "timer": 300,
                "customHtml": ""
            }
        ]
    ],
    "4": [
        [
            {
                "title": "Resolución Pacífica de Conflictos",
                "sub": "1/10 - La Fuerza de la Palabra",
                "content": "📅 <b>Fecha:</b> Hoy<br>📌 <b>Título:</b> 'Comunicación Asertiva y Transformación del Conflicto'<br>🎯 <b>Meta:</b> Resolver desacuerdos mediante el diálogo, la autorregulación emocional y el acuerdo ganar-ganar.",
                "icon": "ph-chat-teardrop-text",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Estudio de Caso: El Trabajo en Equipo que Explotó",
                "sub": "2/10 - El Conflicto de Camilo y Daniela",
                "content": "<b>Lee la situación:</b><br>Camilo y Daniela debían entregar una maqueta grupal. Camilo olvidó traer los materiales el día final. Daniela, enfurecida, le gritó insultos frente a todos, rompió la cartulina y amenazó con sacarlo del grupo. Camilo respondió con burlas y casi se van a los golpes.",
                "icon": "ph-flame",
                "timer": 300,
                "customHtml": "<div style='background:#FEF2F2; border-left:4px solid #EF4444; padding:12px; border-radius:6px; margin-top:10px; color:#991B1B;'><b>Análisis:</b> ¿El error de Camilo justificaba la violencia verbal de Daniela? ¿Cómo pudieron manejarlo sin destruir la convivencia?</div>"
            },
            {
                "title": "Los 3 Estilos de Comunicación",
                "sub": "3/10 - ¿Cómo Reaccionamos?",
                "content": "• 🔴 <b>Pasivo:</b> Se calla, acumula rabia y permite que pasen por encima de él.<br>• 😡 <b>Agresivo:</b> Grita, insulta, ofende y busca imponer su fuerza.<br>• 🟢 <b>Asertivo:</b> Expresa con claridad y respeto lo que siente, defiende sus derechos y busca soluciones sin agredir.",
                "icon": "ph-traffic-signal",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Marco de Valores: La No Violencia y la Tolerancia",
                "sub": "4/10 - Sabiduría para la Paz",
                "content": "<b>Frase para la vida:</b><br><i>'La violencia es el arma de los que no tienen la razón ni la fuerza de los argumentos.'</i><br><br>El conflicto es natural en los seres humanos; lo que define nuestra madurez es la forma en que decidimos resolverlo.",
                "icon": "ph-dove",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "⏱️ Reto en tu Cuaderno: El Semáforo Emocional",
                "sub": "5/10 - Técnica de Autorregulación",
                "content": "<b>Dibuja en tu cuaderno un Semáforo grande con 3 pasos:</b><br>• 🔴 <b>ROJO (Alto):</b> Respira profundo 3 veces, cuenta hasta 10 y no hables con rabia.<br>• 🟡 <b>AMARILLO (Piensa):</b> Identifica el problema real y las consecuencias de reaccionar mal.<br>• 🟢 <b>VERDE (Actúa Asertivamente):</b> Habla con calma usando la fórmula: <i>'Me siento... cuando tú... porque... Te propongo que...'</i>",
                "icon": "ph-pencil-line",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Taller de Reescritura Asertiva",
                "sub": "6/10 - Ejercicio Práctico",
                "content": "Transforma estas frases agresivas en frases asertivas en tu cuaderno:<br>1. <i>'¡Usted siempre es un irresponsable que no sirve para nada!'</i> ➔ ...<br>2. <i>'¡Cállese que a nadie le importa su opinión!'</i> ➔ ...<br>3. <i>'¡O hace lo que digo o aténgase a las consecuencias!'</i> ➔ ...",
                "icon": "ph-arrows-left-right",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Simulación en Parejas: Negociación Ganar-Ganar",
                "sub": "7/10 - Práctica de Mediación",
                "content": "En parejas, resuelvan el caso de Camilo y Daniela actuando como mediadores de paz:<br>• Escuchen las dos versiones sin tomar partido.<br>• Lleguen a un acuerdo justo donde la maqueta se salve y ambos reparen la relación.",
                "icon": "ph-handshake",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Proyecto de Vida: Mi Protocolo ante la Ira",
                "sub": "8/10 - Autocontrol Emocional",
                "content": "Escribe en tu bitácora tu <b>Plan de Acción para Momentos de Crisis</b>:<br>• ¿Qué actividad te calma cuando estás muy enojado (caminar, escuchar música, escribir)?<br>• ¿A qué adulto de confianza recurrirás si un problema se sale de control?",
                "icon": "ph-shield",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Plenaria: Líderes de Paz en la Escuela",
                "sub": "9/10 - Reflexión Colectiva",
                "content": "¿Por qué un verdadero líder no es el que más grita o intimida, sino el que sabe tender puentes y calmar las tormentas con inteligencia y respeto?",
                "icon": "ph-crown",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Cierre y Evaluación: Sello de Mediador",
                "sub": "10/10 - Firma de Avance",
                "content": "✔️ <b>Logro:</b> Dominio de la comunicación asertiva, el autocontrol emocional y la resolución pacífica.<br>✔️ <b>Evidencia:</b> Semáforo Emocional y Reescritura Asertiva en el cuaderno.<br><br>🌟 ¡Eres un embajador de paz en tu comunidad!",
                "icon": "ph-check-circle",
                "timer": 300,
                "customHtml": ""
            }
        ]
    ],
    "5": [
        [
            {
                "title": "Justicia, Equidad y Derechos Humanos",
                "sub": "1/10 - La Dignidad de Cada Ser Humano",
                "content": "📅 <b>Fecha:</b> Hoy<br>📌 <b>Título:</b> 'Igualdad, Equidad y Derechos Fundamentales'<br>🎯 <b>Meta:</b> Reconocer la dignidad inalienable de todas las personas y combatir los prejuicios y la discriminación.",
                "icon": "ph-scales",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Estudio de Caso: La Exclusión de Valentina",
                "sub": "2/10 - El Dilema de Género y Deporte",
                "content": "<b>Lee con atención:</b><br>Valentina es la mejor jugadora de fútbol de su barrio, con talento excepcional. Al inscribirse en el torneo intercolegial, el comité organizador le prohibió participar argumentando que 'el fútbol es solo para hombres' y que 'arruinaría la competencia'.",
                "icon": "ph-prohibit",
                "timer": 300,
                "customHtml": "<div style='background:#FEF2F2; border-left:4px solid #EF4444; padding:12px; border-radius:6px; margin-top:10px; color:#991B1B;'><b>Dilema:</b> ¿Por qué este tipo de decisiones vulneran los Derechos Humanos y limitan el potencial de las personas?</div>"
            },
            {
                "title": "Análisis: Estereotipos y Barreras Invisibles",
                "sub": "3/10 - Deconstruir Prejuicios",
                "content": "• <b>Estereotipo:</b> Idea falsa y generalizada sobre cómo 'deben' ser o actuar las personas por su género, etnia o condición social.<br>• <b>Prejuicio:</b> Juzgar a alguien sin conocer sus verdaderas capacidades.<br>• <b>Discriminación:</b> El acto injusto de excluir y quitar oportunidades a alguien basándose en un prejuicio.",
                "icon": "ph-eye-slash",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Marco de Valores: Igualdad vs. Equidad",
                "sub": "4/10 - Concepto Clave",
                "content": "<b>La Diferencia Fundamental:</b><br>• <b>Igualdad:</b> Darle exactamente lo mismo a todos.<br>• <b>Equidad:</b> Darle a cada quien lo que necesita para que todos tengan las mismas oportunidades de triunfar y vivir con dignidad.",
                "icon": "ph-chart-bar",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "⏱️ Reto en tu Cuaderno: El Dibujo de la Equidad",
                "sub": "5/10 - Comprensión Visual",
                "content": "<b>Dibuja en tu cuaderno dos escenas comparativas:</b><br>• 📦 <b>Escena 1 (Igualdad sin equidad):</b> 3 personas de distinta estatura con una caja del mismo tamaño intentando ver un partido tras una cerca.<br>• 🌟 <b>Escena 2 (Equidad real):</b> Las cajas se distribuyen según la necesidad, permitiendo que todos puedan ver el partido.<br><br>✍️ <i>Escribe debajo una frase explicando por qué la equidad hace un mundo más justo.</i>",
                "icon": "ph-pencil-line",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Reflexión de Vida: Los Derechos en mi Entorno",
                "sub": "6/10 - Pensamiento Ciudadano",
                "content": "Responde en tu cuaderno:<br>• ¿Qué derechos fundamentales (educación, salud, libre expresión, igualdad) sientes que se respetan más en tu comunidad?<br>• ¿Cuáles necesitan mayor defensa y compromiso ciudadano?",
                "icon": "ph-buildings",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Debate en Equipos: Acciones Contra la Discriminación",
                "sub": "7/10 - Propuestas Juveniles",
                "content": "Propongan en grupos de a 4 personas una campaña escolar titulada <b>'Cero Exclusión'</b>:<br>¿Qué acciones concretas harían para incluir a compañeros con discapacidad, de diferentes orígenes étnicos o en situación de vulnerabilidad?",
                "icon": "ph-users",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Proyecto de Vida: Mi Compromiso con la Justicia",
                "sub": "8/10 - Ciudadanía Activa",
                "content": "Escribe en tu bitácora de vida:<br><i>'Como futuro ciudadano, me comprometo a no discriminar a nadie por ninguna razón y a alzar mi voz en defensa de quienes no pueden defenderse solos.'</i>",
                "icon": "ph-megaphone",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Plenaria: La Declaración Universal de DDHH",
                "sub": "9/10 - Historia y Trascendencia",
                "content": "Recordemos el Artículo 1º de la Declaración Universal:<br><i>'Todos los seres humanos nacen libres e iguales en dignidad y derechos y, dotados como están de razón y conciencia, deben comportarse fraternalmente los unos con los otros.'</i>",
                "icon": "ph-globe",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Cierre y Evaluación: Manifiesto por la Equidad",
                "sub": "10/10 - Firma de Avance",
                "content": "✔️ <b>Logro:</b> Comprensión de los Derechos Humanos, la equidad de género y la no discriminación.<br>✔️ <b>Evidencia:</b> Dibujo comparativo de Equidad y Compromiso Ciudadano firmados.<br><br>🌟 ¡La justicia comienza en la forma en que tratas a tus semejantes!",
                "icon": "ph-check-circle",
                "timer": 300,
                "customHtml": ""
            }
        ]
    ],
    "6": [
        [
            {
                "title": "Solidaridad, Bien Común y Cuidado Comunitario",
                "sub": "1/10 - Somos una Comunidad",
                "content": "📅 <b>Fecha:</b> Hoy<br>📌 <b>Título:</b> 'El Bien Común y la Ética del Cuidado'<br>🎯 <b>Meta:</b> Fomentar la solidaridad activa y el cuidado del entorno socioambiental como pilares de una vida con sentido.",
                "icon": "ph-plant",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Estudio de Caso: El Humedal y la Constructora",
                "sub": "2/10 - El Dilema del Progreso vs la Naturaleza",
                "content": "<b>Lee la situación:</b><br>Una empresa quiere rellenar el humedal del barrio para construir un centro comercial que generará dinero y empleos. Don Pedro y los vecinos advierten que el humedal alberga aves nativas, previene inundaciones y da agua limpia a la región.",
                "icon": "ph-tree",
                "timer": 300,
                "customHtml": "<div style='background:#FEF2F2; border-left:4px solid #EF4444; padding:12px; border-radius:6px; margin-top:10px; color:#991B1B;'><b>Dilema:</b> ¿El beneficio económico individual puede pasar por encima del bienestar ecológico y de la salud de toda una comunidad?</div>"
            },
            {
                "title": "Análisis: ¿Qué es el Bien Común?",
                "sub": "3/10 - Principio Social",
                "content": "• <b>El Bien Común:</b> Es el conjunto de condiciones sociales, ambientales y culturales que permiten a TODOS los miembros de una comunidad vivir con dignidad y plenitud.<br>• <b>La Ética del Cuidado:</b> Reconocer que nuestra supervivencia depende del cuidado mutuo y del respeto por la Madre Tierra.",
                "icon": "ph-hands-holding",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Marco de Valores: La Solidaridad y la Generosidad",
                "sub": "4/10 - La Belleza de Servir",
                "content": "<b>Frase inspiradora:</b><br><i>'El que no vive para servir, no sirve para vivir.'</i><br><br>La solidaridad no es dar lo que nos sobra; es compartir lo que tenemos y ofrecer nuestro tiempo y talento para levantar al que ha caído.",
                "icon": "ph-heart-straight",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "⏱️ Reto en tu Cuaderno: El Mapa Social de mi Barrio",
                "sub": "5/10 - Diagnóstico Comunitario",
                "content": "<b>Dibuja en tu cuaderno un croquis o lista de tu barrio y responde:</b><br>1. ¿Cuáles son los 2 problemas sociales o ambientales más urgentes (basuras, parques abandonados, soledad de adultos mayores)?<br>2. ¿Qué solución práctica y solidaria propones tú desde tu rol de estudiante?<br><br>✍️ <i>¡Diseña un logotipo para tu iniciativa solidaria!</i>",
                "icon": "ph-pencil-line",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Reflexión de Vida: La Huella que Quiero Dejar",
                "sub": "6/10 - Sentido de Trascendencia",
                "content": "Escribe una carta breve titulada <b>'Mi Huella en el Mundo'</b>:<br>¿Cómo te gustaría que te recuerden las personas cuando pasen los años? ¿Por tu generosidad y alegría, o por tu egoísmo?",
                "icon": "ph-footprints",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Trabajo en Equipos: Proyecto Social Juvenil",
                "sub": "7/10 - Solidaridad en Acción",
                "content": "En grupos de 4 personas, estructuren un proyecto de voluntariado escolar:<br>• Nombre de la Brigada.<br>• Objetivo (ej: sembrar árboles, recolectar libros para niños, acompañar ancianos).<br>• Cronograma de acción para el próximo mes.",
                "icon": "ph-users-three",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Proyecto de Vida: Mi Servicio a los Demás",
                "sub": "8/10 - Vocación Solidaria",
                "content": "Registra en tu bitácora de vida:<br>• 1 acción solidaria concreta que harás esta semana en tu hogar.<br>• 1 acción solidaria con un vecino o compañero que la necesite.",
                "icon": "ph-sparkle",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Plenaria: La Felicidad del Altruismo",
                "sub": "9/10 - Diálogo Abierto",
                "content": "¿Por qué las personas más solidarias y generosas suelen ser las más felices y plenas en sus vidas?<br>Compartan experiencias donde ayudar a alguien les haya llenado el corazón de alegría.",
                "icon": "ph-sun",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Cierre y Evaluación: Sello de Servicio Social",
                "sub": "10/10 - Firma de Avance",
                "content": "✔️ <b>Logro:</b> Comprensión del bien común, la solidaridad activa y el compromiso ambiental.<br>✔️ <b>Evidencia:</b> Mapa Social Comunitario y Propuesta Solidaria en el cuaderno.<br><br>🌟 ¡Tu generosidad transforma el mundo!",
                "icon": "ph-check-circle",
                "timer": 300,
                "customHtml": ""
            }
        ]
    ],
    "7": [
        [
            {
                "title": "Proyecto de Vida I: Metas, Vocación y Resiliencia",
                "sub": "1/10 - Diseñando mi Futuro",
                "content": "📅 <b>Fecha:</b> Hoy<br>📌 <b>Título:</b> 'Mi Vocación, Mis Talentos y Mis Metas de Vida'<br>🎯 <b>Meta:</b> Definir con claridad nuestra vocación personal, formulando metas realistas y desarrollando resiliencia ante los obstáculos.",
                "icon": "ph-compass",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Estudio de Caso: El Dilema Vocacional de Sofía",
                "sub": "2/10 - Pasión vs. Expectativa Familiar",
                "content": "<b>Lee con atención:</b><br>Sofía tiene un talento innato para las artes digitales y el diseño, y sueña con crear videojuegos educativos. Sin embargo, sus padres le exigen que estudie Derecho porque 'el arte no da dinero'. Sofía no sabe si complacer a su familia o luchar por su verdadera vocación.",
                "icon": "ph-arrows-split",
                "timer": 300,
                "customHtml": "<div style='background:#FEF2F2; border-left:4px solid #EF4444; padding:12px; border-radius:6px; margin-top:10px; color:#991B1B;'><b>Dilema:</b> ¿Cómo dialogar con la familia para defender la propia vocación sin romper los lazos de amor y respeto?</div>"
            },
            {
                "title": "Análisis: Vocación, Profesión y Misión (Ikigai)",
                "sub": "3/10 - El Sentido de la Vida",
                "content": "<b>El Enfoque del Propósito:</b><br>1. <b>Lo que amas hacer:</b> Tu pasión genuina.<br>2. <b>En lo que eres bueno:</b> Tus talentos cultivados con disciplina.<br>3. <b>Lo que el mundo necesita:</b> Tu servicio a la sociedad.<br>4. <b>Por lo que te pueden pagar:</b> Tu sustento y profesión.<br><i>¡Donde se cruzan los 4 puntos está tu verdadero Proyecto de Vida!</i>",
                "icon": "ph-circles-three",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Marco de Valores: La Resiliencia y la Perseverancia",
                "sub": "4/10 - Superar la Adversidad",
                "content": "<b>¿Qué es la Resiliencia?</b><br><i>'No es la fuerza para no caer, sino la capacidad de levantarse cada vez que la vida te pone a prueba.'</i><br><br>Los fracasos no son el fin del camino; son lecciones necesarias para construir el éxito verdadero.",
                "icon": "ph-shield-plus",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "⏱️ Reto en tu Cuaderno: Matriz DOFA Personal",
                "sub": "5/10 - Radiografía de Vida",
                "content": "<b>Dibuja en tu cuaderno una tabla de 4 cuadrantes:</b><br>• 🛡️ <b>Fortalezas (Internas):</b> Lo que haces excelente y tus valores.<br>• ⚠️ <b>Debilidades (Internas):</b> Hábitos que debes mejorar (pereza, impuntualidad).<br>• 🚀 <b>Oportunidades (Externas):</b> Apoyo de tu colegio, familia, cursos gratuitos.<br>• 🌪️ <b>Amenazas (Externas):</b> Malas compañías, problemas económicos o distracciones.",
                "icon": "ph-pencil-line",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Taller de Metas SMART en el Cuaderno",
                "sub": "6/10 - De los Sueños a la Realidad",
                "content": "Escribe en tu cuaderno <b>3 Metas Claras</b>:<br>• <b>Meta a Corto Plazo (Este año):</b> ¿Qué promedio o logro personal alcanzarás?<br>• <b>Meta a Mediano Plazo (3 años):</b> ¿Qué carrera o formación técnica iniciarás?<br>• <b>Meta a Largo Plazo (5 a 10 años):</b> ¿Cómo te ves trabajando y viviendo en tu madurez?",
                "icon": "ph-target",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Entrevista de Futuro en Parejas",
                "sub": "7/10 - Visualización Positiva",
                "content": "Imaginen que están en el año 2035 y se encuentran en un café:<br>• Entrevístense mutuamente durante 3 minutos: <i>'¿A qué te dedicas ahora? ¿Qué metas lograste cumplir? ¿Qué fue lo más difícil y cómo lo superaste?'</i><br>¡Sientan la emoción de verse triunfando!",
                "icon": "ph-microphone",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Carta a mi 'Yo del Futuro'",
                "sub": "8/10 - Compromiso Inquebrantable",
                "content": "Escribe en una página limpia una carta dirigida a ti mismo dentro de 10 años:<br>Recuérdate quién eres hoy, qué valores prometiste no traicionar y qué tan orgulloso estarás de mirar atrás y ver que nunca te rendiste.",
                "icon": "ph-envelope",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Plenaria: Vencer los Miedos y Creer en Uno Mismo",
                "sub": "9/10 - Puesta en Común",
                "content": "¿Cuál es el mayor obstáculo para cumplir nuestros sueños? ¿El miedo al qué dirán, la falta de recursos o la falta de disciplina?<br><br>Compartan una frase de motivación para todo el salón.",
                "icon": "ph-sparkle",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Cierre y Evaluación: Mi Brújula Vocacional",
                "sub": "10/10 - Firma de Avance",
                "content": "✔️ <b>Logro:</b> Formulación del Proyecto de Vida, Matriz DOFA y Metas SMART estructuradas.<br>✔️ <b>Evidencia:</b> Matriz DOFA y Carta al Yo del Futuro selladas en el cuaderno.<br><br>🌟 ¡Tienes un rumbo claro y un propósito invencible!",
                "icon": "ph-check-circle",
                "timer": 300,
                "customHtml": ""
            }
        ]
    ],
    "8": [
        [
            {
                "title": "Proyecto de Vida II: Mi Carta de Navegación y Legado",
                "sub": "1/10 - La Consagración del Proyecto",
                "content": "📅 <b>Fecha:</b> Hoy<br>📌 <b>Título:</b> 'Mi Escudo de Vida, Misión y Legado Ético'<br>🎯 <b>Meta:</b> Consolidar la bitácora integral de vida con nuestra Misión, Visión, Valores Rectores y Plan de Acción Ético.",
                "icon": "ph-trophy",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Estudio de Caso: La Historia de Resiliencia de Santiago",
                "sub": "2/10 - De la Adversidad al Liderazgo",
                "content": "<b>Historia real de transformación:</b><br>Santiago creció en un barrio con violencia y escasez. Trabajaba vendiendo dulces en las mañanas para pagarse los estudios nocturnos. Muchos le decían que nunca saldría adelante. Con disciplina férrea, honestidad y fe, hoy es fundador de una academia comunitaria que educa a cientos de jóvenes.",
                "icon": "ph-star-four",
                "timer": 300,
                "customHtml": "<div style='background:#ECFDF5; border-left:4px solid #10B981; padding:12px; border-radius:6px; margin-top:10px; color:#065F46;'><b>Enseñanza de Vida:</b> El origen de donde vienes no determina el destino glorioso hacia donde puedes llegar con esfuerzo ético.</div>"
            },
            {
                "title": "Análisis: La Coherencia de Vida y el Carácter",
                "sub": "3/10 - La Fuerza del Ejemplo",
                "content": "• <b>El Talento te abre puertas</b>, pero solo el <b>Carácter Ético</b> te mantiene en la cima.<br>• Tu mayor patrimonio no será el dinero que acumules, sino la paz de tu conciencia y el respeto que inspires en quienes te rodean.",
                "icon": "ph-crown",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Marco de Valores: La Trascendencia y la Sabiduría",
                "sub": "4/10 - Vivir con Sentido",
                "content": "<b>Las 3 Preguntas Clave del Proyecto de Vida:</b><br>1. <b>¿Quién soy?</b> (Mis raíces, fortalezas y principios).<br>2. <b>¿Hacia dónde voy?</b> (Mi visión, metas y carrera soñada).<br>3. <b>¿Qué dejaré a mi paso?</b> (Mi legado, servicio y huella en el mundo).",
                "icon": "ph-compass-tool",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "⏱️ Reto en tu Cuaderno: El Escudo de mi Vida",
                "sub": "5/10 - Símbolo de Honor Personal",
                "content": "<b>Dibuja en tu cuaderno un gran Escudo Heráldico dividido en 4 cuarteles:</b><br>• 1️⃣ <b>Mi Mayor Pasión</b> (Dibujo o símbolo de lo que más amas hacer).<br>• 2️⃣ <b>Mi Valor Inquebrantable</b> (El valor que nunca traicionarás).<br>• 3️⃣ <b>Mi Mayor Logro Futuro</b> (La meta cumbre de tu vida).<br>• 4️⃣ <b>Mi Lema de Vida</b> (Una frase corta y poderosa que te motive en la cinta inferior).",
                "icon": "ph-pencil-line",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Redacción de la Misión y Visión Personal",
                "sub": "6/10 - Documento Oficial de Vida",
                "content": "Escribe en tu cuaderno:<br>• 📌 <b>MI MISIÓN (Mi presente):</b> <i>'Ser una persona íntegra, responsable y perseverante, preparándome día a día para servir a mi familia y sociedad.'</i><br>• 🌟 <b>MI VISIÓN (Mi futuro):</b> <i>'En el año 2030 seré un profesional exitoso, líder ético en mi campo, aportando al bienestar de mi comunidad.'</i>",
                "icon": "ph-scroll",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "El Decálogo de Mis Decisiones No Negociables",
                "sub": "7/10 - Mi Código de Honor",
                "content": "Escribe los <b>5 Mandamientos Éticos</b> que guiarán tu juventud y adultez:<br>1. Trabajaré con honestidad y nunca buscaré el atajo corrupto.<br>2. Honraré y apoyaré a mi familia.<br>3. Trataré con respeto y empatía a toda persona.<br>4. Cuidaré mi salud física, mental y espiritual.<br>5. Nunca me rendiré ante una caída.",
                "icon": "ph-list-numbers",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Plan de Acción: Los Primeros 3 Pasos Inmediatos",
                "sub": "8/10 - Pasar a la Acción Ya",
                "content": "Un sueño sin acción es solo una ilusión. Escribe <b>3 acciones concretas que harás esta misma semana</b> para iniciar tu proyecto de vida:<br>1. [Acción en el estudio]<br>2. [Acción en el hogar]<br>3. [Acción personal de superación]",
                "icon": "ph-sneaker-move",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "Ceremonia de Aula: Proclamación del Lema de Vida",
                "sub": "9/10 - Juramento Ético",
                "content": "Cada estudiante se pondrá de pie y compartirá en voz alta su <b>Lema de Vida</b> ante el curso.<br><br>Todos los compañeros aplaudirán y reconocerán el valor y la nobleza de cada proyecto de vida proclamado.",
                "icon": "ph-megaphone-simple",
                "timer": 300,
                "customHtml": ""
            },
            {
                "title": "🌟 Clausura del Periodo: Graduación del Proyecto de Vida",
                "sub": "10/10 - Firma Solemne",
                "content": "🏆 <b>¡FELICITACIONES! Has culminado con éxito las 8 Semanas de Ética y Proyecto de Vida:</b><br>• Semana 1: Autoconocimiento e Identidad.<br>• Semana 2: Empatía y Convivencia.<br>• Semana 3: Responsabilidad y Toma de Decisiones.<br>• Semana 4: Resolución Pacífica de Conflictos.<br>• Semana 5: Justicia, Equidad y Derechos Humanos.<br>• Semana 6: Solidaridad y Cuidado Comunitario.<br>• Semana 7: Vocación, Metas SMART y Resiliencia.<br>• Semana 8: Escudo de Vida, Misión y Legado Ético.<br><br>📜 <i>¡Firma solemne y sello de honor en tu Bitácora de Vida!</i>",
                "icon": "ph-certificate",
                "timer": 300,
                "customHtml": ""
            }
        ]
    ]
}

db["clases"]["etica"] = etica_semanas

with open("proyectorData.json", "w", encoding="utf-8") as f:
    json.dump(db, f, ensure_ascii=False, indent=2)

print("¡Ética actualizada con éxito: 8 semanas, 10 diapositivas por semana, temporizadores de 5 min (300s), estudios de casos y proyecto de vida!")
