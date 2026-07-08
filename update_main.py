with open('motor_seguro.py', 'r', encoding='utf-8') as f:
    text = f.read()

import re

# Find the if __name__ == '__main__': block
start_idx = text.find("if __name__ == '__main__':")
if start_idx != -1:
    new_block = '''if __name__ == '__main__':
    try:
        socketserver.TCPServer.allow_reuse_address = True
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"=================================================")
            print(f"[*] MOTOR SEGURO PEIDAGOGOS INICIADO (PUERTO {PORT})")
            print(f"[*] Escuchando registros de estudiantes...")
            print(f"=================================================")
            httpd.serve_forever()
    except Exception as e:
        print(f"\\n[ERROR FATAL DE ARRANQUE]: {e}")
        input("Presiona Enter para salir...")
'''
    new_text = text[:start_idx] + new_block
    with open('motor_seguro.py', 'w', encoding='utf-8') as f:
        f.write(new_text)
    print("Modificado correctamente motor_seguro.py")
else:
    print("No se encontró el bloque main.")
