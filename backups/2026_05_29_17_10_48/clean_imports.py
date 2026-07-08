import re

with open('iniciar_clase.py', 'r', encoding='utf-8') as f:
    pycode = f.read()

# Remove any 'import json, os' or 'import os' that is indented
pycode = re.sub(r'^[ \t]+import json, os\r?\n', '', pycode, flags=re.MULTILINE)
pycode = re.sub(r'^[ \t]+import os\r?\n', '', pycode, flags=re.MULTILINE)

with open('iniciar_clase.py', 'w', encoding='utf-8') as f:
    f.write(pycode)
print("Removed inner imports.")
