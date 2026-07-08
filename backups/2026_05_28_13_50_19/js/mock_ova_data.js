const mockOvaData = {
    "pregunta_problematizadora": "¿Cómo se organizan las estructuras mínimas para dar lugar a la vida?",
    "objetivo_aprendizaje": "Identificar los componentes principales de una nave celular (célula) para reparar los sistemas vitales antes del impacto asteroidal.",
    "sopa_letras": ["CELULA", "NUCLEO", "MEMBRANA", "CITOPLASMA", "MITOCONDRIA", "RIBOSOMA", "VACUOLA", "LISOSOMA", "CLOROPLASTO", "PROCARIOTA"],
    "saberes_previos": [
        {
            "pregunta": "¿Has visto alguna vez un motor tan pequeño que no se ve a simple vista?",
            "opciones": {"A": "Sí, en bacterias", "B": "No, es imposible", "C": "Tal vez en nanotecnología", "D": "No estoy seguro"}
        },
        {
            "pregunta": "¿Qué hace que una planta respire sin tener pulmones?",
            "opciones": {"A": "Las raíces", "B": "Los estomas y células", "C": "Magia vegetal", "D": "No respiran"}
        },
        {
            "pregunta": "¿De qué están hechos tus músculos?",
            "opciones": {"A": "Agua solamente", "B": "Hueso molido", "C": "Fibras celulares", "D": "Plástico biológico"}
        }
    ],
    "texto_inductivo": "<p>Saludos, Ingeniero. Nos encontramos a bordo de la monumental estación orbital Alfa-Bio, una gigantesca estructura que orbita al borde de un agujero negro supermasivo. Los sistemas principales de la estación han sufrido una falla catastrófica tras el impacto de una tormenta de micrometeoritos oscuros, dejando los sectores primarios sin energía y aislando a las tripulaciones de mantenimiento en las cubiertas inferiores. Nuestra única esperanza radica en tu pericia técnica para restaurar la operatividad de los sistemas antes de que el soporte vital colapse por completo.</p><p>Para restaurar el soporte vital de nuestra estructura colosal, debemos reactivar primero los generadores de energía cuántica, a los que llamamos mitocondrias. Estas estructuras son los motores primarios de nuestra base; sin su capacidad para procesar el combustible y convertirlo en energía utilizable (nuestro ATP espacial), el resto de los módulos no tiene ninguna posibilidad de funcionar. Además, es imperativo reiniciar el inmenso centro de control central (el núcleo). Este búnker hiperprotegido almacena todas las directrices, los planos de ingeniería y el código de emergencia (ADN) de la estación. Si el núcleo permanece apagado, los robots ensambladores no sabrán cómo reparar los daños externos.</p><p>Tú, como ingeniero en jefe, debes conectar los cables visuales en el panel holográfico. Observa detenidamente las gráficas de rendimiento que parpadean en rojo: la membrana protectora de la estación, nuestro escudo plasmático que decide qué materiales peligrosos entran o salen, está perdiendo integridad a un ritmo alarmante. Si esta membrana cede, el vacío del espacio inundará los pasillos. Debemos actuar rápido y ensamblar las piezas de esta gigantesca nave celular. Las lecturas indican que si restauramos la síntesis de proteínas estructurales en los talleres automatizados (ribosomas), las brechas en el casco se sellarán automáticamente. Prepárate para sumergirte en el microcosmos biológico disfrazado de la mayor crisis de ingeniería espacial del siglo.</p>",
    "actividades_cuaderno_1": [
        "1. Dibuja el panel de control de la nave celular (núcleo) y señala sus botones principales.",
        "2. Anota tres diferencias entre los generadores de la estación (mitocondrias) y una batería común."
    ],
    "drag_drop_letras": [
        { "palabra": "CÉLULA", "letras": ["L", "U", "E", "C", "L", "A"] },
        { "palabra": "NÚCLEO", "letras": ["O", "L", "C", "N", "E", "Ú"] }
    ],
    "drag_drop_frases": [
        { "frase": "LA MITOCONDRIA DA ENERGÍA", "palabras": ["ENERGÍA", "MITOCONDRIA", "DA", "LA"] },
        { "frase": "EL NÚCLEO TIENE EL ADN", "palabras": ["ADN", "TIENE", "EL", "EL", "NÚCLEO"] }
    ],
    "texto_deductivo": "<p>Excelente trabajo, Ingeniero. Has devuelto la vida a los pasillos oscuros de la estación Alfa-Bio y los escudos deflectores vuelven a brillar con un intenso tono azul. Los sistemas han vuelto a la normalidad operativa. Gracias a tus cálculos precisos y a la reactivación oportuna del núcleo y las mitocondrias, el desastre ha sido evitado. La tripulación está a salvo y la síntesis de nuevos materiales en los ribosomas ha comenzado a parchear los sectores destruidos de manera autónoma.</p><p>Hemos aprendido, mediante esta crisis simulada, que al igual que nuestra enorme estación espacial requiere de un centro de comando incuestionable, de poderosos generadores de energía y de un casco protector sumamente selectivo, los seres vivos terrestres están compuestos por unidades mínimas llamadas células, las cuales funcionan como máquinas microscópicas perfectas. La analogía es asombrosamente precisa: el núcleo de la célula dirige absolutamente todas las operaciones celulares albergando el código genético (ADN); las mitocondrias son auténticas centrales eléctricas que generan la energía bioquímica (ATP) necesaria para sobrevivir; y la membrana plasmática actúa como la esclusa de aire inteligente, controlando el tráfico molecular.</p><p>Al completar esta misión crítica, no solo has salvado la estación, sino que has demostrado que comprendes que la vida, incluso desde su nivel más microscópico e invisible a nuestros ojos, es un verdadero prodigio de la ingeniería biológica. El microcosmos funciona con las mismas reglas de eficiencia, organización y defensa que aplicamos en la exploración del cosmos exterior. Tu informe de misión pasará a los anales de la academia galáctica. Prepárate para tu próxima asignación, porque el universo está lleno de misterios microscópicos por descubrir.</p>",
    "actividades_cuaderno_2": [
        "1. Compara en un cuadro la función de la mitocondria con el motor de una nave espacial.",
        "2. Dibuja la estructura de la membrana celular simulando una esclusa de seguridad."
    ],
    "preguntas_icfes": [
        {
            "competencia": "Uso Comprensivo del Conocimiento Científico",
            "contexto": "Durante una expedición antártica, un biólogo extrae muestras de tejido de un organismo congelado desconocido. Al observarlo bajo un microscopio electrónico de barrido, identifica estructuras delimitadas por membranas internas, destacando un compartimento denso central y numerosos orgánulos en forma de bastón encargados de producir ATP.",
            "enunciado": "Considerando las estructuras descritas, el organismo descubierto está formado por células:",
            "opciones": {
                "A": "Procariotas, porque carecen de envoltura nuclear.",
                "B": "Eucariotas, porque poseen núcleo y mitocondrias.",
                "C": "Virales, porque necesitan de otro organismo para producir ATP.",
                "D": "Inorgánicas, debido a las bajas temperaturas de su entorno."
            },
            "clave": "B",
            "justificacion": "Las células eucariotas se caracterizan por poseer organelos membranosos complejos, como el núcleo (compartimento denso central) y las mitocondrias (orgánulos que producen energía en forma de ATP)."
        },
        {
            "competencia": "Explicación de Fenómenos",
            "contexto": "En un laboratorio de fisiología vegetal, un grupo de científicos somete una planta a un entorno sellado sin luz durante quince días, manteniéndola solo con agua. Se observa que la planta detiene su crecimiento abruptamente y sus hojas pierden progresivamente su característico color verde brillante.",
            "enunciado": "El fenómeno observado se explica directamente por la incapacidad de la planta para realizar reacciones metabólicas en:",
            "opciones": {
                "A": "Los ribosomas, que dejan de sintetizar las proteínas de soporte estructural de la pared celular.",
                "B": "Las vacuolas, que pierden toda su reserva de agua ante la ausencia de fotones.",
                "C": "Los cloroplastos, que no pueden transformar la energía lumínica en energía química mediante fotosíntesis.",
                "D": "Las mitocondrias, que no reciben luz directa para procesar los carbohidratos simples."
            },
            "clave": "C",
            "justificacion": "Los cloroplastos albergan la clorofila (que da el color verde) y son los organelos responsables de llevar a cabo la fotosíntesis, un proceso que requiere luz obligatoriamente."
        },
        {
            "competencia": "Indagación",
            "contexto": "Un equipo de medicina deportiva analiza biopsias musculares de dos grupos de sujetos: el Grupo A, conformado por maratonistas de élite, y el Grupo B, conformado por oficinistas sedentarios. El análisis morfométrico celular revela que las células del Grupo A poseen un 45% más de mitocondrias por micrómetro cuadrado que las del Grupo B.",
            "enunciado": "¿Cuál de las siguientes hipótesis es más coherente con los resultados obtenidos en el experimento?",
            "opciones": {
                "A": "Las personas sedentarias tienen células procariotas en sus músculos, las cuales carecen de mitocondrias funcionales.",
                "B": "El alto requerimiento y estrés energético del deporte constante induce una proliferación adaptativa de mitocondrias.",
                "C": "Las proteínas consumidas por los atletas de élite se cristalizan y se transforman espontáneamente en mitocondrias adicionales.",
                "D": "El músculo del atleta requiere mayor capacidad celular para almacenar grasas saturadas a largo plazo."
            },
            "clave": "B",
            "justificacion": "Las mitocondrias son las centrales energéticas celulares. Ante una demanda prolongada de energía (ATP) debido al ejercicio intenso, la célula se adapta incrementando el número de mitocondrias (biogénesis mitocondrial)."
        }
    ],
    "seleccion_multiple_basica": [
        {"pregunta": "¿Cuál es la función principal del núcleo celular?", "opciones": {"A":"Generar energía", "B":"Almacenar ADN", "C":"Sintetizar proteínas", "D":"Digerir desechos"}, "clave": "B"},
        {"pregunta": "¿Qué orgánulo es exclusivo de la célula vegetal?", "opciones": {"A":"Mitocondria", "B":"Membrana plasmática", "C":"Cloroplasto", "D":"Ribosoma"}, "clave": "C"},
        {"pregunta": "La célula procariota se diferencia de la eucariota en que:", "opciones": {"A":"No tiene ADN", "B":"No tiene núcleo definido", "C":"Es más grande", "D":"No tiene ribosomas"}, "clave": "B"},
        {"pregunta": "¿Qué estructura regula el paso de sustancias hacia el interior y exterior de la célula?", "opciones": {"A":"Pared celular", "B":"Núcleo", "C":"Membrana plasmática", "D":"Citoplasma"}, "clave": "C"},
        {"pregunta": "Las 'fábricas' de proteínas en la célula se llaman:", "opciones": {"A":"Ribosomas", "B":"Lisosomas", "C":"Aparato de Golgi", "D":"Vacuolas"}, "clave": "A"}
    ],
    "preguntas_abiertas_ova": [
        "Sintetiza la función de la mitocondria relacionándola con la respiración celular.",
        "Argumenta la importancia de la membrana celular en el intercambio de nutrientes.",
        "Compara brevemente la célula procariota con la eucariota.",
        "Explica por qué los ribosomas son esenciales para la vida.",
        "Justifica la presencia de cloroplastos únicamente en organismos autótrofos."
    ],
    "crucigrama": [
        {"pista": "Centro de control celular", "respuesta": "NUCLEO", "x": 1, "y": 2, "orientacion": "H"},
        {"pista": "Organelo energético", "respuesta": "MITOCONDRIA", "x": 6, "y": 1, "orientacion": "V"}
    ]
};
window.mockOvaData = mockOvaData;
