# Regla: Auto-Deploy a GitHub

1. **Sincronización Web:** El usuario trabaja en la página web en producción (Render/GitHub). Por lo tanto, SIEMPRE que se te pida realizar una tarea que involucre escribir, modificar o eliminar código, AL FINALIZAR con éxito DEBES ejecutar comandos de Git para guardar los cambios y empujarlos a producción automáticamente.
2. **Comandos:**
   git add .
   git commit -m "feat: [descripción]"
   git push origin master
3. **Cero Secretos:** NUNCA subas claves de API quemadas en el código.
