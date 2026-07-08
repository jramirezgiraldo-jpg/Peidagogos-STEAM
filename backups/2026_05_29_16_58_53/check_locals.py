import symtable
with open('iniciar_clase.py', 'r', encoding='utf-8') as f:
    source = f.read()
if source.startswith('\ufeff'):
    source = source[1:]
    
st = symtable.symtable(source, 'iniciar_clase.py', 'exec')
for cls in st.get_children():
    if cls.get_name() == 'CustomHandler':
        for m in cls.get_children():
            if m.get_name() == 'do_POST':
                print(f"do_POST locals: {m.get_locals()}")
