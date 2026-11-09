param([switch]$Apply)
$ErrorActionPreference='Stop'
$root=Split-Path -Parent $PSScriptRoot
. (Join-Path $PSScriptRoot 'web_publish.ps1')
$current=(Invoke-WebGit $root @('config','--local','--get','core.hooksPath') @(0,1)).Text
if($current -and $current -cne '.githooks') { throw 'A custom hooksPath is preserved. Integrate the website guard before publication; it will not be overwritten.' }
if(!$current) {
    $custom=(Invoke-WebGit $root @('rev-parse','--git-path','hooks/pre-push')).Text
    if(![IO.Path]::IsPathRooted($custom)) { $custom=Join-Path $root $custom }
    if(Test-Path -LiteralPath $custom) { throw 'An existing pre-push hook is preserved. Integrate the website guard before publication.' }
}
if(!(Test-Path -LiteralPath (Join-Path $root '.githooks\pre-push') -PathType Leaf)) { throw 'Website push guard is missing.' }
if($Apply -and !$current) { [void](Invoke-WebGit $root @('config','--local','core.hooksPath','.githooks')) }
