@echo off
setlocal
set "GITHUB_PUSH_PROJECT_ROOT=%~dp0."
set "GITHUB_PUSH_DRY_RUN=0"
if not "%~2"=="" goto usage
if "%~1"=="" goto run
if /I "%~1"=="--check" (
    set "GITHUB_PUSH_DRY_RUN=1"
    goto run
)
:usage
echo Usage: github_push.bat [--check]
exit /b 2
:run
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; try { $root=[IO.Path]::GetFullPath($env:GITHUB_PUSH_PROJECT_ROOT); $publisherRoot=$env:WEB_PUBLISH_ROOT; if(!$publisherRoot){ $config=Join-Path $root 'github_push.local.psd1'; if(Test-Path -LiteralPath $config){ $publisherRoot=(Import-PowerShellDataFile -LiteralPath $config).PublisherRoot } }; if(!$publisherRoot){ $publisherRoot=Split-Path -Parent $root }; $entry=Join-Path $publisherRoot 'push-project.ps1'; if(!(Test-Path -LiteralPath $entry -PathType Leaf)){ throw 'Set WEB_PUBLISH_ROOT or github_push.local.psd1 PublisherRoot to the shared publisher directory.' }; & $entry -Root $root -Owner 'released' -Repository 'released.github.io' -Branch 'main' -DryRun:($env:GITHUB_PUSH_DRY_RUN -eq '1'); exit $LASTEXITCODE } catch { Write-Host ('STOPPED: '+$_.Exception.Message); exit 1 }"
exit /b %ERRORLEVEL%
