import subprocess
import time
import urllib.request
import json
import os

print("=== INICIANDO SIMULACION AUTONOMA E2E ===")
print("[1] Levantando servidor motor_seguro.py en segundo plano...")
server_process = subprocess.Popen(["python", "-u", "iniciar_clase.py"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(3) # Esperar a que el servidor inicialice

try:
    print("\n[2] Simulando accion: Clic en 'Nuevo Usuario' y envio de formulario...")
    print("    -> Datos: Documento 18460767, Giraldo, Clara, 11, F, 6")
    
    url_reg = 'http://localhost:8080/api/registro-estudiante'
    payload_reg = {
        "documento": "18460767",
        "apellidos": "Giraldo",
        "nombre": "Clara",
        "edad": "11",
        "genero": "F",
        "grado": "6"
    }
    data_reg = json.dumps(payload_reg).encode('utf-8')
    req_reg = urllib.request.Request(url_reg, data=data_reg, headers={'Content-Type': 'application/json'})
    
    with urllib.request.urlopen(req_reg) as response_reg:
        res_text_reg = response_reg.read().decode('utf-8')
        print(f"    <- Respuesta Registro: HTTP {response_reg.status} | {res_text_reg}")
        if response_reg.status == 200 and 'success' in res_text_reg:
            print("    ✅ Registro exitoso. La interfaz regresaria al login.")
        else:
            print("    ❌ Falla en el registro.")

    print("\n[3] Simulando accion: Iniciar Sesion con credenciales recien creadas...")
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
        print(f"    <- Respuesta Login: HTTP {response_login.status} | {res_text_login}")
        if response_login.status == 200 and 'success' in res_text_login:
            print("    ✅ Inicio de sesion exitoso. La interfaz mostraria el Dashboard.")
        else:
            print("    ❌ Falla en el inicio de sesion.")

except Exception as e:
    print(f"\n[!] ERROR DURANTE LA SIMULACION: {e}")
    if hasattr(e, 'read'):
        print(f"    Detalles: {e.read().decode('utf-8')}")

finally:
    print("\n[4] Apagando servidor...")
    server_process.terminate()
    try:
        server_process.wait(timeout=2)
    except subprocess.TimeoutExpired:
        server_process.kill()
    print("=== SIMULACION COMPLETADA ===")
