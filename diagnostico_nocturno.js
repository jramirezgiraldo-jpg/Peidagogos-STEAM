// =========================================================
// MÓDULO DE DIAGNÓSTICO GAMIFICADO PARA CICLOS NOCTURNOS (I - VI)
// ÁREA: CIENCIAS NATURALES - PEIDAGOGOS STEAM
// =========================================================

window.DIAGNOSTICOS_CICLOS = {
    'Ciclo I': {
        ciclo: 'Ciclo I',
        gradosEquiv: '1°, 2°, 3°',
        titulo: 'Misión Cero: Descubriendo el Entorno Vivo y Mi Cuerpo',
        intro: '¡Bienvenido(a) a tu aventura en Ciencias Naturales! Esta breve misión evaluará tus saberes previos sobre los seres vivos, el cuidado del cuerpo y la naturaleza de manera divertida y práctica.',
        preguntas: [
            {
                id: 1,
                enunciado: '¿Cuál de los siguientes elementos es un **ser vivo** que necesita agua, aire y alimento para crecer y desarrollarse?',
                icono: '🌱',
                opciones: [
                    { texto: 'Un perro o una planta de frijol', correcta: true, retro: '¡Correcto! Los animales y las plantas son seres vivos que nacen, crecen, se alimentan y se reproducen.' },
                    { texto: 'Una piedra del río', correcta: false, retro: 'Las piedras son objetos inertes (no vivos); no se alimentan ni crecen.' },
                    { texto: 'Una silla de plástico o madera', correcta: false, retro: 'Los muebles son objetos fabricados por el ser humano, no seres vivos.' }
                ]
            },
            {
                id: 2,
                enunciado: 'Para percibir si una paila está caliente en la cocina o sentir la textura suave de una cobija, ¿qué **sentido** de nuestro cuerpo utilizamos principalmente?',
                icono: '✋',
                opciones: [
                    { texto: 'El sentido del tacto (la piel)', correcta: true, retro: '¡Excelente! La piel nos permite sentir la temperatura, el dolor y las texturas.' },
                    { texto: 'El sentido del olfato (la nariz)', correcta: false, retro: 'El olfato nos sirve para captar olores y aromas, no la temperatura directa.' },
                    { texto: 'El sentido del oído (las orejas)', correcta: false, retro: 'El oído nos permite escuchar sonidos y ruidos del ambiente.' }
                ]
            },
            {
                id: 3,
                enunciado: 'Para que una planta en nuestro jardín, huerta o finca cafetera crezca verde y fuerte, ¿cuáles son los dos elementos indispensables que **no pueden faltar**?',
                icono: '☀️',
                opciones: [
                    { texto: 'La luz del sol y el agua', correcta: true, retro: '¡Muy bien! Las plantas usan la luz solar y el agua para fabricar su alimento mediante la fotosíntesis.' },
                    { texto: 'La oscuridad total y bolsas de plástico', correcta: false, retro: 'Sin luz ni agua, las plantas se marchitan y mueren rápidamente.' },
                    { texto: 'Sal marina concentrada en la tierra', correcta: false, retro: 'El exceso de sal quema las raíces de las plantas.' }
                ]
            },
            {
                id: 4,
                enunciado: '¿Cuál es el hábito de higiene más importante antes de preparar los alimentos o comer para **evitar bacterias y enfermedades**?',
                icono: '🧼',
                opciones: [
                    { texto: 'Lavarse muy bien las manos con agua y jabón', correcta: true, retro: '¡Totalmente cierto! El lavado de manos elimina microbios y previene infecciones estomacales y respiratorias.' },
                    { texto: 'Secarse las manos en el pantalón', correcta: false, retro: 'Secarse con la ropa puede transferir polvo y bacterias a los alimentos.' },
                    { texto: 'Soplar la comida con fuerza', correcta: false, retro: 'Soplar puede esparcir saliva y gérmenes sobre la comida.' }
                ]
            }
        ]
    },

    'Ciclo II': {
        ciclo: 'Ciclo II',
        gradosEquiv: '4°, 5°',
        titulo: 'Misión Cero: Ecosistemas, Materia y Nutrición en el Hogar',
        intro: '¡Bienvenido(a) a Ciencias Naturales Ciclo II! Vamos a explorar cómo se transforma la materia en la cocina, cómo nos alimentamos y cómo cuidamos los ecosistemas de nuestra región.',
        preguntas: [
            {
                id: 1,
                enunciado: 'Cuando ponemos agua en la paila para colar el café y empieza a hervir soltando vapor al aire, ¿a qué **estado de la materia** pasa el agua?',
                icono: '☕',
                opciones: [
                    { texto: 'Estado gaseoso (vapor de agua)', correcta: true, retro: '¡Exacto! El calor hace que el agua líquida se evapore y pase a estado gaseoso.' },
                    { texto: 'Estado sólido (hielo)', correcta: false, retro: 'El estado sólido se obtiene al enfriar el agua por debajo de 0 °C (congelación).' },
                    { texto: 'Estado pegajoso', correcta: false, retro: 'Los tres estados fundamentales son sólido, líquido y gaseoso.' }
                ]
            },
            {
                id: 2,
                enunciado: 'En una huerta o finca, las plantas verdes fabrican su propio alimento con la luz del sol. Por esta razón, en una cadena alimenticia se llaman:',
                icono: '🌿',
                opciones: [
                    { texto: 'Organismos productores', correcta: true, retro: '¡Brillante! Las plantas son la base de la vida porque producen biomasa a partir de la energía solar.' },
                    { texto: 'Depredadores carnívoros', correcta: false, retro: 'Los depredadores se alimentan de otros animales.' },
                    { texto: 'Descomponedores minerales', correcta: false, retro: 'Los descomponedores (como hongos y lombrices) reciclan la materia muerta.' }
                ]
            },
            {
                id: 3,
                enunciado: '¿Qué grupo de alimentos nos proporciona **energía directa y duradera** para las labores de trabajo físico y estudio diario?',
                icono: '🥔',
                opciones: [
                    { texto: 'Carbohidratos saludables (plátano, arroz, maíz, papa y avena)', correcta: true, retro: '¡Muy bien! Los carbohidratos son el combustible principal de nuestros músculos y cerebro.' },
                    { texto: 'Dulces artificiales y gaseosas exclusivamente', correcta: false, retro: 'Los azúcares refinados dan un pico rápido de energía seguido de fatiga y riesgos para la salud.' },
                    { texto: 'Solo agua sin ningún alimento sólido', correcta: false, retro: 'El agua hidrata, pero no aporta calorías ni nutrientes esenciales.' }
                ]
            },
            {
                id: 4,
                enunciado: '¿Por qué es indispensable no arrojar basuras, plásticos ni aceites usados a las **quebradas y ríos del Quindío**?',
                icono: '💧',
                opciones: [
                    { texto: 'Porque contamina el agua potable de las comunidades y mata a los peces y fauna local', correcta: true, retro: '¡Correcto! El agua limpia es el recurso vital para la salud comunitaria, el cultivo del café y la biodiversidad.' },
                    { texto: 'Porque el plástico se disuelve en el agua en menos de un minuto', correcta: false, retro: 'El plástico tarda cientos de años en degradarse, contaminando ríos y mares.' },
                    { texto: 'Porque el aceite hace que el agua hierva más rápido', correcta: false, retro: 'El aceite forma una capa que asfixia la vida acuática e impide el paso de oxígeno.' }
                ]
            }
        ]
    },

    'Ciclo III': {
        ciclo: 'Ciclo III',
        gradosEquiv: '6°, 7°',
        titulo: 'Misión Cero: La Célula, las Mezclas y la Energía Cotidiana',
        intro: '¡Bienvenido(a) a Ciencias Naturales Ciclo III! Reconoceremos la unidad de la vida (la célula), los tipos de mezclas que usamos a diario y las fuentes de energía que mueven nuestro mundo.',
        preguntas: [
            {
                id: 1,
                enunciado: 'Todos los seres vivos (desde una pequeña bacteria hasta un árbol de café o una persona) están formados por unidades vivas microscópicas llamadas:',
                icono: '🔬',
                opciones: [
                    { texto: 'Células', correcta: true, retro: '¡Correcto! La célula es la unidad estructural, funcional y de origen de todos los seres vivos.' },
                    { texto: 'Ladrillos minerales', correcta: false, retro: 'Los ladrillos son materiales de construcción inertes, no unidades biológicas vivas.' },
                    { texto: 'Plásticos biológicos', correcta: false, retro: 'Los plásticos son polímeros sintéticos, no componentes naturales de la vida.' }
                ]
            },
            {
                id: 2,
                enunciado: 'Cuando mezclamos agua caliente con una cucharada de azúcar o café soluble y se disuelve por completo sin dejar fases separadas a la vista, obtenemos una mezcla:',
                icono: '☕',
                opciones: [
                    { texto: 'Homogénea (solución)', correcta: true, retro: '¡Excelente! En las mezclas homogéneas sus componentes están distribuidos de forma uniforme y no se distinguen a simple vista.' },
                    { texto: 'Heterogénea (como agua con arena o aceite)', correcta: false, retro: 'En las mezclas heterogéneas se distinguen claramente las partes o capas separadas.' },
                    { texto: 'Sólida indestructible', correcta: false, retro: 'Sigue siendo un líquido con soluto disuelto.' }
                ]
            },
            {
                id: 3,
                enunciado: 'Cuando encendemos una bombilla en nuestra casa, la energía eléctrica que viaja por el cable se transforma principalmente en:',
                icono: '💡',
                opciones: [
                    { texto: 'Energía lumínica (luz) y una parte en energía térmica (calor)', correcta: true, retro: '¡Muy bien! Según el principio de conservación de la energía, la electricidad se transforma en luz y calor útil.' },
                    { texto: 'Energía nuclear destructiva', correcta: false, retro: 'Una bombilla doméstica no produce reacciones nucleares.' },
                    { texto: 'Solo energía sonora', correcta: false, retro: 'Las bombillas emiten luz, no sonido.' }
                ]
            },
            {
                id: 4,
                enunciado: 'En la preparación tradicional del pan, el kumis y el yogur se utilizan **microorganismos benéficos** (levaduras y bacterias) con el fin de:',
                icono: '🥖',
                opciones: [
                    { texto: 'Fermentar los azúcares y transformar los alimentos haciéndolos nutritivos y esponjosos', correcta: true, retro: '¡Brillante! La biotecnología tradicional utiliza levaduras y bacterias lácticas para fermentar alimentos seguros y deliciosos.' },
                    { texto: 'Envenenar y dañar la masa', correcta: false, retro: 'Estos microorganismos son comestibles y muy beneficiosos para la flora intestinal.' },
                    { texto: 'Evitar que la masa toque el aire', correcta: false, retro: 'La fermentación ocurre internamente por acción enzimática.' }
                ]
            }
        ]
    },

    'Ciclo IV': {
        ciclo: 'Ciclo IV',
        gradosEquiv: '8°, 9°',
        titulo: 'Misión Cero: Genética, Reacciones Químicas y Paisaje Cafetero',
        intro: '¡Bienvenido(a) a Ciencias Naturales Ciclo IV! Conectaremos la herencia de rasgos familiares, las transformaciones químicas del día a día y la conservación ambiental de nuestro territorio.',
        preguntas: [
            {
                id: 1,
                enunciado: 'Los rasgos que heredamos de nuestros padres y abuelos (como el color de ojos, tipo de cabello y estatura) están codificados en una molécula dentro de las células llamada:',
                icono: '🧬',
                opciones: [
                    { texto: 'ADN (Ácido Desoxirribonucleico)', correcta: true, retro: '¡Exacto! El ADN contiene las instrucciones genéticas que determinan nuestras características biológicas.' },
                    { texto: 'Oxígeno disuelto', correcta: false, retro: 'El oxígeno participa en la respiración celular, pero no almacena la información genética hereditaria.' },
                    { texto: 'Cloruro de sodio', correcta: false, retro: 'El cloruro de sodio es la sal común de cocina.' }
                ]
            },
            {
                id: 2,
                enunciado: '¿Cuál de los siguientes sucesos representa un **cambio químico** donde los materiales originales se transforman en sustancias totalmente nuevas?',
                icono: '🔥',
                opciones: [
                    { texto: 'La combustión de la leña o el gas al cocinar (quema con desprendimiento de humo y ceniza)', correcta: true, retro: '¡Muy bien! En la combustión, los enlaces químicos se rompen y se forman nuevos gases ($CO_2$, vapor de agua) y ceniza.' },
                    { texto: 'Cortar una hoja de papel en cuatro pedazos', correcta: false, retro: 'El papel cortado sigue siendo químicamente papel (cambio físico).' },
                    { texto: 'Derretir un cubito de hielo en un vaso', correcta: false, retro: 'El hielo derretido sigue siendo agua líquida $H_2O$ (cambio de estado físico).' }
                ]
            },
            {
                id: 3,
                enunciado: 'Durante el día, los árboles y cafetales absorben dióxido de carbono ($CO_2$) y liberan al aire un gas vital para la respiración humana llamado:',
                icono: '🌳',
                opciones: [
                    { texto: 'Oxígeno ($O_2$)', correcta: true, retro: '¡Correcto! A través de la fotosíntesis, los árboles limpian el aire y generan el oxígeno que respiramos.' },
                    { texto: 'Monóxido de carbono tóxico', correcta: false, retro: 'El monóxido de carbono es un gas nocivo producto de combustiones incompletas.' },
                    { texto: 'Gas propano', correcta: false, retro: 'El propano es un hidrocarburo inflamable usado en pipas de gas doméstico.' }
                ]
            },
            {
                id: 4,
                enunciado: 'En las laderas del Paisaje Cultural Cafetero, sembrar árboles de sombrío y mantener coberturas vegetales vivas en el suelo ayuda principalmente a:',
                icono: '⛰️',
                opciones: [
                    { texto: 'Evitar derrumbes, prevenir la erosión del suelo y conservar la humedad natural', correcta: true, retro: '¡Excelente! Las raíces de los árboles amarran la tierra y protegen las fuentes hídricas frente a lluvias fuertes.' },
                    { texto: 'Secar el terreno para que no crezca nada', correcta: false, retro: 'Al contrario, la sombra y cobertura conservan el agua y la fertilidad.' },
                    { texto: 'Aumentar la temperatura del suelo sin control', correcta: false, retro: 'La vegetación regula el microclima haciéndolo más fresco y equilibrado.' }
                ]
            }
        ]
    },

    'Ciclo V': {
        ciclo: 'Ciclo V',
        gradosEquiv: '10°',
        titulo: 'Misión Cero: Materia, Reacciones y Mecánica Aplicada',
        intro: '¡Bienvenido(a) a Ciencias Naturales Ciclo V! Analizaremos la química de las sustancias cotidianas, la estructura molecular básica y las fuerzas que facilitan el trabajo físico.',
        preguntas: [
            {
                id: 1,
                enunciado: 'El agua pura que consumimos es una sustancia compuesta formada químicamente por la unión de dos átomos de hidrógeno y uno de oxígeno, representada por la fórmula:',
                icono: '💧',
                opciones: [
                    { texto: '$H_2O$', correcta: true, retro: '¡Correcto! Dos átomos de Hidrógeno unidos covalentemente a un átomo de Oxígeno forman la molécula de agua.' },
                    { texto: '$CO_2$', correcta: false, retro: '$CO_2$ representa el Dióxido de Carbono presente en la respiración y emisiones.' },
                    { texto: '$NaCl$', correcta: false, retro: '$NaCl$ es el Cloruro de Sodio (sal de cocina).' }
                ]
            },
            {
                id: 2,
                enunciado: 'El jugo de limón y el vinagre son sustancias de carácter **ácido**. Para neutralizar de forma casera un derrame ácido o la acidez gástrica leve, se suele emplear una sustancia **básica (alcalina)** como:',
                icono: '🧪',
                opciones: [
                    { texto: 'Bicarbonato de sodio disuelto en agua', correcta: true, retro: '¡Excelente! El bicarbonato es una base suave que reacciona con los ácidos neutralizando su efecto.' },
                    { texto: 'Más jugo de limón concentrado', correcta: false, retro: 'Agregar más limón aumentaría la acidez en lugar de neutralizarla.' },
                    { texto: 'Aceite vegetal de cocina', correcta: false, retro: 'El aceite no neutraliza químicamente los iones ácidos.' }
                ]
            },
            {
                id: 3,
                enunciado: 'Para subir un bulto pesado o una carretilla a un andén alto, usar una **rampa inclinada** en lugar de alzarlo a pulso verticalmente permite:',
                icono: '🏗️',
                opciones: [
                    { texto: 'Aplicar una fuerza menor distribuyendo el esfuerzo a lo largo de una distancia mayor', correcta: true, retro: '¡Muy bien! El plano inclinado es una máquina simple que reduce la fuerza necesaria para elevar una carga.' },
                    { texto: 'Eliminar por completo el peso del objeto como si flotara en el espacio', correcta: false, retro: 'El peso del objeto sigue siendo el mismo, lo que disminuye es la fuerza que debemos aplicar.' },
                    { texto: 'Aumentar el peso del bulto al doble', correcta: false, retro: 'La masa del objeto no cambia por usar una rampa.' }
                ]
            },
            {
                id: 4,
                enunciado: 'En la limpieza del hogar o lugar de trabajo, ¿por qué es **extremadamente peligroso** mezclar límpido (cloro/hipoclorito) con ácidos (ácido muriático o vinagre)?',
                icono: '⚠️',
                opciones: [
                    { texto: 'Porque libera gas cloro tóxico que quema las vías respiratorias y puede causar asfixia grave', correcta: true, retro: '¡Vital para la seguridad! Las mezclas caseras de blanqueador con ácidos generan vapores altamente tóxicos y peligrosos.' },
                    { texto: 'Porque la mezcla se congela al instante y no limpia nada', correcta: false, retro: 'La reacción no congela los líquidos; genera gases irritantes muy peligrosos.' },
                    { texto: 'Porque atrae insectos voladores', correcta: false, retro: 'El peligro real es la intoxicación química por inhalación de gases clorados.' }
                ]
            }
        ]
    },

    'Ciclo VI': {
        ciclo: 'Ciclo VI',
        gradosEquiv: '11°',
        titulo: 'Misión Cero: Sostenibilidad, Energía Limpia y Pensamiento Científico',
        intro: '¡Bienvenido(a) a Ciencias Naturales Ciclo VI! En la recta final hacia tu título de bachiller, consolidaremos tu pensamiento crítico sobre el cambio climático, la transición energética y el método científico aplicado a la vida comunitaria.',
        preguntas: [
            {
                id: 1,
                enunciado: 'El aumento global de la temperatura del planeta se debe principalmente a la acumulación en la atmósfera de gases como el $CO_2$ generados por:',
                icono: '🌍',
                opciones: [
                    { texto: 'La quema masiva de combustibles fósiles (gasolina, carbón, gas) y la deforestación', correcta: true, retro: '¡Exacto! El efecto invernadero intensificado por actividades humanas industriales y vehiculares retiene más calor en la atmósfera.' },
                    { texto: 'El uso de bicicletas y paneles solares', correcta: false, retro: 'El transporte limpio y la energía solar reducen las emisiones contaminantes.' },
                    { texto: 'La siembra intensiva de árboles en los bosques', correcta: false, retro: 'Los árboles absorben $CO_2$, ayudando a mitigar el calentamiento global.' }
                ]
            },
            {
                id: 2,
                enunciado: '¿Cuál de las siguientes es una fuente de **energía limpia y renovable** que aprovecha los recursos naturales sin agotar reservas fósiles ni generar humo constante?',
                icono: '☀️',
                opciones: [
                    { texto: 'La energía solar fotovoltaica y la energía eólica (viento)', correcta: true, retro: '¡Excelente! Son fuentes inagotables que no emiten gases de efecto invernadero durante su generación eléctrica.' },
                    { texto: 'Una planta generadora a base de combustión de carbón mineral', correcta: false, retro: 'El carbón es un combustible fósil altamente contaminante y no renovable.' },
                    { texto: 'Generadores portátiles a base de gasolina y ACPM', correcta: false, retro: 'Los motores a gasolina y diésel emiten humo, hollín y gases contaminantes.' }
                ]
            },
            {
                id: 3,
                enunciado: 'Si un agricultor o jardinero observa que sus plantas tienen hojas amarillas y sospecha que les falta nitrógeno, ¿cuál es el paso del **método científico** más sensato antes de comprar fertilizante para todo su cultivo?',
                icono: '🔍',
                opciones: [
                    { texto: 'Hacer un experimento controlado: aplicar el fertilizante solo a un grupo pequeño de prueba y comparar con otro grupo sin fertilizar', correcta: true, retro: '¡Brillante! El método científico se basa en probar hipótesis con evidencias y grupos de control antes de sacar conclusiones generales.' },
                    { texto: 'Asumir que es una plaga y fumigar todo el lote con venenos fuertes sin verificar', correcta: false, retro: 'Fumigar a ciegas genera gastos innecesarios y contamina el suelo y las fuentes de agua.' },
                    { texto: 'Arrancar todas las plantas de inmediato sin investigar la causa', correcta: false, retro: 'No investigar causa pérdidas económicas y evita aprender el origen del problema.' }
                ]
            },
            {
                id: 4,
                enunciado: 'En el contexto de nuestro municipio y departamento, el concepto de **desarrollo sostenible** significa:',
                icono: '🌱',
                opciones: [
                    { texto: 'Satisfacer las necesidades de la comunidad actual sin agotar los recursos naturales de las futuras generaciones', correcta: true, retro: '¡Correcto! Equilibra el progreso social, la economía comunitaria y la preservación ambiental del Paisaje Cafetero.' },
                    { texto: 'Talar todos los árboles disponibles para obtener dinero rápido', correcta: false, retro: 'Eso representa sobreexplotación no sostenible, causando desertificación y escasez de agua.' },
                    { texto: 'Prohibir cualquier tipo de actividad laboral y cultivo en el campo', correcta: false, retro: 'La sostenibilidad no prohíbe el trabajo humano, sino que promueve prácticas responsables y ecológicas.' }
                ]
            }
        ]
    }
};

// Normalizador de Ciclo para matching seguro
window.obtenerDiagnosticoParaGrado = function(gradoOGrupo) {
    if (!gradoOGrupo) return window.DIAGNOSTICOS_CICLOS['Ciclo III']; // Default amigable
    const str = gradoOGrupo.toString().trim();
    
    if (/ciclo\s*1\b|ciclo\s*i\b/i.test(str)) return window.DIAGNOSTICOS_CICLOS['Ciclo I'];
    if (/ciclo\s*2\b|ciclo\s*ii\b/i.test(str)) return window.DIAGNOSTICOS_CICLOS['Ciclo II'];
    if (/ciclo\s*3\b|ciclo\s*iii\b/i.test(str)) return window.DIAGNOSTICOS_CICLOS['Ciclo III'];
    if (/ciclo\s*4\b|ciclo\s*iv\b/i.test(str)) return window.DIAGNOSTICOS_CICLOS['Ciclo IV'];
    if (/ciclo\s*5\b|ciclo\s*v\b/i.test(str)) return window.DIAGNOSTICOS_CICLOS['Ciclo V'];
    if (/ciclo\s*6\b|ciclo\s*vi\b/i.test(str)) return window.DIAGNOSTICOS_CICLOS['Ciclo VI'];
    
    // Mapeo por grado numérico si aplica
    if (/^1|^2|^3/.test(str)) return window.DIAGNOSTICOS_CICLOS['Ciclo I'];
    if (/^4|^5/.test(str)) return window.DIAGNOSTICOS_CICLOS['Ciclo II'];
    if (/^6|^7/.test(str)) return window.DIAGNOSTICOS_CICLOS['Ciclo III'];
    if (/^8|^9/.test(str)) return window.DIAGNOSTICOS_CICLOS['Ciclo IV'];
    if (/^10/.test(str)) return window.DIAGNOSTICOS_CICLOS['Ciclo V'];
    if (/^11/.test(str)) return window.DIAGNOSTICOS_CICLOS['Ciclo VI'];

    return window.DIAGNOSTICOS_CICLOS['Ciclo III'];
};

// =========================================================
// RENDERIZADOR DE LA EXPERIENCIA DE DIAGNÓSTICO GAMIFICADO
// =========================================================

window.iniciarDiagnosticoGamificado = function() {
    const user = window.usuarioEstudianteActual || JSON.parse(localStorage.getItem('usuario_sesion') || '{}');
    const grado = window.gradoActualEstudiante || user.grado || user.grupo || 'Ciclo III';
    const diagData = window.obtenerDiagnosticoParaGrado(grado);
    
    const questContainer = document.getElementById("student-quest-container");
    const guideContent = document.getElementById("student-guide-content");
    const innerContent = document.getElementById("student-guide-inner-content");
    
    if (questContainer) questContainer.style.display = "none";
    if (guideContent) guideContent.style.display = "block";
    
    // Obtener personalización seleccionada si existe
    const rolElem = document.getElementById("student-quest-rol");
    const ambElem = document.getElementById("student-quest-ambiente");
    const rol = (rolElem && rolElem.value) ? rolElem.value : 'Explorador STEAM';
    const amb = (ambElem && ambElem.value) ? ambElem.value : 'Paisaje Cultural Cafetero';

    window.estadoDiagnosticoActual = {
        ciclo: diagData.ciclo,
        preguntas: diagData.preguntas,
        preguntaActual: 0,
        aciertos: 0,
        xpGanado: 0,
        respuestas: [],
        rol: rol,
        ambiente: amb,
        usuario: user
    };

    renderizarPasoDiagnostico();
};

window.renderizarPasoDiagnostico = function() {
    const state = window.estadoDiagnosticoActual;
    const diag = window.DIAGNOSTICOS_CICLOS[state.ciclo];
    const inner = document.getElementById("student-guide-inner-content");
    if (!inner) return;

    const total = state.preguntas.length;
    const idx = state.preguntaActual;
    
    // Si ya completó todas las preguntas -> Pantalla de Recompensa y Eclosión
    if (idx >= total) {
        renderizarFinDiagnostico();
        return;
    }

    const p = state.preguntas[idx];
    const progresoPorcentaje = Math.round((idx / total) * 100);

    // Estado visual del huevo
    let eggEmoji = '🥚';
    let eggText = 'Huevo Místico';
    let eggColor = '#F59E0B';
    if (idx === 1) { eggEmoji = '⚡🥚'; eggText = 'Huevo con Energía'; }
    else if (idx === 2) { eggEmoji = '🐣'; eggText = '¡Comenzando a Eclosionar!'; eggColor = '#10B981'; }
    else if (idx >= 3) { eggEmoji = '✨🐥'; eggText = '¡Casi Listo para Nacer!'; eggColor = '#8B5CF6'; }

    inner.innerHTML = `
        <div style="max-width: 850px; margin: 0 auto; font-family: 'Inter', sans-serif;">
            
            <!-- HEADER DE BIENVENIDA Y GAMIFICACIÓN -->
            <div style="background: linear-gradient(135deg, #1E3A8A, #3B82F6); border-radius: 16px; padding: 25px 30px; color: white; margin-bottom: 25px; box-shadow: 0 10px 25px rgba(37,99,235,0.2); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
                <div>
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                        <span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-weight: 800; font-size: 0.9rem;">🎯 Diagnóstico de Inicio</span>
                        <span style="background: #10B981; padding: 4px 12px; border-radius: 20px; font-weight: 800; font-size: 0.9rem;">${diag.ciclo} (${diag.gradosEquiv})</span>
                    </div>
                    <h2 style="margin: 0; font-size: 1.6rem; font-weight: 900; letter-spacing: -0.5px;">${diag.titulo}</h2>
                    <p style="margin: 6px 0 0 0; color: #BFDBFE; font-size: 0.95rem;">Rol: <strong>${state.rol}</strong> | Entorno: <strong>${state.ambiente}</strong></p>
                </div>

                <!-- MASCOTA / HUEVITO EN PROGRESO -->
                <div style="background: rgba(255,255,255,0.15); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.3); border-radius: 16px; padding: 12px 20px; text-align: center; min-width: 140px;">
                    <div id="diag-egg-icon" style="font-size: 2.8rem; animation: floatEgg 2.5s ease-in-out infinite; transform-origin: center bottom;">${eggEmoji}</div>
                    <div style="font-size: 0.85rem; font-weight: 800; color: #FEF08A; margin-top: 4px;">${eggText}</div>
                </div>
            </div>

            <style>
                @keyframes floatEgg {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-8px) rotate(4deg); }
                }
                @keyframes popCorrect {
                    0% { transform: scale(0.95); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
            </style>

            <!-- BARRA DE PROGRESO DE LA MISIÓN -->
            <div style="background: white; border-radius: 12px; padding: 15px 20px; margin-bottom: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 1px solid #E5E7EB; display: flex; align-items: center; gap: 15px;">
                <span style="font-weight: 800; color: #4B5563; font-size: 0.95rem; white-space: nowrap;">Desafío ${idx + 1} de ${total}</span>
                <div style="flex: 1; background: #E5E7EB; height: 12px; border-radius: 10px; overflow: hidden;">
                    <div style="background: linear-gradient(90deg, #3B82F6, #10B981); width: ${progresoPorcentaje}%; height: 100%; border-radius: 10px; transition: width 0.4s ease;"></div>
                </div>
                <span style="font-weight: 900; color: #10B981; font-size: 1rem;">${progresoPorcentaje}%</span>
            </div>

            <!-- TARJETA DEL DESAFÍO -->
            <div style="background: white; border-radius: 16px; padding: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #E2E8F0; margin-bottom: 25px;">
                
                <div style="display: flex; align-items: flex-start; gap: 15px; margin-bottom: 20px;">
                    <div style="font-size: 2.2rem; background: #EFF6FF; border: 2px solid #BFDBFE; width: 55px; height: 55px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        ${p.icono || '❓'}
                    </div>
                    <div>
                        <span style="color: #6B7280; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Pregunta Cotidiana</span>
                        <h3 style="margin: 5px 0 0 0; color: #1F2937; font-size: 1.3rem; font-weight: 800; line-height: 1.5;">
                            ${p.enunciado.replace(/\*\*(.*?)\*\*/g, '<span style="color: #2563EB; font-weight: 900;">$1</span>')}
                        </h3>
                    </div>
                </div>

                <!-- OPCIONES DE RESPUESTA -->
                <div id="diag-opciones-container" style="display: flex; flex-direction: column; gap: 12px; margin-top: 25px;">
                    ${p.opciones.map((op, opIdx) => `
                        <button onclick="responderDiagnostico(${opIdx})" class="diag-btn-opcion" style="text-align: left; background: #F8FAFC; border: 2px solid #E2E8F0; padding: 16px 20px; border-radius: 12px; font-size: 1.05rem; font-weight: 600; color: #334155; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 15px;" onmouseover="if(!this.disabled){this.style.background='#EFF6FF'; this.style.borderColor='#3B82F6'; this.style.transform='translateX(4px)';}" onmouseout="if(!this.disabled){this.style.background='#F8FAFC'; this.style.borderColor='#E2E8F0'; this.style.transform='none';}">
                            <span style="background: white; border: 2px solid #CBD5E1; color: #475569; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.95rem; flex-shrink: 0;">
                                ${String.fromCharCode(65 + opIdx)}
                            </span>
                            <span>${op.texto}</span>
                        </button>
                    `).join('')}
                </div>

                <!-- CONTENEDOR DE RETROALIMENTACIÓN INMEDIATA -->
                <div id="diag-retro-container" style="display: none; margin-top: 25px; animation: popCorrect 0.3s ease-out;">
                    <!-- Inyectado al responder -->
                </div>
            </div>

        </div>
    `;
};

window.responderDiagnostico = function(opcionIndex) {
    const state = window.estadoDiagnosticoActual;
    const p = state.preguntas[state.preguntaActual];
    const op = p.opciones[opcionIndex];
    
    // Deshabilitar botones para evitar multi-clic
    const botones = document.querySelectorAll('.diag-btn-opcion');
    botones.forEach((btn, i) => {
        btn.disabled = true;
        btn.style.cursor = 'default';
        if (i === opcionIndex) {
            if (op.correcta) {
                btn.style.background = '#ECFDF5';
                btn.style.borderColor = '#10B981';
                btn.style.color = '#065F46';
                btn.querySelector('span').style.background = '#10B981';
                btn.querySelector('span').style.borderColor = '#10B981';
                btn.querySelector('span').style.color = 'white';
            } else {
                btn.style.background = '#FFFBEB';
                btn.style.borderColor = '#F59E0B';
                btn.style.color = '#92400E';
                btn.querySelector('span').style.background = '#F59E0B';
                btn.querySelector('span').style.borderColor = '#F59E0B';
                btn.querySelector('span').style.color = 'white';
            }
        }
    });

    if (op.correcta) {
        state.aciertos++;
        state.xpGanado += 35;
    } else {
        // En diagnóstico nocturno, también se reconoce el esfuerzo para motivar (+20 XP)
        state.xpGanado += 20;
    }

    const retroDiv = document.getElementById("diag-retro-container");
    retroDiv.style.display = "block";
    
    const bannerColor = op.correcta ? '#10B981' : '#F59E0B';
    const bannerBg = op.correcta ? '#ECFDF5' : '#FFFBEB';
    const bannerTitle = op.correcta ? '🎉 ¡Excelente Análisis!' : '💡 ¡Buen Esfuerzo de Comprensión!';
    const icono = op.correcta ? '✅' : '✨';

    retroDiv.innerHTML = `
        <div style="background: ${bannerBg}; border-left: 5px solid ${bannerColor}; padding: 20px; border-radius: 10px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                <span style="font-size: 1.5rem;">${icono}</span>
                <strong style="color: ${bannerColor}; font-size: 1.15rem;">${bannerTitle}</strong>
                <span style="margin-left: auto; background: ${bannerColor}; color: white; padding: 3px 10px; border-radius: 12px; font-weight: 800; font-size: 0.85rem;">+${op.correcta ? '35' : '20'} XP</span>
            </div>
            <p style="margin: 0; color: #374151; font-size: 1rem; line-height: 1.6;">${op.retro}</p>
            
            <div style="margin-top: 20px; text-align: right;">
                <button onclick="avanzarSiguientePregunta()" style="background: #2563EB; color: white; border: none; padding: 12px 28px; border-radius: 30px; font-weight: 800; font-size: 1rem; cursor: pointer; box-shadow: 0 4px 12px rgba(37,99,235,0.3); transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    Continuar Desafío ➔
                </button>
            </div>
        </div>
    `;
};

window.avanzarSiguientePregunta = function() {
    window.estadoDiagnosticoActual.preguntaActual++;
    renderizarPasoDiagnostico();
};

// =========================================================
// PANTALLA DE CIERRE: ECLOSIÓN DEL HUEVO Y PREMIO FINAL
// =========================================================

window.renderizarFinDiagnostico = function() {
    const state = window.estadoDiagnosticoActual;
    const diag = window.DIAGNOSTICOS_CICLOS[state.ciclo];
    const inner = document.getElementById("student-guide-inner-content");
    const user = state.usuario;
    const doc = String(user.documento || 'estudiante');

    // Bono base por completar diagnóstico
    const bonoXP = 150;
    const xpTotalFinal = state.xpGanado + bonoXP;

    // Persistir en LocalStorage
    try {
        const asigKey = 'Ciencias Naturales';
        const progKey = `prog_${doc}_${asigKey}_p3`;
        const diagKey = `prog_${doc}_diag_xp`;
        const xpKey = `xp_${doc}`;
        
        // Guardar desbloqueo de nivel (al menos semana 2 para permitir avanzar)
        const currentProg = parseInt(localStorage.getItem(progKey)) || 1;
        if (currentProg < 2) {
            localStorage.setItem(progKey, 2);
        }
        
        // Guardar XP acumulado
        const currXP = parseInt(localStorage.getItem(xpKey)) || 0;
        localStorage.setItem(xpKey, currXP + xpTotalFinal);
        localStorage.setItem(diagKey, xpTotalFinal);
        
        // Actualizar displays si existen
        const displayScore = document.getElementById("student-score-display");
        if (displayScore) displayScore.innerText = currXP + xpTotalFinal;
        
        const headerXP = document.getElementById("student-guide-header-xp");
        if (headerXP) headerXP.innerText = currXP + xpTotalFinal;

        // Disparar evento de storage para actualizar ranking en tiempo real
        window.dispatchEvent(new Event('storage'));
    } catch(e) {
        console.error("Error guardando progreso diagnóstico:", e);
    }

    inner.innerHTML = `
        <div style="max-width: 800px; margin: 0 auto; text-align: center; font-family: 'Inter', sans-serif;">
            
            <!-- TARJETA DE CELEBRACIÓN -->
            <div style="background: white; border-radius: 24px; padding: 40px 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.08); border: 2px solid #E0E7FF; position: relative; overflow: hidden;">
                
                <!-- Confeti decorativo de fondo -->
                <div style="position: absolute; top: -10px; left: -10px; right: -10px; height: 10px; background: linear-gradient(90deg, #F59E0B, #10B981, #3B82F6, #8B5CF6);"></div>
                
                <span style="display: inline-block; background: #FEF3C7; color: #D97706; padding: 6px 20px; border-radius: 20px; font-weight: 900; font-size: 0.95rem; margin-bottom: 20px; border: 1px solid #FDE68A;">
                    🏆 ¡MISIÓN DE DIAGNÓSTICO CUMPLIDA!
                </span>

                <!-- ECLOSIÓN DEL HUEVO ANIMADA -->
                <div style="margin: 20px 0;">
                    <div id="animacion-eclosion" style="font-size: 5.5rem; animation: hatchAnimation 1.5s ease infinite alternate; display: inline-block;">
                        🐉
                    </div>
                </div>

                <style>
                    @keyframes hatchAnimation {
                        0% { transform: scale(1) rotate(-5deg); }
                        100% { transform: scale(1.15) rotate(5deg); }
                    }
                </style>

                <h1 style="color: #1E3A8A; font-size: 2.2rem; font-weight: 900; margin: 10px 0;">
                    ¡Has eclosionado tu Guardián STEAM!
                </h1>

                <p style="color: #4B5563; font-size: 1.15rem; max-width: 600px; margin: 10px auto 25px auto; line-height: 1.6;">
                    Felicitaciones, <strong>${user.nombre || 'Estudiante'}</strong>. Has completado con éxito la exploración inicial de <strong>${diag.ciclo} (${diag.gradosEquiv})</strong>. Tu nivel de preparación está listo para conquistar este ciclo.
                </p>

                <!-- RECOMPENSA DE XP -->
                <div style="background: linear-gradient(135deg, #EFF6FF, #F0FDF4); border: 2px dashed #10B981; border-radius: 16px; padding: 20px; max-width: 500px; margin: 0 auto 30px auto; display: flex; justify-content: space-around; align-items: center;">
                    <div>
                        <div style="font-size: 0.9rem; color: #6B7280; font-weight: 700;">Desafíos Resueltos</div>
                        <div style="font-size: 1.6rem; font-weight: 900; color: #1F2937;">${state.aciertos} / ${state.preguntas.length}</div>
                    </div>
                    <div style="width: 2px; height: 40px; background: #CBD5E1;"></div>
                    <div>
                        <div style="font-size: 0.9rem; color: #6B7280; font-weight: 700;">Recompensa Total</div>
                        <div style="font-size: 1.8rem; font-weight: 900; color: #10B981;">+${xpTotalFinal} XP 🌟</div>
                    </div>
                </div>

                <!-- BOTONES DE ACCIÓN -->
                <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                    <button onclick="if(typeof mostrarHuevos === 'function') mostrarHuevos();" style="background: linear-gradient(135deg, #F59E0B, #D97706); color: white; border: none; padding: 14px 28px; border-radius: 30px; font-weight: 900; font-size: 1.05rem; cursor: pointer; box-shadow: 0 4px 15px rgba(245,158,11,0.4); display: flex; align-items: center; gap: 8px;">
                        🥚 Abrir Recompensa Mística
                    </button>
                    <button onclick="volverAlGridEstudiante()" style="background: #2563EB; color: white; border: none; padding: 14px 28px; border-radius: 30px; font-weight: 800; font-size: 1.05rem; cursor: pointer; box-shadow: 0 4px 15px rgba(37,99,235,0.3);">
                        📚 Ir a Mis Asignaturas
                    </button>
                </div>

            </div>

        </div>
    `;
};
