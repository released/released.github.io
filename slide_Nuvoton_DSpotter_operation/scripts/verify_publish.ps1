param()
$ErrorActionPreference = 'Stop'
$siteRoot = Split-Path -Parent $PSScriptRoot
foreach ($relative in @('index.html','index.md','assets/guide.css')) {
    if (!(Test-Path -LiteralPath (Join-Path $siteRoot $relative) -PathType Leaf)) { throw ('Missing guide file: ' + $relative) }
}
$html = [IO.File]::ReadAllText((Join-Path $siteRoot 'index.html'),[Text.Encoding]::UTF8)
$markdown = [IO.File]::ReadAllText((Join-Path $siteRoot 'index.md'),[Text.Encoding]::UTF8)
if ($html -notmatch 'data-markdown="index\.md"' -or $html -notmatch 'href="/notices_can/assets/style\.css"' -or $html -notmatch 'src="/notices_can/assets/app\.js"') {
    throw 'The guide must use its Markdown source and the shared knowledge-base style/renderer.'
}
foreach ($text in @($html,$markdown)) {
    if ($text.Contains([char]0xFFFD)) { throw 'Invalid UTF-8 replacement character found.' }
    if ($text -match '(?i)\b[A-Z]:[\\/]|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}') { throw 'Absolute local path or email address found in public guide.' }
}
if (@([regex]::Matches($markdown,'(?m)^\s*```')).Count % 2) { throw 'Unbalanced Markdown fences.' }
$anchors = @{}
foreach ($match in [regex]::Matches($markdown,'<a id="([^"]+)"></a>')) {
    $id = $match.Groups[1].Value
    if ($anchors.ContainsKey($id)) { throw ('Duplicate guide anchor: ' + $id) }
    $anchors[$id] = $true
}
foreach ($match in [regex]::Matches($markdown,'\]\(#([^)]+)\)')) {
    if (!$anchors.ContainsKey($match.Groups[1].Value)) { throw ('Missing guide anchor: ' + $match.Groups[1].Value) }
}
$images = @{}
foreach ($match in [regex]::Matches($markdown,'!\[([^\]]+)\]\((img/[A-Za-z0-9_.-]+\.png)\)')) {
    $relative = $match.Groups[2].Value
    $path = Join-Path $siteRoot $relative
    if (!(Test-Path -LiteralPath $path -PathType Leaf)) { throw ('Missing guide image: ' + $relative) }
    $raw = [IO.File]::ReadAllBytes($path)
    if ($raw.Length -lt 24 -or [BitConverter]::ToString($raw[0..7]) -cne '89-50-4E-47-0D-0A-1A-0A') { throw ('Invalid PNG: ' + $relative) }
    $images[$relative] = $true
}
if (!$images.Count) { throw 'The operation guide has no screenshot references.' }
foreach ($file in Get-ChildItem -LiteralPath (Join-Path $siteRoot 'img') -File) {
    if (!$images.ContainsKey('img/' + $file.Name)) { throw ('Unreferenced guide asset: ' + $file.Name) }
}
Write-Host ('PASS: DSpotter guide uses the shared style; Markdown anchors, PNGs and public text verified (' + $images.Count + ' images).')
