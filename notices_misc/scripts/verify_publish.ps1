$ErrorActionPreference='Stop'
$root=Split-Path -Parent $PSScriptRoot
& node (Join-Path $PSScriptRoot 'verify_web.mjs') (Split-Path -Parent $PSScriptRoot)
if($LASTEXITCODE) { throw 'Web publication baseline failed.' }
foreach($file in @('index.md','examples/sync_repositories.ps1','examples/sync_all_repo.bat')) {if(!(Test-Path -LiteralPath (Join-Path $root $file))){throw ('Missing public sync source: '+$file)}}
$content=[IO.File]::ReadAllText((Join-Path $root 'index.md'))
if($content -match 'reset\s+--hard|clean\s+-fdx|C:\\Users\\'){throw 'Unsafe/destructive sync example or personal path in public content.'}
$script=[IO.File]::ReadAllText((Join-Path $root 'examples/sync_repositories.ps1'))
foreach($flag in @('--ff-only','--no-autostash','--no-overwrite-ignore')){if(!$script.Contains($flag)){throw ('Missing safe sync guard: '+$flag)}}
Write-Host 'PASS: public sync example preserves local changes and uses guarded fast-forward.'
