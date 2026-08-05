// ==============================================================================
// GUÍAS PREDETERMINADAS DE DIAGNÓSTICO SEMANA 1 (CICLOS Y GRADOS REGULARES)
// PEIDAGOGOS STEAM - GENERADOR GARANTIZADO OFFLINE / ONLINE
// ==============================================================================

function obtenerCicloNormalizado(gradoOGrupo) {
    if (!gradoOGrupo) return 'Ciclo III';
    const str = gradoOGrupo.toString().trim();
    if (/ciclo\s*1\b|ciclo\s*i\b/i.test(str)) return 'Ciclo I';
    if (/ciclo\s*2\b|ciclo\s*ii\b/i.test(str)) return 'Ciclo II';
    if (/ciclo\s*3\b|ciclo\s*iii\b/i.test(str)) return 'Ciclo III';
    if (/ciclo\s*4\b|ciclo\s*iv\b/i.test(str)) return 'Ciclo IV';
    if (/ciclo\s*5\b|ciclo\s*v\b/i.test(str)) return 'Ciclo V';
    if (/ciclo\s*6\b|ciclo\s*vi\b/i.test(str)) return 'Ciclo VI';

    if (/^1|^2|^3/.test(str)) return 'Ciclo I';
    if (/^4|^5/.test(str)) return 'Ciclo II';
    if (/^6|^7/.test(str)) return 'Ciclo III';
    if (/^8|^9/.test(str)) return 'Ciclo IV';
    if (/^10/.test(str)) return 'Ciclo V';
    if (/^11/.test(str)) return 'Ciclo VI';

    return 'Ciclo III';
}

function generarGuiaPredeterminada(params) {
    const {
        asignatura = 'Física',
        grado = '7',
        periodo = '3',
        semana = '1',
        rol = 'Explorador(a) STEAM',
        ambiente = 'Paisaje Cultural Cafetero',
        nivel = 'Intermedio',
        enfoque = 'Conceptual Gamificado',
        nombre_estudiante = 'Estudiante',
        institucion = 'IE Instituto Montenegro'
    } = params;

    const nombreEstudiante = nombre_estudiante || 'Estudiante';
    const asigLower = (asignatura || '').toLowerCase();
    const gradoStr = String(grado || '').toUpperCase();

    let sel = null;

    // 1. FÍSICA
    if (asigLower.includes('físic') || asigLower.includes('fisic')) {
        if (gradoStr.includes('6')) {
            sel = {
                tema: 'Fenómenos Naturales, Gravitación Universal y Movimiento Cotidiano (100% Conceptual)',
                objetivo: `100% CONCEPTUAL SIN FÓRMULAS MATEMÁTICAS: Interpretar fenómenos naturales del entorno, la atracción gravitacional e ideas de movimiento mediante observación intuitiva y representaciones visuales.`,
                problema: `¿Por qué caen los objetos a la Tierra y cómo se mueven los astros en el espacio sin chocar ni necesitar cálculos matemáticos?`,
                saberes: [
                    {
                        pregunta: `Cuando soltamos una fruta o una piedra en el aire, ¿qué fuerza invisible atrae los objetos hacia el centro de la Tierra?`,
                        opciones: [`La fuerza de atracción gravitacional`, `La fuerza de rozamiento del viento`, `La energía magnética de la luna`, `La presión atmosférica pura`],
                        correcta: 0
                    },
                    {
                        pregunta: `¿Cómo se desplazan los planetas alrededor del Sol en el espacio?`,
                        opciones: [`En órbitas continuas atraídas por la gravedad del Sol`, `Volando en línea recta hacia afuera del universo`, `Rebotando en nubes de aire`, `Deteniéndose todas las noches`],
                        correcta: 0
                    },
                    {
                        pregunta: `¿Qué sucede con el peso aparente de los astronautas cuando flotan dentro de la Estación Espacial Internacional?`,
                        opciones: [`Experimentan sensación de ingravidez al estar en caída libre continua alrededor de la Tierra`, `Se vuelven de madera`, `Su masa desaparece por completo`, `La gravedad se convierte en agua`],
                        correcta: 0
                    }
                ],
                svg: `<div style='text-align:center; margin:20px 0;'><svg width='320' height='160' viewBox='0 0 320 160' xmlns='http://www.w3.org/2000/svg' style='background:#F0F9FF; border-radius:12px; border:2px solid #7DD3FC;'><circle cx='160' cy='80' r='35' fill='#F59E0B'/><circle cx='240' cy='80' r='14' fill='#3B82F6'/><path d='M160,80 A80,40 0 1,0 240,80' fill='none' stroke='#94A3B8' stroke-dasharray='4'/><text x='160' y='145' font-size='12' font-weight='bold' fill='#0369A1' text-anchor='middle'>Movimiento Planetario y Gravitación Intuitiva</text></svg></div>`,
                icfes: [
                    {
                        contexto: `${nombreEstudiante} suelta dos pelotas de diferente tamaño desde la misma altura en ausencia de fricción apreciable del aire.`,
                        pregunta: `¿Qué observará cualitativamente ${nombreEstudiante} sobre el tiempo de caída de ambas pelotas?`,
                        opciones: [
                            `Ambas pelotas caen al mismo tiempo porque la aceleración de la gravedad actúa por igual sobre todos los cuerpos.`,
                            `La pelota pesada cae diez veces más rápido.`,
                            `La pelota liviana flota indefinidamente sin tocar el suelo.`,
                            `La pelota pesada se detiene a mitad de camino.`
                        ],
                        correcta: 0,
                        retroalimentacion: {
                            "0": `¡Excelente ${nombreEstudiante}! Cualitativamente, en ausencia de fricción del aire, todos los objetos son acelerados por igual por la fuerza de gravedad.`,
                            "1": `Incorrecto. La gravedad acelera por igual independientemente de la masa.`,
                            "2": `Incorrecto. Sin fuerzas opuestas la gravedad atrae la pelota hacia abajo.`,
                            "3": `Incorrecto. No hay ninguna fuerza que detenga la caída en el aire.`
                        }
                    }
                ],
                sopa: `GRAVEDAD,ORBITA,PLANETA,SOL,TIERRA,FUERZA,ATRACCION,ESPACIO,MOVIMIENTO,ASTRO`
            };
        } else if (gradoStr.includes('7')) {
            sel = {
                tema: 'Movimiento Cualitativo en 2D, Trayectorias y Conservación de la Energía (100% Conceptual)',
                objetivo: `100% CONCEPTUAL SIN FÓRMULAS MATEMÁTICAS: Analizar cualitativa y visualmente el movimiento bidimensional (lanzamiento de balones, trayectorias curvadas) y la conservación de la energía en la naturaleza.`,
                problema: `¿Cómo describimos cualitativamente el camino que sigue un balón pateado en curva o una gota de agua al caer sin resolver ecuaciones complejas?`,
                saberes: [
                    {
                        pregunta: `Cuando un jugador patea un balón hacia arriba en forma de arco (parábola), ¿cuáles dos movimientos se combinan al mismo tiempo?`,
                        opciones: [`Un avance horizontal y un movimiento vertical de subida y bajada`, `Un giro en reversa y una explosión`, `Un freno de mano y una aceleración solar`, `Un movimiento circular cerrado fijo`],
                        correcta: 0
                    },
                    {
                        pregunta: `¿Qué transformación de energía ocurre cuando una manzana cae de la rama de un árbol?`,
                        opciones: [`La energía potencial de posición se transforma en energía cinética de movimiento`, `La energía solar se convierte en madera`, `La energía eléctrica se convierte en sonido puro`, `La masa se convierte en luz azul`],
                        correcta: 0
                    },
                    {
                        pregunta: `¿Cuál de las siguientes trayectorias corresponde a una atracción de feria como la rueda de Chicago o un tiovivo?`,
                        opciones: [`Trayectoria circular`, `Trayectoria rectilínea en diagonal`, `Trayectoria parabólica de caída libre`, `Trayectoria errática en zigzag`],
                        correcta: 0
                    }
                ],
                svg: `<div style='text-align:center; margin:20px 0;'><svg width='320' height='160' viewBox='0 0 320 160' xmlns='http://www.w3.org/2000/svg' style='background:#FAF5FF; border-radius:12px; border:2px solid #C084FC;'><path d='M30,130 Q160,20 290,130' fill='none' stroke='#9333EA' stroke-width='4' stroke-dasharray='6'/><circle cx='160' cy='35' r='10' fill='#EC4899'/><text x='160' y='150' font-size='12' font-weight='bold' fill='#6B21A8' text-anchor='middle'>Trayectoria Parabólica en Deportes (Análisis Cualitativo)</text></svg></div>`,
                icfes: [
                    {
                        contexto: `En la cancha escolar de Montenegro, ${nombreEstudiante} observa el lanzamiento de tiro libre en baloncesto. El balón sube perdiendo rapidez hasta la cima y luego baja aumentando su rapidez.`,
                        pregunta: `¿En qué punto de la trayectoria parabólica la energía potencial del balón es máxima?`,
                        opciones: [
                            `En el punto más alto del lanzamiento (la cumbre del arco).`,
                            `En el instante justo cuando toca las manos del jugador al inicio.`,
                            `Cuando el balón está en el suelo antes de ser lanzado.`,
                            `En ningún momento tiene energía potencial.`
                        ],
                        correcta: 0,
                        retroalimentacion: {
                            "0": `¡Muy bien ${nombreEstudiante}! A mayor altura respecto al suelo, mayor es la energía potencial de posición acumulada.`,
                            "1": `Incorrecto. Al inicio la altura es menor que en la cima.`,
                            "2": `Incorrecto. En el suelo la altura es cero.`,
                            "3": `Incorrecto. La posición en el campo gravitacional otorga energía potencial.`
                        }
                    }
                ],
                sopa: `PARABOLA,TRAYECTORIA,ALTURA,RAPIDEZ,ENERGIA,POSICION,CIRCULAR,BALON,FUERZA,ARCO`
            };
        } else {
            sel = {
                tema: 'Principios de la Física, Mecánica y Conservación Energética',
                objetivo: `Comprender los principios fundamentales de la mecánica, las fuerzas en la naturaleza y la conservación de la energía.`,
                problema: `¿Cómo explican las leyes de la física el movimiento y las fuerzas en ${ambiente}?`,
                saberes: [
                    {
                        pregunta: `La propiedad de los cuerpos de resistirse a cambiar su estado de reposo o movimiento se denomina:`,
                        opciones: [`Inercia`, `Fricción química`, `Combustión`, `Magnetismo`],
                        correcta: 0
                    },
                    {
                        pregunta: `¿Cuál es la unidad del Sistema Internacional para medir la fuerza?`,
                        opciones: [`Newton (N)`, `Joule (J)`, `Watt (W)`, `Kilogramo (kg)`],
                        correcta: 0
                    },
                    {
                        pregunta: `La energía asociada al movimiento de un cuerpo recibe el nombre de:`,
                        opciones: [`Energía cinética`, `Energía potencial gravitacional`, `Energía nuclear`, `Energía química`],
                        correcta: 0
                    }
                ],
                svg: `<div style='text-align:center; margin:20px 0;'><svg width='300' height='150' viewBox='0 0 300 150' xmlns='http://www.w3.org/2000/svg' style='background:#EFF6FF; border-radius:12px; border:2px solid #93C5FD;'><rect x='110' y='40' width='80' height='60' fill='#3B82F6' rx='8'/><text x='150' y='75' fill='white' font-weight='bold' text-anchor='middle'>MASA</text><text x='150' y='135' font-size='12' font-weight='bold' fill='#1E3A8A' text-anchor='middle'>Leyes del Movimiento</text></svg></div>`,
                icfes: [
                    {
                        contexto: `Un vehículo transita por una vía de Montenegro y frena bruscamente. ${nombreEstudiante} siente que su cuerpo se desplaza hacia adelante.`,
                        pregunta: `¿Qué principio físico explica la tendencia del cuerpo a mantener su movimiento hacia adelante?`,
                        opciones: [
                            `La Primera Ley de Newton o Ley de la Inercia.`,
                            `La Tercera Ley de Newton sobre acción y reacción.`,
                            `El principio de Pascal en fluidos.`,
                            `La Ley de Ohm en electricidad.`
                        ],
                        correcta: 0,
                        retroalimentacion: {
                            "0": `¡Excelente ${nombreEstudiante}! Todo cuerpo tiende a mantener su estado de movimiento uniforme si no actúa sobre él una fuerza neta externa.`,
                            "1": `Incorrecto. La tercera ley refiere a fuerzas pareadas de acción y reacción.`,
                            "2": `Incorrecto. El principio de Pascal aplica para presiones en fluidos incompresibles.`,
                            "3": `Incorrecto. La Ley de Ohm rige circuitos eléctricos.`
                        }
                    }
                ],
                sopa: `INERCIA,FUERZA,NEWTON,ENERGIA,CINETICA,POTENCIAL,TRABAJO,MASA,VELOCIDAD,ACELERACION`
            };
        }
    }

    // 2. TURISMO Y EMPRENDIMIENTO
    else if (asigLower.includes('turismo')) {
        sel = {
            tema: 'Desarrollo de Producto Turístico Sostenible (Diseño de Bien o Servicio Local)',
            objetivo: `Diseñar y estructurar un producto o servicio turístico local (bien o servicio) en las primeras semanas, valorando la riqueza del Paisaje Cultural Cafetero (PCC - Montenegro) y el emprendimiento regional.`,
            problema: `¿Cómo podemos identificar una oportunidad en Montenegro y transformarla en un bien o servicio turístico sostenible y atractivo para los visitantes en ${ambiente}?`,
            saberes: [
                {
                    pregunta: `En el sector del turismo regional, ¿cuál de las siguientes opciones corresponde a un SERVICIO turístico?`,
                    opciones: [`Una guianza ecológica interpretativa por senderos del café`, `Un paquete de artesanías de guadua terminadas`, `Un paquete de café tostado y molido en bolsa`, `Un recuerdo impreso de madera`],
                    correcta: 0
                },
                {
                    pregunta: `¿Qué elemento constituye un BIEN tangible en la oferta turística del Paisaje Cultural Cafetero?`,
                    opciones: [`Un producto gastronómico típico empacado (ej. mermelada artesanal de café)`, `Un taller de baile folclórico de una hora`, `La bienvenida del recepcionista en el hotel`, `La explicación oral del guía turístico`],
                    correcta: 0
                },
                {
                    pregunta: `Para que una idea de producto o servicio turístico sea exitosa en Montenegro, debe caracterizarse por:`,
                    opciones: [`Resolver una necesidad del visitante resaltando la cultura local y la sostenibilidad ambiental`, `Destruir la vegetación nativa para construir pavimentos`, `Cobrar precios excesivos sin brindar atención de calidad`, `Imitar productos importados sin identidad regional`],
                    correcta: 0
                }
            ],
            svg: `<div style='text-align:center; margin:20px 0;'><svg width='320' height='160' viewBox='0 0 320 160' xmlns='http://www.w3.org/2000/svg' style='background:#ECFDF5; border-radius:12px; border:2px solid #6EE7B7;'><rect x='30' y='40' width='110' height='80' rx='10' fill='#10B981'/><text x='85' y='80' font-size='12' font-weight='bold' fill='white' text-anchor='middle'>BIEN TURÍSTICO</text><text x='85' y='95' font-size='10' fill='#D1FAE5' text-anchor='middle'>(Producto Tangible)</text><rect x='180' y='40' width='110' height='80' rx='10' fill='#059669'/><text x='235' y='80' font-size='12' font-weight='bold' fill='white' text-anchor='middle'>SERVICIO TURÍSTICO</text><text x='235' y='95' font-size='10' fill='#D1FAE5' text-anchor='middle'>(Experiencia / Guianza)</text><text x='160' y='145' font-size='12' font-weight='bold' fill='#065F46' text-anchor='middle'>Estructuración de Producto Turístico (PCC Montenegro)</text></svg></div>`,
            icfes: [
                {
                    contexto: `${nombreEstudiante} propone crear una ruta de avistamiento de aves en Montenegro acompañada de degustación de café campesino (experiencia de servicio + bien artesanal).`,
                    pregunta: `¿Cuál es el valor agregado principal que hace atractivo este producto turístico sostenible?`,
                    opciones: [
                        `Integra la conservación del patrimonio natural del PCC con una experiencia vivencial y cultural única.`,
                        `Requiere talar los árboles del sendero para construir pistas de cemento.`,
                        `Impide que los habitantes locales participen en la economía.`,
                        `Remplaza la fauna nativa por animales sintéticos.`
                    ],
                    correcta: 0,
                    retroalimentacion: {
                        "0": `¡Brillante ${nombreEstudiante}! El valor agregado reside en la autenticidad, la sostenibilidad y la conexión directa con el paisaje cultural.`,
                        "1": `Incorrecto. La tala altera el ecosistema y ahuyenta a las aves.`,
                        "2": `Incorrecto. El turismo comunitario busca el beneficio directo de la población local.`,
                        "3": `Incorrecto. Los visitantes buscan fauna silvestre auténtica.`
                    }
                }
            ],
            sopa: `TURISMO,SERVICIO,PRODUCTO,PAISAJE,CAFETERIO,EMPRENDER,OFERTA,VALOR,EXPERIENCIA,MONTENEGRO`
        };
    }

    // 3. QUÍMICA
    else if (asigLower.includes('químic') || asigLower.includes('quimica')) {
        sel = {
            tema: 'Estructura de la Materia, Reacciones Químicas y Mezclas del Entorno',
            objetivo: `Comprender la constitución atómica de la materia, clasificar cambios físicos y químicos y analizar mezclas homogéneas y heterogéneas en la agricultura e industria local.`,
            problema: `¿Cómo las reacciones químicas y la constitución atómica de las sustancias transforman la materia en los procesos diarios de ${ambiente}?`,
            saberes: [
                {
                    pregunta: `¿Cuál de los siguientes sucesos corresponde a un CAMBIO QUÍMICO donde se forman nuevas sustancias?`,
                    opciones: [`La combustión de la leña o gas al cocinar`, `Evaporación de agua hirviendo`, `Cortar un papel en pedazos pequeños`, `Triturar un cubo de hielo`],
                    correcta: 0
                },
                {
                    pregunta: `Una solución homogénea en la cocina donde el soluto se disuelve completamente en el solvente sin dejar residuos visibles es:`,
                    opciones: [`Agua con sal completamente disuelta`, `Agua con piedras de río`, `Mezcla de aceite y agua`, `Arena con frijoles`],
                    correcta: 0
                },
                {
                    pregunta: `Las partículas subatómicas con carga eléctrica positiva presentes en el núcleo del átomo son los:`,
                    opciones: [`Protones`, `Electrones`, `Fotones`, `Neutrones negativos`],
                    correcta: 0
                }
            ],
            svg: `<div style='text-align:center; margin:20px 0;'><svg width='300' height='150' viewBox='0 0 300 150' xmlns='http://www.w3.org/2000/svg' style='background:#FDF2F8; border-radius:12px; border:2px solid #F472B6;'><circle cx='150' cy='75' r='25' fill='#EC4899'/><ellipse cx='150' cy='75' rx='70' ry='25' fill='none' stroke='#DB2777' stroke-width='2'/><circle cx='220' cy='75' r='8' fill='#9333EA'/><text x='150' y='135' font-size='12' font-weight='bold' fill='#831843' text-anchor='middle'>Estructura Atómica de la Materia</text></svg></div>`,
            icfes: [
                {
                    contexto: `En el laboratorio o en la preparación de insumos agrícolas, ${nombreEstudiante} mezcla bicarbonato de sodio con vinagre y observa efervescencia intensa con liberación de dióxido de carbono ($CO_2$).`,
                    pregunta: `¿Qué tipo de proceso químico ha ocurrido en la reacción entre el ácido acético y el bicarbonato?`,
                    opciones: [
                        `Una reacción química de efervescencia (ácido-base) con liberación de gas gasificado y formación de nuevas sustancias.`,
                        `Un cambio de fase puramente mecánico sin transformación de moléculas.`,
                        `Una congelación instantánea por pérdida de calor.`,
                        `Una separación magnética de metales.`
                    ],
                    correcta: 0,
                    retroalimentacion: {
                        "0": `¡Exacto ${nombreEstudiante}! El desprendimiento de burbujas de gas evidencia la reorganización atómica y síntesis de nuevos productos químicos.`,
                        "1": `Incorrecto. Hay ruptura y formación de enlaces químicos reales.`,
                        "2": `Incorrecto. No hay descenso térmico extremo ni cambio a sólido.`,
                        "3": `Incorrecto. Ninguna de las sustancias es ferromagnética.`
                    }
                }
            ],
            sopa: `QUIMICA,ATOMO,PROTON,ELECTRON,REACCION,ENLACE,MEZCLA,SOLUTO,SOLVENTE,MATERIA`
        };
    }

    // 4. BIOLOGÍA / CIENCIAS NATURALES (DEFAULT POR CICLO)
    else {
        const ciclo = obtenerCicloNormalizado(grado);
        sel = {
            tema: 'La Célula, Ecosistemas y Biodiversidad Regional',
            objetivo: `Comprender la estructura biológica de los seres vivos, sus interacciones en los ecosistemas y la preservación ambiental en el Paisaje Cultural Cafetero.`,
            problema: `¿Cómo interactúan las células y los organismos con los recursos naturales en ${ambiente}?`,
            saberes: [
                {
                    pregunta: `Todos los seres vivos están constituidos por unidades vivas capaces de nutrirse y reproducirse llamadas:`,
                    opciones: [`Células`, `Cristales de cuarzo`, `Plásticos`, `Minerales inertes`],
                    correcta: 0
                },
                {
                    pregunta: `Las plantas verdes producen su propio alimento mediante el proceso de:`,
                    opciones: [`Fotosíntesis`, `Combustión`, `Congelación`, `Fermentación láctica`],
                    correcta: 0
                },
                {
                    pregunta: `¿Qué recurso natural es indispensable para la vida de todos los seres vivos en la región?`,
                    opciones: [`El agua limpia`, `El aceite mineral`, `El plástico sintético`, `La gasolina`],
                    correcta: 0
                }
            ],
            svg: `<div style='text-align:center; margin:20px 0;'><svg width='300' height='150' viewBox='0 0 300 150' xmlns='http://www.w3.org/2000/svg' style='background:#F0FDF4; border-radius:12px; border:2px solid #86EFAC;'><circle cx='150' cy='75' r='35' fill='#4ADE80'/><text x='150' y='80' font-size='24' text-anchor='middle'>🌿</text><text x='150' y='135' font-size='12' font-weight='bold' fill='#166534' text-anchor='middle'>Ecosistemas y Vida Biológica</text></svg></div>`,
            icfes: [
                {
                    contexto: `${nombreEstudiante} analiza la importancia de proteger las microcuencas hídricas en la cuenca del río La Vieja en el Quindío.`,
                    pregunta: `¿Por qué la cobertura vegetal arbórea protege las fuentes de agua en los ecosistemas cafeteros?`,
                    opciones: [
                        `Porque retiene la humedad en el suelo, evita la erosión y regula el ciclo del agua.`,
                        `Porque evapora toda el agua para que nunca llueva.`,
                        `Porque calienta el suelo hasta volverlo desierto.`,
                        `Porque impide el paso de la luz solar por completo en todo el planeta.`
                    ],
                    correcta: 0,
                    retroalimentacion: {
                        "0": `¡Excelente ${nombreEstudiante}! El bosque de galería actúa como esponja natural regulando los flujos hídricos.`,
                        "1": `Incorrecto. La vegetación favorece la precipitación y filtración.`,
                        "2": `Incorrecto. La sombra arbórea modera la temperatura edáfica.`,
                        "3": `Incorrecto. La luz filtrada promueve el sotobosque y biodiversidad.`
                    }
                }
            ],
            sopa: `CELULA,BIOLOGIA,AGUA,VIDA,BOSQUE,PLANTA,FAUNA,ECOSISTEMA,SUELO,HOJA`
        };
    }

    // CONSTRUCCIÓN ESTRICTA CON LA ESTRUCTURA COMPLETA SOLICITADA
    const textoInductivo = `# 🚀 Exploración STEAM: ${sel.tema}

¡Bienvenido(a), **${nombreEstudiante}**! En tu rol de **${rol}**, te encuentras en el entorno de **${ambiente}** participando en una sesión interactiva bajo el enfoque de **${enfoque}**.

***${sel.problema}***

A continuación, ${nombreEstudiante}, iniciaremos una lectura profunda e inductiva sobre **${sel.tema}**. Lee con mucha atención cada concepto y responde los retos intercalados a medida que avanza tu exploración.

${sel.svg}

### 📖 Capítulo 1: Observación e Indagación Inicial

En nuestro entorno cotidiano en ${ambiente}, los fenómenos científicos y las dinámicas sociales ocurren a cada instante. Cuando observamos nuestro alrededor, nos damos cuenta de que todo aquello que nos rodea sigue principios fundamentales que podemos comprender sin necesidad de recurrir a formulas complejas ni explicaciones oscuras. 

Para ti, **${nombreEstudiante}**, comprender estos principios te permitirá tomar mejores decisiones en tu vida diaria, en tu hogar y en tu comunidad. Por ejemplo, al analizar cómo interactúan los objetos, cómo se transforma la energía o cómo se organizan los bienes y servicios en el turismo, descubrimos que la indagación constante es la clave para resolver grandes retos.

[ACTIVIDAD:CUADERNO:✏️ **Actividad en Cuaderno 1:** ${nombreEstudiante}, responde en tu cuaderno: Escribe con tus propias palabras qué fenómeno de tu entorno en ${ambiente} te causa mayor curiosidad y por qué.]

[ACTIVIDAD:PLATAFORMA:¿Cuál es el valor principal de observar los fenómenos cotidianos con actitud científica y reflexiva en ${ambiente}?|Permite comprender el entorno y resolver problemas reales]

[JUEGO:ORDENAR_LETRAS:${sel.sopa.split(',')[0] || 'CIENCIA'}]
[JUEGO:ORDENAR_LETRAS:${sel.sopa.split(',')[1] || 'ENERGIA'}]
[JUEGO:ORDENAR_LETRAS:${sel.sopa.split(',')[2] || 'ENTORNO'}]
[JUEGO:ORDENAR_LETRAS:${sel.sopa.split(',')[3] || 'METODO'}]
[JUEGO:ORDENAR_LETRAS:${sel.sopa.split(',')[4] || 'SISTEMA'}]

[JUEGO:ORDENAR_FRASE:LA OBSERVACION Y LA CURIOSIDAD TRANSFORMAN NUESTRA COMUNIDAD]
[JUEGO:ORDENAR_FRASE:EL CONOCIMIENTO STEAM NOS AYUDA A RESOLVER RETOS REALES]

### 📖 Capítulo 2: Desarrollo y Análisis de Casos

Continuando con nuestra expedición, **${nombreEstudiante}**, debemos profundizar en las evidencias. La ciencia y el desarrollo de proyectos requieren que organicemos la información mediante esquemas visuales, tablas comparativas y mapas mentales que sinteticen las ideas clave de forma clara y atractiva.

[ACTIVIDAD:CUADERNO:🎨 **Actividad en Cuaderno 2:** ${nombreEstudiante}, elabora en tu cuaderno un dibujo explicativo o esquema visual donde representes el concepto central de ${sel.tema}.]

[ACTIVIDAD:CUADERNO:📊 **Actividad en Cuaderno 3:** ${nombreEstudiante}, diseña en tu cuaderno una tabla comparativa con 2 columnas comparando las características de dos elementos clave de este tema.]

[ACTIVIDAD:PLATAFORMA:¿Por qué los esquemas visuales y tablas comparativas facilitan el aprendizaje significativo de ${nombreEstudiante}?|Ayudan a estructurar las ideas y sintetizar la información]

Sigamos adelante con paso firme en nuestra misión de aprendizaje en ${ambiente}.`;

    const textoDeductivo = `### 📚 Fundamentación Teórica y Síntesis Formal

**${nombreEstudiante}**, como **${rol}**, has demostrado que la exploración inductiva nos conduce directamente a la formalización del conocimiento científico y emprendedor.

### 🏛️ Marco Conceptual

* **Principio de Identidad y Coherencia:** Todo concepto tiene un significado preciso y aplicable al mundo real.
* **Sostenibilidad y Contexto:** Lo que aprendemos se conecta directamente con las necesidades reales de nuestra comunidad en ${ambiente}.

[ACTIVIDAD:CUADERNO:✏️ **Actividad en Cuaderno 4:** ${nombreEstudiante}, escribe en tu cuaderno una síntesis de 5 renglones sobre la importancia de este tema para tu futuro profesional o académico.]

[ACTIVIDAD:CUADERNO:🧠 **Actividad en Cuaderno 5:** ${nombreEstudiante}, crea un mapa mental en tu cuaderno relacionando el tema principal con 3 aplicaciones prácticas en tu vida diaria.]

[ACTIVIDAD:CUADERNO:🎨 **Actividad en Cuaderno 6:** ${nombreEstudiante}, realiza una ilustración final colorida en tu cuaderno que resuma la conclusión más importante de esta guía.]

[ACTIVIDAD:CUADERNO:📊 **Actividad en Cuaderno 7:** ${nombreEstudiante}, enumera en tu cuaderno 3 compromisos personales o comunitarios para cuidar tu entorno basándote en lo aprendido.]

[ACTIVIDAD:CUADERNO:📝 **Actividad en Cuaderno 8:** ${nombreEstudiante}, redacta una pregunta que le harías a un experto sobre ${sel.tema} y propone una hipótesis de respuesta.]

[ACTIVIDAD:PLATAFORMA:¿Cuál es la conclusión teórica más valiosa que ha obtenido ${nombreEstudiante} al finalizar esta lección?|El conocimiento se fortalece cuando se aplica con ética y compromiso en el territorio]

[ACTIVIDAD:PLATAFORMA:¿Cómo puede ${nombreEstudiante} compartir este conocimiento con sus compañeros o familia?|Explicando los conceptos con ejemplos cotidianos y realizando proyectos prácticos]

[JUEGO:ORDENAR_LETRAS:${sel.sopa.split(',')[5] || 'TEORIA'}]
[JUEGO:ORDENAR_LETRAS:${sel.sopa.split(',')[6] || 'MODELO'}]
[JUEGO:ORDENAR_LETRAS:${sel.sopa.split(',')[7] || 'APLICAR'}]

[JUEGO:ORDENAR_FRASE:APLICAMOS EL CONOCIMIENTO CON ETICA Y COMPROMISO SOCIAL]
[JUEGO:ORDENAR_FRASE:APRENDER ES UN PROCESO CONTINUO DE EXPLORACION Y DESCUBRIMIENTO]

¡Felicitaciones, **${nombreEstudiante}**! Has completado exitosamente la fundamentación teórica de esta misión pedagógica.`;

    return {
        objetivo_aprendizaje: sel.objetivo,
        pregunta_problematizadora: sel.problema,
        saberes_previos: sel.saberes,
        texto_inductivo: textoInductivo,
        recurso_visual: `| Dimensión | Concepto Clave | Aplicación en ${ambiente} |\n| :--- | :--- | :--- |\n| **Teoría** | ${sel.tema} | Base para la resolución de problemas |\n| **Práctica** | Retos en Cuaderno y Plataforma | Habilidades para la vida real |\n| **Impacto** | Método STEAM Integrado | Bienestar y desarrollo comunitario |`,
        texto_deductivo: textoDeductivo,
        icfes: sel.icfes,
        cierre_gamificado: {
            sopa_letras: sel.sopa
        }
    };
}

module.exports = {
    generarGuiaPredeterminada,
    obtenerCicloNormalizado
};
