with open('iniciar_clase.py', 'r', encoding='utf-8') as f:
    for i in range(15):
        print(f"Line {i+1}: {f.readline().strip()}")
