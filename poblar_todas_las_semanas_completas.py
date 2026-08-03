import json

with open('proyectorData.json', 'r', encoding='utf-8') as f:
    db = json.load(f)

if 'clases' not in db:
    db['clases'] = {}

def slide(title, sub, content, icon="ph-notebook", timer=120, customHtml=""):
    return {
        "title": title,
        "sub": sub,
        "content": content,
        "icon": icon,
        "timer": timer,
        "customHtml": customHtml
    }

planes = {
    "fisica6": {
        "nombre": "Física 6°",
        "semanas": {
            1: {"tema": "Cinemática: Movimiento vs Reposo", "subtemas": ["Diferenciar movimiento y reposo respecto al observador.", "Trayectoria (forma del camino) y Desplazamiento (línea recta).", "Puntos de referencia en la vida cotidiana."], "reto": "Dibuja en tu cuaderno dos trayectorias: una recta y una curva. Señala el punto de partida y el punto de llegada con una flecha de desplazamiento."},
            2: {"tema": "Rapidez y Velocidad", "subtemas": ["Fórmula fundamental: Rapidez = Distancia / Tiempo (v = d / t).", "Unidades en el Sistema Internacional: metros por segundo (m/s) y km/h.", "Diferencia entre rapidez escalar y velocidad vectorial."], "reto": "Calcula en tu cuaderno la rapidez de un auto que recorre 150 kilómetros en 2 horas."},
            3: {"tema": "Movimiento Rectilíneo Uniforme (MRU)", "subtemas": ["Velocidad constante: recorre distancias iguales en tiempos iguales.", "Aceleración igual a cero.", "Gráficos de posición contra tiempo."], "reto": "Elabora una tabla de datos para un móvil que viaja a 10 m/s durante 5 segundos y grafica la recta resultante."},
            4: {"tema": "Las Fuerzas y sus Efectos", "subtemas": ["Concepto de fuerza como interacción entre cuerpos.", "Efectos: movimiento, frenado, cambio de dirección y deformación.", "Fuerzas de contacto vs Fuerzas a distancia (Gravedad y Magnetismo)."], "reto": "Escribe en tu cuaderno 3 ejemplos de fuerzas de contacto y 3 ejemplos de fuerzas a distancia que uses a diario."},
            5: {"tema": "Máquinas Simples y Ventaja Mecánica", "subtemas": ["Palancas: punto de apoyo, resistencia y potencia.", "Poleas fijas y móviles para elevar cargas.", "El plano inclinado y su uso en la arquitectura y el campo."], "reto": "Dibuja una palanca de primer género (como un balancín o unas tijeras) e identifica sus 3 puntos clave."},
            6: {"tema": "Masa, Peso y Densidad", "subtemas": ["Diferencia entre masa (kg) y peso gravitatorio (N).", "El concepto de densidad (ρ = m / V).", "Principio de flotabilidad: ¿Por qué flotan los barcos?"], "reto": "Explica en tu cuaderno por qué una aguja de metal se hunde en el agua pero un enorme barco flota."},
            7: {"tema": "Presión en Líquidos y Fluidos", "subtemas": ["Definición de presión: P = Fuerza / Área.", "Presión hidrostática: aumenta con la profundidad.", "Principio de Pascal y prensas hidráulicas."], "reto": "Explica por qué un cuchillo afilado corta mejor que uno sin filo aplicando la fórmula P = F / A."},
            8: {"tema": "Energía Mecánica y Conservación", "subtemas": ["Energía Cinética (del movimiento) y Potencial (de la altura).", "Ley de Conservación: 'La energía no se destruye, se transforma'.", "Transformaciones de energía en una montaña rusa o caída libre."], "reto": "Dibuja una montaña rusa y señala en qué punto la energía potencial es máxima y dónde la energía cinética es máxima."}
        }
    },
    "fisica7": {
        "nombre": "Física 7°",
        "semanas": {
            1: {"tema": "Materia y Estados de Agregación", "subtemas": ["Identificar sólidos, líquidos, gases y plasma.", "Comprender la teoría cinética molecular.", "Reconocer cambios de estado (fusión, evaporación, sublimación)."], "reto": "Dibuja en tu cuaderno las moléculas de agua en estado sólido (hielo), líquido y gaseoso (vapor). Explica cómo varía su movimiento."},
            2: {"tema": "Calor y Temperatura", "subtemas": ["Diferenciar calor (energía en tránsito) de temperatura (agitación térmica).", "Conocer las escalas Celsius, Fahrenheit y Kelvin.", "Comprender el equilibrio térmico entre dos cuerpos."], "reto": "Resuelve en tu cuaderno: Si mezclas un vaso de agua a 80°C con un vaso de agua a 20°C, ¿a qué temperatura aproximada llegará la mezcla en el equilibrio? Justifica."},
            3: {"tema": "Formas de Transferencia de Calor", "subtemas": ["Conducción en sólidos metálicos.", "Convección en fluidos (líquidos y gases).", "Radiación térmica mediante ondas electromagnéticas."], "reto": "Dibuja una olla en la estufa e identifica con flechas de colores dónde ocurre Conducción, Convección y Radiación."},
            4: {"tema": "Dilatación Térmica en Materiales", "subtemas": ["Dilatación lineal, superficial y volumétrica.", "Juntas de dilatación en puentes y rieles de tren.", "El comportamiento anómalo del agua al congelarse."], "reto": "Escribe en tu cuaderno: ¿Por qué los constructores dejan espacios libres entre los bloques de concreto de los andenes y puentes?"},
            5: {"tema": "Naturaleza de las Ondas y Sonido", "subtemas": ["Ondas mecánicas vs ondas electromagnéticas.", "Partes de la onda: cresta, valle, longitud y frecuencia.", "El sonido como onda longitudinal en el aire."], "reto": "Dibuja una onda transversal completa en tu cuaderno y señala: Longitud de onda (λ), Cresta, Valle y Amplitud."},
            6: {"tema": "Acústica y Propiedades del Sonido", "subtemas": ["Velocidad del sonido en sólidos, líquidos y aire.", "Tono (frecuencia), Timbre e Intensidad (decibeles).", "Fenómenos sonoros: Eco, reverberación y resonancia."], "reto": "Explica en 4 líneas: ¿Por qué en una tormenta vemos primero el relámpago y segundos después escuchamos el trueno?"},
            7: {"tema": "Óptica y Comportamiento de la Luz", "subtemas": ["Propagación rectilínea y velocidad de la luz (300.000 km/s).", "Leyes de la Reflexión y Espejos planos/curvos.", "Refracción de la luz y Ley de Snell."], "reto": "Dibuja un lápiz sumergido en un vaso con agua. Explica por qué parece doblado o quebrado (Refracción)."},
            8: {"tema": "Espectro Electromagnético y Colores", "subtemas": ["Descomposición de la luz blanca en el prisma (Arcoíris).", "Ondas de radio, microondas, rayos X y rayos gamma.", "La visión humana y los colores primarios luz (RGB)."], "reto": "Elabora en tu cuaderno una franja coloreada con los 7 colores del arcoíris en orden de menor a mayor frecuencia."}
        }
    },
    "quimica": {
        "nombre": "Química PENSAR",
        "semanas": {
            1: {"tema": "La Materia y sus Propiedades", "subtemas": ["Propiedades generales: masa, volumen, peso.", "Propiedades específicas: densidad, punto de fusión, ebullición.", "Diferencia entre cambios físicos y químicos."], "reto": "Escribe 3 ejemplos de cambios físicos y 3 ejemplos de cambios químicos que ocurran a diario en tu cocina."},
            2: {"tema": "Sustancias Puras y Mezclas", "subtemas": ["Elementos y compuestos químicos.", "Mezclas homogéneas (soluciones) y heterogéneas.", "Métodos de separación: filtración, decantación, evaporación, destilación."], "reto": "Diseña un método paso a paso para separar una mezcla de agua, sal y arena de río."},
            3: {"tema": "El Átomo y su Estructura", "subtemas": ["Partículas subatómicas: protones (+), neutrones (0) y electrones (-).", "Número atómico (Z) y Número másico (A).", "Evolución histórica de los modelos atómicos."], "reto": "Dibuja el átomo de Carbono (Z=6, A=12) con sus 6 protones, 6 neutrones en el núcleo y 6 electrones en sus órbitas."},
            4: {"tema": "La Tabla Periódica Moderna", "subtemas": ["Organización en 18 grupos y 7 periodos.", "Metales, No Metales y Metaloides.", "Gases Nobles y su estabilidad electrónica."], "reto": "Ubica y escribe en tu cuaderno el símbolo, nombre y masa de 5 metales y 5 no metales indispensables para la vida."},
            5: {"tema": "Enlaces Químicos y Regla del Octeto", "subtemas": ["Electrones de valencia y estructuras de Lewis.", "Enlace Iónico: transferencia de electrones (ej. NaCl).", "Enlace Covalente: compartición de pares de electrones (ej. H2O)."], "reto": "Dibuja la estructura de Lewis para la molécula del agua (H2O) mostrando los electrones compartidos."},
            6: {"tema": "Funciones Químicas Inorgánicas", "subtemas": ["Óxidos básicos y ácidos.", "Hidróxidos o bases (sabor amargo, pH > 7).", "Ácidos (sabor agrio, pH < 7) y sales neutras."], "reto": "Escribe la fórmula química y el nombre común de: 1. Sal de cocina (NaCl), 2. Agua oxigenada (H2O2), 3. Dióxido de carbono (CO2)."},
            7: {"tema": "Reacciones Químicas y Ecuaciones", "subtemas": ["Reactivos y Productos de la reacción.", "Evidencias de reacción: cambio de color, gas, precipitado, calor.", "Ley de Conservación de la Masa y balanceo por tanteo."], "reto": "Balancea por tanteo en tu cuaderno la siguiente ecuación: H2 + O2 ➔ H2O."},
            8: {"tema": "Soluciones Químicas y pH", "subtemas": ["Soluto y Solvente en disoluciones.", "Concentración: Porcentaje masa/volumen y Molaridad.", "La escala de pH de 0 a 14 (ácidos, neutros y alcalinos)."], "reto": "Dibuja la escala de pH (0 a 14) y ubica en ella: jugo de limón (pH 2), agua pura (pH 7) y jabón líquido (pH 10)."}
        }
    },
    "etica": {
        "nombre": "Ética y Valores",
        "semanas": {
            1: {"tema": "Autoconocimiento y Autoestima", "subtemas": ["Reconocer mis talentos, virtudes y aspectos por mejorar.", "La importancia del diálogo interior positivo.", "Construcción de una identidad sólida y segura."], "reto": "Escribe en tu cuaderno: 3 cualidades personales que te hacen único y 1 meta personal para este año."},
            2: {"tema": "La Empatía y la Escucha Activa", "subtemas": ["Ponerse en el lugar de los demás sin juzgar.", "Diferencia entre oír y escuchar con el corazón.", "La empatía como antídoto contra el acoso escolar."], "reto": "Redacta un párrafo corto describiendo cómo ayudarías a un compañero nuevo que se siente solo en el salón."},
            3: {"tema": "Resolución Pacífica de Conflictos", "subtemas": ["El conflicto como oportunidad de crecimiento.", "Estrategias de mediación y diálogo asertivo.", "El control de impulsos y la inteligencia emocional."], "reto": "Describe los 3 pasos que aplicarías para solucionar un desacuerdo con un familiar o amigo sin recurrir a los gritos."},
            4: {"tema": "Derechos Humanos y Diversidad", "subtemas": ["Dignidad humana inalienable.", "Respeto a las diferencias culturales, de género y opinión.", "Inclusión y equidad en la escuela y el trabajo."], "reto": "Escribe el Artículo 1 de la Declaración Universal de los Derechos Humanos y qué significa para ti."},
            5: {"tema": "Responsabilidad y Bien Común", "subtemas": ["El valor de la palabra y el compromiso ciudadano.", "El cuidado de los bienes públicos y espacios compartidos.", "La honestidad como base de la confianza social."], "reto": "Menciona 3 acciones concretas que puedes hacer cada día para cuidar las instalaciones de tu institución educativa."},
            6: {"tema": "Ética en la Era Digital", "subtemas": ["La huella digital y la privacidad en redes sociales.", "Prevención del ciberacoso y las noticias falsas (Fake News).", "Uso responsable y consciente de la tecnología."], "reto": "Crea un 'Decálogo del Buen Ciudadano Digital' con 5 reglas de respeto en internet para tu cuaderno."},
            7: {"tema": "Proyecto de Vida y Vocación", "subtemas": ["Definir metas a corto, mediano y largo plazo.", "La perseverancia frente a los obstáculos.", "Alineación de pasiones, habilidades y servicio a la comunidad."], "reto": "Dibuja tu 'Árbol de la Vida': Raíces (tus valores), Tronco (lo que sabes hacer), Ramas (tus sueños profesionales)."},
            8: {"tema": "Cultura de Paz y Solidaridad", "subtemas": ["Construcción colectiva de la paz cotidiana.", "El voluntariado y la ayuda comunitaria.", "Compromiso ético con el medio ambiente y las futuras generaciones."], "reto": "Escribe un compromiso ético firmado por ti con una acción de servicio a tu comunidad para este mes."}
        }
    },
    "artistica": {
        "nombre": "Educación Artística",
        "semanas": {
            1: {"tema": "El Punto y la Línea en la Composición", "subtemas": ["El punto como unidad mínima generadora de forma.", "Tipos de líneas: rectas, curvas, diagonales y su expresividad.", "El puntillismo como técnica artística."], "reto": "Realiza en tu cuaderno un dibujo aplicando la técnica del Puntillismo utilizando micropuntas o marcadores."},
            2: {"tema": "Teoría y Psicología del Color", "subtemas": ["Círculo cromático: primarios, secundarios y terciarios.", "Colores cálidos (energía) y colores fríos (calma).", "El significado del color en la publicidad y el arte."], "reto": "Divide una hoja en dos: pinta el mismo paisaje con colores cálidos a la izquierda y con colores fríos a la derecha."},
            3: {"tema": "Luz, Sombra y Volumen (Claroscuro)", "subtemas": ["Luz directa, luz reflejada, sombra propia y sombra proyectada.", "Técnicas de degradado con lápices 2B, 4B y 6B.", "Creación de sensación tridimensional en el papel."], "reto": "Dibuja una esfera perfecta y aplícale sombreado en escala de grises con su sombra proyectada."},
            4: {"tema": "Composición y Perspectiva Básica", "subtemas": ["La línea del horizonte y el punto de fuga.", "Perspectiva frontal (un punto de fuga).", "Sensación de profundidad y lejanía en el dibujo."], "reto": "Dibuja una carretera o vía férrea que se pierde en el horizonte hacia un punto de fuga central."},
            5: {"tema": "Historia del Arte: De las Cavernas al Renacimiento", "subtemas": ["Pinturas rupestres y arte precolombino.", "El canon clásico griego y romano.", "Los maestros del Renacimiento: Da Vinci, Miguel Ángel y Rafael."], "reto": "Dibuja un símbolo precolombino de la cultura Quimbaya (ej: poporo o figura zoomorfa) en tu cuaderno."},
            6: {"tema": "Vanguardias Artísticas del Siglo XX", "subtemas": ["El Impresionismo (captura de la luz).", "El Cubismo (Picasso) y el Surrealismo (Dalí).", "El Arte Pop y el diseño gráfico moderno."], "reto": "Crea una ilustración con estilo cubista descomponiendo un rostro u objeto en figuras geométricas."},
            7: {"tema": "Arte y Cultura Tradicional Colombiana", "subtemas": ["Maestros colombianos: Fernando Botero, Débora Arango, Alejandro Obregón.", "Artesanías emblemáticas: Sombrero Vueltiao, Cerámica de Ráquira.", "El arte como memoria histórica del país."], "reto": "Escribe una reseña de 5 líneas sobre una obra del maestro Fernando Botero y dibuja un boceto alusivo."},
            8: {"tema": "Creación y Exposición de Portafolio", "subtemas": ["Curaduría de obras personales.", "Presentación estética y montaje de trabajos.", "Apreciación crítica constructiva del arte."], "reto": "Selecciona tu mejor dibujo del periodo, márcalo con ficha técnica (Título, Técnica, Año, Autor) y preséntalo."}
        }
    },
    "turismo": {
        "nombre": "Turismo Sostenible",
        "semanas": {
            1: {"tema": "Introducción al Turismo y su Cadena de Valor", "subtemas": ["Concepto de turismo, turista y excursionista.", "Impacto socioeconómico y generador de empleo.", "La cadena de servicios turísticos: transporte, alojamiento, gastronomía."], "reto": "Elabora un mapa mental en tu cuaderno con los 5 componentes principales que necesita un turista al llegar a una ciudad."},
            2: {"tema": "Paisaje Cultural Cafetero (PCC)", "subtemas": ["Declaratoria de la UNESCO como Patrimonio Mundial.", "Atributos del PCC: café de montaña, arquitectura de bahareque, tradición.", "Montenegro y el Quindío como corazón del PCC."], "reto": "Escribe los 4 departamentos que conforman el PCC y dibuja una casa tradicional cafetera con su balcón de flores."},
            3: {"tema": "Ecoturismo y Conservación Ambiental", "subtemas": ["Principios del turismo de naturaleza responsable.", "Capacidad de carga de un sendero ecológico.", "Avistamiento de aves (Colombia país #1 del mundo en aves)."], "reto": "Diseña un decálogo con 5 normas de comportamiento que todo turista debe cumplir al visitar un parque natural."},
            4: {"tema": "Atención al Cliente y Calidad del Servicio", "subtemas": ["La hospitalidad como factor diferenciador.", "Comunicación asertiva y resolución de quejas.", "Higiene, presentación personal y lenguaje corporal."], "reto": "Escribe un diálogo teatral corto donde un recepcionista atiende con amabilidad y soluciona un problema a un huésped."},
            5: {"tema": "Patrimonio Gastronómico y Rutas del Café", "subtemas": ["La gastronomía típica como atractivo turístico.", "El proceso del café desde la semilla hasta la taza gourmet.", "Cata de café y atributos sensoriales."], "reto": "Dibuja la ruta del café en 5 pasos: Siembra ➔ Recolección ➔ Beneficio/Secado ➔ Tostión ➔ Preparación de la bebida."},
            6: {"tema": "Guianza Turística y Técnicas de Conducción", "subtemas": ["El rol del guía turístico como embajador cultural.", "Técnicas de manejo de grupos y primeros auxilios básicos.", "Diseño de un itinerario turístico de medio día."], "reto": "Diseña un itinerario turístico de 4 horas para un grupo de visitantes en el municipio de Montenegro."},
            7: {"tema": "Marketing Turístico y Redes Sociales", "subtemas": ["Promoción de destinos en la era digital.", "Creación de contenido visual atractivo (fotografía, video).", "Turismo accesible e incluyente."], "reto": "Crea el eslogan publicitario y el boceto de un cartel promocional para invitar a conocer los atractivos de tu región."},
            8: {"tema": "Proyecto Final: Emprendimiento Turístico", "subtemas": ["Ideación de un modelo de negocio turístico verde.", "Evaluación de sostenibilidad ambiental y viabilidad económica.", "Presentación de propuestas comunitarias."], "reto": "Escribe tu propuesta de emprendimiento turístico en una ficha: Nombre, Qué ofrece, A quién va dirigido y Cómo cuida el planeta."}
        }
    },
    "ciclo1": {
        "nombre": "Ciencias Naturales Ciclo I (1°-3°)",
        "semanas": {
            1: {"tema": "Los Seres Vivos y Mis Sentidos", "subtemas": ["Diferenciar seres vivos de objetos inertes.", "Los 5 sentidos y cómo nos conectan con el mundo.", "Cuidado de los órganos de los sentidos."], "reto": "Dibuja en tu cuaderno los 5 órganos de los sentidos y al lado escribe qué información te permite percibir cada uno."},
            2: {"tema": "El Cuerpo Humano y Hábitos de Salud", "subtemas": ["Las partes principales del cuerpo (cabeza, tronco, extremidades).", "La importancia de la higiene, el sueño y el agua.", "Alimentación balanceada para tener energía."], "reto": "Dibuja un 'Plato Saludable' en tu cuaderno con frutas, verduras, proteínas y cereales."},
            3: {"tema": "El Maravilloso Mundo de las Plantas", "subtemas": ["Partes de la planta: raíz, tallo, hojas, flor y fruto.", "Cómo se alimentan las plantas: Luz, agua y suelo.", "Las plantas medicinales y agrícolas de la región."], "reto": "Dibuja una planta completa señalando sus 5 partes y la función de la raíz y las hojas."},
            4: {"tema": "Los Animales y sus Características", "subtemas": ["Animales domésticos y animales salvajes.", "Cómo nacen (vivíparos y ovíparos).", "Cómo se desplazan (caminan, vuelan, nadan, reptan)."], "reto": "Haz un cuadro comparativo en tu cuaderno con 3 animales ovíparos y 3 vivíparos."},
            5: {"tema": "El Agua: Tesoro de la Naturaleza", "subtemas": ["Estados del agua en la cotidianidad (hielo, líquida, vapor).", "El ciclo del agua en las montañas cafeteras.", "Acciones para no desperdiciar ni contaminar el agua."], "reto": "Dibuja el ciclo del agua con el sol, la evaporación, las nubes (condensación) y la lluvia (precipitación)."},
            6: {"tema": "El Suelo y el Cuidado de la Tierra", "subtemas": ["Qué es el suelo y qué seres viven en él (lombrices, raíces).", "El abono orgánico y el compostaje casero.", "La separación de basuras: orgánicos, reciclables y no aprovechables."], "reto": "Dibuja 3 canecas de colores y escribe qué residuos van en cada una (Blanco: reciclable, Verde: orgánico, Negro: no aprovechable)."},
            7: {"tema": "El Sol, el Día y la Noche", "subtemas": ["El sol como fuente principal de luz y calor para la vida.", "El movimiento de rotación de la Tierra genera el día y la noche.", "Actividades diurnas y animales nocturnos."], "reto": "Explica en tu cuaderno: ¿Por qué las plantas y los seres humanos necesitamos la luz del sol todos los días?"},
            8: {"tema": "Repaso General y Reto STEAM", "subtemas": ["Integración de seres vivos, agua y suelo.", "Mi compromiso como guardián del medio ambiente.", "Evaluación participativa de saberes."], "reto": "Escribe un compromiso de 3 puntos sobre cómo cuidarás las plantas y los animales en tu hogar y comunidad."}
        }
    },
    "ciclo2": {
        "nombre": "Ciencias Naturales Ciclo II (4°-5°)",
        "semanas": {
            1: {"tema": "Ecosistemas y Factores Bióticos/Abióticos", "subtemas": ["Componentes bióticos (seres vivos) y abióticos (luz, agua, temperatura).", "Interacciones en el ecosistema (depredación, simbiosis).", "Cadenas y redes tróficas."], "reto": "Dibuja una cadena alimentaria completa con Productor (Planta) ➔ Consumidor 1° (Herbívoro) ➔ Consumidor 2° (Carnívoro) ➔ Descomponedor."},
            2: {"tema": "Niveles de Organización Biológica", "subtemas": ["De la célula al organismo completo.", "Célula ➔ Tejido ➔ Órgano ➔ Sistema ➔ Individuo.", "Diferencia entre organismos unicelulares y pluricelulares."], "reto": "Elabora un esquema en escalera mostrando los 5 niveles de organización con un ejemplo del cuerpo humano."},
            3: {"tema": "Sistemas del Cuerpo Humano: Nutrición y Transporte", "subtemas": ["El Sistema Digestivo: absorción de nutrientes.", "El Sistema Circulatorio: el corazón y la sangre.", "El Sistema Respiratorio: intercambio de oxígeno y CO2."], "reto": "Dibuja el recorrido del oxígeno desde que entra por la nariz hasta que llega a los pulmones y la sangre."},
            4: {"tema": "La Energía y sus Transformaciones", "subtemas": ["Tipos de energía: solar, térmica, química, cinética, eléctrica.", "Fuentes de energía renovables (solar, eólica, hídrica).", "Uso eficiente de la energía en el hogar."], "reto": "Escribe 3 ejemplos cotidianos donde un tipo de energía se transforme en otro (ej: energía eléctrica ➔ lumínica en un bombillo)."},
            5: {"tema": "La Materia y sus Cambios de Estado", "subtemas": ["Propiedades de sólidos, líquidos y gases.", "Puntos de ebullición y fusión del agua.", "Separación de mezclas en procesos agrícolas."], "reto": "Explica en tu cuaderno por qué la ropa mojada tendida al sol se seca (proceso de evaporación)."},
            6: {"tema": "Biodiversidad y Especies del Quindío", "subtemas": ["Flora y fauna representativa del Eje Cafetero.", "El papel de las abejas y aves en la polinización.", "Especies amenazadas y cómo protegerlas."], "reto": "Dibuja la Palma de Cera del Quindío y el Loro Orejiamarillo explicando por qué son especies protegidas."},
            7: {"tema": "Ciclos Biogeoquímicos y Suelo", "subtemas": ["El ciclo del Carbono y la fotosíntesis.", "La fertilidad del suelo y el humus.", "Causas y consecuencias de la erosión del suelo."], "reto": "Escribe 3 prácticas agrícolas que evitan la erosión de los suelos en las laderas cafeteras."},
            8: {"tema": "Proyecto Ambiental Escolar (PRAE)", "subtemas": ["Diagnóstico de problemas ambientales en el entorno.", "Propuestas de solución comunitaria.", "Cierre y consolidación de competencias científicas."], "reto": "Diseña un afiche publicitario en tu cuaderno invitando al ahorro del agua y la protección de los bosques nativos."}
        }
    },
    "ciclo3": {
        "nombre": "Ciencias Naturales Ciclo III (6°-7°)",
        "semanas": {
            1: {"tema": "La Célula: Unidad Fundamental de la Vida", "subtemas": ["Postulados de la Teoría Celular.", "Células Procariotas vs Eucariotas.", "Diferencias entre Célula Animal y Célula Vegetal."], "reto": "Dibuja una Célula Vegetal señalando la Pared Celular, la Vacuola Central y los Cloroplastos con sus funciones."},
            2: {"tema": "Transporte Celular y Metabolismo", "subtemas": ["La membrana celular y su permeabilidad selectiva.", "Transporte pasivo (difusión y ósmosis) y activo.", "Respiración celular y obtención de ATP."], "reto": "Explica qué le ocurre a una célula vegetal cuando se coloca en agua con abundante sal (Ósmosis)."},
            3: {"tema": "Fuerzas, Movimiento y Trabajo", "subtemas": ["Leyes del movimiento y marco de referencia.", "Fórmulas de velocidad, aceleración y fuerza (F = m × a).", "Fuerza de fricción en la maquinaria agrícola."], "reto": "Calcula la fuerza necesaria para acelerar un bulto de café de 50 kg a una aceleración de 2 m/s²."},
            4: {"tema": "La Materia a Nivel Atómico", "subtemas": ["Modelos atómicos y partículas subatómicas.", "La tabla periódica: periodos, familias y electronegatividad.", "Bioelementos indispensables en la nutrición humana."], "reto": "Escribe la configuración electrónica del Oxígeno (Z=8) y dibuja sus electrones en cada nivel energético."},
            5: {"tema": "Energía Térmica y Termodinámica", "subtemas": ["Escalas de temperatura y dilatación térmica.", "Leyes de la termodinámica aplicadas a motores y naturaleza.", "El efecto invernadero natural y el calentamiento global."], "reto": "Elabora un esquema explicando cómo los gases de efecto invernadero atrapan el calor en la atmósfera."},
            6: {"tema": "Taxonomía y Reinos de la Naturaleza", "subtemas": ["Sistema de clasificación de Linneo y árboles filogenéticos.", "Los 5 reinos: Monera, Protista, Fungi, Plantae, Animalia.", "Importancia ecológica y medicinal del reino Fungi (hongos)."], "reto": "Elabora un cuadro con las características clave y un ejemplo representativo de cada uno de los 5 reinos."},
            7: {"tema": "Recursos Naturales y Cuencas Hidrográficas", "subtemas": ["El agua como recurso estratégico en Colombia.", "Manejo de cuencas hidrográficas y protección de nacimientos de agua.", "Tratamiento de aguas residuales y potabilización."], "reto": "Dibuja una microcuenca hidrográfica señalando la zona de recarga (páramo/bosque de niebla) y la zona de uso humano."},
            8: {"tema": "Reto Integrador de Ciencias Básicas", "subtemas": ["Integración de conceptos biológicos, físicos y químicos.", "Aplicación del método científico en situaciones cotidianas.", "Evaluación y cierre de ciclo."], "reto": "Formula una hipótesis sobre cómo afecta la temperatura al crecimiento de una planta y diseña el experimento para probarla."}
        }
    },
    "ciclo4": {
        "nombre": "Ciencias Naturales Ciclo IV (8°-9°)",
        "semanas": {
            1: {"tema": "Genética Mendeliana y Herencia", "subtemas": ["Leyes de Gregor Mendel.", "Conceptos de Alelo, Gen, Genotipo y Fenotipo.", "Uso de los Cuadros de Punnett para predecir cruces."], "reto": "Resuelve un cruce monohíbrido entre dos plantas heterocigotas (Aa x Aa) y calcula el porcentaje fenotípico resultante."},
            2: {"tema": "Estructura del ADN y Síntesis de Proteínas", "subtemas": ["El modelo de la doble hélice de Watson y Crick.", "Bases nitrogenadas: Adenina, Timina, Citosina, Guanina y Uracilo.", "Transcripción (ADN ➔ ARN) y Traducción (ARN ➔ Proteína)."], "reto": "Dada la cadena de ADN: TAC-GGC-TTA, escribe su cadena complementaria de ARNm y los aminoácidos correspondientes."},
            3: {"tema": "Enlaces Químicos y Reacciones en la Industria", "subtemas": ["Enlace iónico, covalente polar, no polar y metálico.", "Escritura de fórmulas y balanceo de ecuaciones químicas.", "Reacciones exotérmicas y endotérmicas."], "reto": "Balancea la ecuación de combustión del propano: C3H8 + O2 ➔ CO2 + H2O."},
            4: {"tema": "Ondas Electromagnéticas y Espectro", "subtemas": ["La luz como onda y partícula (fotón).", "Frecuencia, longitud de onda y velocidad de propagación.", "Aplicaciones tecnológicas: Rayos X, Wi-Fi, Microondas y Telefonía."], "reto": "Dibuja el espectro electromagnético ordenando las ondas desde la menor energía (Radio) hasta la mayor (Rayos Gamma)."},
            5: {"tema": "Ecología de Poblaciones y Cambio Climático", "subtemas": ["Dinámica poblacional: natalidad, mortalidad, capacidad de carga.", "Pérdida de hábitat y fragmentación de ecosistemas.", "La huella ecológica y acuerdos internacionales sobre el clima."], "reto": "Calcula tu huella ecológica personal respondiendo 4 preguntas sobre tus hábitos de transporte, energía y alimentación."},
            6: {"tema": "Electricidad y Circuitos Eléctricos", "subtemas": ["Carga eléctrica, corriente, voltaje y resistencia.", "La Ley de Ohm (V = I × R).", "Circuitos en serie y circuitos en paralelo."], "reto": "Calcula la corriente que circula por una bombilla con resistencia de 240 Ω conectada a una toma de 120 V."},
            7: {"tema": "Biotecnología y Bioética", "subtemas": ["Ingeniería genética y organismos genéticamente modificados (OGM).", "Terapia génica, clonación y células madre.", "Debates bioéticos sobre la edición genética (CRISPR)."], "reto": "Escribe un argumento a favor y un argumento en contra del uso de cultivos transgénicos en la agricultura."},
            8: {"tema": "Feria de Ciencias y Pensamiento Crítico", "subtemas": ["Diseño de proyectos de investigación científica escolar.", "Análisis de datos y sustentación de resultados.", "Cierre y preparación para la educación media."], "reto": "Redacta el resumen de un proyecto científico: Título, Problema, Metodología y Conclusión esperada."}
        }
    },
    "ciclo5": {
        "nombre": "Ciencias Naturales Ciclo V (10°)",
        "semanas": {
            1: {"tema": "Mecánica Clásica: Vectores y Leyes de Newton", "subtemas": ["Magnitudes escalares y vectoriales (suma de vectores).", "Las 3 Leyes de Newton del Movimiento.", "Diagramas de Cuerpo Libre (DCL) en planos inclinados."], "reto": "Dibuja el Diagrama de Cuerpo Libre para un bloque que se desliza por un plano inclinado con rozamiento."},
            2: {"tema": "Cinemática en Dos Dimensiones: Tiro Parabólico", "subtemas": ["Movimiento compuesto: MRU horizontal + MRUA vertical.", "Ecuaciones de alcance máximo, altura máxima y tiempo de vuelo.", "Aplicaciones en balística y deportes."], "reto": "Escribe las 3 ecuaciones fundamentales del movimiento vertical bajo la acción de la gravedad (g = 9.8 m/s²)."},
            3: {"tema": "Estequiometría y Leyes Ponderales", "subtemas": ["El concepto de Mol y el Número de Avogadro (6.022 × 10²³).", "Cálculo de Masa Molar y composición porcentual.", "Reactivo límite y rendimiento de una reacción química."], "reto": "Calcula cuántos moles de agua (H2O, masa molar 18 g/mol) hay en 90 gramos de agua pura."},
            4: {"tema": "Leyes de los Gases Ideales", "subtemas": ["Variables de estado: Presión, Volumen, Temperatura y Moles.", "Leyes de Boyle, Charles, Gay-Lussac y Avogadro.", "Ecuación de Estado de los Gases Ideales (P × V = n × R × T)."], "reto": "Calcula el volumen que ocupan 2 moles de gas ideal a 1 atmósfera de presión y 273 K de temperatura (R = 0.082 atm·L/mol·K)."},
            5: {"tema": "Termodinámica y Transferencia de Energía", "subtemas": ["Primera Ley de la Termodinámica: Conservación de la Energía.", "Segunda Ley de la Termodinámica y el concepto de Entropía.", "Máquinas térmicas y ciclo de Carnot."], "reto": "Explica por qué es imposible construir una máquina térmica con un rendimiento del 100% (Segunda Ley)."},
            6: {"tema": "Mecánica de Fluidos: Hidrostática e Hidrodinámica", "subtemas": ["Presión atmosférica e hidrostática (P = ρ × g × h).", "Principio de Arquímedes y empuje de flotación.", "Ecuación de Continuidad y Principio de Bernoulli en tuberías."], "reto": "Explica cómo genera sustentación el ala de un avión utilizando el Principio de Bernoulli."},
            7: {"tema": "Disoluciones Químicas y Equilibrio", "subtemas": ["Concentración: Molaridad (M), Molalidad (m), Normalidad (N).", "El equilibrio químico y la constante Kc.", "Principio de Le Chatelier ante cambios de presión y temperatura."], "reto": "Calcula la Molaridad de una solución que contiene 40 g de NaOH (Masa Molar 40 g/mol) en 2 Litros de solución."},
            8: {"tema": "Simulación ICFES Saber 11 - Ciencias Naturales", "subtemas": ["Estructura y competencias evaluadas por el ICFES (Uso del conocimiento, Explicación de fenómenos, Indagación).", "Técnicas de descarte y lectura crítica de gráficas y tablas.", "Resolución guiada de 5 preguntas tipo Saber 11."], "reto": "Resuelve y justifica la opción correcta de la pregunta modelo ICFES proyectada en pantalla."}
        }
    },
    "ciclo6": {
        "nombre": "Ciencias Naturales Ciclo VI (11°)",
        "semanas": {
            1: {"tema": "Química Orgánica: El Átomo de Carbono", "subtemas": ["Hibridación del Carbono (sp³, sp², sp) y tetravalencia.", "Tipos de cadenas y fórmulas (empírica, molecular, estructural).", "Hidrocarburos: Alcanos, Alquenos y Alquinos."], "reto": "Dibuja la estructura semidesarrollada y nombra según la IUPAC un alcano ramificado de 5 carbonos (ej: 2-metilbutano)."},
            2: {"tema": "Grupos Funcionales Oxigenados y Nitrogenados", "subtemas": ["Alcoholes, Aldehídos, Cetonas y Ácidos Carboxílicos.", "Ésteres (aromas), Éteres y Aminas/Amidas.", "Importancia en la industria farmacéutica y perfumería."], "reto": "Identifica el grupo funcional presente en: 1. El vinagre (Ácido acético), 2. El alcohol antiséptico (Etanol), 3. La acetona (Propanona)."},
            3: {"tema": "Biomoléculas y Bioquímica Fundamental", "subtemas": ["Carbohidratos (monosacáridos y polisacáridos).", "Lípidos (ácidos grasos, triglicéridos y fosfolípidos).", "Proteínas (aminoácidos y enlace peptídico) y Ácidos Nucleicos."], "reto": "Dibuja la estructura básica de un aminoácido señalando el grupo amino (-NH2), el grupo carboxilo (-COOH) y el radical R."},
            4: {"tema": "Electromagnetismo y Ley de Faraday", "subtemas": ["Campo eléctrico, potencial eléctrico y Ley de Coulomb.", "Magnetismo, polos magnéticos y campo de la Tierra.", "Inducción electromagnética: cómo se genera la electricidad en una hidroeléctrica."], "reto": "Explica en tu cuaderno cómo un imán en movimiento dentro de una bobina de cobre genera corriente eléctrica (Inducción)."},
            5: {"tema": "Óptica Ondulatoria y Física Moderna", "subtemas": ["Difracción, Interferencia y Polarización de la luz.", "El Efecto Fotoeléctrico (premio Nobel de Einstein).", "Dualidad onda-partícula de la materia (De Broglie)."], "reto": "Explica cómo los paneles solares aprovechan el Efecto Fotoeléctrico para convertir luz solar en electricidad."},
            6: {"tema": "Física Cuántica y Radiactividad", "subtemas": ["Estructura del núcleo atómico y fuerzas nucleares.", "Emisiones alfa (α), beta (β) y gamma (γ).", "Fisión nuclear, fusión nuclear y datación por Carbono-14."], "reto": "Escribe la diferencia fundamental entre Fisión Nuclear (división de núcleos pesados) y Fusión Nuclear (unión de núcleos livianos)."},
            7: {"tema": "Química Ambiental y Transición Energética", "subtemas": ["El ciclo del carbono antropogénico y el calentamiento global.", "Lluvia ácida (óxidos de azufre y nitrógeno).", "Energías limpias: Hidrógeno verde, baterías de litio y biocombustibles."], "reto": "Escribe un ensayo corto (5 líneas) sobre los retos de Colombia para lograr una transición energética justa y sostenible."},
            8: {"tema": "Taller Maestro de Graduación / ICFES Saber 11", "subtemas": ["Consolidación de las 3 áreas: Biología, Física y Química.", "Manejo del tiempo y control del estrés en pruebas de estado.", "Balance general y cierre exitoso del bachillerato."], "reto": "Escribe tu meta de puntaje ICFES y tu plan de estudio para la semana previa a la prueba de estado."}
        }
    }
}

for key, plan in planes.items():
    nombre_materia = plan['nombre']
    if key not in db['clases']:
        db['clases'][key] = {}
    for num_sem, info in plan['semanas'].items():
        titulo_sem = info['tema']
        subtemas = info['subtemas']
        reto = info['reto']
        slides_list = [
            slide(f"{nombre_materia} - Semana {num_sem}", "Prepara tu cuaderno y toma apuntes", f"📅 <b>Fecha:</b> Hoy<br>📌 <b>Título:</b> '{titulo_sem}'<br>🎯 <b>Meta Pedagógica:</b> {subtemas[0]}", "ph-book-open", 120),
            slide(f"Concepto Clave: {titulo_sem}", "Fundamentos Esenciales", f"<b>Ideas Principales:</b><br>1. {subtemas[0]}<br>2. {subtemas[1]}<br>3. {subtemas[2]}", "ph-lightbulb", 180),
            slide("Esquema y Análisis Visual", "Comprender para aplicar", f"Observa la relación entre conceptos:<br><div style='background:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px; padding:15px; margin-top:10px;'>💡 <b>Aplicación cotidiana:</b> {subtemas[1]} es fundamental para entender fenómenos de nuestro entorno en Colombia y el mundo.</div>", "ph-tree-structure", 180),
            slide("⏱️ Reto Práctico en tu Cuaderno", "Desafío de clase individual", f"<b>Actividad para desarrollar ahora:</b><br>{reto}<br><br>✍️ <i>Escribe con letra clara, utiliza colores y encuadra tu respuesta.</i>", "ph-pencil-line", 240, "<div style='background:#FEF3C7; border:1px solid #FDE68A; border-radius:8px; padding:8px; font-size:0.85rem; color:#92400E;'>⏱️ Tienes el cronómetro en pantalla. ¡Concéntrate y haz tu mejor trabajo!</div>"),
            slide("Socialización y Pregunta Desafío", "Puntos de participación", f"¿Quién desea compartir su respuesta ante el grupo?<br><br><b>Pregunta de debate:</b> ¿Cómo impacta {titulo_sem.lower()} en nuestra comunidad y en la vida diaria?", "ph-users-three", 180),
            slide("Conclusión y Firma de Avance", "Cierre de la sesión", f"✔️ <b>Aprendizaje alcanzado:</b> Dominio conceptual de {titulo_sem}.<br>✔️ <b>Evidencia:</b> Ejercicio resuelto y sellado en el cuaderno.<br><br>🌟 ¡Excelente trabajo en la clase de hoy!", "ph-check-circle", 120)
        ]
        db['clases'][key][str(num_sem)] = [slides_list]

with open('proyectorData.json', 'w', encoding='utf-8') as f:
    json.dump(db, f, ensure_ascii=False, indent=2)

print("¡proyectorData.json 100% poblado para las 12 materias y todas las semanas 1 a 8!")
