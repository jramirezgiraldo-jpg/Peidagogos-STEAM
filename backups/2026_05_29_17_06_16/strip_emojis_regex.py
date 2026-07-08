import re
with open('iniciar_clase.py', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace ✅ and ❌ anywhere in the text
text = text.replace('\u2705', 'EXITO').replace('\u274c', 'FALLO')

with open('iniciar_clase.py', 'w', encoding='utf-8') as f:
    f.write(text)
print("Stripped emojis successfully.")
