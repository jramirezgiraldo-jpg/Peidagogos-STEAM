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
        
        if (ciclo === 'Ciclo I') {
            sel = {
                tema: 'Los Seres Vivos, los Sentidos y la Naturaleza',
                objetivo: `Reconocer los seres vivos del entorno, el funcionamiento de los sentidos del cuerpo humano y las rutinas de higiene y alimentación saludable.`,
                problema: `¿Cómo podemos usar nuestros sentidos y cuidar nuestro cuerpo para explorar los seres vivos en ${ambiente}?`,
                saberes: [
                    {
                        pregunta: `¿Cuál de estos elementos es un ser vivo que necesita agua y alimento para crecer?`,
                        opciones: [`Un perro o una planta de café`, `Una piedra del río`, `Una silla de madera`, `Un vaso de plástico`],
                        correcta: 0
                    },
                    {
                        pregunta: `¿Qué sentido de nuestro cuerpo usamos para sentir la temperatura y las texturas suaves o ásperas?`,
                        opciones: [`El sentido del tacto (la piel)`, `El sentido del olfato`, `El sentido del oído`, `El sentido del gusto`],
                        correcta: 0
                    },
                    {
                        pregunta: `¿Cuál es la acción más importante antes de comer para evitar bacterias y enfermedades?`,
                        opciones: [`Lavarse muy bien las manos con agua y jabón`, `Secarse con el pantalón`, `Soplar el plato con fuerza`, `Tomar agua fría`],
                        correcta: 0
                    }
                ],
                svg: `<div style='text-align:center; margin:20px 0;'><svg width='300' height='160' viewBox='0 0 300 160' xmlns='http://www.w3.org/2000/svg' style='background:#F0FDF4; border-radius:12px; border:2px solid #86EFAC;'><circle cx='80' cy='80' r='40' fill='#4ADE80'/><text x='80' y='85' font-size='26' text-anchor='middle'>🌱</text><text x='80' y='140' font-size='12' font-weight='bold' fill='#166534' text-anchor='middle'>Seres Vivos</text><circle cx='220' cy='80' r='40' fill='#60A5FA'/><text x='220' y='85' font-size='26' text-anchor='middle'>✋</text><text x='220' y='140' font-size='12' font-weight='bold' fill='#1E40AF' text-anchor='middle'>Los Sentidos</text></svg></div>`,
                icfes: [
                    {
                        contexto: `En una huerta escolar o casera, ${nombreEstudiante} observa que una planta ubicada en la sombra total tiene hojas amarillas y débiles, mientras que la que recibe sol está verde y fuerte.`,
                        pregunta: `¿A qué se debe principalmente esta diferencia en el crecimiento de las plantas?`,
                        opciones: [
                            `A que las plantas necesitan la luz solar para fabricar su alimento mediante fotosíntesis.`,
                            `A que la planta en la sombra tenía demasiado abono mineral.`,
                            `A que las plantas crecen mejor en la oscuridad total.`,
                            `A que el viento no tocaba la planta del sol.`
                        ],
                        correcta: 0,
                        retroalimentacion: {
                            "0": `¡Excelente ${nombreEstudiante}! La luz solar es el motor indispensable para la fotosíntesis.`,
                            "1": `Incorrecto. La sombra limita la energía lumínica.`,
                            "2": `Incorrecto. Sin luz las plantas no pueden sintetizar azúcares.`,
                            "3": `Incorrecto. El factor determinante principal es la radiación solar.`
                        }
                    }
                ],
                sopa: `VIDA,PLANTA,SENTIDO,AGUA,SALUD,CUERPO,SOL,TIERRA,HIGIENE,MANOS`
            };
        } else if (ciclo === 'Ciclo II') {
            sel = {
                tema: 'Ecosistemas, Estados de la Materia y Nutrición Saludable',
                objetivo: `Identificar las interacciones en los ecosistemas, los estados de la materia en procesos cotidianos del hogar y los nutrientes esenciales para la salud.`,
                problema: `¿Cómo interactúan la materia, la energía y los seres vivos en las actividades del hogar y el entorno de ${ambiente}?`,
                saberes: [
                    {
                        pregunta: `Cuando ponemos a hervir agua para el café y sale vapor al aire, ¿a qué estado físico pasa el agua?`,
                        opciones: [`Estado gaseoso (vapor de agua)`, `Estado sólido (hielo)`, `Estado viscoso`, `Estado plasmático`],
                        correcta: 0
                    },
                    {
                        pregunta: `En una cadena trófica de una huerta, las plantas que fabrican su propio alimento se denominan:`,
                        opciones: [`Organismos productores`, `Consumidores secundarios`, `Descomponedores minerales`, `Depredadores tope`],
                        correcta: 0
                    },
                    {
                        pregunta: `¿Qué grupo de alimentos aporta la energía primaria para las actividades de estudio y trabajo diario?`,
                        opciones: [`Carbohidratos saludables (plátano, arroz, avena, maíz)`, `Golosinas artificiales y gaseosas`, `Solo agua sin sólidos`, `Salchichas ultraprocesadas`],
                        correcta: 0
                    }
                ],
                svg: `<div style='text-align:center; margin:20px 0;'><svg width='320' height='160' viewBox='0 0 320 160' xmlns='http://www.w3.org/2000/svg' style='background:#EFF6FF; border-radius:12px; border:2px solid #93C5FD;'><rect x='20' y='50' width='70' height='60' rx='8' fill='#60A5FA'/><text x='55' y='85' font-size='11' font-weight='bold' fill='white' text-anchor='middle'>SÓLIDO</text><rect x='125' y='50' width='70' height='60' rx='8' fill='#3B82F6'/><text x='160' y='85' font-size='11' font-weight='bold' fill='white' text-anchor='middle'>LÍQUIDO</text><rect x='230' y='50' width='70' height='60' rx='8' fill='#1D4ED8'/><text x='265' y='85' font-size='11' font-weight='bold' fill='white' text-anchor='middle'>GASEOSO</text><text x='160' y='140' font-size='12' font-weight='bold' fill='#1E3A8A' text-anchor='middle'>Estados de la Materia</text></svg></div>`,
                icfes: [
                    {
                        contexto: `En una finca cafetera de Montenegro, se desea mantener el equilibrio ecológico evitando el uso excesivo de pesticidas químicos que dañan a las abejas y aves polinizadoras.`,
                        pregunta: `¿Cuál es la función fundamental de las abejas en el ecosistema agrícola?`,
                        opciones: [
                            `Polinizar las flores para permitir la formación de frutos y semillas en los cultivos.`,
                            `Consumir toda la madera de los árboles viejos.`,
                            `Calentar el suelo de la plantación con su vuelo.`,
                            `Aumentar la cantidad de maleza en el cafetal.`
                        ],
                        correcta: 0,
                        retroalimentacion: {
                            "0": `¡Brillante ${nombreEstudiante}! Las abejas garantizan la reproducción vegetal.`,
                            "1": `Incorrecto. Función de termitas y hongos descomponedores.`,
                            "2": `Incorrecto. El calor del suelo depende de la radiación solar.`,
                            "3": `Incorrecto. La polinización beneficia directamente a los cultivos.`
                        }
                    }
                ],
                sopa: `MATERIA,LIQUIDO,SOLIDO,GAS,ENERGIA,ECOSISTEMA,PLANTA,SUELO,AGUA,NUTRICION`
            };
        } else if (ciclo === 'Ciclo IV') {
            sel = {
                tema: 'Genética, Reacciones Químicas y Sostenibilidad Ambiental',
                objetivo: `Comprender la transmisión de información hereditaria (ADN), diferenciar cambios físicos y químicos en el entorno y proponer alternativas de conservación ecológica.`,
                problema: `¿Cómo la herencia genética y las reacciones químicas condicionan la productividad y equilibrio ambiental en ${ambiente}?`,
                saberes: [
                    {
                        pregunta: `La molécula presente en el núcleo celular que almacena las instrucciones genéticas hereditarias es:`,
                        opciones: [`ADN (Ácido Desoxirribonucleico)`, `Glucosa disuelta`, `Cloruro de sodio`, `Dióxido de carbono`],
                        correcta: 0
                    },
                    {
                        pregunta: `¿Cuál de los siguientes sucesos representa un cambio químico irreversible?`,
                        opciones: [`La combustión de leña o gas al cocinar`, `Cortar una hoja de papel`, `Fundir un bloque de hielo`, `Romper un vidrio`],
                        correcta: 0
                    },
                    {
                        pregunta: `Las plantas y cafetales absorben $CO_2$ durante el día y liberan al aire el gas vital:`,
                        opciones: [`Oxígeno ($O_2$)`, `Monóxido de carbono`, `Gas propano`, `Metano puro`],
                        correcta: 0
                    }
                ],
                svg: `<div style='text-align:center; margin:20px 0;'><svg width='320' height='160' viewBox='0 0 320 160' xmlns='http://www.w3.org/2000/svg' style='background:#FFFBEB; border-radius:12px; border:2px solid #FCD34D;'><path d='M40,80 Q90,20 160,80 T280,80' fill='none' stroke='#D97706' stroke-width='4'/><path d='M40,80 Q90,140 160,80 T280,80' fill='none' stroke='#2563EB' stroke-width='4'/><text x='160' y='145' font-size='12' font-weight='bold' fill='#92400E' text-anchor='middle'>Doble Hélice del ADN</text></svg></div>`,
                icfes: [
                    {
                        contexto: `En un cultivo se cruzan dos variedades de plantas: una homocigota dominante de tallo alto ($AA$) con una homocigota recesiva de tallo enano ($aa$).`,
                        pregunta: `De acuerdo con las leyes mendelianas, ¿qué porcentaje de la primera generación filial ($F_1$) tendrá fenotipo de tallo alto?`,
                        opciones: [
                            `100% de plantas con tallo alto (genotipo heterocigoto $Aa$).`,
                            `50% tallo alto y 50% tallo enano.`,
                            `25% tallo alto y 75% tallo enano.`,
                            `0% tallo alto (todas enanas).`
                        ],
                        correcta: 0,
                        retroalimentacion: {
                            "0": `¡Exacto ${nombreEstudiante}! El alelo dominante $A$ se expresa en la totalidad de la descendencia heterocigota.`,
                            "1": `Incorrecto. Proporción de cruce recesivo.`,
                            "2": `Incorrecto. El alelo dominante enmascara al recesivo en $F_1$.`,
                            "3": `Incorrecto. El fenotipo recesivo requiere homocigosis.`
                        }
                    }
                ],
                sopa: `GENETICA,GENOMA,ALELO,MENDEL,REACCION,ENLACE,OXIDACION,EROSION,BIODIVERSIDAD,CELULA`
            };
        } else if (ciclo === 'Ciclo V') {
            sel = {
                tema: 'Cinemática, Dinámica de Newton y Química Inorgánica',
                objetivo: `Analizar vectorialmente el movimiento de los cuerpos, aplicar las leyes de la dinámica de Newton y nombrar compuestos químicos inorgánicos.`,
                problema: `¿Cómo actúan las fuerzas mecánicas y los enlaces químicos en los procesos tecnológicos de ${ambiente}?`,
                saberes: [
                    {
                        pregunta: `La Primera Ley de Newton o Ley de la Inercia establece que un cuerpo mantiene su estado de reposo o movimiento a menos que sobre él actúe:`,
                        opciones: [`Una fuerza neta externa no nula`, `Un campo magnético puro`, `Una corriente eléctrica alternativa`, `Una reacción de oxidación`],
                        correcta: 0
                    },
                    {
                        pregunta: `El compuesto $CO_2$ producido en la respiración celular y en la combustión corresponde químicamente a un:`,
                        opciones: [`Óxido ácido (anhídrido)`, `Hidróxido alcalino`, `Sal binaria`, `Ácido hidrácido`],
                        correcta: 0
                    },
                    {
                        pregunta: `La magnitud física que mide la rapidez con la que cambia la velocidad en el tiempo es la:`,
                        opciones: [`Aceleración`, `Masa inercial`, `Trabajo mecánico`, `Temperatura`],
                        correcta: 0
                    }
                ],
                svg: `<div style='text-align:center; margin:20px 0;'><svg width='320' height='160' viewBox='0 0 320 160' xmlns='http://www.w3.org/2000/svg' style='background:#FEF2F2; border-radius:12px; border:2px solid #FCA5A5;'><rect x='110' y='50' width='100' height='60' rx='8' fill='#EF4444'/><text x='160' y='85' font-size='12' font-weight='bold' fill='white' text-anchor='middle'>$F = m \\cdot a$</text><text x='160' y='145' font-size='12' font-weight='bold' fill='#991B1B' text-anchor='middle'>Segunda Ley de Newton</text></svg></div>`,
                icfes: [
                    {
                        contexto: `Un bulto de insumos de $50\\text{ kg}$ es arrastrado sobre un piso plano mediante una fuerza horizontal de $200\\text{ N}$. La fuerza de fricción entre el saco y el suelo es de $50\\text{ N}$.`,
                        pregunta: `¿Cuál es la fuerza neta o resultante que acelera el bulto?`,
                        opciones: [
                            `$150\\text{ N}$ hacia adelante ($200\\text{ N} - 50\\text{ N}$).`,
                            `$250\\text{ N}$ sumando las fuerzas.`,
                            `$10000\\text{ N}$ multiplicando por la masa.`,
                            `$0\\text{ N}$ porque está en equilibrio absoluto.`
                        ],
                        correcta: 0,
                        retroalimentacion: {
                            "0": `¡Excelente ${nombreEstudiante}! La fuerza neta es $200\\text{ N} - 50\\text{ N} = 150\\text{ N}$.`,
                            "1": `Incorrecto. La fricción se opone al movimiento y se resta.`,
                            "2": `Incorrecto. No se multiplican las magnitudes.`,
                            "3": `Incorrecto. Hay aceleración resultante distinta de cero.`
                        }
                    }
                ],
                sopa: `INERCIA,FUERZA,NEWTON,ACELERACION,MASA,OXIDO,ENLACE,VALENCIA,DINAMICA,VECTOR`
            };
        } else if (ciclo === 'Ciclo VI') {
            sel = {
                tema: 'Termodinámica, Ondas Electromagnéticas y Química Orgánica',
                objetivo: `Aplicar las leyes de la termodinámica, comprender la propagación de ondas mecánicas y electromagnéticas y clasificar hidrocarburos orgánicos.`,
                problema: `¿Cómo la energía térmica, las ondas y la química orgánica determinan la eficiencia tecnológica y ambiental en ${ambiente}?`,
                saberes: [
                    {
                        pregunta: `La Primera Ley de la Termodinámica representa el principio fundamental de:`,
                        opciones: [`Conservación de la energía (el calor se convierte en trabajo y energía interna)`, `Destrucción espontánea de la masa`, `Generación infinita de movimiento de la nada`, `Aumento exclusivo de la gravedad`],
                        correcta: 0
                    },
                    {
                        pregunta: `Los hidrocarburos que contienen solo enlaces sencillos entre átomos de carbono (como el gas propano) son los:`,
                        opciones: [`Alcanos`, `Alquenos`, `Alquinos`, `Aromáticos bencénicos`],
                        correcta: 0
                    },
                    {
                        pregunta: `Las ondas que requieren un medio material (aire, agua, sólidos) para propagarse (como el sonido) son:`,
                        opciones: [`Ondas mecánicas`, `Ondas electromagnéticas puras`, `Rayos X vacíos`, `Fotones`],
                        correcta: 0
                    }
                ],
                svg: `<div style='text-align:center; margin:20px 0;'><svg width='320' height='160' viewBox='0 0 320 160' xmlns='http://www.w3.org/2000/svg' style='background:#F0FDF4; border-radius:12px; border:2px solid #86EFAC;'><path d='M20,80 Q50,20 80,80 T140,80 T200,80 T260,80' fill='none' stroke='#166534' stroke-width='3'/><text x='160' y='145' font-size='12' font-weight='bold' fill='#14532D' text-anchor='middle'>Movimiento Ondulatorio y Frecuencia</text></svg></div>`,
                icfes: [
                    {
                        contexto: `Un gas ideal encerrado en un cilindro absorbe $500\\text{ J}$ de calor mientras realiza un trabajo de expansión sobre el pistón de $200\\text{ J}$.`,
                        pregunta: `De acuerdo con la primera ley de la termodinámica ($\\Delta U = Q - W$), ¿cuál es el cambio en la energía interna del gas?`,
                        opciones: [
                            `$+300\\text{ J}$ ($500\\text{ J} - 200\\text{ J}$).`,
                            `$+700\\text{ J}$.`,
                            `$-300\\text{ J}$.`,
                            `$100000\\text{ J}$.`
                        ],
                        correcta: 0,
                        retroalimentacion: {
                            "0": `¡Brillante ${nombreEstudiante}! $\\Delta U = 500\\text{ J} - 200\\text{ J} = 300\\text{ J}$.`,
                            "1": `Incorrecto. El trabajo realizado por el gas se resta.`,
                            "2": `Incorrecto. La energía interna aumenta (+).`,
                            "3": `Incorrecto. No se multiplican las magnitudes.`
                        }
                    }
                ],
                sopa: `ENTROPIA,CALOR,TRABAJO,TERMODINAMICA,ONDA,FRECUENCIA,REFRACCION,ENERGIA,FOTON,ICFES`
            };
        } else {
            sel = {
                tema: 'La Célula, Mezclas Cotidianas y Conservación de la Energía',
                objetivo: `Comprender la organización celular de los seres vivos, clasificar mezclas homogéneas y heterogéneas en el hogar y aplicar el principio de conservación de la energía.`,
                problema: `¿Cómo se relacionan las estructuras microscópicas y las transformaciones energéticas con la vida diaria en ${ambiente}?`,
                saberes: [
                    {
                        pregunta: `Todos los seres vivos (desde una bacteria hasta un árbol de café o un ser humano) están constituidos por unidades vivas llamadas:`,
                        opciones: [`Células`, `Ladrillos minerales`, `Polímeros sintéticos`, `Moléculas de plástico`],
                        correcta: 0
                    },
                    {
                        pregunta: `Al disolver una cucharada de panela o azúcar en agua caliente hasta que no se ven partes separadas, formamos una mezcla:`,
                        opciones: [`Homogénea (solución)`, `Heterogénea`, `Precipitada sólida`, `Insoluble`],
                        correcta: 0
                    },
                    {
                        pregunta: `Cuando encendemos una bombilla en casa, la energía eléctrica se transforma principalmente en:`,
                        opciones: [`Energía lumínica (luz) y energía térmica (calor)`, `Energía nuclear pura`, `Energía gravitacional`, `Energía acústica pura`],
                        correcta: 0
                    }
                ],
                svg: `<div style='text-align:center; margin:20px 0;'><svg width='320' height='170' viewBox='0 0 320 170' xmlns='http://www.w3.org/2000/svg' style='background:#FAF5FF; border-radius:12px; border:2px solid #D8B4FE;'><ellipse cx='160' cy='80' rx='120' ry='55' fill='#F3E8FF' stroke='#9333EA' stroke-width='3'/><circle cx='160' cy='80' r='22' fill='#A855F7'/><text x='160' y='85' font-size='10' font-weight='bold' fill='white' text-anchor='middle'>NÚCLEO</text><text x='160' y='155' font-size='12' font-weight='bold' fill='#6B21A8' text-anchor='middle'>Estructura Básica Celular</text></svg></div>`,
                icfes: [
                    {
                        contexto: `En el proceso de fermentación del café o en la preparación de pan casero, los microorganismos (levaduras) consumen azúcares y liberan gas sin necesidad de oxígeno libre.`,
                        pregunta: `¿Qué tipo de proceso biológico y transformación ocurre durante la fermentación?`,
                        opciones: [
                            `Un proceso bioquímico anaerobio donde se transforman los azúcares y se genera energía celular.`,
                            `Una reacción física reversible sin cambio en las moléculas.`,
                            `Una evaporación espontánea del agua pura.`,
                            `Una combustión con llama abierta.`
                        ],
                        correcta: 0,
                        retroalimentacion: {
                            "0": `¡Excelente ${nombreEstudiante}! La fermentación es una ruta metabólica anaerobia clave.`,
                            "1": `Incorrecto. Hay transformación bioquímica.`,
                            "2": `Incorrecto. No se trata de un simple cambio de fase.`,
                            "3": `Incorrecto. No hay presencia de llama abierta.`
                        }
                    }
                ],
                sopa: `CELULA,NUCLEO,ENERGIA,MEZCLA,SOLUCION,CALOR,MATERIA,FERMENTO,FOTOSINTESIS,ATOMO`
            };
        }
    }

    // CONSTRUCCIÓN ESTRICTA CON MÁS DE 500 PALABRAS POR FASE
    const textoInductivo = `# 🚀 Exploración STEAM Inductiva: ${sel.tema}

¡Bienvenido(a) a tu gran expedición pedagógica, **${nombreEstudiante}**! En tu rol fundamental como **${rol}**, te encuentras explorando el apasionante entorno de **${ambiente}** en una sesión interactiva bajo el enfoque de **${enfoque}**.

***${sel.problema}***

A continuación, **${nombreEstudiante}**, iniciaremos una lectura guiada, inductiva y profunda sobre **${sel.tema}**. Es vital que leas con extrema atención cada párrafo, pues los conocimientos que abordaremos se relacionan directamente con lo que observas en tu vida diaria, tu comunidad y los retos del mundo contemporáneo.

${sel.svg}

### 📖 Capítulo 1: Observación, Asombro e Indagación Inicial del Entorno

En nuestro entorno cotidiano en **${ambiente}**, los fenómenos científicos, las transformaciones de la materia y las dinámicas sociales ocurren a cada instante a nuestro alrededor sin que a veces nos detengamos a contemplar su maravilloso origen. Cuando caminamos por las calles, observamos los paisajes naturales de nuestra región, miramos el funcionamiento de los electrodomésticos en casa o contemplamos cómo la naturaleza se autorregula, nos damos cuenta de que absolutamente todo sigue principios fundamentales que podemos comprender de manera intuitiva y apasionante.

Para ti, **${nombreEstudiante}**, comprender estos principios te permitirá tomar mejores decisiones en tu vida diaria, en tu hogar y en tu futuro académico. La ciencia y la tecnología no son fórmulas lejanas ni ecuaciones misteriosas guardadas en libros antiguos; son, por el contrario, las herramientas vivas con las que explicamos por qué caen las cosas, cómo la energía fluye de un cuerpo a otro, cómo se organizan las células o cómo se estructura un emprendimiento de turismo sostenible en nuestra propia tierra. Al indagar sobre estos aspectos, te conviertes en un agente activo capaz de transformar tu entorno.

Por ejemplo, **${nombreEstudiante}**, cuando observas detenidamente cómo interactúan los objetos al moverse, cómo el calor calienta una taza de café o cómo las personas colaboran para sacar adelante un proyecto comunal en **${ambiente}**, descubres que la curiosidad y la indagación rigurosa son los motores principales para resolver grandes desafíos sociales y ambientales. La investigación inductiva comienza siempre con una pregunta sencilla pero poderosa, seguida de la observación atenta de las evidencias que la naturaleza nos entrega.

[ACTIVIDAD:CUADERNO:✏️ **Actividad en Cuaderno 1:** ${nombreEstudiante}, responde en tu cuaderno: Escribe un texto de al menos 5 renglones explicando qué fenómeno natural o tecnológico de tu entorno en ${ambiente} te causa mayor curiosidad, qué preguntas te surgen al respecto y cómo crees que la ciencia podría ayudarte a comprenderlo mejor.]

[ACTIVIDAD:PLATAFORMA:¿Cuál es el valor principal de observar los fenómenos cotidianos con actitud científica, crítica y reflexiva en ${ambiente}?|Permite comprender las causas profundas del entorno, tomar decisiones informadas y resolver problemas reales de la comunidad]

Para continuar fortaleciendo tu agilidad mental y vocabulario técnico, **${nombreEstudiante}**, resuelve los siguientes minijuegos de reordenamiento de letras basados en los conceptos centrales de esta lección:

[JUEGO:ORDENAR_LETRAS:${sel.sopa.split(',')[0] || 'CIENCIA'}]
[JUEGO:ORDENAR_LETRAS:${sel.sopa.split(',')[1] || 'ENERGIA'}]
[JUEGO:ORDENAR_LETRAS:${sel.sopa.split(',')[2] || 'ENTORNO'}]
[JUEGO:ORDENAR_LETRAS:${sel.sopa.split(',')[3] || 'METODO'}]
[JUEGO:ORDENAR_LETRAS:${sel.sopa.split(',')[4] || 'SISTEMA'}]

[JUEGO:ORDENAR_FRASE:LA OBSERVACION Y LA CURIOSIDAD TRANSFORMAN NUESTRA COMUNIDAD]
[JUEGO:ORDENAR_FRASE:EL CONOCIMIENTO STEAM NOS AYUDA A RESOLVER RETOS REALES]

### 📖 Capítulo 2: Desarrollo, Análisis de Casos y Organización de Evidencias

Continuando con nuestra expedición de descubrimiento, **${nombreEstudiante}**, debemos profundizar en el análisis de las evidencias encontradas en el terreno. La construcción del conocimiento científico y la estructuración de proyectos innovadores requieren que aprendamos a organizar la información recopilada mediante esquemas visuales, mapas conceptuales, dibujos interpretativos y tablas comparativas. Estas herramientas no solo facilitan el estudio, sino que también permiten transmitir ideas complejas a otras personas de forma clara, sintética y altamente persuasiva.

Al analizar casos específicos dentro de **${ambiente}**, notamos cómo la teoría aprendida se pone a prueba en situaciones reales. Por ejemplo, al estudiar la conservación de la energía, la química de las mezclas o el impacto ecológico de nuestras actividades, comprendemos que cada acción tiene una consecuencia directa sobre el equilibrio ambiental y social. Como **${rol}**, tu misión consiste en examinar estos casos con imparcialidad, proponer explicaciones basadas en hechos verificables y formular soluciones creativas.

Es por ello que, **${nombreEstudiante}**, a medida que avanzamos en la lección, es fundamental que registres tus reflexiones personales en tu cuaderno de trabajo. El cuaderno no es solo un depósito de notas, sino tu bitácora de viaje donde plasmas tu pensamiento crítico, tus esquemas organizadores y los bocetos de tus ideas. Integrar la lectura inductiva con retos prácticos de dibujo y tabulación garantiza que tu aprendizaje sea duradero, significativo y aplicable en múltiples contextos de tu vida cotidiana.

[ACTIVIDAD:CUADERNO:🎨 **Actividad en Cuaderno 2:** ${nombreEstudiante}, elabora en tu cuaderno un dibujo explicativo a todo color o un esquema visual detallado donde representes el concepto central de ${sel.tema} y su relación directa con tu vida diaria en ${ambiente}.]

[ACTIVIDAD:CUADERNO:📊 **Actividad en Cuaderno 3:** ${nombreEstudiante}, diseña en tu cuaderno una tabla comparativa de 2 columnas donde contrapongas las características de dos elementos o momentos clave de este tema, resaltando sus diferencias y semejanzas de forma muy ordenada.]

[ACTIVIDAD:PLATAFORMA:¿Por qué la elaboración de esquemas visuales, mapas conceptuales y tablas comparativas facilita el aprendizaje significativo de ${nombreEstudiante}?|Ayudan a estructurar las ideas complejas, sintetizar la información clave y visualizar relaciones lógicas de manera clara]

Sigamos adelante con paso firme, entusiasmo y rigor científico en esta enriquecedora misión de exploración en **${ambiente}**.`;

    const textoDeductivo = `### 📚 Fundamentación Teórica y Síntesis Formal: ${sel.tema}

¡Excelente trabajo de investigación inductiva, **${nombreEstudiante}**! En tu calidad de **${rol}**, has demostrado que la observación inicial y la recolección de evidencias son los cimientos indispensables para construir nuevo conocimiento científico y formalizar las grandes leyes que rigen nuestro universo.

### 🏛️ Marco Conceptual y Principios Científicos Fundamentales

En esta segunda fase de la misión pedagógica, **${nombreEstudiante}**, pasaremos de las observaciones particulares a la formalización deducción teórica de los conceptos clave de **${sel.tema}**. La ciencia moderna se consolida cuando los descubrimientos empíricos se organizan bajo principios unificadores universalmente aceptados.

1. **Principio de Identidad y Coherencia Lógica:** Todo concepto biológico, físico o químico posee un significado preciso, coherente y matemáticamente o cualitativamente demostrable en la realidad. Las leyes de la naturaleza no operan de forma azarosa ni caprichosa, sino bajo patrones constantes que la humanidad ha descifrado a lo largo de siglos de investigación.

2. **Principio de Sostenibilidad, Conservación y Contexto:** La materia y la energía no se crean ni se destruyen, sino que se transforman continuamente. En **${ambiente}**, este principio se manifiesta en cada proceso biológico, industrial y social. Lo que aprendemos en el aula se conecta en tiempo real con las necesidades ambientales de nuestra comunidad, promoviendo el cuidado de los recursos naturales y el desarrollo sostenible.

3. **Integración Transdisciplinar STEAM:** El pensamiento científico no actúa aislado del arte, la tecnología y las matemáticas. Como **${nombreEstudiante}** ha podido comprobar, resolver un problema real exige combinar la creatividad artística con el método deductivo riguroso para construir soluciones éticas, duraderas y de alto impacto comunitario.

[ACTIVIDAD:CUADERNO:✏️ **Actividad en Cuaderno 4:** ${nombreEstudiante}, escribe en tu cuaderno una síntesis reflexiva de al menos 5 renglones sobre la importancia que tiene dominar los conceptos teóricos de este tema para tu desarrollo profesional, académico o personal.]

[ACTIVIDAD:CUADERNO:🧠 **Actividad en Cuaderno 5:** ${nombreEstudiante}, crea un mapa mental amplio y estructurado en tu cuaderno relacionando el tema principal de ${sel.tema} con al menos 3 aplicaciones prácticas visibles en las labores de tu hogar, tu institución o tu trabajo.]

[ACTIVIDAD:CUADERNO:🎨 **Actividad en Cuaderno 6:** ${nombreEstudiante}, realiza una ilustración final artística y colorida en tu cuaderno que resuma la conclusión teórica más importante que has extraído a lo largo de esta lección pedagógica.]

[ACTIVIDAD:CUADERNO:📊 **Actividad en Cuaderno 7:** ${nombreEstudiante}, enumera en tu cuaderno 3 compromisos personales y comunitarios concretos que asumirás para cuidar tu entorno y aplicar con responsabilidad lo aprendido en esta misión.]

[ACTIVIDAD:CUADERNO:📝 **Actividad en Cuaderno 8:** ${nombreEstudiante}, redacta una pregunta desafiante que le harías a un científico experto sobre ${sel.tema} y formula una hipótesis razonada de cómo responderías tú a esa pregunta basándote en lo aprendido.]

[ACTIVIDAD:PLATAFORMA:¿Cuál es la conclusión teórica más valiosa que ha obtenido ${nombreEstudiante} al finalizar esta fundamentación científica?|El conocimiento se fortalece y adquiere verdadero sentido cuando se aplica con ética, rigor y compromiso social en beneficio de la comunidad]

[ACTIVIDAD:PLATAFORMA:¿De qué manera estratégica puede ${nombreEstudiante} compartir este nuevo conocimiento con sus compañeros, docentes o grupo familiar?|Explicando los principios teóricos con ejemplos sencillos del entorno cotidiano y promoviendo proyectos prácticos comunitarios]

Para consolidar tu dominio sobre la fundamentación teórica formal, **${nombreEstudiante}**, resuelve la segunda ronda de minijuegos interactivos de ordenamiento de letras y frases:

[JUEGO:ORDENAR_LETRAS:${sel.sopa.split(',')[5] || 'TEORIA'}]
[JUEGO:ORDENAR_LETRAS:${sel.sopa.split(',')[6] || 'MODELO'}]
[JUEGO:ORDENAR_LETRAS:${sel.sopa.split(',')[7] || 'APLICAR'}]

[JUEGO:ORDENAR_FRASE:APLICAMOS EL CONOCIMIENTO CON ETICA Y COMPROMISO SOCIAL]
[JUEGO:ORDENAR_FRASE:APRENDER ES UN PROCESO CONTINUO DE EXPLORACION Y DESCUBRIMIENTO]

¡Felicitaciones de corazón, **${nombreEstudiante}**! Has completado con rotundo éxito la fundamentación teórica y deducción científica de esta importante misión pedagógica.`;

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
