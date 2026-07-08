import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('iniciar_clase.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if i >= 220 and i <= 245:
            print(f"Line {i+1}: {line.strip()}")
