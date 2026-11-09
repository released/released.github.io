param([string]$ReferenceRoot='')
$ErrorActionPreference='Stop'
& node (Join-Path $PSScriptRoot 'verify_web.mjs') (Split-Path -Parent $PSScriptRoot)
if($LASTEXITCODE) { throw 'Web publication baseline failed.' }
