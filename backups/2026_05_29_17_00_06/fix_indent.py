with open('iniciar_clase.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

import re

with open('iniciar_clase.py', 'w', encoding='utf-8') as f:
    for line in lines:
        if line.startswith('        if parsed_path.path == \'/api/registro-estudiante\':') and len(line) - len(line.lstrip()) != 8:
            # this shouldn't happen if it was literally 8 spaces, but let's just make it uniform
            pass
        f.write(line)

# Let me just rewrite the file replacing 8 spaces with the exact spacing of the do_POST method.
# Wait, do_POST is at 4 spaces indentation, and the inner blocks are at 8 spaces.
