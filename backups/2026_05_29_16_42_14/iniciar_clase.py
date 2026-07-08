import http.server
import socketserver
import socket
import webbrowser
import os
import shutil
import datetime
import json
from urllib.parse import urlparse, parse_qs

PORT = 8080
HOST = "0.0.0.0"
DB_FILE = "db_scores.json"

def realizar_backup():
    now = datetime.datetime.now().strftime("%Y_%m_%d_%H_%M_%S")
    backup_dir = os.path.join("backups", now)
    
    def ignore_backups(dir, contents):
        if os.path.basename(dir) == "backups":
            return contents
        if "backups" in contents:
            return ["backups"]
        return []

    try:
        shutil.copytree(".", backup_dir, ignore=ignore_backups)
        print(f"[*] Backup automÃƒÂ¡tico creado exitosamente en: {backup_dir}")
    except Exception as e:
        print(f"[!] Error al crear backup: {e}")

def get_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def load_db(self):
        if not os.path.exists(DB_FILE):
            with open(DB_FILE, 'w', encoding='utf-8') as f:
                json.dump([], f)
        with open(DB_FILE, 'r', encoding='utf-8') as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                return []
                
    def save_db(self, data):
        with open(DB_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4)

    def do_GET(self):
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/api/leaderboard':
            query = parse_qs(parsed_path.query)
            grado = query.get('grado', [''])[0]
            grupo = query.get('grupo', [''])[0]
            
            db = self.load_db()
            filtered = db
            if grado and grado != 'all':
                filtered = [s for s in filtered if str(s.get('grado')) == str(grado)]
            if grupo and grupo != 'all':
                filtered = [s for s in filtered if str(s.get('grupo')) == str(grupo)]
                
            filtered.sort(key=lambda x: x.get('puntos_obtenidos', 0), reverse=True)
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(filtered).encode('utf-8'))
            return
            
        elif parsed_path.path == '/api/companeros':
            query = parse_qs(parsed_path.query)
            grado = query.get('grado', [''])[0]
            grupo = query.get('grupo', [''])[0]
            exclude = query.get('exclude', [''])[0]
            
            db = self.load_db()
            filtered = []
            for s in db:
                if str(s.get('grado')) == str(grado) and str(s.get('id')) != exclude:
                    filtered.append(s)
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(filtered).encode('utf-8'))
            return
        elif parsed_path.path == '/api/admin/progreso-generacion':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            try:
                with open('batch_progress.json', 'r', encoding='utf-8') as f:
                    progress_data = json.load(f)
            except Exception:
                progress_data = {"status": "waiting", "percentage": 0, "current": 0, "total": 0}
            self.wfile.write(json.dumps(progress_data).encode('utf-8'))
            return
            
        elif parsed_path.path == '/api/conexion':
            ip_real = get_ip()
            # Si se requiriera SSID, python necesita comandos extra del OS, por ahora enviamos "Red Local" o el nombre de host
            ssid = socket.gethostname()
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                "ip": ip_real,
                "puerto": PORT,
                "ssid": ssid
            }).encode('utf-8'))
            return
            
        return super().do_GET()

    def do_POST(self):

        parsed_path = urlparse(self.path)
        if parsed_path.path == '/api/admin/generar-semana':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            semana = data.get('semana', '1')
            
            # Inicializar el archivo de progreso
            with open('batch_progress.json', 'w', encoding='utf-8') as f:
                json.dump({"current": 0, "total": 216, "status": "processing", "percentage": 0}, f)
                
            # Lanzar el proceso en background (subprocess)
            import subprocess
            subprocess.Popen(['python', 'generador_batch.py', str(semana)])
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "message": "Proceso iniciado"}).encode('utf-8'))
            return


        if parsed_path.path == '/api/registro-estudiante':
            try:
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
                with open('DEBUG_LOGIN_ERROR.txt', 'w', encoding='utf-8') as dbg:
                    import traceback
                    dbg.write(traceback.format_exc())
                print(f"[!] Error en Login: {e}")
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
                return

        parsed_path = urlparse(self.path)
        if parsed_path.path == '/api/puntos':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                db = self.load_db()
                
                # Es un evento de ROBO (PvP)?
                if 'id_atacante' in data and 'id_victima' in data:
                    id_ata = str(data['id_atacante'])
                    id_vic = str(data['id_victima'])
                    pct = float(data['porcentaje_robo'])
                    
                    atacante = next((s for s in db if str(s.get('id')) == id_ata), None)
                    victima = next((s for s in db if str(s.get('id')) == id_vic), None)
                    
                    if atacante and victima:
                        pts_robados = int(victima.get('puntos_obtenidos', 0) * pct)
                        victima['puntos_obtenidos'] = max(0, victima.get('puntos_obtenidos', 0) - pts_robados)
                        atacante['puntos_obtenidos'] = atacante.get('puntos_obtenidos', 0) + pts_robados
                        self.save_db(db)
                        
                        self.send_response(200)
                        self.send_header('Content-Type', 'application/json')
                        self.send_header('Access-Control-Allow-Origin', '*')
                        self.end_headers()
                        self.wfile.write(json.dumps({"status": "success", "robados": pts_robados}).encode('utf-8'))
                        return
                    else:
                        self.send_response(404)
                        self.send_header('Access-Control-Allow-Origin', '*')
                        self.end_headers()
                        return
                
                # Caso estÃƒÂ¡ndar (Sumar Puntos / Nota)
                student_id = str(data.get('id', ''))
                puntos = int(data.get('puntos_obtenidos', 0))
                nota = data.get('nota_academica')
                
                found = False
                for student in db:
                    if str(student.get('id')) == student_id:
                        student['puntos_obtenidos'] = student.get('puntos_obtenidos', 0) + puntos
                        if nota is not None:
                            student['nota_academica'] = float(nota)
                        student['nombre'] = data.get('nombre', student.get('nombre'))
                        student['grado'] = data.get('grado', student.get('grado'))
                        student['grupo'] = data.get('grupo', student.get('grupo'))
                        found = True
                        break
                        
                if not found:
                    new_student = {
                        "id": student_id,
                        "nombre": data.get('nombre', 'Desconocido'),
                        "grado": data.get('grado', ''),
                        "grupo": data.get('grupo', 'A'),
                        "puntos_obtenidos": puntos
                    }
                    if nota is not None:
                        new_student['nota_academica'] = float(nota)
                    db.append(new_student)
                    
                self.save_db(db)
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "success", "message": "Actualizado"}).encode('utf-8'))
                
            except Exception as e:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode('utf-8'))
            return

    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def start_server():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer((HOST, PORT), CustomHandler) as httpd:
        print("[*] Servidor en ejecuciÃƒÂ³n con API PvP. Presiona Ctrl+C en esta terminal para detenerlo.")
        httpd.serve_forever()

if __name__ == '__main__':
    print("Iniciando Peidagogos Local LMS (Modo Multijugador)...")
    realizar_backup()
    ip_local = get_ip()
    print(f"\n========================================================")
    print(f"[*] ADMINISTRADOR: Puedes acceder localmente en: http://localhost:{PORT}")
    print(f"[*] ESTUDIANTES: Deben conectarse en la red a: http://{ip_local}:{PORT}")
    print(f"========================================================\n")
    webbrowser.open(f"http://localhost:{PORT}")
    start_server()


