@echo off
color 0D
echo ========================================================
echo   INICIANDO GENERADOR CRON (VENTANA NOCTURNA)
echo ========================================================
echo.
echo Esta ventana es el cerebro del Cron Generator.
echo El script trabajara 24/7 de forma ininterrumpida.
echo En el dia (8 AM a 2 AM) tomara pausas largas (2 minutos) entre guias.
echo En la madrugada (2 AM a 8 AM) trabajara mas rapido (pausas de 20s).
echo.
echo ADVERTENCIA: Para que funcione a las 2 AM, el PC DEBE
echo estar encendido (puedes apagar la pantalla).
echo.
cd /d "d:\Peidagogos_Local"
node generador_cron.js
echo.
pause
