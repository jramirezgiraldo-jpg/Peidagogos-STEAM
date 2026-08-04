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
        asignatura = 'Ciencias Naturales',
        grado = 'Ciclo III',
        periodo = '1',
        semana = '1',
        rol = 'Científico(a) Explorador(a)',
        ambiente = 'Paisaje Cultural Cafetero',
        nivel = 'Modo Supervivencia (Intermedio)',
        enfoque = 'Resolver un misterio (Indagación)',
        nombre_estudiante = 'Estudiante',
        institucion = 'Validacion'
    } = params;

    const nombreEstudiante = nombre_estudiante || 'Estudiante';
    const ciclo = obtenerCicloNormalizado(grado);
    const esNocturno = institucion === 'Validacion' || grado.toString().toLowerCase().includes('ciclo');

    // Base de datos de diagnósticos temáticos por Ciclo
    const plantillasCiclos = {
        'Ciclo I': {
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
                    opciones: [`El sentido del olfato`, `El sentido del tacto (la piel)`, `El sentido del oído`, `El sentido del gusto`],
                    correcta: 1
                },
                {
                    pregunta: `¿Cuál es la acción más importante antes de comer para evitar bacterias y enfermedades?`,
                    opciones: [`Secarse con el pantalón`, `Lavarse muy bien las manos con agua y jabón`, `Soplar el plato con fuerza`, `Tomar agua fría`],
                    correcta: 1
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
                        "0": `¡Excelente ${nombreEstudiante}! La luz solar es el motor indispensable para la fotosíntesis y la producción de clorofila.`,
                        "1": `Incorrecto. La sombra no produce exceso de abono; limita la energía lumínica.`,
                        "2": `Incorrecto. Sin luz las plantas no pueden sintetizar azúcares y se marchitan.`,
                        "3": `Incorrecto. El factor determinante principal es la captación de radiación solar.`
                    }
                },
                {
                    contexto: `Para preparar la merienda familiar, se recomienda consumir frutas frescas y verduras de la región en lugar de paquetes ultraprocesados.`,
                    pregunta: `¿Cuál es el principal beneficio de incluir frutas y agua limpia en la dieta diaria?`,
                    opciones: [
                        `Aportan vitaminas, minerales y agua que fortalecen nuestras defensas naturales.`,
                        `Hacen que no necesitemos dormir en la noche.`,
                        `Tienen más azúcar sintética que las gaseosas.`,
                        `Evitan que tengamos que lavarnos las manos.`
                    ],
                    correcta: 0,
                    retroalimentacion: {
                        "0": `¡Muy bien ${nombreEstudiante}! Las vitaminas y minerales regulan las funciones biológicas y previenen infecciones.`,
                        "1": `Incorrecto. El descanso nocturno sigue siendo vital para la regeneración celular.`,
                        "2": `Incorrecto. Las frutas contienen fructosa natural y fibra saludable.`,
                        "3": `Incorrecto. El lavado de manos siempre es obligatorio antes de comer.`
                    }
                }
            ],
            sopa: `VIDA,PLANTA,SENTIDO,AGUA,SALUD,CUERPO,SOL,TIERRA,HIGIENE,MANOS`,
            crucigrama: `Órgano del tacto|PIEL;Ser vivo que da frutos|PLANTA;Líquido vital|AGUA;Estrella que da calor|SOL;Limpieza de manos|HIGIENE`
        },

        'Ciclo II': {
            tema: 'Ecosistemas, Materia en la Cocina y Nutrición Saludable',
            objetivo: `Identificar las interacciones en los ecosistemas, los estados de la materia en procesos cotidianos del hogar y los nutrientes esenciales para la salud.`,
            problema: `¿Cómo interactúan la materia, la energía y los seres vivos en las actividades del hogar y el entorno de ${ambiente}?`,
            saberes: [
                {
                    pregunta: `Cuando ponemos a hervir agua para el café y sale vapor al aire, ¿a qué estado físico pasa el agua?`,
                    opciones: [`Estado gaseoso (vapor)`, `Estado sólido (hielo)`, `Estado viscoso`, `Estado plasmático`],
                    correcta: 0
                },
                {
                    pregunta: `En una cadena trófica de una huerta, las plantas que fabrican su propio alimento se denominan:`,
                    opciones: [`Consumidores secundarios`, `Productores`, `Descomponedores minerales`, `Depredadores tope`],
                    correcta: 1
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
                        "0": `¡Brillante ${nombreEstudiante}! Las abejas transportan el polen garantizando la reproducción vegetal y la seguridad alimentaria.`,
                        "1": `Incorrecto. Esa es función de termitas y hongos descomponedores.`,
                        "2": `Incorrecto. El calor del suelo depende de la radiación solar y cobertura vegetal.`,
                        "3": `Incorrecto. La polinización beneficia directamente a los cultivos y bosques nativos.`
                    }
                }
            ],
            sopa: `MATERIA,LIQUIDO,SOLIDO,GAS,ENERGIA,ECOSISTEMA,PLANTA,SUELO,AGUA,NUTRICION`,
            crucigrama: `Agua en estado sólido|HIELO;Fabrica su propio alimento|PRODUCTOR;Gas que respiramos|OXIGENO;Polinizador clave|ABEJA;Recurso hídrico|AGUA`
        },

        'Ciclo III': {
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
                    opciones: [`Heterogénea`, `Homogénea (solución)`, `Precipitada sólida`, `Insoluble`],
                    correcta: 1
                },
                {
                    pregunta: `Cuando encendemos una bombilla en casa, la energía eléctrica se transforma principalmente en:`,
                    opciones: [`Energía lumínica (luz) y energía térmica (calor)`, `Energía nuclear pura`, `Energía gravitacional`, `Energía acústica pura`],
                    correcta: 0
                }
            ],
            svg: `<div style='text-align:center; margin:20px 0;'><svg width='320' height='170' viewBox='0 0 320 170' xmlns='http://www.w3.org/2000/svg' style='background:#FAF5FF; border-radius:12px; border:2px solid #D8B4FE;'><ellipse cx='160' cy='80' rx='120' ry='55' fill='#F3E8FF' stroke='#9333EA' stroke-width='3'/><circle cx='160' cy='80' r='22' fill='#A855F7'/><text x='160' y='85' font-size='10' font-weight='bold' fill='white' text-anchor='middle'>NÚCLEO</text><circle cx='105' cy='75' r='10' fill='#C084FC'/><circle cx='215' cy='75' r='10' fill='#C084FC'/><text x='160' y='155' font-size='12' font-weight='bold' fill='#6B21A8' text-anchor='middle'>Estructura Básica Celular</text></svg></div>`,
            icfes: [
                {
                    contexto: `En el proceso de fermentación del café o en la preparación de pan casero, los microorganismos (levaduras) consumen azúcares y liberan gas y compuestos aromáticos sin necesidad de oxígeno libre.`,
                    pregunta: `¿Qué tipo de proceso biológico y transformación ocurre durante la fermentación?`,
                    opciones: [
                        `Un proceso bioquímico anaerobio donde se transforman los azúcares y se genera energía celular.`,
                        `Una reacción física reversible sin cambio en las moléculas.`,
                        `Una evaporación espontánea del agua pura.`,
                        `Una combustión con llama abierta.`
                    ],
                    correcta: 0,
                    retroalimentacion: {
                        "0": `¡Excelente ${nombreEstudiante}! La fermentación es una ruta metabólica anaerobia clave en la biotecnología tradicional.`,
                        "1": `Incorrecto. Hay síntesis y degradación enzimática de sustancias químicas.`,
                        "2": `Incorrecto. No se trata de un simple cambio de fase del agua.`,
                        "3": `Incorrecto. No hay presencia de fuego ni combustión térmica.`
                    }
                },
                {
                    contexto: `Al calentar agua en una tetera metálica sobre una estufa, el calor se propaga a través del metal del recipiente por contacto directo entre partículas.`,
                    pregunta: `¿A qué mecanismo de transferencia de calor corresponde este fenómeno?`,
                    opciones: [
                        `Conducción térmica.`,
                        `Convección atmosférica exclusivamente.`,
                        `Radiación electromagnética visible.`,
                        `Sublimación regresiva.`
                    ],
                    correcta: 0,
                    retroalimentacion: {
                        "0": `¡Muy bien ${nombreEstudiante}! En los sólidos metálicos el calor se transmite principalmente por conducción.`,
                        "1": `Incorrecto. La convección ocurre en fluidos (líquidos y gases) por movimiento de masa.`,
                        "2": `Incorrecto. La radiación no requiere contacto material (ej. luz del sol).`,
                        "3": `Incorrecto. La sublimación es un cambio de estado físico.`
                    }
                }
            ],
            sopa: `CELULA,NUCLEO,ENERGIA,MEZCLA,SOLUCION,CALOR,MATERIA,FERMENTO,FOTOSINTESIS,ATOMO`,
            crucigrama: `Unidad de vida|CELULA;Centro de control celular|NUCLEO;Mezcla uniforme|HOMOGENEA;Capacidad de hacer trabajo|ENERGIA;Transferencia en sólidos|CONDUCCION`
        },

        'Ciclo IV': {
            tema: 'Genética, Cambios Químicos y Sostenibilidad Ambiental',
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
            svg: `<div style='text-align:center; margin:20px 0;'><svg width='320' height='160' viewBox='0 0 320 160' xmlns='http://www.w3.org/2000/svg' style='background:#FFFBEB; border-radius:12px; border:2px solid #FCD34D;'><path d='M40,80 Q90,20 160,80 T280,80' fill='none' stroke='#D97706' stroke-width='4'/><path d='M40,80 Q90,140 160,80 T280,80' fill='none' stroke='#2563EB' stroke-width='4'/><line x1='100' y1='50' x2='100' y2='110' stroke='#6B7280' stroke-width='2'/><line x1='160' y1='80' x2='160' y2='80' stroke='#6B7280' stroke-width='2'/><line x1='220' y1='50' x2='220' y2='110' stroke='#6B7280' stroke-width='2'/><text x='160' y='145' font-size='12' font-weight='bold' fill='#92400E' text-anchor='middle'>Doble Hélice del ADN</text></svg></div>`,
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
                        "0": `¡Exacto ${nombreEstudiante}! El alelo dominante $A$ se expresa en la totalidad de la descendencia heterocigota $Aa$.`,
                        "1": `Incorrecto. Esa proporción se obtiene al cruzar un heterocigoto con un homocigoto recesivo ($Aa \\times aa$).`,
                        "2": `Incorrecto. El alelo dominante enmascara al recesivo en $F_1$.`,
                        "3": `Incorrecto. El fenotipo recesivo solo se expresa en homocigosis ($aa$).`
                    }
                }
            ],
            sopa: `GENETICA,GENOMA,ALELO,MENDEL,REACCION,ENLACE,OXIDACION,EROSION,BIODIVERSIDAD,CELULA`,
            crucigrama: `Molécula de la herencia|ADN;Forma de un gen|ALELO;Reacción con oxígeno|OXIDACION;Padre de la genética|MENDEL;Desgaste del suelo|EROSION`
        },

        'Ciclo V': {
            tema: 'Cinemática, Dinámica de Newton y Propiedades de los Fluidos',
            objetivo: `Modelar matemáticamente el movimiento rectilíneo uniforme y acelerado, aplicar las tres leyes de Newton y analizar la presión en fluidos.`,
            problema: `¿Cómo explican las leyes de la mecánica clásica y la hidrostática el movimiento y transporte en ${ambiente}?`,
            saberes: [
                {
                    pregunta: `Si un vehículo viaja con velocidad constante de $20\\text{ m/s}$ en línea recta durante $10\\text{ segundos}$, la distancia recorrida es:`,
                    opciones: [`$200\\text{ metros}$`, `$2\\text{ metros}$`, `$50\\text{ metros}$`, `$2000\\text{ metros}$`],
                    correcta: 0
                },
                {
                    pregunta: `La Primera Ley de Newton (Inercia) establece que un cuerpo permanece en reposo o MRU a menos que:`,
                    opciones: [`Una fuerza neta externa actúe sobre él`, `Su masa sea nula`, `No tenga energía térmica`, `Gire en un círculo`],
                    correcta: 0
                },
                {
                    pregunta: `La presión hidrostática que ejerce un líquido en reposo depende directamente de:`,
                    opciones: [`La profundidad y la densidad del líquido ($P = \\rho g h$)`, `El color del recipiente`, `La forma de la tapa`, `El volumen total sin importar la altura`],
                    correcta: 0
                }
            ],
            svg: `<div style='text-align:center; margin:20px 0;'><svg width='320' height='160' viewBox='0 0 320 160' xmlns='http://www.w3.org/2000/svg' style='background:#F8FAFC; border-radius:12px; border:2px solid #CBD5E1;'><line x1='40' y1='120' x2='280' y2='120' stroke='#334155' stroke-width='3'/><rect x='110' y='60' width='80' height='60' rx='4' fill='#3B82F6'/><text x='150' y='95' font-size='14' font-weight='bold' fill='white' text-anchor='middle'>m = 10 kg</text><line x1='190' y1='90' x2='260' y2='90' stroke='#EF4444' stroke-width='4' marker-end='url(#arrow)'/><text x='225' y='80' font-size='12' font-weight='bold' fill='#EF4444' text-anchor='middle'>F = 50 N</text><text x='150' y='145' font-size='12' font-weight='bold' fill='#1E293B' text-anchor='middle'>Segunda Ley: F = m · a</text></svg></div>`,
            icfes: [
                {
                    contexto: `Un bloque de masa $m = 5\\text{ kg}$ se encuentra sobre una superficie horizontal lisa (sin fricción). Se le aplica una fuerza horizontal constante $F = 20\\text{ N}$.`,
                    pregunta: `¿Cuál es la aceleración que experimenta el bloque durante la aplicación de la fuerza?`,
                    opciones: [
                        `$a = 4\\text{ m/s}^2$ ($a = \\frac{F}{m} = \\frac{20}{5}$)`,
                        `$a = 100\\text{ m/s}^2$`,
                        `$a = 0.25\\text{ m/s}^2$`,
                        `$a = 15\\text{ m/s}^2$`
                    ],
                    correcta: 0,
                    retroalimentacion: {
                        "0": `¡Impecable ${nombreEstudiante}! Aplicando $F = m \\cdot a$, despejamos $a = F/m = 20/5 = 4\\text{ m/s}^2$.`,
                        "1": `Incorrecto. No se multiplican masa y fuerza para hallar la aceleración.`,
                        "2": `Incorrecto. La relación es $F/m$, no $m/F$.`,
                        "3": `Incorrecto. No es una resta de magnitudes.`
                    }
                }
            ],
            sopa: `INERCIA,FUERZA,MASA,ACELERACION,VELOCIDAD,PRESION,DENSIDAD,TRABAJO,GRAVEDAD,NEWTON`,
            crucigrama: `Resistencia al cambio de movimiento|INERCIA;Causa de aceleración|FUERZA;Unidad de fuerza|NEWTON;Fuerza por unidad de área|PRESION;Masa sobre volumen|DENSIDAD`
        },

        'Ciclo VI': {
            tema: 'Termodinámica, Ondas Electromagnéticas y Preparación Saber 11',
            objetivo: `Interpretar las leyes de la termodinámica, analizar fenómenos ondulatorios y resolver problemas interdisciplinares tipo ICFES Saber 11.`,
            problema: `¿Cómo interactúan las leyes de la termodinámica y los espectros electromagnéticos con la tecnología actual en ${ambiente}?`,
            saberes: [
                {
                    pregunta: `La Primera Ley de la Termodinámica expresa la conservación de la energía mediante la ecuación:`,
                    opciones: [`$\\Delta U = Q - W$`, `$F = m \\cdot a$`, `$E = m \\cdot c^2$`, `$P = V \\cdot I$`],
                    correcta: 0
                },
                {
                    pregunta: `Cuando una onda luminosa o sonora pasa de un medio material a otro diferente y cambia su velocidad y dirección, ocurre:`,
                    opciones: [`Refracción`, `Reflexión especular`, `Difracción pura`, `Polarización circular`],
                    correcta: 0
                },
                {
                    pregunta: `¿Cuál de las siguientes radiaciones del espectro electromagnético posee mayor frecuencia y energía cuántica?`,
                    opciones: [`Rayos Gamma`, `Ondas de Radio AM`, `Microondas`, `Luz Infrarroja`],
                    correcta: 0
                }
            ],
            svg: `<div style='text-align:center; margin:20px 0;'><svg width='320' height='160' viewBox='0 0 320 160' xmlns='http://www.w3.org/2000/svg' style='background:#0F172A; border-radius:12px; border:2px solid #334155;'><path d='M30,80 Q70,20 110,80 T190,80 T270,80' fill='none' stroke='#38BDF8' stroke-width='3'/><line x1='30' y1='80' x2='290' y2='80' stroke='#64748B' stroke-width='1.5' stroke-dasharray='4,4'/><text x='160' y='140' font-size='12' font-weight='bold' fill='#38BDF8' text-anchor='middle'>Onda: Longitud de Onda λ y Frecuencia f</text></svg></div>`,
            icfes: [
                {
                    contexto: `Un gas ideal contenido en un cilindro con émbolo móvil absorbe $Q = 500\\text{ J}$ de calor del entorno mientras realiza un trabajo de expansión sobre el pistón de $W = 200\\text{ J}$.`,
                    pregunta: `¿Cuál es la variación de la energía interna ($\\Delta U$) del gas?`,
                    opciones: [
                        `$\\Delta U = +300\\text{ J}$ ($\Delta U = Q - W = 500 - 200$)`,
                        `$\\Delta U = +700\\text{ J}$`,
                        `$\\Delta U = -300\\text{ J}$`,
                        `$\\Delta U = +1000\\text{ J}$`
                    ],
                    correcta: 0,
                    retroalimentacion: {
                        "0": `¡Excelente ${nombreEstudiante}! Aplicando la primera ley termodinámica: $\\Delta U = Q - W = 500\\text{ J} - 200\\text{ J} = 300\\text{ J}$.`,
                        "1": `Incorrecto. El calor absorbido entra como positivo y el trabajo realizado por el gas se resta.`,
                        "2": `Incorrecto. El gas absorbió más calor del trabajo que realizó, por lo tanto su energía interna aumenta (+).`,
                        "3": `Incorrecto. No se multiplican las magnitudes.`
                    }
                }
            ],
            sopa: `ENTROPIA,CALOR,TRABAJO,TERMODINAMICA,ONDA,FRECUENCIA,REFRACCION,ENERGIA,FOTON,ICFES`,
            crucigrama: `Grado de desorden del sistema|ENTROPIA;Energía en tránsito térmico|CALOR;Cambio de dirección de onda|REFRACCION;Número de ciclos por segundo|FRECUENCIA;Partícula de luz|FOTON`
        }
    };

    const sel = plantillasCiclos[ciclo] || plantillasCiclos['Ciclo III'];

    // Construcción del texto inductivo con gamificación embebida
    const textoInductivo = `# 🚀 Misión Diagnóstica STEAM: ${sel.tema}

¡Bienvenido(a), **${nombreEstudiante}**! En tu rol de **${rol}**, te encuentras en el entorno de **${ambiente}** enfrentando un reto de nivel **${nivel}** bajo el enfoque de **${enfoque}**.

***${sel.problema}***

Hoy activaremos tus saberes previos mediante desafíos interactivos, análisis visual y experimentos prácticos para tu cuaderno.

${sel.svg}

## 🧩 Desafío 1: Pistas y Conceptos Clave

Para iniciar la expedición, debemos ordenar nuestras herramientas conceptuales:

[JUEGO:ORDENAR_LETRAS:${sel.tema.split(' ')[1] || 'CIENCIA'}]

[JUEGO:ORDENAR_FRASE:LA CIENCIA TRANSFORMA NUESTRO ENTORNO]

En ${ambiente}, cada observación que realizas cuenta. La física, la química y la biología no son fórmulas lejanas: son los principios que explican el funcionamiento de tu cuerpo, la preparación de alimentos en tu cocina y la conservación de la naturaleza.

[JUEGO:SOPA_LETRAS:${sel.sopa.split(',').slice(0, 5).join(',')}]

[JUEGO:CRUCIGRAMA:${sel.crucigrama}]

## 🔍 Desafío 2: Investigación en el Terreno

[JUEGO:ORDENAR_FRASE:OBSERVAR INDAGAR Y EXPLICAR CON RIGOR]

Continúa explorando los fenómenos a tu alrededor. A continuación encontrarás las preguntas de análisis y los retos prácticos diseñados especialmente para ti.`;

    const textoDeductivo = `### 📚 Síntesis y Fundamentación Conceptual

**${nombreEstudiante}**, como **${rol}**, has demostrado que los saberes previos son el cimiento para construir nuevo conocimiento científico.

* **Principio Fundamental:** En todo fenómeno natural existe conservación de materia y energía.
* **Aplicación Cotidiana:** Lo que aprendemos en el aula se aplica directamente en el hogar, el trabajo y el cuidado del entorno en ${ambiente}.

[JUEGO:SOPA_LETRAS:${sel.sopa.split(',').slice(5, 10).join(',')}]`;

    return {
        objetivo_aprendizaje: sel.objetivo,
        pregunta_problematizadora: sel.problema,
        saberes_previos: sel.saberes,
        texto_inductivo: textoInductivo,
        recurso_visual: `| Concepto Clave | Significado en ${ambiente} | Aplicación en la Vida Diaria |\n| :--- | :--- | :--- |\n| **Saberes Previos** | Experiencias y vivencias del estudiante | Base para resolver problemas nuevos |\n| **Método STEAM** | Ciencia, Tecnología, Arte y Matemáticas integradas | Proyectos útiles para la comunidad |\n| **Pensamiento Crítico** | Capacidad de formular hipótesis y verificar hechos | Toma de decisiones informadas y éticas |`,
        preguntas_inductivas_pagina: [
            {
                pregunta: `¿Cuál es el objetivo principal de esta misión diagnóstica en ${ambiente}?`,
                respuesta_esperada: `Identificar saberes previos y relacionar los conceptos de ${sel.tema} con la vida cotidiana.`
            },
            {
                pregunta: `¿Por qué es importante integrar la ciencia con los retos diarios en el hogar y la región?`,
                respuesta_esperada: `Porque permite aplicar el conocimiento para resolver necesidades reales de salud, producción y sostenibilidad.`
            },
            {
                pregunta: `¿Cómo ayuda el rol de ${rol} a resolver el misterio planteado?`,
                respuesta_esperada: `Fomenta la curiosidad, el método de indagación riguroso y la formulación de explicaciones lógicas.`
            }
        ],
        preguntas_inductivas_cuaderno: [
            `✏️ **Reto en Cuaderno 1:** Elabora un mapa conceptual o dibujo explicativo en tu cuaderno que resuma las ideas clave de ${sel.tema}.`,
            `📝 **Reto en Cuaderno 2:** Escribe un párrafo de 5 renglones explicando cómo aplicas la ciencia en una actividad real de tu hogar o trabajo.`,
            `🔬 **Reto en Cuaderno 3:** Diseña una propuesta sencilla para mejorar el cuidado del agua o los recursos naturales en ${ambiente}.`
        ],
        texto_deductivo: textoDeductivo,
        icfes: sel.icfes,
        cierre_gamificado: {
            sopa_letras: sel.sopa,
            crucigrama: sel.crucigrama
        }
    };
}

module.exports = {
    generarGuiaPredeterminada,
    obtenerCicloNormalizado
};
