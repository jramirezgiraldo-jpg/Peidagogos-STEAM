import http.server
import socketserver
import json
import os
import sys

# BLINDAJE OBLIGATORIO: Fuerza a la terminal de Windows a usar UTF-8 para evitar crashes charmap
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

    def do_POST(self):
        if self.path == '/api/registro-estudiante':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                datos = json.loads(post_data.decode('utf-8'))
                
                print(f"[INFO] RECIBIENDO ESTUDIANTE: {datos.get('nombre')} (Doc: {datos.get('documento')})")

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
                print(f"[ERROR] EN REGISTRO: {e}")
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
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

                if os.path.exists(archivo_db):
                    with open(archivo_db, 'r', encoding='utf-8') as f:
                        try:
                            usuarios = json.load(f)
                            for u in usuarios:
                                if str(u.get('documento', '')) == usuario_input and str(u.get('documento', '')) == clave_input:
                                    encontrado = True
                                    nombre_estudiante = f"{u.get('nombre', '')} {u.get('apellidos', '')}"
                                    grado_estudiante = str(u.get('grado', ''))
                                    break
                        except Exception as e:
                            print(f"[ERROR] LEYENDO JSON: {e}")

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()

                if encontrado:
                    print(f"[EXITO] LOGIN CONCEDIDO: {nombre_estudiante} (Grado: {grado_estudiante})")
                    self.wfile.write(json.dumps({"status": "success", "nombre": nombre_estudiante, "grado": grado_estudiante}).encode('utf-8'))
                else:
                    print(f"[FALLO] LOGIN DENEGADO: {usuario_input}")
                    self.wfile.write(json.dumps({"status": "error", "message": "Credenciales inválidas"}).encode('utf-8'))

            except Exception as e:
                print(f"[ERROR] EN LOGIN: {e}")
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
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
