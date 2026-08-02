require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const rawKeys = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "";
const apiKeys = rawKeys.split(',').map(k => k.trim()).filter(k => k.length > 0);
let currentKeyIndex = 0;

function getAIClient() {
    if (apiKeys.length === 0) {
        console.error("No hay API Keys configuradas.");
        process.exit(1);
    }
    const key = apiKeys[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    return new GoogleGenAI({ apiKey: key });
}

function logMsg(msg) {
    const time = new Date().toLocaleTimeString();
    const str = `[${time}] ${msg}`;
    console.log(str);
    fs.appendFileSync(path.join(__dirname, 'cron_registro.txt'), str + "\n", 'utf-8');
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Opciones del Menú (TODAS las opciones disponibles)
const allRoles = ["Detective de Misterios", "Explorador Espacial", "Científico Loco", "Hacker Tecnológico"];
const allAmbientes = ["Mundo Post-Apocalíptico", "Estación Espacial Internacional", "Expedición en la Selva", "Laboratorio Secreto Subterráneo"];
const allNiveles = ["Modo Novato (Fácil)", "Modo Supervivencia (Intermedio)", "Modo Héroe (Avanzado)", "Modo Dios (Experto)"];
const allEnfoques = ["Resolver un misterio (Indagación)", "Explicar un fenómeno extraño", "Aplicar la ciencia para sobrevivir", "Desmentir un mito popular (Análisis Crítico)"];

const mallasCurriculares = {
    "Ciencias Naturales": {
        "Ciclo I": [
            { semana: 1, topico: "Los seres vivos y su entorno natural", meta: "Identificar seres vivos y su relación con el entorno." },
            { semana: 2, topico: "Partes de las plantas y su función", meta: "Reconocer raíces, tallos, hojas y flores." },
            { semana: 3, topico: "Animales vertebrados e invertebrados", meta: "Clasificar animales según su estructura ósea." },
            { semana: 4, topico: "El agua y su cuidado en el hogar", meta: "Comprender la importancia del ahorro hídrico." },
            { semana: 5, topico: "Los sentidos humanos y la percepción", meta: "Relacionar los órganos de los sentidos con estímulos." },
            { semana: 6, topico: "La materia: sólidos y líquidos", meta: "Diferenciar estados físicos de la materia." },
            { semana: 7, topico: "El sol, la luna y el día/noche", meta: "Explicar los ciclos astronómicos básicos." },
            { semana: 8, topico: "Proyecto Integrador de Ciencias Ciclo I", meta: "Elaborar un herbario o maqueta ecológica." }
        ],
        "Ciclo II": [
            { semana: 1, topico: "Ecosistemas y cadenas tróficas", meta: "Analizar el flujo de energía en productores y consumidores." },
            { semana: 2, topico: "Adaptaciones de los seres vivos", meta: "Explicar adaptaciones morfológicas y fisiológicas." },
            { semana: 3, topico: "El sistema digestivo y circulatorio", meta: "Identificar órganos y funciones de nutrición humana." },
            { semana: 4, topico: "Mezclas y sustancias en la vida diaria", meta: "Diferenciar mezclas homogéneas y heterogéneas." },
            { semana: 5, topico: "Energía y sus formas (luz, calor, sonido)", meta: "Reconocer manifestaciones energéticas cotidianas." },
            { semana: 6, topico: "Fuerzas y máquinas simples", meta: "Aplicar palancas, poleas y planos inclinados." },
            { semana: 7, topico: "El ciclo del agua y el clima", meta: "Explicar evaporación, condensación y precipitación." },
            { semana: 8, topico: "Proyecto Integrador de Ciencias Ciclo II", meta: "Construir un prototipo de máquina simple o terrario." }
        ]
    },
    "Física": {
        "6": [
            { semana: 1, topico: "Cinemática básica (Movimiento vs Reposo)", meta: "Diferenciar estados de movimiento e interpretar fenómenos del entorno." },
            { semana: 2, topico: "Posición y Trayectoria", meta: "Identificar variables cinemáticas." },
            { semana: 3, topico: "Velocidad y Rapidez", meta: "Calcular rapidez en escenarios reales." },
            { semana: 4, topico: "Aceleración y Frenado", meta: "Comprender la aceleración." },
            { semana: 5, topico: "Fuerzas del entorno", meta: "Identificar fuerzas cotidianas." },
            { semana: 6, topico: "Gravedad y Sistema Planetario", meta: "Explicar la gravedad." },
            { semana: 7, topico: "Energía mecánica introductoria", meta: "Distinguir tipos de energía." },
            { semana: 8, topico: "Proyecto Integrador de Física 6", meta: "Aplicar conceptos en un reto." }
        ],
        "7": [
            { semana: 1, topico: "Análisis Vectorial del Movimiento", meta: "Manejar cantidades escalares y vectoriales en fenómenos naturales." },
            { semana: 2, topico: "Gráficas de Posición vs Tiempo (x-t)", meta: "Interpretar gráficas x-t." },
            { semana: 3, topico: "Gráficas de Velocidad vs Tiempo (v-t)", meta: "Interpretar gráficas v-t." },
            { semana: 4, topico: "Caída Libre y Aceleración Gravitacional", meta: "Aplicar principios de caída libre." },
            { semana: 5, topico: "Energía Cinética vs Potencial", meta: "Diferenciar tipos de energía." },
            { semana: 6, topico: "Ley de Conservación de Energía", meta: "Aplicar conservación de energía." },
            { semana: 7, topico: "Trabajo Físico y Potencia", meta: "Calcular trabajo y potencia." },
            { semana: 8, topico: "Proyecto Integrador de Física 7", meta: "Resolver retos energéticos." }
        ],
        "11": [
            { semana: 1, topico: "Mecánica Clásica y Leyes de Newton Avanzadas", meta: "Resolver problemas dinámicos con diagramas de cuerpo libre y fricción." },
            { semana: 2, topico: "Movimiento Armónico Simple y Péndulos", meta: "Determinar periodos, frecuencias y ecuaciones de oscilación." },
            { semana: 3, topico: "Ondas Mecánicas, Sonido y Efecto Doppler", meta: "Analizar velocidad de propagación y variación de frecuencia acústica." },
            { semana: 4, topico: "Hidrostática y Principios de Pascal y Arquímedes", meta: "Calcular presiones hidrostáticas y empuje en fluidos." },
            { semana: 5, topico: "Termodinámica: Calor, Temperatura y Leyes de Gases", meta: "Aplicar la primera y segunda ley de la termodinámica en ciclos térmicos." },
            { semana: 6, topico: "Electrostática: Ley de Coulomb y Campo Eléctrico", meta: "Calcular fuerzas electrostáticas y potencial eléctrico puntual." },
            { semana: 7, topico: "Circuitos Eléctricos: Ley de Ohm y Leyes de Kirchhoff", meta: "Diseñar circuitos mixtos, corrientes y potencias disipadas." },
            { semana: 8, topico: "Óptica Geométrica y Preguntas Saber 11 de Física", meta: "Resolver problemas de reflexión, refracción y análisis de gráficos ICFES." }
        ],
        "Ciclo III": [
            { semana: 1, topico: "Magnitudes físicas y el método científico", meta: "Medir variables físicas fundamentales y derivadas." },
            { semana: 2, topico: "El movimiento y la velocidad en la vida cotidiana", meta: "Analizar trayectorias, distancias y rapidez." },
            { semana: 3, topico: "Fuerzas y leyes de Newton aplicadas", meta: "Identificar inercia, acción-reacción y fuerza neta." },
            { semana: 4, topico: "Gravedad, masa y peso", meta: "Diferenciar masa y peso en diversos contextos planetarios." },
            { semana: 5, topico: "La energía y sus transformaciones", meta: "Comprender la conservación de la energía mecánica." },
            { semana: 6, topico: "Calor y temperatura en el hogar", meta: "Distinguir transferencia de calor por conducción, convección y radiación." },
            { semana: 7, topico: "Presión y fluidos en el entorno", meta: "Explicar principios básicos de presión en líquidos y gases." },
            { semana: 8, topico: "Proyecto STEAM de Física Ciclo III", meta: "Diseñar un vehículo propulsado por aire o resorte." }
        ],
        "Ciclo VI": [
            { semana: 1, topico: "Mecánica clásica y termodinámica aplicada", meta: "Modelar fuerzas y transferencias térmicas en sistemas reales." },
            { semana: 2, topico: "Movimiento ondulatorio y acústica", meta: "Interpretar propagación de ondas y resonancia." },
            { semana: 3, topico: "Electromagnetismo y circuitos eléctricos", meta: "Calcular parámetros de circuitos y campos magnéticos." },
            { semana: 4, topico: "Óptica y naturaleza de la luz", meta: "Analizar fenómenos de refracción, lentes y espejos." },
            { semana: 5, topico: "Fluidos y presión atmosférica", meta: "Resolver retos de flotabilidad y aerodinámica básica." },
            { semana: 6, topico: "Energías renovables y eficiencia energética", meta: "Evaluar matrices energéticas y sustentabilidad." },
            { semana: 7, topico: "Física moderna y tecnología actual", meta: "Comprender aplicaciones de fotones, láseres y semiconductores." },
            { semana: 8, topico: "Preparación ICFES Saber 11 Física", meta: "Dominar competencias de indagación, explicación y uso comprensivo." }
        ]
    },
    "Química": {
        "PENS": [
            { semana: 1, topico: "Estructura de la Materia y Modelos Atómicos", meta: "Comprender los componentes atómicos y la materia." },
            { semana: 2, topico: "Tabla Periódica Básica y Elementos", meta: "Identificar elementos comunes y su periodicidad." },
            { semana: 3, topico: "Enlaces Químicos (Iónico y Covalente)", meta: "Diferenciar enlaces químicos." },
            { semana: 4, topico: "Reacciones Químicas Cotidianas", meta: "Observar e interpretar reacciones químicas en la vida diaria." },
            { semana: 5, topico: "Estados de la Materia y Cambios de Fase", meta: "Analizar cambios de estado y termodinámica básica." },
            { semana: 6, topico: "Mezclas, Soluciones y Métodos de Separación", meta: "Separar y caracterizar mezclas homogéneas y heterogéneas." },
            { semana: 7, topico: "Ácidos, Bases y Escala de pH", meta: "Identificar pH en sustancias cotidianas y alimentos." },
            { semana: 8, topico: "Proyecto Químico PENS", meta: "Experimento casero seguro y balance químico." }
        ],
        "11": [
            { semana: 1, topico: "Química Orgánica: El Carbono e Hibridación", meta: "Comprender la tetravalencia del carbono y tipos de hibridación sp3, sp2, sp." },
            { semana: 2, topico: "Hidrocarburos: Alcanos, Alquenos y Alquinos", meta: "Nombrar cadenas carbonadas bajo normas IUPAC y predecir propiedades." },
            { semana: 3, topico: "Grupos Funcionales Oxigenados (Alcoholes, Aldehídos, Cetonas, Ácidos)", meta: "Reconocer grupos funcionales y su reactividad en productos de uso común." },
            { semana: 4, topico: "Estequiometría de Reacciones y Rendimiento", meta: "Balancear ecuaciones químicas y calcular reactivo límite y pureza." },
            { semana: 5, topico: "Gases Ideales y Leyes Ponderales", meta: "Aplicar la ecuación de estado PV=nRT en condiciones estándar." },
            { semana: 6, topico: "Soluciones Químicas: Molaridad, Molalidad y % m/m", meta: "Calcular concentraciones y factores de dilución en laboratorio." },
            { semana: 7, topico: "Equilibrio Químico y Principio de Le Chatelier", meta: "Analizar desplazamientos de equilibrio por temperatura y presión." },
            { semana: 8, topico: "Bioquímica y Preguntas Saber 11 de Química", meta: "Interpretar biomoléculas y resolver casos de indagación ICFES." }
        ],
        "Ciclo V": [
            { semana: 1, topico: "Química inorgánica y enlaces químicos", meta: "Identificar nomenclatura inorgánica y enlaces químicos." },
            { semana: 2, topico: "Tabla periódica y propiedades periódicas", meta: "Relacionar electronegatividad y radio atómico." },
            { semana: 3, topico: "Reacciones químicas y balanceo por tanteo", meta: "Comprender la conservación de la masa en reacciones." },
            { semana: 4, topico: "Estequiometría y mol", meta: "Realizar cálculos estequiométricos sencillos." },
            { semana: 5, topico: "Estados de agregación y teoría cinética", meta: "Explicar el comportamiento molecular de los estados." },
            { semana: 6, topico: "Soluciones acuosas y concentración", meta: "Calcular porcentaje en masa y volumen en mezclas." },
            { semana: 7, topico: "Ácidos, bases y neutralización", meta: "Medir pH y entender reacciones de neutralización." },
            { semana: 8, topico: "Proyecto Químico Ciclo V", meta: "Diseñar un producto químico seguro (jabón, limpiador)." }
        ],
        "Ciclo VI": [
            { semana: 1, topico: "Química orgánica: hidrocarburos y grupos funcionales", meta: "Estructurar compuestos de carbono y grupos oxigenados y nitrogenados." },
            { semana: 2, topico: "Isomería y reactividad orgánica", meta: "Identificar isómeros estructurales y estereoisómeros." },
            { semana: 3, topico: "Polímeros sintéticos y biopolímeros", meta: "Comprender la polimerización y el reciclaje de plásticos." },
            { semana: 4, topico: "Cinética química y catálisis", meta: "Analizar factores que aceleran o retardan reacciones." },
            { semana: 5, topico: "Termoquímica y entalpía de reacción", meta: "Diferenciar reacciones endotérmicas y exotérmicas." },
            { semana: 6, topico: "Electroquímica: pilas y electrólisis", meta: "Explicar celdas galvánicas y corrosión de metales." },
            { semana: 7, topico: "Bioquímica y biomoléculas esenciales", meta: "Analizar carbohidratos, lípidos, proteínas y ADN." },
            { semana: 8, topico: "Preparación Saber 11 / Proyecto Químico Ciclo VI", meta: "Resolver preguntas complejas tipo ICFES de química." }
        ]
    },
    "Turismo": {
        "7": [
            { semana: 1, topico: "El Eje Cafetero y Paisaje Cultural Cafetero (PCC)", meta: "Reconocer la identidad, geografía y patrimonio regional." },
            { semana: 2, topico: "Municipios y Símbolos del Quindío", meta: "Valorar los atractivos turísticos de Montenegro y el Quindío." },
            { semana: 3, topico: "Atractivos Turísticos y Patrimonio Regional", meta: "Identificar sitios emblemáticos y ecoturismo." },
            { semana: 4, topico: "Mitos, Leyendas y Tradición Oral Cafetera", meta: "Comprender el patrimonio inmaterial y la cultura local." },
            { semana: 5, topico: "Emprendimiento Turístico y Sostenibilidad", meta: "Formular ideas de negocio turístico sostenible." },
            { semana: 6, topico: "Servicio al Cliente y Hospitalidad", meta: "Desarrollar habilidades de atención al turista." },
            { semana: 7, topico: "Guianza Turística y Narración del Territorio", meta: "Crear rutas e itinerarios interpretativos." },
            { semana: 8, topico: "Feria Turística Escolar", meta: "Diseñar y presentar una propuesta de turismo local." }
        ],
        "11": [
            { semana: 1, topico: "Gestión Estratégica de Destinos y Competitividad PCC", meta: "Formular planes de ordenamiento y marketing para destinos sostenibles." },
            { semana: 2, topico: "Ecoturismo, Aviturismo y Rutas de Biodiversidad", meta: "Diseñar experiencias de turismo de naturaleza de alto valor." },
            { semana: 3, topico: "Normatividad Turística Nacional e Internacional (RNT)", meta: "Aplicar marcos regulatorios y estándares de calidad turística." },
            { semana: 4, topico: "Diseño de Paquetes Turísticos e Itinerarios Digitales", meta: "Costear y estructurar paquetes turísticos con herramientas tecnológicas." },
            { semana: 5, topico: "Marketing Turístico Digital y Canales OTAs", meta: "Gestionar visibilidad en plataformas globales y redes sociales." },
            { semana: 6, topico: "Agroturismo y Experiencias de Café Especial", meta: "Integrar la cultura cafetera y la catación en la oferta turística." },
            { semana: 7, topico: "Turismo Comunitario y Desarrollo Local", meta: "Empoderar a comunidades locales mediante el turismo regenerativo." },
            { semana: 8, topico: "Proyecto Final de Emprendimiento Turístico Grado 11", meta: "Sustentar un modelo de negocio Canvas validado." }
        ],
        "PENS": [
            { semana: 1, topico: "Operación Turística Regional y PCC", meta: "Analizar la cadena de valor turística en el Eje Cafetero." },
            { semana: 2, topico: "Patrimonio Cultural y Gestión de Destinos", meta: "Evaluar el impacto económico y cultural del turismo." },
            { semana: 3, topico: "Emprendimiento y Modelos de Negocio Turísticos", meta: "Diseñar planes de negocio aplicados a la región." },
            { semana: 4, topico: "Sostenibilidad y Normatividad Turística", meta: "Aplicar normas de turismo responsable y ambiental." },
            { semana: 5, topico: "Marketing Turístico Digital y Promoción", meta: "Crear estrategias de posicionamiento de atractivos." },
            { semana: 6, topico: "Agroindustria y Turismo Rural", meta: "Integrar el café y la agroindustria a la oferta turística." },
            { semana: 7, topico: "Calidad en el Servicio y Operación Hotelera", meta: "Estándares de atención y gestión de experiencias." },
            { semana: 8, topico: "Proyecto Productivo Turístico PENS", meta: "Sustentar un proyecto de desarrollo turístico comunitario." }
        ],
        "Ciclo III": [
            { semana: 1, topico: "Patrimonio turístico regional y cultura ciudadana", meta: "Reconocer atractivos culturales y naturales del Quindío." },
            { semana: 2, topico: "El Paisaje Cultural Cafetero como patrimonio", meta: "Valorar la arquitectura y tradiciones cafeteras." },
            { semana: 3, topico: "Atención al visitante y comunicación asertiva", meta: "Desarrollar actitudes de servicio y hospitalidad." },
            { semana: 4, topico: "Geografía y rutas turísticas locales", meta: "Elaborar mapas turísticos del municipio." },
            { semana: 5, topico: "Ecoturismo y respeto por la fauna y flora", meta: "Promover prácticas de no dejar rastro en la naturaleza." },
            { semana: 6, topico: "Tradiciones gastronómicas y café", meta: "Reconocer el valor del café en la identidad regional." },
            { semana: 7, topico: "Señalización y seguridad turística", meta: "Identificar normas de seguridad para viajeros." },
            { semana: 8, topico: "Muestra Turística Ciclo III", meta: "Crear un folleto informativo de un destino local." }
        ],
        "Ciclo IV": [
            { semana: 1, topico: "Turismo sostenible y conservación ambiental", meta: "Analizar la huella ecológica del turismo." },
            { semana: 2, topico: "Guianza interpretativa del territorio", meta: "Aprender técnicas de narración y conducción de grupos." },
            { semana: 3, topico: "Patrimonio inmaterial y leyendas regionales", meta: "Rescatar relatos orales para la experiencia turística." },
            { semana: 4, topico: "Rutas agroecológicas y aviturismo", meta: "Diseñar recorridos temáticos en fincas y reservas." },
            { semana: 5, topico: "Creación de productos turísticos comunitarios", meta: "Integrar servicios de artesanos y productores locales." },
            { semana: 6, topico: "Promoción y fotografía turística", meta: "Utilizar imágenes y redes para divulgar atractivos." },
            { semana: 7, topico: "Normas de sostenibilidad turística (NTS)", meta: "Aplicar criterios de calidad y responsabilidad ambiental." },
            { semana: 8, topico: "Feria de Rutas Turísticas Ciclo IV", meta: "Presentar un itinerario completo de un día." }
        ],
        "Ciclo V": [
            { semana: 1, topico: "Emprendimiento y gestión turística regional", meta: "Estructurar ideas de negocio turístico en el PCC." },
            { semana: 2, topico: "Costos y tarifas de servicios turísticos", meta: "Calcular precios de alojamiento, transporte y guianza." },
            { semana: 3, topico: "Marketing digital para el turismo", meta: "Diseñar campañas de promoción en canales digitales." },
            { semana: 4, topico: "Legislación turística y formalización empresarial", meta: "Conocer el Registro Nacional de Turismo y trámites." },
            { semana: 5, topico: "Diseño de experiencias turísticas memorables", meta: "Crear narrativas y vivencias inmersivas para clientes." },
            { semana: 6, topico: "Gestión ambiental en hoteles y restaurantes", meta: "Implementar ahorro de agua, energía y gestión de residuos." },
            { semana: 7, topico: "Relaciones públicas y fidelización del turista", meta: "Manejar PQRS y estrategias de recomendación." },
            { semana: 8, topico: "Proyecto de Negocio Turístico Ciclo V", meta: "Elaborar un plan de negocio resumido (Canvas)." }
        ],
        "Ciclo VI": [
            { semana: 1, topico: "Marketing turístico digital y proyectos productivos", meta: "Planificar estrategias comerciales de alto impacto." },
            { semana: 2, topico: "Turismo de naturaleza y avistamiento de aves", meta: "Posicionar rutas de biodiversidad en mercados nacionales e internacionales." },
            { semana: 3, topico: "Calidad en el servicio y hospitalidad de excelencia", meta: "Aplicar protocolos internacionales de atención y bioseguridad." },
            { semana: 4, topico: "Diseño y comercialización de paquetes turísticos", meta: "Integrar operadores, hoteles y atractivos en una sola oferta." },
            { semana: 5, topico: "Innovación y tecnologías aplicadas al turismo", meta: "Usar realidad virtual, códigos QR y apps de viajes." },
            { semana: 6, topico: "Turismo regenerativo y desarrollo comunitario", meta: "Medir el impacto positivo del turismo en la comunidad local." },
            { semana: 7, topico: "Gestión de eventos y turismo corporativo", meta: "Organizar congresos, ferias y festivales culturales." },
            { semana: 8, topico: "Sustentación de Proyecto Productivo Turístico Ciclo VI", meta: "Defender la propuesta de emprendimiento turístico final." }
        ]
    },
    "Artes": {
        "7": [
            { semana: 1, topico: "Música Digital y Teclado como Instrumento", meta: "Explorar la música digital y el ritmo interactivo." },
            { semana: 2, topico: "El Ritmo y Patrones de Pulso", meta: "Construir secuencias rítmicas básicas." },
            { semana: 3, topico: "Lectura Básica de Notas y Pentagrama", meta: "Identificar notas musicales y frecuencias." },
            { semana: 4, topico: "Ejecución de Melodías Tradicionales", meta: "Interpretar piezas sencillas." },
            { semana: 5, topico: "Armonía y Acompañamiento", meta: "Crear bases musicales de apoyo." },
            { semana: 6, topico: "Géneros Musicales Colombianos", meta: "Apreciar la diversidad sonora nacional." },
            { semana: 7, topico: "Edición y Secuenciación Sonora", meta: "Manejar herramientas de producción digital." },
            { semana: 8, topico: "Concierto y Ensamble Virtual", meta: "Presentación de la obra musical del periodo." }
        ],
        "8": [
            { semana: 1, topico: "Teoría del Color y Composición Visual", meta: "Aplicar armonías cromáticas y técnicas visuales." },
            { semana: 2, topico: "Línea, Volumen y Perspectiva 3D", meta: "Construir dibujos con profundidad y puntos de fuga." },
            { semana: 3, topico: "Técnicas Mixtas, Collage y Texturas", meta: "Experimentar con materiales diversos." },
            { semana: 4, topico: "Historia del Arte: De lo Clásico a lo Moderno", meta: "Analizar movimientos artísticos y su contexto." },
            { semana: 5, topico: "Morfología y Proporciones del Rostro y Cuerpo", meta: "Dibujar proporciones de la figura humana." },
            { semana: 6, topico: "Arte Digital y Diseño Gráfico Básico", meta: "Crear ilustraciones mediante herramientas digitales." },
            { semana: 7, topico: "Expresión Plástica y Escenografía", meta: "Diseñar espacios y ambientaciones creativas." },
            { semana: 8, topico: "Galería de Exposición de Artes 8", meta: "Montaje y sustentación de la galería artística." }
        ],
        "9": [
            { semana: 1, topico: "Vanguardias Artísticas y Arte Contemporáneo", meta: "Interpretar el arte conceptual y las vanguardias." },
            { semana: 2, topico: "Fotografía y Lenguaje Visual", meta: "Comprender encuadre, iluminación y narrativa visual." },
            { semana: 3, topico: "Muralismo y Arte Urbano", meta: "Diseñar intervenciones plásticas con mensaje social." },
            { semana: 4, topico: "Diseño Tridimensional y Escultura", meta: "Modelar estructuras y volúmenes escultóricos." },
            { semana: 5, topico: "Animación y Narrativa Audiovisual", meta: "Crear secuencias animadas y storyboards." },
            { semana: 6, topico: "Crítica de Arte y Semiótica de la Imagen", meta: "Analizar el significado y la intención en obras complejas." },
            { semana: 7, topico: "Producción Multimedia Integrada", meta: "Fusionar música, video y artes plásticas." },
            { semana: 8, topico: "Curaduría y Muestra Artística de Grado 9", meta: "Exponer el portafolio artístico del curso." }
        ],
        "Ciclo I": [
            { semana: 1, topico: "El punto, la línea y los colores primarios", meta: "Explorar la motricidad fina y la expresión gráfica." },
            { semana: 2, topico: "Mezcla de colores secundarios y formas geométricas", meta: "Crear composiciones bidimensionales coloridas." },
            { semana: 3, topico: "Texturas táctiles y visuales con materiales reciclados", meta: "Reconocer texturas rugosas, suaves y lisas." },
            { semana: 4, topico: "Percusión corporal y juegos rítmicos", meta: "Acompañar canciones infantiles con palmas y pies." },
            { semana: 5, topico: "Modelado con plastilina y figuras tridimensionales", meta: "Desarrollar volumen espacial a través del modelado." },
            { semana: 6, topico: "El títere y la expresión teatral básica", meta: "Crear personajes sencillos para contar historias." },
            { semana: 7, topico: "Danzas y rondas tradicionales de Colombia", meta: "Coordinar movimientos corporales con la música folclórica." },
            { semana: 8, topico: "Festival Artístico Infantil Ciclo I", meta: "Presentar una muestra plástica y rítmica familiar." }
        ],
        "Ciclo II": [
            { semana: 1, topico: "Dibujo con sombras y claroscuro básico", meta: "Aplicar gradaciones tonales con lápiz de grafito." },
            { semana: 2, topico: "Composición con círculos cromáticos y colores complementarios", meta: "Contrastar colores cálidos y fríos en ilustraciones." },
            { semana: 3, topico: "Lectura rítmica y flauta dulce / percusión", meta: "Interpretar notas básicas y figuras rítmicas simples." },
            { semana: 4, topico: "Máscaras y diseño de vestuario creativo", meta: "Elaborar máscaras alusivas a la fauna colombiana." },
            { semana: 5, topico: "Técnicas de acuarela y pintura con témperas", meta: "Dominar el uso del pincel y la disolución con agua." },
            { semana: 6, topico: "Mitos locales ilustrados en formato cómic", meta: "Construir viñetas y globos de texto con narrativa visual." },
            { semana: 7, topico: "Danzas del Pacífico y la Región Andina", meta: "Aprender pasos básicos de cumbia, currulao y pasillo." },
            { semana: 8, topico: "Muestra de Artes Integradas Ciclo II", meta: "Montar una galería colectiva de historietas y máscaras." }
        ],
        "Ciclo IV": [
            { semana: 1, topico: "Expresión artística y patrimonio cultural", meta: "Interpretar el valor estético de las tradiciones colombianas." },
            { semana: 2, topico: "Técnicas de dibujo y composición visual", meta: "Aplicar perspectiva con uno y dos puntos de fuga." },
            { semana: 3, topico: "Grabado y estampación artesanal", meta: "Crear sellos y matrices con materiales cotidianos." },
            { semana: 4, topico: "Música latinoamericana e instrumentos autóctonos", meta: "Analizar ritmos y timbres instrumentales de la región." },
            { semana: 5, topico: "Muralismo y mensajes de impacto comunitario", meta: "Diseñar bocetos de murales sobre cuidado ambiental." },
            { semana: 6, topico: "Fotografía con dispositivos móviles", meta: "Comprender la regla de los tercios y encuadres fotográficos." },
            { semana: 7, topico: "Escenografía y expresión dramática", meta: "Montar una escena teatral breve con ambientación propia." },
            { semana: 8, topico: "Exposición Artística Ciclo IV", meta: "Socializar el portafolio de creaciones visuales y sonoras." }
        ]
    },
    "Ética": {
        "7": [
            { semana: 1, topico: "Autoconocimiento y Proyecto de Vida", meta: "Reconocer fortalezas, valores y metas personales." },
            { semana: 2, topico: "Resolución Pacífica de Conflictos y Diálogo Asertivo", meta: "Aprender técnicas de mediación y comunicación no violenta." },
            { semana: 3, topico: "Dilemas Morales: Honestidad vs Presión de Grupo", meta: "Analizar situaciones de juicio moral y toma de decisiones." },
            { semana: 4, topico: "Empatía Digital y Prevención del Ciberacoso", meta: "Promover la convivencia armónica en entornos virtuales." },
            { semana: 5, topico: "Solidaridad y Trabajo Comunitario", meta: "Fortalecer el sentido de pertenencia y ayuda mutua." },
            { semana: 6, topico: "Derechos y Deberes en la Escuela y la Familia", meta: "Comprender la responsabilidad ciudadana temprana." },
            { semana: 7, topico: "Cuidado de Sí Mismo y Prevención de Riesgos", meta: "Desarrollar hábitos de autocuidado y salud mental." },
            { semana: 8, topico: "Evaluación y Compromisos del Proyecto de Vida", meta: "Consolidar los aprendizajes éticos del periodo." }
        ],
        "10": [
            { semana: 1, topico: "El Proyecto de Vida: Vocación y Visión de Futuro", meta: "Estructurar metas a mediano y largo plazo con bases éticas." },
            { semana: 2, topico: "Libertad, Autonomía y Responsabilidad Moral", meta: "Examinar las consecuencias éticas de las decisiones individuales." },
            { semana: 3, topico: "Dilemas Éticos Contemporáneos (Bioética y Tecnología)", meta: "Debatir sobre inteligencia artificial, biotecnología y justicia." },
            { semana: 4, topico: "Presión Social, Identidad y Autenticidad", meta: "Fortalecer la integridad y la toma de postura crítica." },
            { semana: 5, topico: "Ciudadanía Activa y Derechos Humanos", meta: "Promover la defensa de la dignidad y la participación democrática." },
            { semana: 6, topico: "Ética Profesional y Cultura de la Legalidad", meta: "Comprender el compromiso ético en el ámbito laboral." },
            { semana: 7, topico: "Consumo Responsable y Ética Ambiental", meta: "Analizar el impacto ecológico y social de los estilos de vida." },
            { semana: 8, topico: "Sustentación del Manifiesto Ético Personal", meta: "Presentar y debatir el código moral propio para la vida adulta." }
        ],
        "11": [
            { semana: 1, topico: "Ética Ciudadana, Derechos Humanos y Construcción de Paz", meta: "Analizar el marco de derechos humanos y justicia restaurativa en Colombia." },
            { semana: 2, topico: "Dilemas Bioéticos: Vida, Salud y Avance Científico", meta: "Examinar posturas éticas ante la manipulación genética, clonación y eutanasia." },
            { semana: 3, topico: "Transparencia, Anticorrupción y Cultura de la Legalidad", meta: "Identificar el valor de la rendición de cuentas y la integridad en lo público." },
            { semana: 4, topico: "Ética en la Inteligencia Artificial y la Era Algorítmica", meta: "Debatir sobre privacidad, sesgos de datos y automatización laboral." },
            { semana: 5, topico: "Justicia Social, Inclusión y Equidad de Género", meta: "Promover la erradicación de la discriminación y la igualdad de oportunidades." },
            { semana: 6, topico: "Ética Global y Responsabilidad Ambiental Intergeneracional", meta: "Asumir compromisos individuales y colectivos con la sostenibilidad planetaria." },
            { semana: 7, topico: "Liderazgo Trascendente y Servicio a la Comunidad", meta: "Formular iniciativas ciudadanas de alto impacto social." },
            { semana: 8, topico: "Sustentación del Proyecto Ético de Vida para Educación Superior", meta: "Presentar y defender el plan ético vocacional del bachiller." }
        ],
        "Ciclo I": [
            { semana: 1, topico: "Respeto por mis compañeros y maestros", meta: "Reconocer normas básicas de convivencia en el aula." },
            { semana: 2, topico: "El valor de decir siempre la verdad", meta: "Comprender por qué la honestidad genera confianza." },
            { semana: 3, topico: "Compartir y jugar en equipo", meta: "Aprender a cooperar y esperar turnos con alegría." },
            { semana: 4, topico: "Cuidado de los útiles y el espacio común", meta: "Valorar el orden y los bienes propios y ajenos." },
            { semana: 5, topico: "Expresar mis emociones sin lastimar", meta: "Identificar la alegría, la rabia y el miedo de forma sana." },
            { semana: 6, topico: "La importancia de la familia y los afectos", meta: "Agradecer el apoyo y los lazos afectivos del hogar." },
            { semana: 7, topico: "Escuchar a los demás con atención", meta: "Practicar la escucha atenta sin interrumpir." },
            { semana: 8, topico: "El árbol de los buenos tratos", meta: "Construir un mural con compromisos de respeto mutuo." }
        ],
        "Ciclo II": [
            { semana: 1, topico: "La empatía: ponerme en el lugar del otro", meta: "Comprender los sentimientos y necesidades de los demás." },
            { semana: 2, topico: "Tolerancia y respeto por las diferencias", meta: "Aceptar la diversidad física, cultural y de pensamiento." },
            { semana: 3, topico: "Resolución de desacuerdos mediante el diálogo", meta: "Evitar la violencia y proponer acuerdos pacíficos." },
            { semana: 4, topico: "La responsabilidad en las tareas y deberes", meta: "Cumplir compromisos a tiempo y con autonomía." },
            { semana: 5, topico: "Cuidado del medio ambiente y los animales", meta: "Asumir hábitos de respeto por toda forma de vida." },
            { semana: 6, topico: "Amistad verdadera y lealtad", meta: "Distinguir la amistad positiva de las malas influencias." },
            { semana: 7, topico: "Los derechos de los niños y niñas", meta: "Reconocer el derecho al juego, la educación y el afecto." },
            { semana: 8, topico: "Decálogo de convivencia de Ciclo II", meta: "Firmar acuerdos grupales para un aula armónica." }
        ],
        "Ciclo III": [
            { semana: 1, topico: "Ética, convivencia y toma de decisiones", meta: "Reflexionar sobre las consecuencias de las decisiones diarias." },
            { semana: 2, topico: "Dignidad humana y respeto a los derechos de todos", meta: "Promover la no discriminación en la comunidad." },
            { semana: 3, topico: "Identidad personal y autoestima", meta: "Fortalecer la confianza y el aprecio propio." },
            { semana: 4, topico: "Manejo de la presión de grupo y autonomía", meta: "Aprender a decir no con firmeza ante conductas dañinas." },
            { semana: 5, topico: "Convivencia digital y uso ético de redes sociales", meta: "Prevenir el ciberacoso y proteger la privacidad." },
            { semana: 6, topico: "Solidaridad con los más vulnerables", meta: "Planificar acciones de ayuda comunitaria." },
            { semana: 7, topico: "El valor del esfuerzo y la perseverancia", meta: "Reconocer que las metas se alcanzan con disciplina." },
            { semana: 8, topico: "Manifiesto de Valores Ciclo III", meta: "Exponer compromisos éticos personales y colectivos." }
        ],
        "Ciclo V": [
            { semana: 1, topico: "Ética profesional y bioética ambiental", meta: "Debatir sobre la ética en los oficios y el impacto ecológico." },
            { semana: 2, topico: "Dilemas morales en la sociedad moderna", meta: "Analizar casos de dilemas éticos y justicia distributiva." },
            { semana: 3, topico: "Autonomía moral y libertad responsable", meta: "Asumir la responsabilidad plena por los actos propios." },
            { semana: 4, topico: "Cultura de la paz y mediación de conflictos", meta: "Dominar herramientas de concertación y perdón social." },
            { semana: 5, topico: "Transparencia y lucha contra la corrupción cotidiana", meta: "Fortalecer la honestidad en el trabajo y la familia." },
            { semana: 6, topico: "Derechos laborales y dignidad del trabajador", meta: "Conocer los principios de un trabajo decente y justo." },
            { semana: 7, topico: "Proyecto de vida y metas a largo plazo", meta: "Construir un plan de desarrollo formativo y laboral." },
            { semana: 8, topico: "Foro Ético Ciclo V", meta: "Sustentar reflexiones sobre dilemas éticos actuales." }
        ],
        "Ciclo VI": [
            { semana: 1, topico: "Ética ciudadana, derechos humanos y paz", meta: "Analizar la constitución y los mecanismos de participación ciudadana." },
            { semana: 2, topico: "Bioética, tecnología e inteligencia artificial", meta: "Examinar límites éticos en la ciencia y la manipulación de datos." },
            { semana: 3, topico: "Justicia distributiva y equidad social", meta: "Evaluar propuestas para reducir la desigualdad socioeconómica." },
            { semana: 4, topico: "Liderazgo ético y transformación comunitaria", meta: "Inspirar cambios positivos en el entorno barrial o municipal." },
            { semana: 5, topico: "Responsabilidad intergeneracional y sostenibilidad", meta: "Comprometerse con el legado ecológico para futuras generaciones." },
            { semana: 6, topico: "Cultura de la legalidad y deber ciudadano", meta: "Reconocer la importancia de las normas para la convivencia civilizada." },
            { semana: 7, topico: "Ética en la vida adulta y profesional", meta: "Formular el código deontológico personal del egresado." },
            { semana: 8, topico: "Sustentación del Proyecto de Vida Ciclo VI", meta: "Defender la visión de futuro y el compromiso social como bachiller." }
        ]
    }
};

function getDynamicDelay() {
    return { ms: 3100, desc: "3.1s (Flujo Constante Sin Ráfagas)" };
}

async function generarGuia(asignatura, grado, periodo, semanaData, rol, ambiente, nivel, enfoque) {

    const cacheDir = path.join(__dirname, 'guias_cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const fileNameSafe = [asignatura, periodo, semanaData.semana, rol, ambiente, nivel, enfoque]
        .map(s => s ? s.toString().toLowerCase().replace(/[^a-z0-9]/g, '_') : 'na')
        .join('_') + '.json';
    
    const cacheFilePath = path.join(cacheDir, fileNameSafe);
    
    if (fs.existsSync(cacheFilePath)) {
        return; // Ya existe, omitimos silenciosamente para avanzar rápido
    }

    logMsg(`[GENERANDO] ${asignatura} G${grado} Sem${semanaData.semana} | Rol: ${rol.substring(0,10)}... | Amb: ${ambiente.substring(0,10)}...`);

    let perfilEstudiante = "estudiantes de básica secundaria (aprox. 11-14 años)";
    let matchGrado = grado.toString().match(/\d+/);
    let numGrado = matchGrado ? parseInt(matchGrado[0]) : 0;
    
    if (grado.toString().toUpperCase().includes("PENSAR")) {
        perfilEstudiante = "jóvenes y adultos en modelo educativo flexible (CLEI/PENSAR), requiriendo un enfoque andragógico, maduro y muy contextualizado a la vida laboral/cotidiana";
    } else if (numGrado >= 10) {
        perfilEstudiante = "estudiantes de educación media (aprox. 15-17 años)";
    } else if (numGrado >= 6 && numGrado <= 9) {
        perfilEstudiante = "estudiantes de básica secundaria (aprox. 11-14 años)";
    }

    const prompt = `Actúa como un ${rol}. Tu objetivo pedagógico es enseñar ${asignatura} (Grado ${grado}) a ${perfilEstudiante} en el contexto narrativo inmersivo de ${ambiente}.
Nivel de dificultad: ${nivel}. Competencia focal: ${enfoque}.

Contexto Curricular:
- Periodo: ${periodo}
- Semana: ${semanaData.semana}
- Meta: ${semanaData.meta}
- Tópico: ${semanaData.topico}

REGLAS PEDAGÓGICAS ESTRICTAS:
1. EXTENSIÓN Y RIGOR:
   - "texto_inductivo" DEBE tener MÍNIMO 500 PALABRAS. Narrativa de exploración profunda y contextualizada.
   - "texto_deductivo" DEBE tener MÍNIMO 500 PALABRAS. Formalización teórica, leyes, modelos matemáticos/científicos y síntesis.
2. PREGUNTA PROBLEMATIZADORA:
   - El primer párrafo de "texto_inductivo" debe iniciar OBLIGATORIAMENTE con la Pregunta Problematizadora en negrita y cursiva (**_¿Pregunta...?_**).
3. INTERCALACIÓN EXACTA EN "texto_inductivo" (debes incrustar estos shortcodes dentro de los párrafos):
   - 3 Actividades de Cuaderno: [ACTIVIDAD:CUADERNO:Instrucción de lo que debe dibujar, hacer o tabular en el cuaderno]
   - 3 Actividades de Plataforma: [ACTIVIDAD:PLATAFORMA:Pregunta de análisis profundo|Respuesta esperada o palabra clave]
   - 3 Juegos de Ordenar Letras: [JUEGO:ORDENAR_LETRAS:PALABRA]
   - 3 Juegos de Ordenar Frase: [JUEGO:ORDENAR_FRASE:FRASE COMPLETA CON SENTIDO]
4. INTERCALACIÓN EXACTA EN "texto_deductivo" (debes incrustar estos shortcodes dentro de los párrafos):
   - 3 Actividades de Cuaderno: [ACTIVIDAD:CUADERNO:Instrucción de síntesis, esquema o mapa conceptual en el cuaderno]
   - 3 Actividades de Plataforma: [ACTIVIDAD:PLATAFORMA:Pregunta de síntesis o aplicación|Respuesta esperada]
   - 3 Juegos de Ordenar Letras: [JUEGO:ORDENAR_LETRAS:PALABRA]
   - 3 Juegos de Ordenar Frase: [JUEGO:ORDENAR_FRASE:FRASE DE PRINCIPIO O LEY CIENTIFICA]
5. DESAFÍO FINAL - 3 PREGUNTAS TIPO ICFES SABER 11 (Diseño Centrado en Evidencias):
   - Pregunta 1: Evalúa "Explicación de Fenómenos".
   - Pregunta 2: Evalúa "Uso Comprensivo del Conocimiento Científico".
   - Pregunta 3: Evalúa "Indagación" (análisis de datos, gráficas o diseño experimental).
   - Cada pregunta debe tener: competencia, texto_introductorio, tabla_o_grafica_markdown, pregunta, 4 opciones (Opción A, B, C, D) y retroalimentación detallada explicando la opción correcta y por qué cada uno de los 3 distractores es falso.
6. CIERRE GAMIFICADO AL FINAL:
   - 1 Sola Sopa de Letras con exactamente 10 términos clave de toda la guía: [JUEGO:SOPA_LETRAS:P1,P2,P3,P4,P5,P6,P7,P8,P9,P10]
   - 1 Solo Crucigrama con exactamente 10 pistas y respuestas: [JUEGO:CRUCIGRAMA:Pista 1|PAL1;Pista 2|PAL2;Pista 3|PAL3;Pista 4|PAL4;Pista 5|PAL5;Pista 6|PAL6;Pista 7|PAL7;Pista 8|PAL8;Pista 9|PAL9;Pista 10|PAL10]

DEBES DEVOLVER EXCLUSIVAMENTE UN OBJETO JSON VÁLIDO CON LA SIGUIENTE ESTRUCTURA EXACTA:
{
  "objetivo_aprendizaje": "Objetivo de aprendizaje de la semana...",
  "pregunta_problematizadora": "¿Pregunta problematizadora...?",
  "saberes_previos": [
    { "pregunta": "¿...?", "opciones": ["A", "B", "C", "D"], "correcta": 0 },
    { "pregunta": "¿...?", "opciones": ["A", "B", "C", "D"], "correcta": 1 },
    { "pregunta": "¿...?", "opciones": ["A", "B", "C", "D"], "correcta": 2 }
  ],
  "texto_inductivo": "Markdown (+500 palabras) con la pregunta problematizadora y conteniendo 3 [ACTIVIDAD:CUADERNO:...], 3 [ACTIVIDAD:PLATAFORMA:...], 3 [JUEGO:ORDENAR_LETRAS:...] y 3 [JUEGO:ORDENAR_FRASE:...]",
  "recurso_visual": "Instrucción de mapa mental o tabla con diagrama Mermaid graph TD o tabla markdown",
  "texto_deductivo": "Markdown (+500 palabras) con teoría formal y conteniendo 3 [ACTIVIDAD:CUADERNO:...], 3 [ACTIVIDAD:PLATAFORMA:...], 3 [JUEGO:ORDENAR_LETRAS:...] y 3 [JUEGO:ORDENAR_FRASE:...]",
  "icfes": [
    {
      "competencia": "Explicación de Fenómenos",
      "texto_introductorio": "Contexto de la pregunta...",
      "tabla_o_grafica_markdown": "| Variable | Valor |\\n|---|---|",
      "pregunta": "¿...?",
      "opciones": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correcta": 0,
      "retroalimentacion": {
        "0": "Correcto porque...",
        "1": "Incorrecto porque...",
        "2": "Incorrecto porque...",
        "3": "Incorrecto porque..."
      }
    },
    {
      "competencia": "Uso Comprensivo del Conocimiento Científico",
      "texto_introductorio": "Contexto...",
      "tabla_o_grafica_markdown": "",
      "pregunta": "¿...?",
      "opciones": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correcta": 1,
      "retroalimentacion": {
        "0": "Incorrecto porque...",
        "1": "Correcto porque...",
        "2": "Incorrecto porque...",
        "3": "Incorrecto porque..."
      }
    },
    {
      "competencia": "Indagación",
      "texto_introductorio": "Contexto experimental...",
      "tabla_o_grafica_markdown": "| Ensayo | Resultado |\\n|---|---|",
      "pregunta": "¿...?",
      "opciones": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correcta": 2,
      "retroalimentacion": {
        "0": "Incorrecto porque...",
        "1": "Incorrecto porque...",
        "2": "Correcto porque...",
        "3": "Incorrecto porque..."
      }
    }
  ],
  "cierre_gamificado": {
    "sopa_letras": "PAL1,PAL2,PAL3,PAL4,PAL5,PAL6,PAL7,PAL8,PAL9,PAL10",
    "crucigrama": "Pista 1|PAL1;Pista 2|PAL2;Pista 3|PAL3;Pista 4|PAL4;Pista 5|PAL5;Pista 6|PAL6;Pista 7|PAL7;Pista 8|PAL8;Pista 9|PAL9;Pista 10|PAL10"
  }
}`;

    const modelos = ['gemini-flash-latest', 'gemini-2.0-flash', 'gemini-flash-lite-latest'];
    let responseText = "";
    let maxRetries = 15;
    let baseDelay = 30000;

    while (maxRetries > 0) {
        const ai = getAIClient();
        for (let i = 0; i < modelos.length; i++) {
            try {
                const response = await ai.models.generateContent({ 
                    model: modelos[i], 
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json"
                    }
                });
                responseText = response.text;
                break; // Éxito!
            } catch (err) {
                console.error(`[ERROR API ${modelos[i]}]`, err.message || err);
                await sleep(1500); // Pequeña pausa antes de intentar otro modelo
            }
        }
        if (responseText) break;
        
        logMsg(`[REINTENTO] Fallo en la petición. Esperando ${baseDelay/1000}s...`);
        await sleep(baseDelay);
        baseDelay *= 1.5; // Backoff exponencial
        maxRetries--;
    }

    if (!responseText) {
        logMsg(`[FATAL] Error irrecuperable en la guía de ${asignatura} Sem${semanaData.semana}. Saltando.`);
        return;
    }

    let limpio = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
    try {
        const finalJson = JSON.parse(limpio);
        fs.writeFileSync(cacheFilePath, JSON.stringify(finalJson, null, 2), 'utf-8');
    } catch (e) {
        logMsg(`[ERROR JSON] Fallo sintáctico en la respuesta. Saltando guía.`);
    }
    
    const delayInfo = getDynamicDelay();
    logMsg(`[DESCANSO] Esperando ${delayInfo.desc} para proteger cuota API...`);
    await sleep(delayInfo.ms); 
}

async function generarSemanaCompleta(semanaObjetivo) {
    const periodo = "1"; 
    
    // Las 4 opciones completas de cada menú habilitadas
    const actRoles = allRoles;
    const actAmbientes = allAmbientes;
    const actNiveles = allNiveles;
    const actEnfoques = allEnfoques;
    
    let tareas = [];

    for (const asignatura of Object.keys(mallasCurriculares)) {
        const grados = Object.keys(mallasCurriculares[asignatura]);
        
        for (const grado of grados) {
            const semanaData = mallasCurriculares[asignatura][grado].find(s => s.semana === semanaObjetivo);
            if (!semanaData) continue;

            for (const r of actRoles) {
                for (const a of actAmbientes) {
                    for (const n of actNiveles) {
                        for (const e of actEnfoques) {
                            tareas.push({asignatura, grado, periodo, semanaData, r, a, n, e});
                        }
                    }
                }
            }
        }
    }
    
    logMsg(`Se encolaron ${tareas.length} guías para la Semana ${semanaObjetivo}. Procesando en lotes de 1...`);
    
    const CONCURRENCIA = 1;
    for (let i = 0; i < tareas.length; i += CONCURRENCIA) {
        const lote = tareas.slice(i, i + CONCURRENCIA);
        const promesas = lote.map(t => generarGuia(t.asignatura, t.grado, t.periodo, t.semanaData, t.r, t.a, t.n, t.e));
        await Promise.all(promesas);
    }
}

function pushGuiasToGit() {
    return new Promise((resolve) => {
        // Deshabilitado para la nube. 
        // En Render, usaremos Persistent Disks o enviaremos directamente a MongoDB/Firebase.
        // Por ahora, simplemente guardamos en el File System (que en Render apuntará a un disco persistente).
        logMsg("Sincronización Git desactivada para ejecución en servidor Cloud (Render).");
        resolve(true);
    });
}

async function main() {
    logMsg("=================================================");
    logMsg("  CRON GENERATOR - MODO 24/7 DINÁMICO ACTIVO");
    logMsg("=================================================");
    
    while (true) {
        // Generar consecutivamente de la semana 1 a la 8
        for (let semana = 1; semana <= 8; semana++) {
            logMsg(`+++ PUESTA EN COLA: SEMANA ${semana} +++`);
            await generarSemanaCompleta(semana);
            logMsg(`+++ COMPLETADA: SEMANA ${semana} +++`);
            await pushGuiasToGit();
        }

        logMsg("=================================================");
        logMsg("  🎉 REVISIÓN DE TODAS LAS SEMANAS COMPLETADA.");
        logMsg("  Iniciando un descanso de 5 minutos antes del próximo ciclo...");
        logMsg("=================================================");
        await sleep(300000); // 5 minutos de pausa general al final
    }
}

main();
