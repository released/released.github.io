param([string]$ReferenceRoot='')
$ErrorActionPreference='Stop'
& node (Join-Path $PSScriptRoot 'verify_web.mjs') (Split-Path -Parent $PSScriptRoot)
if($LASTEXITCODE) { throw 'Web publication baseline failed.' }
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
