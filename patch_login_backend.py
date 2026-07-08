with open('iniciar_clase.py', 'r', encoding='utf-8') as f:
    text = f.read()

import re
# Find the /api/login block start and end.
# Starts at "elif parsed_path.path == '/api/login':"
# Ends at the line before "parsed_path = urlparse(self.path)" or "if parsed_path.path == '/api/puntos':"

start_idx = text.find("elif parsed_path.path == '/api/login':")
end_idx = text.find("parsed_path = urlparse(self.path)", start_idx)

if start_idx != -1 and end_idx != -1:
    target_block = text[start_idx:end_idx]
    
    new_block = '''elif parsed_path.path == '/api/login':
            respuesta_json = {}
            codigo_http = 200
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                creds = json.loads(post_data.decode('utf-8'))
                
                usuario_input = creds.get('usuario', '').strip()
                clave_input = creds.get('clave', '').strip()
                
                archivo_db = 'usuarios.json'
                encontrado = False
                nombre_estudiante = ""

                if os.path.exists(archivo_db):
                    with open(archivo_db, 'r', encoding='utf-8') as f:
                        usuarios = json.load(f)
                        for u in usuarios:
                            if str(u.get('documento', '')) == usuario_input and str(u.get('documento', '')) == clave_input:
                                encontrado = True
                                nombre_estudiante = f"{u.get('nombre', '')} {u.get('apellidos', '')}"
                                break

                if encontrado:
                    print(f"[EXITO] LOGIN EXITOSO: {nombre_estudiante}")
                    respuesta_json = {"status": "success", "nombre": nombre_estudiante}
                else:
                    print(f"[FALLO] LOGIN FALLIDO: Documento {usuario_input}")
                    respuesta_json = {"status": "error", "message": "Credenciales inválidas"}

            except Exception as e:
                print(f"[!] ERROR CRÍTICO EN LOGIN: {e}")
                codigo_http = 500
                respuesta_json = {"status": "error", "error_desc": str(e)}

            # Envío ÚNICO de cabeceras y cuerpo (Garantiza que no haya texto HTTP en el JSON)
            self.send_response(codigo_http)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(respuesta_json).encode('utf-8'))
            return
            
        '''
    
    new_text = text.replace(target_block, new_block)
    
    with open('iniciar_clase.py', 'w', encoding='utf-8') as f:
        f.write(new_text)
    print("iniciar_clase.py modificado correctamente.")
else:
    print("Error encontrando los bloques.")
