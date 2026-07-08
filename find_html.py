import os

def find_files():
    for root, dirs, files in os.walk('.'):
        for file in files:
            if 'combinado' in file.lower() or 'transversal' in file.lower() or 'trasnversal' in file.lower():
                print(f"Encontrado: {os.path.join(root, file)}")
            elif file.endswith('.html'):
                print(f"HTML: {os.path.join(root, file)}")

find_files()
