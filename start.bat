@echo off
title 3M Fashion - Server
cd /d "%~dp0"
echo.
echo   3M Fashion is starting...
echo   Store : http://localhost:3000
echo   Admin : http://localhost:3000/admin
echo.
node server.js
pause
