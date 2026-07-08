with open('iniciar_clase.py', 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if i >= 125 and i <= 140:
            print(f"Line {i+1}: {line.rstrip()}")
