import json
with open('iniciar_clase.py', 'r', encoding='utf-8') as f:
    text = f.read()
    for i, c in enumerate(text):
        if ord(c) > 10000:
            print(f"High ord character found at index {i}: {c} (code: {ord(c)})")
