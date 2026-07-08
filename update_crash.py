import re
import shutil
import os

with open('motor_seguro.py', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace do_GET completely
get_logic = '''    def do_GET(self):
        if self.path == '/api/estudiantes':
            try:
                import json, os
                archivo_db = 'usuarios.json'
                usuarios = []
                if os.path.exists(archivo_db):
                    with open(archivo_db, 'r', encoding='utf-8') as f:
                        usuarios = json.load(f)
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(usuarios).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
            return  # Freno obligatorio. Evita que el codigo siga leyendo hacia abajo.
            
        elif self.path == '/favicon.ico':
            self.send_response(204) # Silencia el error 404 de favicon respondiendo "Sin contenido"
            self.end_headers()
            return
            
        else:
            # Para TODO lo demas (app.js, index.html, imagenes), usa el servidor por defecto
            try:
                super().do_GET()
            except Exception as e:
                print(f"[INFO] Peticion estatica cancelada o no encontrada: {self.path}")
'''

# Find def do_GET(self): and replace until def do_POST(self):
start_idx = code.find('def do_GET(self):')
end_idx = code.find('def do_POST(self):')

if start_idx != -1 and end_idx != -1:
    code = code[:start_idx] + get_logic + '\n    ' + code[end_idx:]
    with open('motor_seguro.py', 'w', encoding='utf-8') as f:
        f.write(code)
    print("motor_seguro.py reparado.")

# Update index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('<script src="js/app.js"></script>', '<script src="app.js"></script>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

# Mover js/app.js a la raiz si el usuario quiere que sea src="app.js"
if os.path.exists('js/app.js'):
    shutil.copy('js/app.js', 'app.js')

print("index.html blindado y app.js copiado a la raiz.")
