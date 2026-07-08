import json
import urllib.request
import urllib.error
import threading
import time
from http.server import HTTPServer
import sys

# We need to run the server in a thread to get real exceptions
import iniciar_clase

def start_server():
    server_address = ('', 8080)
    httpd = HTTPServer(server_address, iniciar_clase.CustomHandler)
    httpd.serve_forever()

t = threading.Thread(target=start_server)
t.daemon = True
t.start()
time.sleep(2)

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

