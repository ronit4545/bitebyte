@echo off
title BiteByte (Java)
cd /d "%~dp0"
echo Building React frontend...
cd client
if not exist node_modules call npm install
call npm run build
if errorlevel 1 ( echo Frontend build failed. & pause & exit /b 1 )
cd ..\server-java
echo Starting Java server on http://localhost:5000 ...
start "" http://localhost:5000
call mvn spring-boot:run
pause
