with open('iniciar_clase.py', 'r', encoding='utf-8') as f:
    pycode = f.read()

pycode = pycode.replace('[✅] ACCESO CONCEDIDO', '[EXITO] ACCESO CONCEDIDO')
pycode = pycode.replace('[❌] ACCESO DENEGADO', '[FALLO] ACCESO DENEGADO')

with open('iniciar_clase.py', 'w', encoding='utf-8') as f:
    f.write(pycode)
print("Emojis eliminados de iniciar_clase.py")
