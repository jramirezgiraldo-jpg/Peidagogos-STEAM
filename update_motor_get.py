with open('motor_seguro.py', 'r', encoding='utf-8') as f:
    code = f.read()

# Add do_GET logic
get_logic = '''
    def do_GET(self):
        if self.path == '/api/estudiantes':
            try:
                archivo_db = 'usuarios.json'
                usuarios = []
                import os, json
                if os.path.exists(archivo_db):
                    with open(archivo_db, 'r', encoding='utf-8') as f:
                        try: usuarios = json.load(f)
                        except: pass
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(usuarios).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
        else:
            super().do_GET()
'''

if 'def do_GET(self):' not in code:
    # Insert right after do_OPTIONS
    opts_idx = code.find('def do_POST(self):')
    if opts_idx != -1:
        code = code[:opts_idx] + get_logic + '\n' + code[opts_idx:]

with open('motor_seguro.py', 'w', encoding='utf-8') as f:
    f.write(code)
print("motor_seguro.py actualizado con GET /api/estudiantes")
