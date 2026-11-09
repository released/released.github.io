@echo off
setlocal
if not "%~2"=="" goto usage
if "%~1"=="" goto publish
if /I "%~1"=="--check" goto check
:usage
echo Usage: github_push.bat [--check]
exit /b 2
:publish
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\publish_site.ps1"
exit /b %ERRORLEVEL%
:check
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\publish_site.ps1" -DryRun
exit /b %ERRORLEVEL%
