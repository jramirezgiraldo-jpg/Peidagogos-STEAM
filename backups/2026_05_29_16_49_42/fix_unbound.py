with open('iniciar_clase.py', 'r', encoding='utf-8') as f:
    pycode = f.read()

pycode = pycode.replace('                import json, os\n', '')
pycode = pycode.replace('                import os\n', '')

with open('iniciar_clase.py', 'w', encoding='utf-8') as f:
    f.write(pycode)
