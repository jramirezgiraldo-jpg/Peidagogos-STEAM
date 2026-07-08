import json
import requests
import time
import os

# --- CONFIGURACIÃ“N DEL LLM ---
LLM_API_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "llama3" # Cambiar segÃºn el modelo local disponible en Ollama
OUTPUT_FILE = "banco_guias.json"

# --- DATOS BASE SIMULADOS ---
# En un entorno real, esto se importarÃ­a de curriculumData.js o una base de datos.
UNIVERSOS = ["ExploraciÃ³n Espacial y Galaxias", "FantasÃ­a y Magia", "Agencia de Detectives", "Supervivencia Extrema"]
ROLES = ["Ingeniero", "Investigador", "Explorador"]
CANALES = ["Visual", "Auditivo", "KinestÃ©sico"]

TEMAS_CURRICULARES = [
    {"asignatura": "BiologÃ­a", "pregunta": "Â¿CÃ³mo se organizan las estructuras mÃ­nimas para dar lugar a la vida?"},
    {"asignatura": "FÃ­sica", "pregunta": "Â¿Por quÃ© algunos objetos se hunden mientras otros flotan?"}
]

PROMPT_TEMPLATE = """
ActÃºa como un experto neuroeducador, diseÃ±ador de gamificaciÃ³n y especialista en psicometrÃ­a del ICFES. Tu tarea es generar el contenido completo de una GuÃ­a de Aprendizaje (OVA) estrictamente en formato JSON vÃ¡lido, sin Markdown extra.

Variables de PersonalizaciÃ³n:
Tema: {tema}
Universo (TemÃ¡tica Narrativa): {universo}
Rol del Estudiante: {rol}
Canal VAK (Estilo de RedacciÃ³n): {canal}

Estructura Estricta del JSON a generar:
{{
    "pregunta_problematizadora": "String",
    "objetivo_aprendizaje": "String (Adaptado a la narrativa)",
    "sopa_letras": ["10", "strings", "palabras", "clave", "del", "tema", "para", "sopa", "de", "letras"],
    "saberes_previos": ["Pregunta 1", "Pregunta 2", "Pregunta 3"],
    "texto_inductivo": "String. Un relato inmersivo y tÃ©cnico de MÃNIMO 500 palabras que introduzca el tema cientÃ­fico, usando estrictamente el vocabulario del 'Universo', poniendo al estudiante en su 'Rol' y usando descriptores del 'Canal VAK'.",
    "actividades_cuaderno_1": ["Reto 1", "Reto 2", "Reto 3", "Reto 4", "Reto 5"],
    "drag_and_drop": [
        {{"palabra_desordenada": "elclua", "palabra_correcta": "celula"}},
        {{"palabra_desordenada": "...", "palabra_correcta": "..."}},
        {{"palabra_desordenada": "...", "palabra_correcta": "..."}},
        {{"palabra_desordenada": "...", "palabra_correcta": "..."}},
        {{"palabra_desordenada": "...", "palabra_correcta": "..."}}
    ],
    "texto_deductivo": "String. Un relato conclusivo de MÃNIMO 500 palabras...",
    "actividades_cuaderno_2": ["Reto 1", "Reto 2", "Reto 3", "Reto 4", "Reto 5"],
    "preguntas_icfes": [
        {{
            "competencia": "Uso comprensivo del conocimiento",
            "contexto": "Contexto de mÃ¡x 100 palabras...",
            "enunciado": "Enunciado directo...",
            "opciones": {{"A":"opciÃ³n", "B":"opciÃ³n", "C":"opciÃ³n", "D":"opciÃ³n"}},
            "clave": "A",
            "justificacion": "RazÃ³n..."
        }},
        {{
            "competencia": "ExplicaciÃ³n de fenÃ³menos",
            "contexto": "...",
            "enunciado": "...",
            "opciones": {{"A":"", "B":"", "C":"", "D":""}},
            "clave": "B",
            "justificacion": "..."
        }},
        {{
            "competencia": "IndagaciÃ³n",
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
        "Pregunta de sÃ­ntesis 1", "Pregunta 2", "Pregunta 3", "Pregunta 4", "Pregunta 5"
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
    
    print(f"Iniciando generaciÃ³n de {total_combinaciones} combinaciones (SimulaciÃ³n Limitada).")
    
    # Bucle anidado para iterar combinaciones
    for tema in TEMAS_CURRICULARES:
        for uni in UNIVERSOS:
            for rol in ROLES:
                for canal in CANALES:
                    # NOTA: En un entorno real se quitarÃ­a este break. 
                    # Por protecciÃ³n de tiempo, solo generaremos 1 de prueba si el endpoint falla,
                    # o se pueden simular los datos si no hay un LLM corriendo.
                    
                    # ova_data = generar_ova(tema, uni, rol, canal)
                    # if ova_data:
                    #     banco.append({
                    #         "metadata": {"tema": tema, "universo": uni, "rol": rol, "canal": canal},
                    #         "ova": ova_data
                    #     })
                    
                    completados += 1
                    print(f"Progreso: {completados}/{total_combinaciones}")
                    
                    # SimulaciÃ³n: Se rompe tras 1 iteraciÃ³n para no bloquear la ejecuciÃ³n de demostraciÃ³n
                    break
                break
            break
        break
        
    print("SimulaciÃ³n de script terminada. El archivo generador_banco_ovas.py estÃ¡ configurado.")

if __name__ == "__main__":
    main()

