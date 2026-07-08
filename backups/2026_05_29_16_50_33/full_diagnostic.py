import subprocess
import time
import urllib.request
import urllib.error
import json

print("Starting server...")
p = subprocess.Popen(["python", "iniciar_clase.py"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
time.sleep(3) # wait for startup

print("Sending request...")
url = 'http://localhost:8080/api/registro-estudiante'
payload = {"documento": "18460767", "apellidos": "Giraldo", "nombre": "Clara", "edad": "11", "genero": "F", "grado": "6"}
data = json.dumps(payload).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as response:
        print("Status:", response.status)
except Exception as e:
    print("Exception during request:", e)

p.kill()
out, err = p.communicate()
print("\nSTDOUT:")
print(out.decode('utf-8', errors='ignore'))
print("\nSTDERR:")
print(err.decode('utf-8', errors='ignore'))
