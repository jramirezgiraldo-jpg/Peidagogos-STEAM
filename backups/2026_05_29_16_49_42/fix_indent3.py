with open('iniciar_clase.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if line.startswith('                if parsed_path.path == \'/api/registro-estudiante\':'):
        new_lines.append('        if parsed_path.path == \'/api/registro-estudiante\':\n')
    else:
        new_lines.append(line)

with open('iniciar_clase.py', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
