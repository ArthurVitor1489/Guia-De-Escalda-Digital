@echo off
title CRUX - Guia Digital Interativo de Escalada
cd /d "%~dp0"
echo ========================================================
echo       CRUX // GUIA DIGITAL INTERATIVO DE ESCALADA
echo ========================================================
echo.
echo  - Pressione 'w' para abrir no Navegador Web (Preview 3D)
echo  - Pressione 'a' para abrir no Emulador Android
echo  - Ou escaneie o QR Code com o aplicativo Expo Go no celular!
echo ========================================================
echo.
call npm.cmd start
pause
