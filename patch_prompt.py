with open(r'd:\Peidagogos_Oficial\server.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Find and replace the giant prompt with a shorter, focused one
old_prompt_start = "    const prompt = `Eres un diseñador instruccional experto. Genera contenido STEAM para una clase de ${materia},"
old_prompt_end = "Asegúrate de que las definiciones coincidan con las 'palabras', el Jeopardy tenga 25 preguntas, y que todo el contenido sea muy rico, exacto pedagógicamente y relacionado al tema ${tema}.`;"

# Find the full prompt block
start_idx = code.find(old_prompt_start)
end_idx = code.find(old_prompt_end, start_idx)

if start_idx >= 0 and end_idx >= 0:
    full_prompt_end = end_idx + len(old_prompt_end)
    new_prompt = """    const prompt = `Eres un experto pedagógico STEAM. Para una clase de ${materia}, grado ${grado}, tema "${tema}" (dificultad: ${dificultad || 'media'}), genera EXACTAMENTE este JSON válido (sin markdown, sin explicaciones extra):
{
  "palabras": ["P1","P2","P3","P4","P5","P6","P7","P8","P9","P10"],
  "definiciones": [{"palabra":"P1","pista":"Definición corta"},{"palabra":"P2","pista":"Definición corta"},{"palabra":"P3","pista":"Definición corta"},{"palabra":"P4","pista":"Definición corta"},{"palabra":"P5","pista":"Definición corta"},{"palabra":"P6","pista":"Definición corta"},{"palabra":"P7","pista":"Definición corta"},{"palabra":"P8","pista":"Definición corta"},{"palabra":"P9","pista":"Definición corta"},{"palabra":"P10","pista":"Definición corta"}],
  "categoriasJeopardy": ["Cat1","Cat2","Cat3","Cat4","Cat5"],
  "preguntasJeopardy": [{"cat":"Cat1","q":"Pregunta","pts":100},{"cat":"Cat1","q":"Pregunta","pts":200},{"cat":"Cat1","q":"Pregunta","pts":300},{"cat":"Cat1","q":"Pregunta","pts":400},{"cat":"Cat1","q":"Pregunta","pts":500},{"cat":"Cat2","q":"Pregunta","pts":100},{"cat":"Cat2","q":"Pregunta","pts":200},{"cat":"Cat2","q":"Pregunta","pts":300},{"cat":"Cat2","q":"Pregunta","pts":400},{"cat":"Cat2","q":"Pregunta","pts":500},{"cat":"Cat3","q":"Pregunta","pts":100},{"cat":"Cat3","q":"Pregunta","pts":200},{"cat":"Cat3","q":"Pregunta","pts":300},{"cat":"Cat3","q":"Pregunta","pts":400},{"cat":"Cat3","q":"Pregunta","pts":500},{"cat":"Cat4","q":"Pregunta","pts":100},{"cat":"Cat4","q":"Pregunta","pts":200},{"cat":"Cat4","q":"Pregunta","pts":300},{"cat":"Cat4","q":"Pregunta","pts":400},{"cat":"Cat4","q":"Pregunta","pts":500},{"cat":"Cat5","q":"Pregunta","pts":100},{"cat":"Cat5","q":"Pregunta","pts":200},{"cat":"Cat5","q":"Pregunta","pts":300},{"cat":"Cat5","q":"Pregunta","pts":400},{"cat":"Cat5","q":"Pregunta","pts":500}],
  "supraordinada": "Concepto mayor del tema",
  "isoordinadas": ["Característica 1","Característica 2","Característica 3"],
  "exclusiones": ["Lo que NO es 1","Lo que NO es 2"],
  "infraordinadas": ["Subtipo 1","Subtipo 2","Subtipo 3"],
  "proposicionesNovak": [{"nodo":"A","conector":"se relaciona con","desc":"B"},{"nodo":"C","conector":"produce","desc":"D"},{"nodo":"E","conector":"se divide en","desc":"F"}],
  "ramasBuzan": [{"titulo":"Rama 1","desc":"Detalle 1"},{"titulo":"Rama 2","desc":"Detalle 2"},{"titulo":"Rama 3","desc":"Detalle 3"},{"titulo":"Rama 4","desc":"Detalle 4"}],
  "experimentoLab": {"pregunta":"¿Cómo se puede demostrar...?","hipotesis":"Si hacemos X entonces Y","materiales":"Material A, B, C","pasos":["1. Paso","2. Paso","3. Paso"]},
  "textoCloze": "Texto con [ _________ ] para rellenar sobre el tema.",
  "bancoCloze": ["Palabra1","Palabra2","Palabra3"],
  "debateDetonante": "¿Pregunta socrática profunda sobre ${tema}?"
}
Remplaza TODOS los valores con contenido real y pedagógicamente correcto para el tema "${tema}" en ${materia} grado ${grado}. Las palabras deben ser términos clave del tema. Las definiciones deben coincidir con las palabras.`;"""
    
    code = code[:start_idx] + new_prompt + code[full_prompt_end:]
    with open(r'd:\Peidagogos_Oficial\server.js', 'w', encoding='utf-8') as f:
        f.write(code)
    print('OK: Prompt optimizado')
else:
    print('ERROR: Prompt no encontrado')
    print('start_idx:', start_idx)
    print('end_idx:', end_idx)
