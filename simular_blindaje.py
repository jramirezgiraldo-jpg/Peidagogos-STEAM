import subprocess
import time
import urllib.request
import json
import os

print("=== INICIANDO SIMULACION AUTONOMA E2E (TEST BLINDAJE MOTOR) ===")
print("[1] Levantando servidor motor_seguro.py en segundo plano...")

# Ensure any running motor_seguro processes are killed first just in case
subprocess.run(['taskkill', '/F', '/IM', 'python.exe', '/FI', 'WINDOWTITLE eq Servidor Peidagogos STEAM*'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

# Start the safe server
server_process = subprocess.Popen(["python", "motor_seguro.py"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding='utf-8')
time.sleep(3)

try:
    print("\n[2] Simulando accion: Iniciar Sesion con credenciales recien creadas...")
    print("    -> Datos: Usuario '18460767', Clave '18460767'")
    
    url_login = 'http://localhost:8080/api/login'
    payload_login = {
        "usuario": "18460767",
        "clave": "18460767"
    }
    data_login = json.dumps(payload_login).encode('utf-8')
    req_login = urllib.request.Request(url_login, data=data_login, headers={'Content-Type': 'application/json'})
    
    with urllib.request.urlopen(req_login) as response_login:
        res_text_login = response_login.read().decode('utf-8')
        print(f"    <- Respuesta Login cruda: HTTP {response_login.status} | {res_text_login}")
        
        try:
            parsed = json.loads(res_text_login)
            if parsed.get('status') == 'success':
                print("    [EXITO TOTAL] El servidor retorno JSON puro, parseado exitosamente.")
            else:
                print("    [ADVERTENCIA] JSON puro pero status no es success:", parsed)
        except json.JSONDecodeError as e:
            print("    [ERROR FATAL] La respuesta NO es JSON valido. Crash del servidor detectado.")

except Exception as e:
    print(f"\n[!] ERROR DURANTE LA SIMULACION (urllib exception): {e}")
    if hasattr(e, 'read'):
        print(f"    Cuerpo del error: {e.read().decode('utf-8', errors='ignore')}")

finally:
    print("\n[3] Apagando servidor simulado...")
    server_process.terminate()
    try:
        outs, errs = server_process.communicate(timeout=2)
    except subprocess.TimeoutExpired:
        server_process.kill()
        outs, errs = server_process.communicate()
    
    print("\n=== LOGS CAPTURADOS DEL SERVIDOR PYTHON ===")
    print(outs.strip() if outs else "Sin salida estandar")
    if errs:
        print("--- ERRORES DEL SERVIDOR ---")
        print(errs.strip())
    print("===========================================")
