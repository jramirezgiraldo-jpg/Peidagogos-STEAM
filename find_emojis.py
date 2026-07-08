import json
with open('iniciar_clase.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        for c in line:
            if ord(c) > 10000:
                print(f"Line {i+1}: {line.strip()}")
                break
