import subprocess
import time
import urllib.request
import urllib.error
import json

print("Starting server...")
p = subprocess.Popen(["python", "iniciar_clase.py"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
time.sleep(3) # wait for startup

print("Sending request...")
url = 'http://localhost:8080/api/login'
payload = {"usuario": "18460767", "clave": "18460767"}
data = json.dumps(payload).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as response:
        print("Status:", response.status)
        print("Body:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("HTTPError:", e.code)
    print("Error Body:", e.read().decode('utf-8'))
except Exception as e:
    print("Exception during request:", e)

p.kill()
out, err = p.communicate()
print("\nSTDOUT:")
print(out.decode('utf-8', errors='ignore'))
print("\nSTDERR:")
print(err.decode('utf-8', errors='ignore'))
