import http.server
import socketserver
import json
import os

PORT = 8080

class GestorAPI(http.server.SimpleHTTPRequestHandler):
    # 1. Permiso de Seguridad (Evita el ERR_EMPTY_RESPONSE)
    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    # 2. Recepción de Estudiantes
    def do_POST(self):
        if self.path == '/api/registro-estudiante':
            try:
                # Leer los datos que envía el navegador
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                datos = json.loads(post_data.decode('utf-8'))
                
                print(f"\n[🚀] RECIBIENDO ESTUDIANTE: {datos['nombre']} {datos['apellidos']} (Doc: {datos['documento']})")

                # Guardar en la base de datos JSON
                archivo_db = 'usuarios.json'
                usuarios = []
                if os.path.exists(archivo_db):
                    with open(archivo_db, 'r', encoding='utf-8') as f:
                        try: usuarios = json.load(f)
                        except: pass
                
                usuarios.append(datos)
                with open(archivo_db, 'w', encoding='utf-8') as f:
                    json.dump(usuarios, f, indent=4, ensure_ascii=False)

                # Enviar respuesta de ÉXITO al navegador
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "success", "message": "Guardado exitosamente"}).encode('utf-8'))
                print("[✅] Estudiante guardado en usuarios.json correctamente.\n")

            except Exception as e:
                print(f"\n[❌] ERROR INTERNO: {e}\n")
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
        else:
            # Si no es registro, procesa normal
            super().do_POST()

# Levantar el servidor
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", PORT), GestorAPI) as httpd:
    print(f"=================================================")
    print(f"[*] MOTOR SEGURO PEIDAGOGOS INICIADO (PUERTO {PORT})")
    print(f"[*] Escuchando registros de estudiantes...")
    print(f"=================================================")
    httpd.serve_forever()