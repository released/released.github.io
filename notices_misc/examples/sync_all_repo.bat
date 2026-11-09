@echo off
setlocal
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0sync_repositories.ps1" %*
exit /b %ERRORLEVEL%
