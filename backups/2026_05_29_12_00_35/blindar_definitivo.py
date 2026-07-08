import re

with open('iniciar_clase.py', 'r', encoding='utf-8') as f:
    pycode = f.read()

# 1. Update /api/registro-estudiante block in do_POST
new_registro_block = '''        if parsed_path.path == '/api/registro-estudiante':
            try:
                import json, os
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                datos = json.loads(post_data.decode('utf-8'))
                print(f"[*] Datos recibidos en Backend: {datos}")

                archivo_db = 'usuarios.json'
                usuarios = []
                if os.path.exists(archivo_db):
                    with open(archivo_db, 'r', encoding='utf-8') as f:
                        try: usuarios = json.load(f)
                        except json.JSONDecodeError: pass
                
                usuarios.append(datos)
                with open(archivo_db, 'w', encoding='utf-8') as f:
                    json.dump(usuarios, f, indent=4, ensure_ascii=False)

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "success"}).encode('utf-8'))
                return
            except Exception as e:
                print(f"[ERROR CRÍTICO EN PYTHON]: {e}")
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
                return
'''

pattern_post = re.compile(r'if parsed_path\.path == \'/api/registro-estudiante\':.*?return\s+', re.DOTALL)
pycode = pattern_post.sub(new_registro_block + '\n        ', pycode)

# 2. Update do_OPTIONS
new_options_block = '''    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()'''

pattern_options = re.compile(r'    def do_OPTIONS\(self\):.*?self\.end_headers\(\)\s+', re.DOTALL)
pycode = pattern_options.sub(new_options_block + '\n\n', pycode)

with open('iniciar_clase.py', 'w', encoding='utf-8') as f:
    f.write(pycode)
