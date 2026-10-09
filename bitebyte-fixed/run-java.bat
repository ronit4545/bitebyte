@echo off
title BiteByte - Java Backend
cd /d "%~dp0"

echo [1/2] Building the React frontend...
if not exist "client\node_modules" (
  cd client
  call npm install
  if errorlevel 1 (
    echo ERROR: npm install failed. Check that Node.js and npm are installed.
    pause
    exit /b 1
  )
  cd ..
)
cd client
call npm run build
if errorlevel 1 (
  echo ERROR: Frontend build failed.
  pause
  exit /b 1
)
cd ..

echo.
echo [2/2] Starting BiteByte Java backend...
cd server-java
if not exist pom.xml (
  echo ERROR: server-java\pom.xml was not found.
  pause
  exit /b 1
)
call mvn spring-boot:run
pause
