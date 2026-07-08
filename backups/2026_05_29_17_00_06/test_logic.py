import json
import os

usuario_input = "18460767"
clave_input = "18460767"
archivo_db = 'usuarios.json'
encontrado = False
nombre_estudiante = ""

if os.path.exists(archivo_db):
    with open(archivo_db, 'r', encoding='utf-8') as f:
        usuarios = json.load(f)
        print("Total usuarios:", len(usuarios))
        for u in usuarios:
            doc = str(u.get('documento'))
            print(f"Comparing doc '{doc}' with input '{usuario_input}'")
            if doc == usuario_input and doc == clave_input:
                encontrado = True
                nombre_estudiante = f"{u.get('nombre')} {u.get('apellidos')}"
                break
                
print("Encontrado:", encontrado, "Nombre:", nombre_estudiante)
