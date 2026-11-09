param([string]$ReferenceRoot='')
$ErrorActionPreference='Stop'
& node (Join-Path $PSScriptRoot 'verify_web.mjs') (Split-Path -Parent $PSScriptRoot)
if($LASTEXITCODE) { throw 'Web publication baseline failed.' }
$webRoot=Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
if(!$ReferenceRoot) { $ReferenceRoot=$env:WEB_PUBLISH_REFERENCE_ROOT }
if(!$ReferenceRoot) { $ReferenceRoot=$env:FIRMWARE_TOOL_ROOT }
if(!$ReferenceRoot) {
    throw 'Set -ReferenceRoot (Tool checkout), WEB_PUBLISH_REFERENCE_ROOT or web/push-all.local.psd1 before publication.'
}
$sync=Join-Path $ReferenceRoot 'scripts\sync_rh850_device.ps1'
if(!(Test-Path -LiteralPath $sync)) { throw 'ReferenceRoot does not contain the RH850 canonical sync entry.' }
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $sync -WebRoot $webRoot -CheckOnly
if($LASTEXITCODE) { throw 'RH850 canonical chapters/timing differ; synchronize and review before publication.' }
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'verify_local.ps1') -ToolRoot $ReferenceRoot
if($LASTEXITCODE) { throw 'RH850 Web references/public-content verification failed.' }
