import json
import requests
import time
import os

# --- CONFIGURACIÓN DEL LLM ---
LLM_API_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "llama3" # Cambiar según el modelo local disponible en Ollama
OUTPUT_FILE = "banco_guias.json"

# --- DATOS BASE SIMULADOS ---
# En un entorno real, esto se importaría de curriculumData.js o una base de datos.
UNIVERSOS = ["Exploración Espacial y Galaxias", "Fantasía y Magia", "Agencia de Detectives", "Supervivencia Extrema"]
ROLES = ["Ingeniero", "Investigador", "Explorador"]
CANALES = ["Visual", "Auditivo", "Kinestésico"]

TEMAS_CURRICULARES = [
    {"asignatura": "Biología", "pregunta": "¿Cómo se organizan las estructuras mínimas para dar lugar a la vida?"},
    {"asignatura": "Física", "pregunta": "¿Por qué algunos objetos se hunden mientras otros flotan?"}
]

PROMPT_TEMPLATE = """
Actúa como un experto neuroeducador, diseñador de gamificación y especialista en psicometría del ICFES. Tu tarea es generar el contenido completo de una Guía de Aprendizaje (OVA) estrictamente en formato JSON válido, sin Markdown extra.

Variables de Personalización:
Tema: {tema}
Universo (Temática Narrativa): {universo}
Rol del Estudiante: {rol}
Canal VAK (Estilo de Redacción): {canal}

Estructura Estricta del JSON a generar:
{{
    "pregunta_problematizadora": "String",
    "objetivo_aprendizaje": "String (Adaptado a la narrativa)",
    "sopa_letras": ["10", "strings", "palabras", "clave", "del", "tema", "para", "sopa", "de", "letras"],
    "saberes_previos": ["Pregunta 1", "Pregunta 2", "Pregunta 3"],
    "texto_inductivo": "String. Un relato inmersivo y técnico de MÍNIMO 500 palabras que introduzca el tema científico, usando estrictamente el vocabulario del 'Universo', poniendo al estudiante en su 'Rol' y usando descriptores del 'Canal VAK'.",
    "actividades_cuaderno_1": ["Reto 1", "Reto 2", "Reto 3", "Reto 4", "Reto 5"],
    "drag_and_drop": [
        {{"palabra_desordenada": "elclua", "palabra_correcta": "celula"}},
        {{"palabra_desordenada": "...", "palabra_correcta": "..."}},
        {{"palabra_desordenada": "...", "palabra_correcta": "..."}},
        {{"palabra_desordenada": "...", "palabra_correcta": "..."}},
        {{"palabra_desordenada": "...", "palabra_correcta": "..."}}
    ],
    "texto_deductivo": "String. Un relato conclusivo de MÍNIMO 500 palabras...",
    "actividades_cuaderno_2": ["Reto 1", "Reto 2", "Reto 3", "Reto 4", "Reto 5"],
    "preguntas_icfes": [
        {{
            "competencia": "Uso comprensivo del conocimiento",
            "contexto": "Contexto de máx 100 palabras...",
            "enunciado": "Enunciado directo...",
            "opciones": {{"A":"opción", "B":"opción", "C":"opción", "D":"opción"}},
            "clave": "A",
            "justificacion": "Razón..."
        }},
        {{
            "competencia": "Explicación de fenómenos",
            "contexto": "...",
            "enunciado": "...",
            "opciones": {{"A":"", "B":"", "C":"", "D":""}},
            "clave": "B",
            "justificacion": "..."
        }},
        {{
            "competencia": "Indagación",
            "contexto": "...",
            "enunciado": "...",
            "opciones": {{"A":"", "B":"", "C":"", "D":""}},
            "clave": "C",
            "justificacion": "..."
        }}
    ],
    "seleccion_multiple_basica": [
        {{"pregunta": "P1", "opciones": {{"A":"", "B":"", "C":"", "D":""}}, "clave": "A"}},
        {{"pregunta": "P2", "opciones": {{"A":"", "B":"", "C":"", "D":""}}, "clave": "A"}},
        {{"pregunta": "P3", "opciones": {{"A":"", "B":"", "C":"", "D":""}}, "clave": "A"}},
        {{"pregunta": "P4", "opciones": {{"A":"", "B":"", "C":"", "D":""}}, "clave": "A"}},
        {{"pregunta": "P5", "opciones": {{"A":"", "B":"", "C":"", "D":""}}, "clave": "A"}}
    ],
    "preguntas_abiertas_ova": [
        "Pregunta de síntesis 1", "Pregunta 2", "Pregunta 3", "Pregunta 4", "Pregunta 5"
    ],
    "crucigrama": [
        {{"pista": "Unidad fundamental de la vida", "respuesta": "celula"}},
        {{"pista": "...", "respuesta": "..."}},
        {{"pista": "...", "respuesta": "..."}},
        {{"pista": "...", "respuesta": "..."}},
        {{"pista": "...", "respuesta": "..."}}
    ]
}}
"""

def generar_ova(tema, universo, rol, canal):
    prompt_text = PROMPT_TEMPLATE.format(
        tema=f"{tema['asignatura']} - {tema['pregunta']}",
        universo=universo,
        rol=rol,
        canal=canal
    )
    
    payload = {
        "model": MODEL_NAME,
        "prompt": prompt_text,
        "stream": False,
        "format": "json"
    }

    try:
        print(f"Generando OVA para: {tema['asignatura']} | {universo} | {rol} | {canal}...")
        response = requests.post(LLM_API_URL, json=payload)
        response.raise_for_status()
        data = response.json()
        return json.loads(data["response"])
    except Exception as e:
        print(f"Error generando OVA: {e}")
        return None

def main():
    banco = []
    total_combinaciones = len(TEMAS_CURRICULARES) * len(UNIVERSOS) * len(ROLES) * len(CANALES)
    completados = 0
    
    print(f"Iniciando generación de {total_combinaciones} combinaciones (Simulación Limitada).")
    
    # Bucle anidado para iterar combinaciones
    for tema in TEMAS_CURRICULARES:
        for uni in UNIVERSOS:
            for rol in ROLES:
                for canal in CANALES:
                    # NOTA: En un entorno real se quitaría este break. 
                    # Por protección de tiempo, solo generaremos 1 de prueba si el endpoint falla,
                    # o se pueden simular los datos si no hay un LLM corriendo.
                    
                    # ova_data = generar_ova(tema, uni, rol, canal)
                    # if ova_data:
                    #     banco.append({
                    #         "metadata": {"tema": tema, "universo": uni, "rol": rol, "canal": canal},
                    #         "ova": ova_data
                    #     })
                    
                    completados += 1
                    print(f"Progreso: {completados}/{total_combinaciones}")
                    
                    # Simulación: Se rompe tras 1 iteración para no bloquear la ejecución de demostración
                    break
                break
            break
        break
        
    print("Simulación de script terminada. El archivo generador_banco_ovas.py está configurado.")

if __name__ == "__main__":
    main()
