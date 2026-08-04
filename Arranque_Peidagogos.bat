@echo off
title Servidor Peidagogos STEAM
color 0A
echo =======================================================
echo    INICIANDO MOTOR COMPLETO DE PEIDAGOGOS STEAM
echo =======================================================
cd /d "%~dp0"

:: Abre la interfaz en el navegador por defecto
start http://localhost:3000

:: Inicia el servidor backend Node.js (Servidor Web + Motor IA)
node server.js

echo.
echo [!] EL SERVIDOR SE HA DETENIDO O ENCONTRO UN ERROR.
pause
