import subprocess
import time
import urllib.request
import urllib.error
import json
import os

print("Starting server...")
with open("server_stderr.txt", "w") as ferr, open("server_stdout.txt", "w") as fout:
    p = subprocess.Popen(["python", "iniciar_clase.py"], stdout=fout, stderr=ferr)
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

    p.terminate()
    try:
        p.wait(timeout=3)
    except:
        p.kill()

print("\n--- server_stderr.txt ---")
if os.path.exists("server_stderr.txt"):
    with open("server_stderr.txt", "r") as f:
        print(f.read())
