@echo off
title Generador Infinito de Guias - Peidagogos STEAM
color 0A

echo =======================================================
echo    GENERADOR INFINITO DE GUIAS (MODO ANTI-BLOQUEO)
echo =======================================================
echo Este proceso funciona en segundo plano comunicandose con
echo tu servidor NodeJS para generar las guias de IA de forma
echo segura y continua.
echo.
echo NOTA IMPORTANTE:
echo El servidor principal (Arranque_Peidagogos.bat o server.js)
echo DEBE ESTAR CORRIENDO para que esto funcione.
echo.
echo Presiona cualquier tecla para comenzar la fabricacion masiva...
pause >nul

cd /d "%~dp0"
node generador_infinito.js

echo.
echo Proceso finalizado.
pause
