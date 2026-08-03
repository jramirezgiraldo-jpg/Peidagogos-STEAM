import json

with open('proyectorData.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Asegurar semanas 2, 3 y 4 con contenido didáctico para los 6 ciclos
temas_extra = {
    "ciclo1": {
        "3": {
            "title": "La Naturaleza y las Plantas de Nuestra Región",
            "slides": [
                {"title": "Las Plantas y sus Partes", "sub": "Raíz, tallo, hojas, flores y frutos", "content": "Las plantas nos dan oxígeno, alimento y medicina. En tu cuaderno dibuja una planta de café o tomate y señala sus 5 partes.", "icon": "ph-plant", "timer": 180},
                {"title": "Cuidado del Medio Ambiente", "sub": "Separación de residuos en la vereda", "content": "Separa residuos orgánicos (cáscaras de plátano, café) para abono, y plásticos limpios para reciclaje.", "icon": "ph-recycle", "timer": 180}
            ]
        },
        "4": {
            "title": "Animales Domésticos y Silvestres",
            "slides": [
                {"title": "Animales de la Granja y de la Selva", "sub": "Hábitats y cuidados", "content": "Diferenciamos animales que conviven con nosotros (gallinas, perros) y animales protegidos del bosque (loros, ardillas).", "icon": "ph-bird", "timer": 180}
            ]
        }
    },
    "ciclo2": {
        "2": {
            "title": "Ecosistemas Colombianos y Biodiversidad",
            "slides": [
                {"title": "Flora y Fauna de la Región Andina", "sub": "Páramos, bosques de niebla y valles", "content": "Colombia es el país con más especies de aves del mundo. Nuestros frailejones en el páramo son fábricas naturales de agua pura.", "icon": "ph-tree", "timer": 180},
                {"title": "Actividad: Red Trófica Local", "sub": "Construye una cadena alimenticia", "content": "Escribe en tu cuaderno una cadena alimenticia con: Sol ➔ Pasto ➔ Vaca ➔ Ser Humano.", "icon": "ph-pencil-line", "timer": 200}
            ]
        },
        "3": {
            "title": "El Suelo y su Conservación",
            "slides": [
                {"title": "Capas del Suelo Fértil", "sub": "Materia orgánica y minerales", "content": "El suelo fértil tarda cientos de años en formarse. Evitar la quema de rastrojos mantiene vivos los microorganismos que nutren las cosechas.", "icon": "ph-globe-hemisphere-west", "timer": 180}
            ]
        },
        "4": {
            "title": "Sistemas del Cuerpo Humano",
            "slides": [
                {"title": "Sistema Digestivo y Respiratorio", "sub": "Transformando alimentos y aire en vida", "content": "Aprende cómo el estómago descompone los nutrientes y los pulmones oxigenan la sangre para darnos vigor.", "icon": "ph-heartbeat", "timer": 180}
            ]
        }
    },
    "ciclo3": {
        "2": {
            "title": "La Célula Animal vs Célula Vegetal",
            "slides": [
                {"title": "Estructuras y Diferencias Celulares", "sub": "Pared celular y cloroplastos", "content": "Las células vegetales poseen pared celular rígida y cloroplastos para fotosíntesis; las células animales tienen membrana flexible.", "icon": "ph-circle", "timer": 180},
                {"title": "Actividad en Cuaderno: Cuadro Comparativo", "sub": "Organizador gráfico", "content": "Dibuja un cuadro comparativo entre célula animal y vegetal con 3 diferencias clave.", "icon": "ph-pencil-simple-line", "timer": 240}
            ]
        },
        "3": {
            "title": "La Tabla Periódica Básica",
            "slides": [
                {"title": "Metales, No Metales y la Vida", "sub": "Elementos en nuestra cotidianidad", "content": "Hierro en la sangre (Fe), Calcio en los huesos (Ca), Oxígeno para respirar (O) y Carbono en los alimentos (C).", "icon": "ph-table", "timer": 180}
            ]
        },
        "4": {
            "title": "Fuerza, Trabajo y Máquinas Cotidianas",
            "slides": [
                {"title": "Tipos de Fuerzas en el Trabajo", "sub": "Fricción, gravedad y empuje", "content": "Analizaremos cómo la fricción frena un vehículo y cómo la gravedad actúa en la caída de las frutas.", "icon": "ph-wrench", "timer": 180}
            ]
        }
    },
    "ciclo4": {
        "2": {
            "title": "Leyes de Mendel y Cuadros de Punnett",
            "slides": [
                {"title": "Genotipo, Fenotipo y Herencia", "sub": "Alelos dominantes y recesivos", "content": "Aprenderemos a predecir la probabilidad de que una cría o planta herede rasgos específicos mediante el cuadro de Punnett.", "icon": "ph-dna", "timer": 200},
                {"title": "Ejercicio Práctico en Cuaderno", "sub": "Cruce genético simple", "content": "Cruza una planta de flor roja pura (AA) con una de flor blanca (aa) y halla el resultado fenotípico en la F1.", "icon": "ph-pencil-line", "timer": 240}
            ]
        },
        "3": {
            "title": "Enlaces Químicos: Iónicos y Covalentes",
            "slides": [
                {"title": "¿Cómo se unen los átomos?", "sub": "Electrones de valencia", "content": "Enlace Iónico (transferencia de electrones como en la sal NaCl) vs Enlace Covalente (compartición como en el agua H2O).", "icon": "ph-atom", "timer": 180}
            ]
        },
        "4": {
            "title": "Impacto Ambiental y Manejo de Cuencas",
            "slides": [
                {"title": "Protección de Ríos y Quebradas", "sub": "Normativa y buenas prácticas agrícolas", "content": "El tratamiento de aguas mieles del café y la reforestación de riberas evitan la contaminación del agua comunitaria.", "icon": "ph-drop", "timer": 180}
            ]
        }
    },
    "ciclo5": {
        "2": {
            "title": "Estequiometría y Balanceo de Ecuaciones",
            "slides": [
                {"title": "Ley de Conservación de la Masa", "sub": "Lavoisier: La materia no se crea ni se destruye", "content": "La masa de los reactivos debe ser exactamente igual a la masa de los productos. Métodos de balanceo por tanteo.", "icon": "ph-scales", "timer": 200},
                {"title": "Ejercicio de Balanceo en Cuaderno", "sub": "Práctica guiada", "content": "Balancea en tu cuaderno: $H_2 + O_2 \\rightarrow H_2O$ y $CH_4 + 2O_2 \\rightarrow CO_2 + 2H_2O$.", "icon": "ph-pencil-simple-line", "timer": 240}
            ]
        },
        "3": {
            "title": "Cinemática y Dinámica (Leyes de Newton)",
            "slides": [
                {"title": "1ª, 2ª y 3ª Ley de Newton", "sub": "Inercia, Fuerza ($F=m \\cdot a$) y Acción-Reacción", "content": "Explicación de por qué usamos cinturón de seguridad y cómo propulsa el despegue de un cohete o el retroceso de una herramienta.", "icon": "ph-car", "timer": 180}
            ]
        },
        "4": {
            "title": "Soluciones Químicas y Concentraciones",
            "slides": [
                {"title": "Porcentaje Masa/Volumen y Molaridad", "sub": "Cálculos en el campo y laboratorio", "content": "Preparación exacta de soluciones desinfectantes, abonos foliares y dosificación segura de agroinsumos.", "icon": "ph-flask", "timer": 180}
            ]
        }
    },
    "ciclo6": {
        "2": {
            "title": "Química Orgánica: Hidrocarburos y Grupos Funcionales",
            "slides": [
                {"title": "Alcanos, Alquenos, Alcoholes y Ácidos Carboxílicos", "sub": "La versatilidad del átomo de Carbono", "content": "Estudio del petróleo, plásticos biodegradables, etanol de caña y los ésteres responsables del aroma del café.", "icon": "ph-flask", "timer": 200},
                {"title": "Reto Saber 11 en Cuaderno", "sub": "Identificación de grupos funcionales", "content": "Identifica los grupos funcionales presentes en la molécula de ácido acetilsalicílico (aspirina).", "icon": "ph-pencil-line", "timer": 240}
            ]
        },
        "3": {
            "title": "Termodinámica y Máquinas Térmicas",
            "slides": [
                {"title": "Calor, Temperatura y Entropía", "sub": "Eficiencia energética en la industria", "content": "Diferencia entre calor (energía en tránsito) y temperatura (medida de agitación molecular). Motores de combustión vs motores eléctricos.", "icon": "ph-thermometer", "timer": 180}
            ]
        },
        "4": {
            "title": "Biotecnología y Bioética",
            "slides": [
                {"title": "Organismos Modificados Genéticamente y Medicina", "sub": "Debate contemporáneo", "content": "Aplicaciones de la biotecnología en vacunas, biorremediación de suelos y producción sostenible de alimentos.", "icon": "ph-dna", "timer": 200}
            ]
        }
    }
}

for c_key, weeks in temas_extra.items():
    if c_key not in data['clases']:
        data['clases'][c_key] = {}
    for sem_k, sem_val in weeks.items():
        data['clases'][c_key][sem_k] = [sem_val['slides']]

with open('proyectorData.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=4)

print("¡Semanas 2, 3 y 4 pobladas con éxito en proyectorData.json!")
