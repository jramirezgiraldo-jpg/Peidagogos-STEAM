with open('iniciar_clase.py', 'r', encoding='utf-8') as f:
    text = f.read()

# Make absolutely sure all potential emojis are gone
text = text.replace('✅', 'OK').replace('❌', 'ERROR').replace('🚀', 'START')
text = text.replace('[✅]', '[OK]').replace('[❌]', '[ERROR]').replace('[🚀]', '[START]')

with open('iniciar_clase.py', 'w', encoding='utf-8') as f:
    f.write(text)
print("Todas las representaciones de los emojis fueron purgadas.")
