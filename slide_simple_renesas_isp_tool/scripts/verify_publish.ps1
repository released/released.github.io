param([string]$ReferenceRoot='')
$ErrorActionPreference='Stop'
& node (Join-Path $PSScriptRoot 'verify_web.mjs') (Split-Path -Parent $PSScriptRoot)
if($LASTEXITCODE) { throw 'Web publication baseline failed.' }
$webRoot=Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
if(!$ReferenceRoot) { $ReferenceRoot=$env:WEB_PUBLISH_REFERENCE_ROOT }
if(!$ReferenceRoot) { $ReferenceRoot=$env:FIRMWARE_TOOL_ROOT }
if(!$ReferenceRoot -or !(Test-Path -LiteralPath (Join-Path $ReferenceRoot 'scripts\sync_device_workshop.ps1'))) {
    throw 'Set -ReferenceRoot (Tool checkout), WEB_PUBLISH_REFERENCE_ROOT or web/push-all.local.psd1 before publication.'
}
foreach($name in @('sync_device_workshop.ps1','sync_update_evidence.ps1','sync_transfer_diagnostics.ps1')) {
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $ReferenceRoot ('scripts\'+$name)) -WebRoot $webRoot -CheckOnly
    if($LASTEXITCODE) { throw "Canonical document check failed: $name" }
}
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'verify_local.ps1') -ToolRoot $ReferenceRoot
if($LASTEXITCODE) { throw 'Web references/public-content verification failed.' }
& node (Join-Path $ReferenceRoot 'scripts\verify_device_upgrade_release.mjs') $webRoot
if($LASTEXITCODE) { throw 'Device guide publication includes an unaccepted engineering role.' }
