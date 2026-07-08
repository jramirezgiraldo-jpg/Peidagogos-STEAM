import urllib.request
import json

url = 'http://localhost:8080/api/conexion'
try:
    with urllib.request.urlopen(url) as response:
        print("Status:", response.status)
        print("Body:", response.read().decode('utf-8'))
except Exception as e:
    print("Error:", e)
