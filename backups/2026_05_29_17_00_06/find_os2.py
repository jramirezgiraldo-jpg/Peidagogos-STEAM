with open('iniciar_clase.py', 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if 'import os' in line or 'os.' in line:
            print(f"Line {i+1}: {line.strip()}")
