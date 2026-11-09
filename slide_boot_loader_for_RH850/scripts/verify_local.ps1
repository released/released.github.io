param([string]$ToolRoot='')
$ErrorActionPreference='Stop'
$root=Split-Path -Parent $PSScriptRoot
$web=Split-Path -Parent $root
$map=Get-Content -LiteralPath (Join-Path $root 'guide-map.json') -Raw -Encoding UTF8|ConvertFrom-Json
$checked=0
foreach($page in $map.pages.PSObject.Properties.Name){
    if($page -notmatch '^[a-z0-9-]+$'){throw 'Invalid chapter filename.'}
    foreach($extension in @('md','html')){
        $path=Join-Path $root ($page+'.'+$extension)
        $text=[IO.File]::ReadAllText($path)
        if($text -match '(?<![A-Za-z])[A-Za-z]:[\\/]|_Avery|SourceCode|[\uE000-\uF8FF\uFFFD]'){throw ('Private path/invalid glyph: '+$page)}
        if($extension -eq 'md'){
            if([regex]::Matches($text,'(?m)^# ').Count -ne 1 -or [regex]::Matches($text,'(?m)^```').Count%2){throw 'Invalid Markdown structure.'}
            $ids=@([regex]::Matches($text,'<a id="([^"]+)"></a>')|ForEach-Object {$_.Groups[1].Value})
            if(@($ids|Group-Object|Where-Object Count -gt 1).Count){throw 'Duplicate chapter anchor.'}
        }
        $refs=@([regex]::Matches($text,'\]\(([^\s)]+)\)|(?:src|href)="([^"]+)"')|ForEach-Object {
            if($_.Groups[1].Success){$_.Groups[1].Value}else{$_.Groups[2].Value}
        })
        foreach($reference in $refs){
            if($reference -match '^mailto:'){continue}
            $baseUri=[uri]('https://released.github.io/slide_boot_loader_for_RH850/'+$page+'.html')
            $url=[uri]::new($baseUri,$reference)
            if($url.Host -ne 'released.github.io'){continue}
            if($url.Fragment){
                $parts=$url.AbsolutePath.Trim('/').Split('/')
                $mapFile=Join-Path $web ($parts[0]+'\guide-map.json')
                if(Test-Path -LiteralPath $mapFile){
                    $targetMap=Get-Content -LiteralPath $mapFile -Raw -Encoding UTF8|ConvertFrom-Json
                    $id=[uri]::UnescapeDataString($url.Fragment.TrimStart('#'))
                    if($id -ne 'article_top'){
                        $entry=$targetMap.aliases.PSObject.Properties[$id]
                        if(!$entry){throw ('Unknown cross-chapter anchor: '+$reference)}
                        # Fragment-only legacy links are resolved by guide-routes.js.
                        # Explicit chapter links must already name the owning page.
                        if(!$reference.StartsWith('#') -and $parts.Count -gt 1 -and $parts[1] -ne 'index.html' -and $entry.Value.page -ne $parts[1]){throw ('Anchor belongs to another chapter: '+$reference)}
                    }
                }
            }
            if($reference -match '^(https?:|#)'){continue}
            $relative=$reference.Split('#')[0]
            $target=if($relative.StartsWith('/')){Join-Path $web $relative.TrimStart('/')}else{Join-Path $root $relative}
            if(!(Test-Path -LiteralPath $target)){throw ('Missing chapter resource: '+$reference)}
            $checked++
        }
    }
}
$metadata=Get-Content -LiteralPath (Join-Path $root 'data\rh850_image_example.json') -Raw -Encoding UTF8|ConvertFrom-Json
$reference=[IO.File]::ReadAllText((Join-Path $root 'reference.md'))
for($i=0;$i -lt 256;$i++){
    $row='| 0x{0:X2} | 0x{1:X8} | {2} |' -f $i,(0x10100+$i),$metadata.metadata_hex.Substring($i*2,2)
    if(!$reference.Contains($row)){throw ('Metadata byte/address row mismatch: '+$i)}
}
foreach($file in Get-ChildItem -LiteralPath (Join-Path $root data) -Filter 'update_*.json' -File){
    $report=Get-Content -LiteralPath $file.FullName -Raw -Encoding UTF8|ConvertFrom-Json
    if($report.source_report -cne $file.Name -or $report.input_bytes -le 0 -or $report.elapsed_ms -le 0 -or $report.app_confirmation -cne 'PASS'){throw 'Invalid timing provenance.'}
    if($report.source_sha256 -notmatch '^[0-9A-F]{64}$'){throw 'Missing source report hash.'}
}
if($ToolRoot){
    & (Join-Path $ToolRoot 'scripts\sync_rh850_device.ps1') -WebRoot $web -CheckOnly
    & node (Join-Path $ToolRoot 'scripts\verify_web_guide_layout.mjs') $web
    if($LASTEXITCODE -ne 0){throw 'Cross-guide route check failed.'}
}
Write-Host ('PASS RH850 '+@($map.pages.PSObject.Properties).Count+' pages / '+$checked+' resources / 256 Metadata byte rows / report provenance.')
