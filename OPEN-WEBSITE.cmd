@echo off
setlocal
set "SITE_DIR=%~dp0"
set "PHP_EXE=C:\Users\HP\AppData\Roaming\Local\lightning-services\php-8.2.29+0\bin\win64\php.exe"
if not exist "%PHP_EXE%" (
  start "" "%SITE_DIR%index.html"
  exit /b
)
powershell.exe -NoProfile -WindowStyle Hidden -Command "$listener = Get-NetTCPConnection -LocalPort 4173 -State Listen -ErrorAction SilentlyContinue; if (-not $listener) { Start-Process -FilePath '%PHP_EXE%' -ArgumentList '-S','127.0.0.1:4173','-t','%SITE_DIR%' -WorkingDirectory '%SITE_DIR%' -WindowStyle Hidden }"
timeout /t 1 /nobreak >nul
start "" "http://127.0.0.1:4173/index.html"
