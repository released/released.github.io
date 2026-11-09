@echo off
rem All topics share the parent website repository and publication checks.
call "%~dp0..\github_push.bat" %*
exit /b %ERRORLEVEL%
