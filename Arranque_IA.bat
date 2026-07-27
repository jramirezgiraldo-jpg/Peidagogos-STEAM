@echo off
title Motor de Inteligencia Artificial - Peidagogos STEAM
color 0B
echo =======================================================
echo    MOTOR DE IA Y CONEXION CON GEMINI (PUERTO 3000)
echo =======================================================
echo Este servidor es necesario para que funcione la generacion
echo de guias automatica.
echo.
cd /d "%~dp0"
node server.js
echo.
pause
