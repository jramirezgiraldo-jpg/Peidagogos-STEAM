import subprocess
import time
import urllib.request
import json
import os

with open("out.txt", "w") as f:
    p = subprocess.Popen(["python", "-u", "iniciar_clase.py"], stdout=f, stderr=subprocess.STDOUT)
    time.sleep(2)
    
    try:
        url = 'http://localhost:8080/api/login'
        payload = {"usuario": "18460767", "clave": "18460767"}
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
        urllib.request.urlopen(req)
    except Exception as e:
        pass
        
    p.terminate()

with open("out.txt", "r") as f:
    print(f.read())
