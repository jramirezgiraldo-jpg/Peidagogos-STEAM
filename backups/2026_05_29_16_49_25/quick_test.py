import json
import urllib.request

url = 'http://localhost:8080/api/login'
payload = {"usuario": "18460767", "clave": "18460767"}
data = json.dumps(payload).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as response:
        print("Status:", response.status)
        print("Body:", response.read().decode('utf-8'))
except Exception as e:
    print(e)
