with open('iniciar_clase.py', 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if 'parsed_path' in line:
            print(f"Line {i+1}: {line.strip()}")
