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
                print(f"[INFO] REGISTRO: {datos.get('nombre')} (Doc: {datos.get('documento')})")
                
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

        elif self.path == '/api/login':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                creds = json.loads(post_data.decode('utf-8'))
                
                usuario_input = creds.get('usuario', '').strip()
                clave_input = creds.get('clave', '').strip()
                
                archivo_db = 'usuarios.json'
                encontrado = False
                nombre_estudiante = ""
                grado_estudiante = ""

                if os.path.exists(archivo_db):
                    with open(archivo_db, 'r', encoding='utf-8') as f:
                        try:
                            usuarios = json.load(f)
                            for u in usuarios:
                                doc_db = str(u.get('documento', '')).strip()
                                print(f"[DEBUG] Comparando BD [{doc_db}] contra Input Usuario [{usuario_input}] y Clave [{clave_input}]")
                                if doc_db == usuario_input and doc_db == clave_input:
                                    encontrado = True
                                    nombre_estudiante = f"{u.get('nombre', '')} {u.get('apellidos', '')}"
                                    grado_estudiante = str(u.get('grado', ''))
                                    # Sin break, sigue buscando el válido en caso de duplicados vacíos
                        except Exception: pass

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()

                if encontrado:
                    print(f"[EXITO] LOGIN CONCEDIDO: {nombre_estudiante}")
                    self.wfile.write(json.dumps({"status": "success", "nombre": nombre_estudiante, "grado": grado_estudiante}).encode('utf-8'))
                else:
                    print(f"[FALLO] LOGIN DENEGADO")
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
