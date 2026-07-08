import subprocess
import time
import os
import urllib.request
import json

with open("out_global.txt", "w") as f:
    p = subprocess.Popen(["python", "-u", "iniciar_clase.py"], stdout=f, stderr=subprocess.STDOUT)
    time.sleep(2)
    
    try:
        url = 'http://localhost:8080/api/login'
        payload = {"usuario": "18460767", "clave": "18460767"}
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req) as response:
            print("Status:", response.status)
            print("Body:", response.read().decode('utf-8'))
    except Exception as e:
        print("Test Error:", e)
        if hasattr(e, 'read'):
            print("Error Body:", e.read().decode('utf-8'))
        
    p.terminate()

if os.path.exists("POST_CRASH.log"):
    print("--- POST_CRASH.log ---")
    with open("POST_CRASH.log", "r") as f: print(f.read())
else:
    print("NO CRASH LOG CREATED!")
