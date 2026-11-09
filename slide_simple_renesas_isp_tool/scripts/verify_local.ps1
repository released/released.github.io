param([string]$PreviewBase = '', [string]$ToolRoot = '')
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$webRoot = Split-Path -Parent $projectRoot
$guideMaps=@{}
$guideReaderPages=@()
foreach($folder in @('slide_simple_renesas_isp_tool','slide_boot_loader_for_RL78','slide_boot_loader_for_RH850')){
    $map=Get-Content -LiteralPath (Join-Path $webRoot ($folder+'\guide-map.json')) -Raw -Encoding UTF8 | ConvertFrom-Json
    $guideMaps[$folder]=$map
    foreach($page in $map.pages.PSObject.Properties.Name){$guideReaderPages+=($folder+'\'+$page+'.md')}
}
$sources = @((Join-Path $projectRoot 'index.md'),
    (Join-Path $projectRoot 'SCREENSHOT_CHECKLIST.md'),
    (Join-Path $projectRoot 'index.html'),
    (Join-Path $webRoot 'slide_boot_loader_for_RL78\index.md'),
    (Join-Path $webRoot 'slide_boot_loader_for_RL78\basic_uart_i2c\index.md'),
    (Join-Path $webRoot 'slide_boot_loader_for_RL78\basic_uart_i2c\index.html'),
    (Join-Path $webRoot 'README.md'),
    (Join-Path $webRoot 'README.html'))
$sources+=@($guideReaderPages | ForEach-Object{Join-Path $webRoot $_})
$sources+=@($guideReaderPages | ForEach-Object{Join-Path $webRoot ([IO.Path]::ChangeExtension($_,'html'))})
$sources=@($sources | Select-Object -Unique)
$checked = 0
foreach ($source in $sources) {
    $text = Get-Content -LiteralPath $source -Raw -Encoding UTF8
    if ($text -match '[\uE000-\uF8FF\uFFFD]') { throw "Invalid glyph in public source: $source" }
    if ($source.EndsWith('.md') -and ([regex]::Matches($text, '(?m)^```').Count % 2) -ne 0) {
        throw "Unbalanced fences: $source"
    }
    $refs = @([regex]::Matches($text, '\]\(([^)]+)\)') | ForEach-Object { $_.Groups[1].Value.Split(' ')[0] })
    $refs += @([regex]::Matches($text, '(?:src|href)="([^"]+)"') | ForEach-Object { $_.Groups[1].Value })
    foreach ($reference in $refs) {
        if ($reference -match '^(https?:|mailto:|#)') { continue }
        $relative = $reference.Split('#')[0]
        if ($relative.StartsWith('/')) {
            $resolved = Join-Path $webRoot $relative.TrimStart('/')
        } else { $resolved = Join-Path (Split-Path -Parent $source) $relative }
        if (-not (Test-Path -LiteralPath $resolved)) { throw "Missing local reference $reference in $source" }
        $checked++
    }
}
Write-Host "PASS: $checked local image/page/resource references; Markdown fences balanced."
$readerPages = $guideReaderPages+@('slide_boot_loader_for_RL78\basic_uart_i2c\index.md')
foreach ($page in $readerPages) {
    $pageText = [IO.File]::ReadAllText((Join-Path $webRoot $page))
    $prose = [regex]::Replace($pageText, '(?ms)^```[^\r\n]*\r?\n.*?^```[ \t]*\r?$', '')
    $ids = @([regex]::Matches($prose, '<a id="([^"]+)"></a>') | ForEach-Object { $_.Groups[1].Value })
    $duplicates = @($ids | Group-Object | Where-Object Count -gt 1)
    if ($duplicates.Count) { throw "Duplicate explicit anchors in ${page}: $($duplicates.Name -join ', ')" }
    if ([regex]::Matches($prose, '(?m)^# ').Count -ne 1) { throw "Expected one page title: $page" }
}
Write-Host 'PASS: unique explicit anchors and one page title per reader page.'
$navigation = Get-Content -LiteralPath (Join-Path $webRoot 'README.md') -Raw -Encoding UTF8
$ispEntry = [regex]::Match($navigation, '(?m)^\| \[Simple Renesas ISP Tool\]\(https://released\.github\.io/slide_simple_renesas_isp_tool/[^\r\n]*')
if (-not $ispEntry.Success) { throw 'Missing linked Simple Renesas ISP Tool navigation entry.' }
if ($ispEntry.Value -match '(\d+\.\d+\.\d+|Tool\d{4}|\u5de5\u7a0b\u7b2c\u4e00\u7248|19244|10963|301\u5340\u584a)') {
    throw 'Navigation must describe functions, not pin a release or benchmark.'
}
foreach ($page in ($guideReaderPages+@(
        'slide_boot_loader_for_RL78\basic_uart_i2c\index.md',
        'slide_simple_renesas_isp_tool\README.md', 'slide_boot_loader_for_RL78\README.md',
        'README.md', 'README.html'))) {
    $pageText = Get-Content -LiteralPath (Join-Path $webRoot $page) -Raw -Encoding UTF8
    # ASCII escapes keep Windows PowerShell 5 source decoding unambiguous.
    $draftPattern = '(\u5c1a\u672a\u767c\u5e03|\u672a\u767c\u5e03|\u5c1a\u672a\u516c\u958b\u767c\u5e03|\u672c\u6a5f\u7a3f|\u672c\u6a5f\u7de8\u8f2f\u7a3f|\u672c\u6a5f\u88fd\u4f5c\u7a3f|\u5de5\u7a0b\u7b2c\u4e00\u7248)'
    if ($pageText -match $draftPattern) {
        throw "Draft/release milestone wording in public guide: $page"
    }
    if ($pageText -match '(_Avery|(?<![A-Za-z])[A-Za-z]:[\\/]|\.\./\.\./python|SourceCode)') {
        throw "Private workspace path in public guide: $page"
    }
}
Write-Host 'PASS: linked evergreen navigation and no draft/release milestone labels.'
$ispText = ($guideReaderPages | Where-Object { $_.StartsWith('slide_simple_renesas_isp_tool\') } |
    ForEach-Object { [IO.File]::ReadAllText((Join-Path $webRoot $_)) }) -join "`n"
$bootText = ($guideReaderPages | Where-Object { $_.StartsWith('slide_boot_loader_for_RL78\') } |
    ForEach-Object { [IO.File]::ReadAllText((Join-Path $webRoot $_)) }) -join "`n"
$resourcePattern = '(?s)<!-- PUBLIC_RESOURCES_BEGIN -->.*?<!-- PUBLIC_RESOURCES_END -->'
$ispBlocks = [regex]::Matches($ispText, $resourcePattern)
$bootBlocks = [regex]::Matches($bootText, $resourcePattern)
if ($ispBlocks.Count -ne 1 -or $bootBlocks.Count -ne 1 -or
    -not $bootBlocks[0].Value.Contains('https://released.github.io/slide_simple_renesas_isp_tool/downloads.html#downloads') -or
    $bootBlocks[0].Value.Contains('raw.githubusercontent')) {
    throw 'Expected full downloads on ISP and a navigation link on Bootloader.'
}
foreach ($anchor in @('tool-bridge-flow','tool-operation','custom-transfer','host-bridge-firmware','f13-device-update','mcu-can-device')) {
    if ($anchor -ne 'article_top' -and [regex]::Matches($ispText, '<a id="' + $anchor + '"></a>').Count -ne 1) {
        throw "Missing/duplicate public workflow anchor: $anchor"
    }
}
foreach ($anchor in @('boot-app-porting','f13-boot-decision','f24-can-device','device-metadata-vector-workshop','device-app-irq','device-app-build')) {
    if ([regex]::Matches($bootText, '<a id="' + $anchor + '"></a>').Count -ne 1) {
        throw "Missing/duplicate device anchor: $anchor"
    }
}
$pages = @{'slide_simple_renesas_isp_tool'=$ispText;'slide_boot_loader_for_RL78'=$bootText}
$homeHtml=[IO.File]::ReadAllText((Join-Path $webRoot 'README.html'))
foreach ($text in (@($pages.Values)+@($navigation,$homeHtml))) {
    foreach ($match in [regex]::Matches($text,'https://released\.github\.io/((?:slide_simple_renesas_isp_tool|slide_boot_loader_for_RL78))/#([A-Za-z0-9_-]+)')) {
        $site=$match.Groups[1].Value
        $anchor=$match.Groups[2].Value
        if ($anchor -ne 'article_top' -and [regex]::Matches($pages[$site],'<a id="'+[regex]::Escape($anchor)+'"></a>').Count -ne 1) {
            throw "Broken/duplicate cross-page anchor: $site / $anchor"
        }
    }
}
foreach ($download in @('simple_renesas_isp_tool/main/build/FirmwareUpgradeTool.exe',
    'simple_renesas_isp_tool/main/firmware/RL78_F24_Bridge_boot/DefaultBuild/RL78_F24_Bridge_boot.mot',
    'simple_renesas_isp_tool/main/firmware/RL78_F24_Bridge_app/DefaultBuild/RL78_F24_Bridge_app_bridge_update.bin',
    'simple_renesas_isp_tool/main/firmware/RL78_F24_Bridge_app/DefaultBuild/RL78_F24_Bridge_app_flash.mot',
    'RL78_F13_Boot_loader_CAN/main/DefaultBuild/boot0000_1FFF.hex',
    'RL78_F13_Boot_loader_CAN_app/main/boot_app.hex',
    'RL78_F13_Boot_loader_CAN_app/main/DefaultBuild/RL78_F13_Boot_loader_CAN_app_update.bin')) {
    if (-not $ispBlocks[0].Value.Contains('https://raw.githubusercontent.com/released/' + $download)) {
        throw "Missing public download: $download"
    }
}
Write-Host 'PASS: workflow anchors, seven downloads and single-owner resource navigation.'
foreach ($entry in @('slide_boot_loader_for_RL78/#can-fd-device-engineering',
        'slide_simple_renesas_isp_tool/#can-fd-update',
        'slide_simple_renesas_isp_tool/#can-fd-custom-transfer')) {
    if (-not $ispBlocks[0].Value.Contains('https://released.github.io/' + $entry)) {
        throw "Missing CAN FD entry in downloads/operation overview: $entry"
    }
}
Write-Host 'PASS: downloads/operation overview includes all three CAN FD entry links.'
function Assert-TransferExampleNavigation([string]$Text) {
    $blocks=[regex]::Matches($Text,'(?s)<!-- TRANSFER_EXAMPLES_BEGIN -->.*?<!-- TRANSFER_EXAMPLES_END -->')
    if($blocks.Count -ne 1){throw 'Expected one Custom Transfer example block.'}
    foreach($transferExample in @(
        @{Project='RL78_F13_CAN_Transfer';Mode='F13 Classical CAN';Anchor='f13-transfer-example'},
        @{Project='RL78_F24_CAN_Transfer';Mode='F24 Classical CAN';Anchor='f24-custom-transfer-example'},
        @{Project='RL78_F24_CAN_FD_Transfer';Mode='F24 CAN FD';Anchor='can-fd-custom-transfer'})) {
        $rows=[regex]::Matches($blocks[0].Value,'(?m)^\|[^\r\n]*https://github\.com/released/'+
            [regex]::Escape($transferExample.Project)+'\)[^\r\n]*\r?$')
        $operation='https://released.github.io/slide_simple_renesas_isp_tool/#'+$transferExample.Anchor
        if($rows.Count -ne 1 -or !$rows[0].Value.Contains($transferExample.Mode) -or
                !$rows[0].Value.Contains($operation)) {
            throw "Missing/mismatched Custom Transfer example row: $($transferExample.Project)"
        }
    }
}
Assert-TransferExampleNavigation $ispText
Write-Host 'PASS: Custom Transfer section has three MCU/mode categories, source URLs and operation links.'
function Assert-DeviceModeNavigation([string]$Text) {
    $blocks=[regex]::Matches($Text,'(?s)<!-- DEVICE_MODE_NAV_BEGIN -->.*?<!-- DEVICE_MODE_NAV_END -->')
    if($blocks.Count -ne 1){throw 'Expected one Bootloader device mode navigation block.'}
    foreach($deviceMode in @(
        @{Label='Classical CAN';Tokens=@('F13','F24');Links=@('#f13-boot-decision',
            '#f24-can-device','/#f13-device-update')},
        @{Label='CAN FD';Tokens=@('F24');Links=@('#can-fd-device-engineering','/#can-fd-update')},
        @{Label='Custom Transfer';Tokens=@('F13','F24','Classical CAN','CAN FD');Links=@('/#custom-transfer')})) {
        $rows=[regex]::Matches($blocks[0].Value,'(?m)^\| '+[regex]::Escape($deviceMode.Label)+'[^\r\n]*\r?$')
        if($rows.Count -ne 1){throw "Missing Bootloader mode row: $($deviceMode.Label)"}
        foreach($link in $deviceMode.Links){
            if(!$rows[0].Value.Contains($link+')')){
                throw "Missing Bootloader mode link: $($deviceMode.Label) / $link"
            }
        }
        foreach($token in $deviceMode.Tokens){
            if(!$rows[0].Value.Contains($token)){throw "Missing Bootloader device/mode: $token"}
        }
    }
}
Assert-DeviceModeNavigation $bootText
Write-Host 'PASS: Bootloader overview groups Classical F13/F24 and CAN FD F24 with engineering/update/Transfer links.'
function Assert-CanEntryCategories([string]$Text,[string]$Marker,[switch]$Html) {
    $pattern='(?s)<!-- '+[regex]::Escape($Marker)+'_BEGIN -->.*?<!-- '+[regex]::Escape($Marker)+'_END -->'
    $blocks=[regex]::Matches($Text,$pattern)
    if($blocks.Count -ne 1){throw "Expected one entry category block: $Marker"}
    foreach($category in @(
        @{Label='Classical CAN';Tokens=@('F13','F24');Target='#f13-device-update'},
        @{Label='CAN FD';Tokens=@('F24');Target='#can-fd-update'},
        @{Label='Custom Transfer';Tokens=@('F13','F24','Classical CAN','CAN FD');Target='#custom-transfer'})) {
        if($Html){$rowPattern='(?s)<tr>\s*<td>'+[regex]::Escape($category.Label)+'.*?</tr>'}
        else{$rowPattern='(?m)^\| '+[regex]::Escape($category.Label)+'[^\r\n]*\r?$'}
        $rows=[regex]::Matches($blocks[0].Value,$rowPattern)
        if($rows.Count -ne 1 -or !$rows[0].Value.Contains($category.Target)){
            throw "Missing/mismatched entry category: $Marker / $($category.Label)"
        }
        foreach($token in $category.Tokens){
            if(!$rows[0].Value.Contains($token)){throw "Missing entry device/mode: $Marker / $token"}
        }
    }
}
Assert-CanEntryCategories $ispText 'ISP_MODE_NAV'
Assert-CanEntryCategories $navigation 'RL78_CAN_ENTRY'
Assert-CanEntryCategories $homeHtml 'RL78_CAN_ENTRY' -Html
$homeMarkdownBlock=[regex]::Match($navigation,'(?s)<!-- RL78_CAN_ENTRY_BEGIN -->.*?<!-- RL78_CAN_ENTRY_END -->').Value
$homeHtmlBlock=[regex]::Match($homeHtml,'(?s)<!-- RL78_CAN_ENTRY_BEGIN -->.*?<!-- RL78_CAN_ENTRY_END -->').Value
$homeMarkdownLinks=@([regex]::Matches($homeMarkdownBlock,'\]\(([^)]+)\)') | ForEach-Object{$_.Groups[1].Value} | Sort-Object)
$homeHtmlLinks=@([regex]::Matches($homeHtmlBlock,'href="([^"]+)"') | ForEach-Object{$_.Groups[1].Value} | Sort-Object)
if(($homeMarkdownLinks -join "`n") -cne ($homeHtmlLinks -join "`n")){
    throw 'Knowledge-base Markdown/HTML category links differ.'
}
Write-Host 'PASS: ISP and knowledge-base MD/HTML entry categories and mirrored links; all homepage target anchors valid.'
$flashPattern = '(?s)<!-- FLASH_REFERENCE_BEGIN -->.*?<!-- FLASH_REFERENCE_END -->'
$flashBlocks = [regex]::Matches($bootText, $flashPattern)
if ($flashBlocks.Count -ne 1 -or
    [regex]::Matches($bootText, '<a id="flash-metadata-can-reference"></a>').Count -ne 1 -or
    -not $ispText.Contains('https://released.github.io/slide_boot_loader_for_RL78/#flash-metadata-can-reference') -or
    [regex]::Matches($flashBlocks[0].Value, '(?m)^\| 0x[0-9A-F]{2} \| 0x[0-9A-F]{5} \| [0-9A-F]{2} \|').Count -ne 256) {
    throw 'Missing/incomplete Flash reference anchor or 256 byte-address rows.'
}
Write-Host 'PASS: linked Flash/metadata/CAN reference and all256 byte-address rows.'
$walkPattern = '(?s)<!-- CAN_WALKTHROUGH_BEGIN -->.*?<!-- CAN_WALKTHROUGH_END -->'
$walkBlocks = [regex]::Matches($ispText, $walkPattern)
if ($walkBlocks.Count -ne 1 -or
    [regex]::Matches($ispText, '<a id="can-update-walkthrough"></a>').Count -ne 1 -or
    [regex]::Matches($walkBlocks[0].Value, '(?m)^```mermaid').Count -ne 9 -or
    [regex]::Matches($walkBlocks[0].Value, '(?m)^\|(?: --- \|){3,5}\r?$').Count -ne 15 -or
    $bootText -notmatch '(https://released\.github\.io/|\.\./)slide_simple_renesas_isp_tool/can-protocol\.html') {
    throw 'Missing/incomplete cross-layer CAN tutorial, tables, flows or navigation.'
}
Write-Host 'PASS: cross-layer CAN tutorial with15 tables/9 Mermaid diagrams and linked navigation.'
if ($ToolRoot) {
    $identity = Get-Content -LiteralPath (Join-Path $ToolRoot 'src\build_info.generated.h') -Raw -Encoding UTF8
    $guide = $ispText
    if ($identity -notmatch 'FIRMWARE_UPGRADE_TOOL_VERSION' -or $guide -notmatch 'FirmwareUpgradeTool') {
        throw 'Tool/web product identity missing.'
    }
    Write-Host 'PASS: Tool/web product identity; public guide intentionally has no build-version pin.'
    & (Join-Path $ToolRoot 'scripts\sync_public_content_guidelines.ps1') -WebRoot $webRoot -CheckOnly
    & (Join-Path $ToolRoot 'scripts\verify_public_content.ps1') -WebRoot $webRoot
    & node (Join-Path $ToolRoot 'scripts\verify_web_guide_layout.mjs') $webRoot
    if($LASTEXITCODE){throw 'Guide chapter/legacy-route checks failed.'}
}
if ($PreviewBase) {
    $routes = @('/slide_simple_renesas_isp_tool/', '/slide_simple_renesas_isp_tool/index.md',
        '/slide_simple_renesas_isp_tool/img/benchmark_pcan.jpg',
        '/slide_simple_renesas_isp_tool/img/benchmark_mcu_log.jpg',
        '/slide_boot_loader_for_RL78/', '/slide_boot_loader_for_RL78/basic_uart_i2c/',
        '/slide_boot_loader_for_RL78/basic_uart_i2c/index.md',
        '/README.html', '/notices_can/assets/style.css', '/notices_can/assets/app.js')
    foreach($reader in $guideReaderPages){
        $routes+=('/'+$reader.Replace('\','/'))
        $routes+=('/'+[IO.Path]::ChangeExtension($reader,'html').Replace('\','/'))
    }
    $routes=@($routes | Select-Object -Unique)
    foreach ($route in $routes) {
        $response = Invoke-WebRequest -UseBasicParsing ($PreviewBase.TrimEnd('/') + $route)
        if ($response.StatusCode -ne 200) { throw "HTTP failure: $route" }
    }
    Write-Host "PASS: $($routes.Count) local preview HTTP routes. Browser/DPI checks are separate, NOT RUN."
}
