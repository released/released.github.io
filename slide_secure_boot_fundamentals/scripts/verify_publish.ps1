param()
$ErrorActionPreference='Stop'
& node (Join-Path $PSScriptRoot 'verify_web.mjs') (Split-Path -Parent $PSScriptRoot)
if($LASTEXITCODE) { throw 'Web publication baseline failed.' }
$siteRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$utf8=New-Object Text.UTF8Encoding($false,$true)
function Read-Utf8([string]$relative){
    return $utf8.GetString([IO.File]::ReadAllBytes((Join-Path $siteRoot $relative))).TrimStart([char]0xFEFF)
}
function Get-TextHash([string]$value){
    $sha=[Security.Cryptography.SHA256]::Create()
    try { return ([BitConverter]::ToString($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($value)))).Replace('-','').ToLowerInvariant() }
    finally { $sha.Dispose() }
}
$markdown=Read-Utf8 'index.md'
$html=Read-Utf8 'index.html'
if([regex]::Matches($markdown,'(?m)^## (?:[1-9]|1[0-2])\. ').Count -ne 12){throw 'Expected twelve chapters'}
if([regex]::Matches($markdown,'(?m)^### (?:[1-9]|1[0-2])\.[12] ').Count -ne 24){throw 'Expected twenty-four learning units'}
if(([regex]::Matches($markdown,'(?m)^```').Count % 2) -ne 0){throw 'Unbalanced Markdown fences'}
if($markdown -match '\b[A-Za-z]:[\\/]|BEGIN (?:RSA |EC )?PRIVATE KEY|github_pat_|ghp_'){throw 'Unexpected private path or credential material'}
if($markdown.Contains([char]0xFFFD)){throw 'Invalid replacement character'}
$anchors=@([regex]::Matches($markdown,'\bid="([^"]+)"') | ForEach-Object {$_.Groups[1].Value})
if(@($anchors | Select-Object -Unique).Count -ne $anchors.Count){throw 'Duplicate source IDs'}
foreach($match in [regex]::Matches($markdown,'\]\(#([^)]+)\)')){
    if($anchors -notcontains $match.Groups[1].Value){throw ('Missing source anchor: '+$match.Groups[1].Value)}
}
foreach($relative in @('assets/learning.js','assets/learning.css','assets/favicon.svg','assets/sources.json','README.md','assets/diagrams/manifest.json')){
    if(!(Test-Path -LiteralPath (Join-Path $siteRoot $relative) -PathType Leaf)){throw ('Missing resource: '+$relative)}
}
foreach($match in [regex]::Matches($markdown,'!?\[[^\]]*\]\(([^)]+)\)')){
    $target=$match.Groups[1].Value.Split('#')[0]
    if($target -and $target -notmatch '^https://'){
        $resolved=[IO.Path]::GetFullPath((Join-Path $siteRoot $target))
        if(!$resolved.StartsWith($siteRoot+'\',[StringComparison]::OrdinalIgnoreCase)){throw 'Local resource outside site'}
        if(!(Test-Path -LiteralPath $resolved -PathType Leaf)){throw ('Missing linked resource: '+$target)}
    }
}
if(!$html.Contains('/notices_can/assets/style.css') -or !$html.Contains('/notices_can/assets/app.js')){throw 'Shared template references differ'}
$sources=Read-Utf8 'assets/sources.json' | ConvertFrom-Json
if($sources.sources.Count -ne 13){throw 'Expected thirteen public primary sources'}
foreach($source in $sources.sources){
    $uri=[Uri]$source.url
    if($uri.Scheme -ne 'https' -or $uri.Host -notin @('www.nuvoton.com','docs.mcuboot.com','renesas.github.io','www.renesas.com','csrc.nist.gov','www.w3.org')){throw 'Unexpected source host'}
    if(!$markdown.Contains($source.url)){throw ('Missing public source link: '+$source.id)}
}
$graphs=[regex]::Matches($markdown,'(?ms)^```mermaid\r?\n(.*?)^```[ \t]*\r?$')
$manifest=Read-Utf8 'assets/diagrams/manifest.json' | ConvertFrom-Json
if($graphs.Count -ne 8 -or $manifest.diagrams.Count -ne 9){throw 'Expected eight Mermaid diagrams and one original SVG'}
foreach($diagram in $manifest.diagrams){
    $file=Join-Path $siteRoot ('assets/diagrams/'+$diagram.file)
    if(!(Test-Path -LiteralPath $file)){throw ('Missing SVG: '+$diagram.file)}
    if((Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash.ToLowerInvariant() -ne $diagram.sha256){throw ('SVG hash differs: '+$diagram.file)}
    [xml]$xml=Read-Utf8 ('assets/diagrams/'+$diagram.file)
    if($xml.DocumentElement.LocalName -ne 'svg'){throw 'Invalid SVG root'}
    if($diagram.kind -eq 'mermaid'){
        $text=$graphs[[int]$diagram.index].Groups[1].Value.Replace("`r`n","`n").Trim()
        if((Get-TextHash $text) -ne $diagram.sourceSha256){throw ('Mermaid projection is stale: '+$diagram.file)}
    }
}
Write-Output 'PASS:12 chapters /24 units /13 public sources /8 Mermaid and1 original SVG; UTF-8, links, anchors and projections verified.'
