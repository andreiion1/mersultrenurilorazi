@echo off
title Mersul Trenurilor Azi - server local
cd /d "%~dp0"

echo ============================================
echo   Mersul Trenurilor Azi - pornire server
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [EROARE] Node.js nu este instalat.
  echo Descarca versiunea LTS de pe https://nodejs.org , instaleaza, apoi redeschide acest fisier.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules\next" (
  echo Instalez dependentele ^(o singura data, dureaza 1-2 minute^)...
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo [EROARE] Instalarea a esuat. Daca exista folderul node_modules, sterge-l si incearca din nou.
    pause
    exit /b 1
  )
)

echo.
echo Pornesc site-ul... se va deschide automat in browser.
echo Lasa aceasta fereastra deschisa cat timp folosesti site-ul.
echo Ca sa opresti: apasa Ctrl + C sau inchide fereastra.
echo.

start "" http://localhost:3000
call npm run dev
pause
