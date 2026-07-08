with open('iniciar_clase.py', 'r', encoding='utf-8') as f:
    text = f.read()

new_text = ""
replacements = []
for i, c in enumerate(text):
    if ord(c) > 8000:  # Any emoji or high unicode
        replacements.append((c, ord(c)))
        if c == '\u2705': new_text += '[EXITO]'
        elif c == '\u274c': new_text += '[FALLO]'
        elif c == '🚀': new_text += '[START]'
        elif c == '⚠️': new_text += '[WARN]'
        else: new_text += '*'  # Fallback replace with asterisk
    else:
        new_text += c

with open('iniciar_clase.py', 'w', encoding='utf-8') as f:
    f.write(new_text)

with open('replacements.txt', 'w', encoding='utf-8') as f:
    for c, code in set(replacements):
        f.write(f"Replaced char code: {code}\n")
