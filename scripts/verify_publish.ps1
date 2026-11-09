param([string]$ReferenceRoot='')
$ErrorActionPreference='Stop'
& node (Join-Path $PSScriptRoot 'verify_web.mjs') (Split-Path -Parent $PSScriptRoot)
if($LASTEXITCODE) { throw 'Web publication baseline failed.' }
& node (Join-Path $PSScriptRoot 'verify_consolidation.mjs') (Split-Path -Parent $PSScriptRoot)
if($LASTEXITCODE) { throw 'Single-site layout/public URL checks failed.' }
& node (Join-Path $PSScriptRoot 'sync_web_runtime.mjs') --check
if($LASTEXITCODE) { throw 'Shared runtime compatibility copies differ.' }
& node (Join-Path $PSScriptRoot 'deploy_web_contracts.mjs') --check
if($LASTEXITCODE) { throw 'Consolidated declaration/verifier projections differ.' }
$root=Split-Path -Parent $PSScriptRoot
. (Join-Path $PSScriptRoot 'web_publish.ps1')
$changed=@((Invoke-WebGit $root @('diff','--name-only','HEAD','--')).Text.Split("`n"))
$changed+=@((Invoke-WebGit $root @('ls-files','--others','--exclude-standard')).Text.Split("`n"))
if($changed -match '^(slide_boot_loader_for_RL78|slide_boot_loader_for_RH850|slide_simple_renesas_isp_tool)/') {
    foreach($topic in @('slide_simple_renesas_isp_tool','slide_boot_loader_for_RH850')) {
        $arguments=@('-NoProfile','-ExecutionPolicy','Bypass','-File',(Join-Path $root ($topic+'\scripts\verify_publish.ps1')))
        if($ReferenceRoot) { $arguments+=@('-ReferenceRoot',$ReferenceRoot) }
        & powershell.exe @arguments
        if($LASTEXITCODE) { throw "Changed Tool/Bootloader canonical source checks failed: $topic" }
    }
}
$siteRoot=Split-Path -Parent $PSScriptRoot
foreach($relative in @('README.md','README.html','index.html','favicon.ico','assets\app.js','assets\style.css','assets\knowledge-base.svg')) {
    if(!(Test-Path -LiteralPath (Join-Path $siteRoot $relative) -PathType Leaf)) {
        throw "Homepage publication file is missing: $relative"
    }
}
$markdown=[IO.File]::ReadAllText((Join-Path $siteRoot 'README.md'),[Text.Encoding]::UTF8)
$html=[IO.File]::ReadAllText((Join-Path $siteRoot 'index.html'),[Text.Encoding]::UTF8)
if($markdown.Contains([char]0xFFFD)) { throw 'Homepage Markdown contains an invalid UTF-8 replacement character.' }
if(@([regex]::Matches($markdown,'(?m)^\s*```')).Count % 2) { throw 'Homepage Markdown fences are not balanced.' }
if($html -notmatch 'data-markdown="README\.md"' -or $html -notmatch 'assets/app\.js' -or $html -notmatch 'assets/style\.css') {
    throw 'Homepage entry does not load its Markdown and local renderer assets.'
}
Write-Host 'PASS: homepage source, renderer assets, UTF-8 and Markdown fences verified independently.'
$guideEntry = 'slide_Nuvoton_DSpotter_operation/'
$legacy = [IO.File]::ReadAllText((Join-Path $siteRoot 'README.html'),[Text.Encoding]::UTF8)
if (!$markdown.Contains($guideEntry) -or !$legacy.Contains($guideEntry)) { throw 'DSpotter guide link is missing from the homepage source or HTML projection.' }
& (Join-Path $siteRoot 'slide_Nuvoton_DSpotter_operation/scripts/verify_publish.ps1')
