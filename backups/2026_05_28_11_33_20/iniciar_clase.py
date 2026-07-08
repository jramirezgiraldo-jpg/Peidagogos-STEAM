import http.server
import socketserver
import socket
import webbrowser
import os
import shutil
import datetime

PORT = 8080
HOST = "0.0.0.0"

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
        print(f"[*] Backup automático creado exitosamente en: {backup_dir}")
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

def start_server():
    Handler = http.server.SimpleHTTPRequestHandler
    # Permitir reusar la dirección para evitar errores de Address already in use
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer((HOST, PORT), Handler) as httpd:
        print("[*] Servidor en ejecución. Presiona Ctrl+C en esta terminal para detenerlo.")
        httpd.serve_forever()

if __name__ == '__main__':
    print("Iniciando Peidagogos Local LMS...")
    # Ejecutar directiva permanente de backup en cada arranque
    realizar_backup()
    
    ip_local = get_ip()
    print(f"\n========================================================")
    print(f"[*] ADMINISTRADOR: Puedes acceder localmente en: http://localhost:{PORT}")
    print(f"[*] ESTUDIANTES: Deben conectarse en la red a: http://{ip_local}:{PORT}")
    print(f"========================================================\n")
    
    # Apertura Autónoma del navegador
    webbrowser.open(f"http://localhost:{PORT}")
    
    start_server()
