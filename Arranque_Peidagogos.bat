@echo off
title Servidor Peidagogos STEAM
color 0A
echo ==========================================
echo Iniciando Motor de Peidagogos STEAM...
echo ==========================================
cd /d "%~dp0"

:: Abre la interfaz en el navegador por defecto
start http://localhost:8080

:: Inicia el servidor backend
python motor_seguro.py

echo.
echo [!] EL SERVIDOR SE HA DETENIDO O ENCONTRO UN ERROR.
pause
