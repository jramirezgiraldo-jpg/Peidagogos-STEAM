import urllib.request
import urllib.error
import json

url = 'http://localhost:8080/api/registro-estudiante'
payload = {"documento": "18460767", "apellidos": "Giraldo", "nombre": "Clara", "edad": "11", "genero": "F", "grado": "6"}
data = json.dumps(payload).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as response:
        print("Status:", response.status)
        print("Body:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("HTTPError:", e.code)
    print("Error Body:", e.read().decode('utf-8'))
except urllib.error.URLError as e:
    print("URLError:", e.reason)
except Exception as e:
    print("Exception:", e)
