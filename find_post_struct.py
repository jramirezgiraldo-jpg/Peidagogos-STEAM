with open('iniciar_clase.py', 'r', encoding='utf-8') as f:
    in_post = False
    for i, line in enumerate(f):
        if 'def do_POST' in line:
            in_post = True
        if in_post:
            if 'def ' in line and 'do_POST' not in line:
                break
            if 'if ' in line or 'elif ' in line or 'except ' in line or 'try:' in line:
                print(f"Line {i+1}: {line.strip()}")
