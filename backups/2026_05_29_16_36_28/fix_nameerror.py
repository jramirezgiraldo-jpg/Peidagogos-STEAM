with open('iniciar_clase.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if line.strip() == 'parsed_path = urllib.parse.urlparse(self.path)':
        new_lines.append(line.replace('urllib.parse.urlparse', 'urlparse'))
    else:
        new_lines.append(line)

with open('iniciar_clase.py', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
