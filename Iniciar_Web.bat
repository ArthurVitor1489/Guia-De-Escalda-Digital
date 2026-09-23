@echo off
title CRUX - Modo Web Preview
cd /d "%~dp0"
echo ========================================================
echo       CRUX // MODO PREVIEW WEB
echo ========================================================
echo.
echo Iniciando servidor Web local...
call npm.cmd run web
pause
