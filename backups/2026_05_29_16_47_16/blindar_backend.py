import re

with open('iniciar_clase.py', 'r', encoding='utf-8') as f:
    pycode = f.read()

# I will find the block that starts with if parsed_path.path == '/api/registro-estudiante':
# and replace it up to if parsed_path.path == '/api/puntos': (which is the next condition).

new_block = '''        if parsed_path.path == '/api/registro-estudiante':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                
                import json, os
                data = json.loads(post_data.decode('utf-8'))
                print(f"[*] NUEVO ESTUDIANTE RECIBIDO: {data.get('nombre', '')} {data.get('apellidos', '')} - Doc: {data.get('documento', '')}")
                
                usuarios_file = "usuarios.json"
                # Lectura segura
                usuarios = []
                if os.path.exists(usuarios_file):
                    try:
                        with open(usuarios_file, "r", encoding="utf-8") as f:
                            usuarios = json.load(f)
                    except json.JSONDecodeError:
                        usuarios = []
                
                nuevo_estudiante = {
                    "documento": data.get("documento", ""),
                    "apellidos": data.get("apellidos", ""),
                    "nombre": data.get("nombre", ""),
                    "edad": data.get("edad", ""),
                    "genero": data.get("genero", ""),
                    "grado": data.get("grado", ""),
                    "rol": "estudiante"
                }
                usuarios.append(nuevo_estudiante)
                
                with open(usuarios_file, "w", encoding="utf-8") as f:
                    json.dump(usuarios, f, indent=4, ensure_ascii=False)
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "success", "message": "Estudiante registrado"}).encode('utf-8'))
            except Exception as e:
                print(f"[!] Error crítico en /api/registro-estudiante: {e}")
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode('utf-8'))
            return

        parsed_path = urlparse(self.path)
        if parsed_path.path == '/api/puntos':'''

# Regex replacement
pattern = re.compile(r'if parsed_path\.path == \'/api/registro-estudiante\':.*?if parsed_path\.path == \'/api/puntos\':', re.DOTALL)

if pattern.search(pycode):
    pycode = pattern.sub(new_block, pycode)
    with open('iniciar_clase.py', 'w', encoding='utf-8') as f:
        f.write(pycode)
    print("Endpoint blindado exitosamente.")
else:
    print("No se encontró el bloque esperado.")

