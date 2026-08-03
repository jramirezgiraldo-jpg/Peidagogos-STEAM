import json
import os

with open('proyectorData.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

ciclos_info = {
    "ciclo1": {
        "nombre": "Ciclo I (1°, 2°, 3°)",
        "semanas": {
            "1": {
                "tema": "Diagnóstico Inicial: Los Sentidos y el Entorno Vivo",
                "slides": [
                    {
                        "title": "¡Bienvenidos a Ciencias Naturales Ciclo I!",
                        "sub": "Prepara tu cuaderno y lápiz",
                        "content": "Escribe la fecha de hoy en tu cuaderno y el título en grande con color: <b>'Misión Inicial: Explorando los Seres Vivos y Mis Sentidos'</b>.<br><br>Hoy evaluaremos lo que ya conocemos sobre nuestro cuerpo y la naturaleza de forma práctica y divertida.",
                        "icon": "ph-hand-waving",
                        "customHtml": "",
                        "timer": 120
                    },
                    {
                        "title": "¿Qué diferencia a un Ser Vivo de un Objeto Inerte?",
                        "sub": "Observando nuestro alrededor",
                        "content": "Los seres vivos (personas, perros, gallinas, árboles de café) <b>nacen, crecen, respiran, se alimentan y se reproducen</b>.<br><br>Los objetos inertes (piedras, sillas, herramientas) no tienen vida ni necesitan alimento.",
                        "icon": "ph-plant",
                        "customHtml": "",
                        "timer": 180
                    },
                    {
                        "title": "Actividad 1 en tu Cuaderno",
                        "sub": "Clasificación Rápida",
                        "content": "Dibuja en tu cuaderno una tabla de 2 columnas:<br><b>Columna A:</b> 3 Seres Vivos de tu hogar o vereda.<br><b>Columna B:</b> 3 Objetos Inertes que uses a diario.",
                        "icon": "ph-pencil-line",
                        "customHtml": "",
                        "timer": 240
                    },
                    {
                        "title": "Nuestros 5 Sentidos",
                        "sub": "Las ventanas hacia el mundo",
                        "content": "Usamos nuestros sentidos todo el día:<br>👁️ <b>Vista:</b> para reconocer colores y formas.<br>👂 <b>Oído:</b> para escuchar el entorno.<br>👃 <b>Olfato:</b> para sentir aromas y prevenir peligros.<br>👅 <b>Gusto:</b> para disfrutar sabores.<br>✋ <b>Tacto:</b> para sentir frío, calor y texturas.",
                        "icon": "ph-eye",
                        "customHtml": "",
                        "timer": 180
                    },
                    {
                        "title": "Desafío de Comprensión",
                        "sub": "Pregunta de Diagnóstico",
                        "content": "<b>Caso:</b> Si en la cocina hueles a gas o sientes una paila muy caliente:<br><br>¿Qué sentidos te ayudaron a evitar un accidente?<br>A. La vista y el gusto.<br>B. El olfato y el tacto.<br>C. El oído exclusivamente.<br><br><b>Escribe la respuesta correcta en tu cuaderno.</b>",
                        "icon": "ph-question",
                        "customHtml": "",
                        "timer": 180
                    },
                    {
                        "title": "Cuidado del Agua y la Salud",
                        "sub": "Hábitos indispensables",
                        "content": "El agua potable y el lavado de manos con agua y jabón antes de comer son las herramientas más poderosas para prevenir enfermedades infecciosas.<br><br>Copia este consejo clave en tu cuaderno con una estrella ⭐.",
                        "icon": "ph-drop",
                        "customHtml": "",
                        "timer": 120
                    }
                ]
            },
            "2": {
                "tema": "Partes del Cuerpo Humano y Salud",
                "slides": [
                    {
                        "title": "Mi Cuerpo, Mi Máquina Perfecta",
                        "sub": "Partes principales",
                        "content": "Nuestro cuerpo se divide en: <b>Cabeza, Tronco y Extremidades</b> (brazos y piernas). Cada parte cumple una función vital.",
                        "icon": "ph-person",
                        "customHtml": "",
                        "timer": 180
                    },
                    {
                        "title": "Alimentación Balanceada",
                        "sub": "Comer para vivir con energía",
                        "content": "Nuestro cuerpo necesita frutas, verduras, proteínas (huevos, frijoles) y agua limpia para rendir en el trabajo y el estudio.",
                        "icon": "ph-apple",
                        "customHtml": "",
                        "timer": 180
                    }
                ]
            }
        }
    },

    "ciclo2": {
        "nombre": "Ciclo II (4°, 5°)",
        "semanas": {
            "1": {
                "tema": "Diagnóstico Inicial: Estados de la Materia y Cadenas Alimenticias",
                "slides": [
                    {
                        "title": "¡Bienvenidos a Ciencias Naturales Ciclo II!",
                        "sub": "Iniciando con entusiasmo",
                        "content": "Escribe en tu cuaderno: <b>'Diagnóstico Inicial: Estados de la Materia y Ecosistemas'</b>.<br><br>Comprobaremos cómo la ciencia explica los fenómenos que vemos todos los días en la cocina y en el campo.",
                        "icon": "ph-sparkle",
                        "customHtml": "",
                        "timer": 120
                    },
                    {
                        "title": "Los 3 Estados del Agua",
                        "sub": "Sólido, Líquido y Gaseoso",
                        "content": "🧊 <b>Sólido:</b> Hielo (temperatura baja, forma fija).<br>💧 <b>Líquido:</b> Agua que bebemos o llueve (toma la forma del recipiente).<br>💨 <b>Gaseoso:</b> Vapor al hervir agua en la olla o paila.",
                        "icon": "ph-drop",
                        "customHtml": "",
                        "timer": 180
                    },
                    {
                        "title": "Actividad de Cuaderno: El Ciclo del Agua",
                        "sub": "Esquema en 3 pasos",
                        "content": "Dibuja en tu cuaderno el recorrido del agua:<br>1. <b>Evaporación:</b> El sol calienta el agua de ríos y suelos.<br>2. <b>Condensación:</b> Se forman las nubes.<br>3. <b>Precipitación:</b> Cae la lluvia que riega los cafetales.",
                        "icon": "ph-cloud-rain",
                        "customHtml": "",
                        "timer": 240
                    },
                    {
                        "title": "¿Quién se alimenta de quién?",
                        "sub": "Cadenas alimenticias",
                        "content": "☀️ <b>Productores:</b> Plantas y árboles (fabrican su alimento con la luz solar).<br>🐛 <b>Consumidores primarios:</b> Herbívoros (insectos, vacas).<br>🦅 <b>Consumidores secundarios:</b> Carnívoros (aves, zorros).<br>🍄 <b>Descomponedores:</b> Hongos y lombrices que nutren el suelo.",
                        "icon": "ph-tree",
                        "customHtml": "",
                        "timer": 200
                    },
                    {
                        "title": "Pregunta de Diagnóstico",
                        "sub": "Razonamiento en clase",
                        "content": "<b>Pregunta:</b> Si en una huerta eliminamos todas las plantas verdes, ¿qué sucederá con los insectos herbívoros y los animales que dependen de ellos?<br><br>A. Crecerán más rápido.<br>B. Emigrarán o morirán por falta de alimento.<br>C. Se alimentarán de piedras.<br><br><b>Copia y justifica tu respuesta en 2 renglones.</b>",
                        "icon": "ph-question",
                        "customHtml": "",
                        "timer": 180
                    }
                ]
            }
        }
    },

    "ciclo3": {
        "nombre": "Ciclo III (6°, 7°)",
        "semanas": {
            "1": {
                "tema": "Diagnóstico Inicial: La Célula, Mezclas y Energía Cotidiana",
                "slides": [
                    {
                        "title": "¡Bienvenidos a Ciencias Naturales Ciclo III!",
                        "sub": "Básica Secundaria Nocturna",
                        "content": "Escribe en tu cuaderno: <b>'Diagnóstico Inicial: La Célula y las Propiedades de la Materia'</b>.<br><br>Descubriremos los bloques invisibles que construyen la vida y cómo interactúa la materia a nuestro alrededor.",
                        "icon": "ph-atom",
                        "customHtml": "",
                        "timer": 120
                    },
                    {
                        "title": "La Célula: Unidad de la Vida",
                        "sub": "El ladrillo de todos los organismos",
                        "content": "Todo organismo vivo está compuesto por células. Sus 3 partes fundamentales son:<br><br>1. <b>Membrana Celular:</b> Protege y controla lo que entra y sale.<br>2. <b>Citoplasma:</b> Medio líquido donde están los organelos.<br>3. <b>Núcleo:</b> Guarda el material genético (ADN).",
                        "icon": "ph-circle",
                        "customHtml": "",
                        "timer": 200
                    },
                    {
                        "title": "Mezclas Homogéneas vs Heterogéneas",
                        "sub": "La química en la cocina",
                        "content": "☕ <b>Homogéneas:</b> No se distinguen sus componentes a simple vista (ej. café con azúcar disuelto, agua con sal).<br><br>🥗 <b>Heterogéneas:</b> Se pueden ver claramente las fases o partes separadas (ej. ensalada, agua con aceite, suelo con piedras).",
                        "icon": "ph-coffee",
                        "customHtml": "",
                        "timer": 180
                    },
                    {
                        "title": "Actividad de Cuaderno: Clasificar Mezclas",
                        "sub": "Misión práctica",
                        "content": "Copia esta lista y escribe al frente si es <b>Homogénea</b> o <b>Heterogénea</b>:<br><br>1. Jugo de maracuyá colado con azúcar.<br>2. Sancocho con plátano, yuca y carne.<br>3. Alcohol desinfectante al 70%.<br>4. Arena de río mezclada con hojas secas.",
                        "icon": "ph-pencil-simple-line",
                        "customHtml": "",
                        "timer": 240
                    },
                    {
                        "title": "Energía en Acción",
                        "sub": "La energía no se crea ni se destruye",
                        "content": "La energía se transforma: la energía química de los alimentos nos permite movernos; la energía eléctrica de un enchufe se convierte en luz y calor en un bombillo.<br><br><b>Reflexión:</b> ¿Qué fuentes de energía renovable tenemos en Colombia?",
                        "icon": "ph-lightning",
                        "customHtml": "",
                        "timer": 180
                    }
                ]
            }
        }
    },

    "ciclo4": {
        "nombre": "Ciclo IV (8°, 9°)",
        "semanas": {
            "1": {
                "tema": "Diagnóstico Inicial: Genética, Reacciones Químicas y Territorio Cafetero",
                "slides": [
                    {
                        "title": "¡Bienvenidos a Ciencias Naturales Ciclo IV!",
                        "sub": "Consolidación de Básica Secundaria",
                        "content": "Escribe en tu cuaderno: <b>'Diagnóstico Inicial: Herencia Biológica, Cambios Químicos y Ecología'</b>.<br><br>Comprenderemos las leyes que rigen la herencia y las transformaciones profundas de la materia.",
                        "icon": "ph-dna",
                        "customHtml": "",
                        "timer": 120
                    },
                    {
                        "title": "El ADN y la Herencia",
                        "sub": "El manual de instrucciones de la vida",
                        "content": "El ADN contiene los genes que transmiten características de padres a hijos (color de ojos, tipo de sangre, forma de hojas en cultivos).<br><br>Gracias a la genética, podemos entender la biodiversidad y el mejoramiento de semillas tradicionales.",
                        "icon": "ph-dna",
                        "customHtml": "",
                        "timer": 200
                    },
                    {
                        "title": "Cambios Físicos vs Reacciones Químicas",
                        "sub": "¿Cuándo cambia la sustancia?",
                        "content": "✂️ <b>Cambio Físico:</b> La materia cambia de forma o estado pero sigue siendo la misma sustancia (ej. cortar papel, derretir cera).<br><br>🔥 <b>Reacción Química:</b> Se rompen y crean nuevos enlaces formando sustancias distintas (ej. quemar leña, la oxidación de un clavo, la fermentación del café).",
                        "icon": "ph-flame",
                        "customHtml": "",
                        "timer": 200
                    },
                    {
                        "title": "Desafío de Cuaderno: Caso Quindiano",
                        "sub": "Fotosíntesis y Sombrío Cafetero",
                        "content": "<b>Escribe en tu cuaderno:</b><br>¿Por qué sembrar árboles como el guamo y el nogal cafetero dentro del cafetal ayuda tanto a la fotosíntesis del café como a la captura de carbono y retención de humedad en el suelo?",
                        "icon": "ph-tree-evergreen",
                        "customHtml": "",
                        "timer": 240
                    },
                    {
                        "title": "Pregunta de Diagnóstico",
                        "sub": "Pensamiento Crítico",
                        "content": "<b>Pregunta:</b> Durante la fermentación del grano de café en el beneficio húmedo, las bacterias y levaduras transforman los azúcares del mucílago. Este proceso es un ejemplo de:<br><br>A. Una evaporación física.<br>B. Una transformación bioquímica.<br>C. Una congelación mineral.<br><br><b>Registra tu opción y susténtala brevemente.</b>",
                        "icon": "ph-question",
                        "customHtml": "",
                        "timer": 180
                    }
                ]
            }
        }
    },

    "ciclo5": {
        "nombre": "Ciclo V (10°)",
        "semanas": {
            "1": {
                "tema": "Diagnóstico Inicial: Estructura de la Materia, Ácidos-Bases y Mecánica",
                "slides": [
                    {
                        "title": "¡Bienvenidos a Ciencias Naturales Ciclo V (10°)!",
                        "sub": "Educación Media Vocacional",
                        "content": "Escribe en tu cuaderno: <b>'Diagnóstico Inicial: Química General y Principios Físicos Aplicados'</b>.<br><br>Afianzaremos las bases moleculares, fórmulas químicas cotidianas y las leyes de fuerza y movimiento.",
                        "icon": "ph-flask",
                        "customHtml": "",
                        "timer": 120
                    },
                    {
                        "title": "Átomos, Elementos y Compuestos",
                        "sub": "La arquitectura del universo",
                        "content": "⚛️ <b>Átomo:</b> Unidad fundamental (protones, neutrones, electrones).<br>🧪 <b>Elementos clave de la vida (CHONPS):</b> Carbono, Hidrógeno, Oxígeno, Nitrógeno, Fósforo, Azufre.<br>💧 <b>Compuestos:</b> Combinaciones químicas con proporciones fijas como el agua ($H_2O$) o el dióxido de carbono ($CO_2$).",
                        "icon": "ph-atom",
                        "customHtml": "",
                        "timer": 200
                    },
                    {
                        "title": "Ácidos, Bases y la Escala de pH",
                        "sub": "Seguridad y química doméstica",
                        "content": "🍋 <b>Ácidos (pH < 7):</b> Vinagre, limón, ácido de baterías (sabor agrio, reactivos con metales).<br>🧼 <b>Bases (pH > 7):</b> Jabón, bicarbonato, cal viva, amoníaco (sensación resbalosa, neutralizan ácidos).<br>💧 <b>Neutro (pH = 7):</b> Agua pura.",
                        "icon": "ph-test-tube",
                        "customHtml": "",
                        "timer": 200
                    },
                    {
                        "title": "Mecánica Básica y Máquinas Simples",
                        "sub": "El trabajo en la vida real",
                        "content": "El uso de planos inclinados, poleas y palancas no disminuye el trabajo total requerido, pero <b>reduce la fuerza que los músculos deben aplicar</b>, facilitando el transporte y levantamiento de cargas en obras y fincas.",
                        "icon": "ph-wrench",
                        "customHtml": "",
                        "timer": 180
                    },
                    {
                        "title": "Reto de Cuaderno: Seguridad Química",
                        "sub": "Prevención en el hogar y taller",
                        "content": "<b>Instrucción en tu cuaderno:</b><br>Explica en un párrafo por qué nunca se debe mezclar hipoclorito de sodio (límpido) con ácidos (ácido muriático o vinagre). Señala qué gas se produce y cómo afecta la salud respiratoria.",
                        "icon": "ph-warning-octagon",
                        "customHtml": "",
                        "timer": 240
                    }
                ]
            }
        }
    },

    "ciclo6": {
        "nombre": "Ciclo VI (11°)",
        "semanas": {
            "1": {
                "tema": "Diagnóstico Inicial: Sostenibilidad, Transición Energética y Método Científico",
                "slides": [
                    {
                        "title": "¡Bienvenidos a Ciencias Naturales Ciclo VI (11°)!",
                        "sub": "Rumbo al Grado de Bachiller",
                        "content": "Escribe en tu cuaderno: <b>'Diagnóstico Inicial: Transición Ecológica, Pensamiento Científico y Sociedad'</b>.<br><br>Articularemos el análisis crítico para resolver problemas reales del entorno regional y global.",
                        "icon": "ph-graduation-cap",
                        "customHtml": "",
                        "timer": 120
                    },
                    {
                        "title": "Cambio Climático y Efecto Invernadero",
                        "sub": "Comprendiendo la crisis global",
                        "content": "El efecto invernadero natural permite la vida en la Tierra. Sin embargo, el exceso de emisiones de $CO_2$ y metano ($CH_4$) por quema de combustibles fósiles y deforestación atrapa más calor, alterando regímenes de lluvias y cosechas.",
                        "icon": "ph-globe-hemisphere-west",
                        "customHtml": "",
                        "timer": 200
                    },
                    {
                        "title": "Transición hacia Energías Limpias",
                        "sub": "El futuro de Colombia",
                        "content": "☀️ <b>Solar:</b> Aprovecha la radiación solar abundante en el trópico.<br>💨 <b>Eólica:</b> Aprovecha corrientes de viento (ej. La Guajira).<br>💧 <b>Hidroeléctrica:</b> Fuente principal de Colombia (requiere protección de cuencas).<br>🌱 <b>Biomasa:</b> Aprovechamiento de residuos agrícolas (ej. cascarilla de café).",
                        "icon": "ph-sun",
                        "customHtml": "",
                        "timer": 200
                    },
                    {
                        "title": "El Método Científico en la Vida Diaria",
                        "sub": "Toma de decisiones fundamentadas",
                        "content": "Pasos esenciales:<br>1. <b>Observación</b> del problema real.<br>2. <b>Pregunta / Hipótesis</b> fundamentada.<br>3. <b>Experimentación controlada</b> con grupo testigo.<br>4. <b>Análisis de datos</b> sin sesgos.<br>5. <b>Conclusiones</b> aplicables a la comunidad.",
                        "icon": "ph-magnifying-glass",
                        "customHtml": "",
                        "timer": 200
                    },
                    {
                        "title": "Pregunta Saber 11 / Diagnóstico",
                        "sub": "Indagación y Evidencia",
                        "content": "<b>Caso:</b> Para evaluar el impacto de un biofertilizante en un lote de plátano, se aplican 3 dosis distintas en 3 parcelas idénticas y se deja una 4ta parcela sin fertilizante (control).<br><br><b>Pregunta:</b> ¿Por qué es indispensable incluir la parcela sin fertilizante?<br>A. Para ahorrar fertilizante.<br>B. Para comparar el crecimiento natural frente al efecto real del producto.<br>C. Para evitar que las plagas se dispersen.<br><br><b>Copia la justificación en tu cuaderno.</b>",
                        "icon": "ph-check-square-offset",
                        "customHtml": "",
                        "timer": 240
                    }
                ]
            }
        }
    }
}

# Añadir a data['clases']
for cid, cval in ciclos_info.items():
    if cid not in data['clases']:
        data['clases'][cid] = {}
    
    for sem_num, sem_obj in cval['semanas'].items():
        data['clases'][cid][sem_num] = [sem_obj['slides']]

with open('proyectorData.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=4)

print("¡Ciclos 1 al 6 añadidos exitosamente a proyectorData.json!")
