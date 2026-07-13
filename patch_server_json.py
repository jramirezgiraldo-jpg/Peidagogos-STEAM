import io

with io.open('server.js', 'r', encoding='utf-8') as f:
    js = f.read()

old_prompt_block = '''        // Construir el Prompt Maestro
        const prompt = `Actúa como un ${rol}. Tu objetivo es enseñar ${asignatura} a estudiantes de educación media en el contexto narrativo de ${ambiente}.
Debes estructurar la guía de estudio siguiendo el nivel evolutivo de ${nivel} (usando esa jerarquía o nivel de complejidad como hilo conductor de la explicación).
La guía debe evaluar la competencia de ${enfoque} (Enfoque ICFES), asegurando que el estudiante desarrolle pensamiento crítico y autónomo y no solo memoria.

Contexto Curricular:
- Periodo: ${periodo}
- Semana: ${semana}
- Meta de Comprensión Anual: ${meta}
- Tópico Generativo de la Semana: ${topico}

Instrucciones de formato:
- Sé inmersivo con el ambiente y tu rol desde el primer párrafo.
- Usa formato Markdown (títulos, negritas, viñetas) para hacer la lectura agradable.
- Incluye una explicación clara del tópico generativo conectándolo con la narrativa.
- Al final, incluye un pequeño "Reto" interactivo o problema lógico basado en el Enfoque ICFES seleccionado, para que el estudiante piense.
`;'''

new_prompt_block = '''        // Construir el Prompt Maestro
        const prompt = `Actúa como un ${rol}. Tu objetivo es enseñar ${asignatura} a estudiantes de educación media en el contexto narrativo de ${ambiente}.
Debes estructurar la guía de estudio siguiendo el nivel evolutivo de ${nivel}.
La guía debe evaluar la competencia de ${enfoque}.

Contexto Curricular:
- Periodo: ${periodo}
- Semana: ${semana}
- Meta de Comprensión Anual: ${meta}
- Tópico Generativo de la Semana: ${topico}

DEBES DEVOLVER EXCLUSIVAMENTE UN OBJETO JSON VÁLIDO (sin bloques de código markdown como \`\`\`json) CON LA SIGUIENTE ESTRUCTURA EXACTA:
{
  "saberes_previos": [
    { "pregunta": "¿...?", "opciones": ["A", "B", "C", "D"], "correcta": 0 }
  ],
  "texto_inductivo": "Texto de al menos 500 palabras, formato markdown o HTML simple permitido para negritas...",
  "preguntas_inductivas_pagina": [ "¿P1?", "¿P2?", "¿P3?", "¿P4?", "¿P5?" ],
  "preguntas_inductivas_cuaderno": [ "¿P1?", "¿P2?", "¿P3?", "¿P4?", "¿P5?" ],
  "juegos_ordenar_letras_1": ["PALABRA1", "PALABRA2", "PALABRA3"],
  "juego_ordenar_frase_1": "FRASE LARGA CON SENTIDO",
  "texto_deductivo": "Texto deductivo de al menos 500 palabras...",
  "preguntas_deductivas_pagina": [ "¿P1?", "¿P2?", "¿P3?", "¿P4?", "¿P5?" ],
  "preguntas_deductivas_cuaderno": [ "¿P1?", "¿P2?", "¿P3?", "¿P4?", "¿P5?" ],
  "juegos_ordenar_letras_2": ["TERMINO1", "TERMINO2", "TERMINO3"],
  "juego_ordenar_frase_2": "OTRA FRASE A ORDENAR",
  "sopa_letras": ["PALABRA1", "PALABRA2", "PALABRA3", "PALABRA4", "PALABRA5", "PALABRA6", "PALABRA7", "PALABRA8", "PALABRA9", "PALABRA10"],
  "crucigrama": [
    { "palabra": "RESPUESTA1", "pista": "Definición o pista 1" }, // hasta 10 palabras
    { "palabra": "RESPUESTA2", "pista": "Definición o pista 2" }
  ],
  "icfes": [
    {
      "competencia": "Explicación de Fenómenos",
      "texto_introductorio": "Contexto de la pregunta...",
      "tabla_o_grafica_markdown": "| Dato | Valor |\\n|---|---|",
      "pregunta": "¿Qué ocurre si...?",
      "opciones": ["Opcion 1", "Opcion 2", "Opcion 3", "Opcion 4"],
      "correcta": 0,
      "retroalimentacion": {
        "0": "Correcto porque...",
        "1": "Incorrecto porque...",
        "2": "Incorrecto porque...",
        "3": "Incorrecto porque..."
      }
    } // Añade 2 preguntas más para las otras 2 competencias (uso comprensivo, indagación)
  ]
}`;'''

if old_prompt_block in js:
    js = js.replace(old_prompt_block, new_prompt_block)

with io.open('server.js', 'w', encoding='utf-8') as f:
    f.write(js)
