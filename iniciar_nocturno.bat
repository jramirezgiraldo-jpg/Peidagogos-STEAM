@echo off
cd /d "%~dp0"
color 0A
title Celador Nocturno - Peidagogos
echo ==========================================================
echo       SISTEMA DE GENERACION NOCTURNA ACTIVADO
echo ==========================================================
echo.
echo Este programa arrancara automaticamente a las 2:00 AM.
echo Empezara por la Semana 1, y cada noche avanzara a la siguiente.
echo.
echo REGLAS IMPORTANTES:
echo 1. No cierres esta ventana negra.
echo 2. Deja el computador conectado a la corriente.
echo 3. Asegurate de que el computador no entre en suspension 
echo    (la pantalla se puede apagar, pero el sistema debe seguir despierto).
echo.
echo Presiona CTRL+C si deseas detener el celador en algun momento.
echo.
node orquestador_nocturno.js
pause
