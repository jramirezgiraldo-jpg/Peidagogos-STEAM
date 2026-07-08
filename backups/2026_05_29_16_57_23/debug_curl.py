import subprocess
import time
import os

with open("out_curl.txt", "w") as f:
    p = subprocess.Popen(["python", "-u", "iniciar_clase.py"], stdout=f, stderr=subprocess.STDOUT)
    time.sleep(3)
    
    os.system('curl.exe -s -X POST http://127.0.0.1:8080/api/login -d "{\\"usuario\\":\\"18460767\\",\\"clave\\":\\"18460767\\"}" -H "Content-Type: application/json" > curl_out.txt 2> curl_err.txt')
    
    time.sleep(1)
    p.terminate()

print("--- curl_out.txt ---")
with open("curl_out.txt", "r") as f: print(f.read())
print("--- curl_err.txt ---")
with open("curl_err.txt", "r") as f: print(f.read())
print("--- out_curl.txt ---")
with open("out_curl.txt", "r") as f: print(f.read())
