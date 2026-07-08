with open('iniciar_clase.py', 'r', encoding='utf-8') as f:
    in_post = False
    for i, line in enumerate(f):
        if 'def do_POST' in line:
            in_post = True
        if in_post:
            if 'def ' in line and 'do_POST' not in line:
                break
            if not line.startswith('        ') and not line.startswith('    ') and line.strip() != '' and not line.startswith('def'):
                pass
            if line.startswith('        ') and not line.startswith('            '):
                print(f"Line {i+1}: {line.strip()}")
