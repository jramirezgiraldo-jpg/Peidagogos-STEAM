import os
import subprocess

def create_shortcut():
    desktop = os.path.join(os.environ['USERPROFILE'], 'Desktop')
    shortcut_path = os.path.join(desktop, 'Iniciar Peidagogos.lnk')
    target_path = "python.exe"
    cwd_path = os.path.abspath(os.getcwd())
    args = "iniciar_clase.py"

    ps_script = f"""
    $wshell = New-Object -ComObject WScript.Shell
    $shortcut = $wshell.CreateShortcut("{shortcut_path}")
    $shortcut.TargetPath = "{target_path}"
    $shortcut.Arguments = "{args}"
    $shortcut.WorkingDirectory = "{cwd_path}"
    $shortcut.IconLocation = "cmd.exe"
    $shortcut.Save()
    """

    ps_script_path = "create_shortcut.ps1"
    with open(ps_script_path, "w") as f:
        f.write(ps_script)

    try:
        subprocess.run(["powershell", "-ExecutionPolicy", "Bypass", "-File", ps_script_path], check=True)
        print(f"Acceso directo creado exitosamente en el Escritorio:\n -> {shortcut_path}")
    except Exception as e:
        print(f"Error al crear el acceso directo: {e}")
    finally:
        if os.path.exists(ps_script_path):
            os.remove(ps_script_path)

if __name__ == '__main__':
    create_shortcut()
