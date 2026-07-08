with open('iniciar_clase.py', 'r', encoding='utf-8') as f:
    pycode = f.read()

target = '''                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
                return'''

login_block = '''                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
                return

        elif parsed_path.path == '/api/login':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                creds = json.loads(post_data.decode('utf-8'))
                
                usuario_input = creds.get('usuario', '').strip()
                clave_input = creds.get('clave', '').strip()
                
                archivo_db = 'usuarios.json'
                encontrado = False
                nombre_estudiante = ""

                # Leer la base de datos
                import os
                if os.path.exists(archivo_db):
                    with open(archivo_db, 'r', encoding='utf-8') as f:
                        try:
                            usuarios = json.load(f)
                            for u in usuarios:
                                # Valida que el documento coincida con usuario y clave
                                if str(u.get('documento')) == usuario_input and str(u.get('documento')) == clave_input:
                                    encontrado = True
                                    nombre_estudiante = f"{u.get('nombre')} {u.get('apellidos')}"
                                    break
                        except Exception as e:
                            print(f"[!] Error leyendo JSON: {e}")

                # Enviar respuesta
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()

                if encontrado:
                    print(f"[✅] ACCESO CONCEDIDO: Estudiante {nombre_estudiante}")
                    self.wfile.write(json.dumps({"status": "success", "nombre": nombre_estudiante}).encode('utf-8'))
                else:
                    print(f"[❌] ACCESO DENEGADO: Intento fallido con doc {usuario_input}")
                    self.wfile.write(json.dumps({"status": "error", "message": "Credenciales inválidas"}).encode('utf-8'))

            except Exception as e:
                print(f"[!] Error en Login: {e}")
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
                return'''

pycode = pycode.replace(target, login_block, 1)

with open('iniciar_clase.py', 'w', encoding='utf-8') as f:
    f.write(pycode)
