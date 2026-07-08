with open('iniciar_clase.py', 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if i >= 150 and i <= 165:
            print(f"Line {i+1}: {line.strip()}")
