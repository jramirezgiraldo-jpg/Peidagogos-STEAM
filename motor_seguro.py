import http.server
import socketserver
import json
import os
import sys

# BLINDAJE WINDOWS UTF-8
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

PORT = 8080

class GestorAPI(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        if self.path == '/api/estudiantes':
            try:
                archivo_db = 'usuarios.json'
                usuarios = []
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
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
            return
            
        elif self.path == '/api/docentes':
            try:
                archivo_db = 'docentes.json'
                docentes = []
                if os.path.exists(archivo_db):
                    with open(archivo_db, 'r', encoding='utf-8') as f:
                        try: docentes = json.load(f)
                        except: pass
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(docentes).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
            return

        elif self.path == '/api/asignaturas':
            try:
                archivo_db = 'asignaturas.json'
                asignaturas = []
                if os.path.exists(archivo_db):
                    with open(archivo_db, 'r', encoding='utf-8') as f:
                        try: asignaturas = json.load(f)
                        except: pass
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(asignaturas).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
            return

        elif self.path == '/favicon.ico':
            self.send_response(204)
            self.end_headers()
            return
            
        else:
            try: super().do_GET()
            except Exception as e: print(f"[INFO] Recurso no encontrado: {self.path}")

    def do_POST(self):
        if self.path == '/api/registro-estudiante':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                datos = json.loads(post_data.decode('utf-8'))
                print(f"[INFO] REGISTRO ESTUDIANTE: {datos.get('nombre')} (Doc: {datos.get('documento')})")
                
                archivo_db = 'usuarios.json'
                usuarios = []
                if os.path.exists(archivo_db):
                    with open(archivo_db, 'r', encoding='utf-8') as f:
                        try: usuarios = json.load(f)
                        except: pass
                
                usuarios.append(datos)
                with open(archivo_db, 'w', encoding='utf-8') as f:
                    json.dump(usuarios, f, indent=4, ensure_ascii=False)

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "success", "message": "Guardado"}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
                
        elif self.path == '/api/registro-docente':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                datos = json.loads(post_data.decode('utf-8'))
                
                archivo_db = 'docentes.json'
                docentes = []
                if os.path.exists(archivo_db):
                    with open(archivo_db, 'r', encoding='utf-8') as f:
                        try: docentes = json.load(f)
                        except: pass
                
                docentes.append(datos)
                with open(archivo_db, 'w', encoding='utf-8') as f:
                    json.dump(docentes, f, indent=4, ensure_ascii=False)

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "success", "message": "Docente Creado"}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))

        elif self.path == '/api/eliminar-estudiante':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                datos = json.loads(post_data.decode('utf-8'))
                doc_a_borrar = str(datos.get('documento', '')).strip()
                
                archivo_db = 'usuarios.json'
                if os.path.exists(archivo_db):
                    with open(archivo_db, 'r', encoding='utf-8') as f:
                        usuarios = json.load(f)
                    
                    # Filtrar eliminando al estudiante con ese documento
                    usuarios_restantes = [u for u in usuarios if str(u.get('documento', '')).strip() != doc_a_borrar]
                    
                    with open(archivo_db, 'w', encoding='utf-8') as f:
                        json.dump(usuarios_restantes, f, indent=4, ensure_ascii=False)
                        
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({"status": "success", "message": "Estudiante eliminado"}).encode('utf-8'))
                else:
                    self.send_response(404)
                    self.end_headers()
                    self.wfile.write(json.dumps({"status": "error", "message": "Base de datos no encontrada"}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))

        elif self.path == '/api/asignaturas':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                datos = json.loads(post_data.decode('utf-8'))
                
                archivo_db = 'asignaturas.json'
                asignaturas = []
                if os.path.exists(archivo_db):
                    with open(archivo_db, 'r', encoding='utf-8') as f:
                        try: asignaturas = json.load(f)
                        except: pass
                
                asignaturas.append(datos)
                with open(archivo_db, 'w', encoding='utf-8') as f:
                    json.dump(asignaturas, f, indent=4, ensure_ascii=False)

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "success", "message": "Asignatura Creada"}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))

        elif self.path == '/api/login':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                creds = json.loads(post_data.decode('utf-8'))
                
                usuario_input = creds.get('usuario', '').strip()
                clave_input = creds.get('clave', '').strip()
                rol_esperado = creds.get('rol', '').strip() # "admin", "docente", "estudiante"
                
                encontrado = False
                nombre = ""
                grado = ""
                grupo = ""
                asignatura = ""
                rol_asignado = ""

                if rol_esperado == "admin":
                    if (usuario_input == "jramirezgiraldo" and clave_input == "Biologia2008%") or (usuario_input == "admin" and clave_input == "admin"):
                        encontrado = True
                        nombre = "Administrador"
                        rol_asignado = "admin"
                elif rol_esperado == "docente":
                    archivo_db = 'docentes.json'
                    if os.path.exists(archivo_db):
                        with open(archivo_db, 'r', encoding='utf-8') as f:
                            try:
                                docentes = json.load(f)
                                for u in docentes:
                                    if str(u.get('documento', '')).strip() == usuario_input and str(u.get('clave', '')).strip() == clave_input:
                                        encontrado = True
                                        nombre = f"{u.get('nombre', '')} {u.get('apellidos', '')}"
                                        rol_asignado = "docente"
                                        break
                            except: pass
                else: # Estudiante por defecto
                    archivo_db = 'usuarios.json'
                    if os.path.exists(archivo_db):
                        with open(archivo_db, 'r', encoding='utf-8') as f:
                            try:
                                usuarios = json.load(f)
                                for u in usuarios:
                                    doc_db = str(u.get('documento', '')).strip()
                                    if doc_db == usuario_input and doc_db == clave_input:
                                        encontrado = True
                                        nombre = f"{u.get('nombre', '')} {u.get('apellidos', '')}"
                                        grado = str(u.get('grado', ''))
                                        grupo = str(u.get('grupo', ''))
                                        asignatura = str(u.get('asignatura', ''))
                                        rol_asignado = "estudiante"
                                        break
                            except: pass

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()

                if encontrado:
                    self.wfile.write(json.dumps({"status": "success", "nombre": nombre, "grado": grado, "grupo": grupo, "asignatura": asignatura, "rol": rol_asignado, "usuario": usuario_input}).encode('utf-8'))
                else:
                    self.wfile.write(json.dumps({"status": "error", "message": "Inválido"}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

if __name__ == '__main__':
    try:
        socketserver.TCPServer.allow_reuse_address = True
        with socketserver.TCPServer(("", PORT), GestorAPI) as httpd:
            print(f"=================================================")
            print(f"[*] MOTOR SEGURO PEIDAGOGOS INICIADO (PUERTO {PORT})")
            print(f"=================================================")
            httpd.serve_forever()
    except Exception as e:
        print(f"\n[ERROR FATAL DE ARRANQUE]: {e}")
        input("Presiona Enter para salir...")
