import re

with open('iniciar_clase.py', 'r', encoding='utf-8') as f:
    pycode = f.read()

# We want to replace the if parsed_path.path == '/api/registro-estudiante': block completely
# up to         parsed_path = urlparse(self.path) which introduces /api/puntos

new_block = '''        if parsed_path.path == '/api/registro-estudiante':
            try:
                import json, os
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                datos = json.loads(post_data.decode('utf-8'))

                archivo_db = 'usuarios.json'
                usuarios = []
                if os.path.exists(archivo_db):
                    with open(archivo_db, 'r', encoding='utf-8') as f:
                        try:
                            usuarios = json.load(f)
                        except json.JSONDecodeError:
                            usuarios = []
                
                usuarios.append(datos)

                with open(archivo_db, 'w', encoding='utf-8') as f:
                    json.dump(usuarios, f, indent=4, ensure_ascii=False)

                # ESTO EVITA EL ERR_EMPTY_RESPONSE (Cabeceras obligatorias)
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "success", "message": "Guardado"}).encode('utf-8'))
            
            except Exception as e:
                print(f"[!] Error crítico en POST: {e}")
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
            return
'''

pattern = re.compile(r'if parsed_path\.path == \'/api/registro-estudiante\':.*?return\s+', re.DOTALL)
pycode = pattern.sub(new_block + '\n        ', pycode)

with open('iniciar_clase.py', 'w', encoding='utf-8') as f:
    f.write(pycode)

