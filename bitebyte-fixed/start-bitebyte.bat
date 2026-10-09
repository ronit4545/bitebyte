@echo off
title BiteByte
echo ========================================================
echo   Starting BiteByte...
echo ========================================================
echo.
set "NODE_PATH=%LOCALAPPDATA%\Programs\node-win\node-v20.18.0-win-x64"
set "PATH=%NODE_PATH%;%PATH%"

echo Checking server dependencies...
echo Opening BiteByte in your browser: http://localhost:5000
echo.
start http://localhost:5000

node server/server.js
pause
