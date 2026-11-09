param([string[]]$Project=@(), [switch]$CheckOnly, [string]$DecisionHubRoot='')
$ErrorActionPreference='Stop'
$root=Split-Path -Parent $PSScriptRoot
$name='PUBLIC_CONTENT_GUIDELINES_zh-TW.md'
if(!$DecisionHubRoot) { $DecisionHubRoot=[IO.Path]::GetFullPath((Join-Path $root '..\..\..\python\#READ_ME_FIRST#')) }
$canonical=Join-Path $DecisionHubRoot ('rules\'+$name)
if(!(Test-Path -LiteralPath $canonical -PathType Leaf)) { throw 'Decision-center public-content source is unavailable; specify -DecisionHubRoot.' }
$source=[IO.File]::ReadAllText($canonical)
$rootCopy=Join-Path $root $name
$priorSource=[IO.File]::ReadAllText($rootCopy)
$statePath=Join-Path $root '.public-guidelines.local.json'
function Text-Hash([string]$Text) {
    $sha=[Security.Cryptography.SHA256]::Create()
    try { return ([BitConverter]::ToString($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($Text.Replace("`r`n","`n"))))).Replace('-','').ToLowerInvariant() }
    finally { $sha.Dispose() }
}
function Assert-ProjectionPath([string]$Path) {
    $full=[IO.Path]::GetFullPath($Path)
    if(!$full.StartsWith([IO.Path]::GetFullPath($root).TrimEnd('\')+'\',[StringComparison]::OrdinalIgnoreCase)) { throw 'Projection path escaped web root.' }
    $cursor=$full
    while($cursor) {
        if((Test-Path -LiteralPath $cursor) -and ((Get-Item -LiteralPath $cursor -Force).Attributes -band [IO.FileAttributes]::ReparsePoint)) { throw 'Projection reparse path refused.' }
        $cursor=[IO.Path]::GetDirectoryName($cursor)
    }
}
$sourceHash=Text-Hash $source
$priorHash=Text-Hash $priorSource
$priorState=$null
if(Test-Path -LiteralPath $statePath) { $priorState=[IO.File]::ReadAllText($statePath)|ConvertFrom-Json }
if($priorHash -cne $sourceHash -and (!$priorState -or $priorState.source_hash -cne $priorHash)) { throw 'Unmanaged web-root guideline edits preserved; reconcile them with the center first.' }
$legacyPrefix="<!-- Generated from /web/$name. Edit the common root source, not this copy. -->`n"
$prefix="<!-- Generated from decision-center rules/$name through /web. Edit the center source, not this copy. -->`n"
$expected=$prefix+$source
$priorExpected=$prefix+$priorSource
$legacyExpected=$legacyPrefix+$priorSource
if(!$Project.Count) {
    $Project=@(Get-ChildItem -LiteralPath $root -Directory | Where-Object {
        $entry=Join-Path $_.FullName 'AGENTS.md'
        (Test-Path -LiteralPath (Join-Path $_.FullName $name)) -or
        ((Test-Path -LiteralPath $entry) -and [IO.File]::ReadAllText($entry).Contains($name))
    } | ForEach-Object Name)
}
$updates=@()
Assert-ProjectionPath $rootCopy
Assert-ProjectionPath $statePath
if($CheckOnly -and $priorHash -cne $sourceHash) { throw 'Web-root guideline copy differs from the canonical decision center.' }
if(!$CheckOnly -and $priorSource -cne $source) { $updates+=@{Path=$rootCopy;Text=$source} }
foreach($folder in $Project) {
    if($folder -notmatch '^[A-Za-z0-9_.-]+$' -or $folder -in @('.','..')) { throw "Expected direct site folder: $folder" }
    $directory=Join-Path $root $folder
    if(!(Test-Path -LiteralPath $directory -PathType Container)) { throw "Missing site: $folder" }
    $target=Join-Path $directory $name
    Assert-ProjectionPath $target
    if($CheckOnly) {
        if(!(Test-Path -LiteralPath $target) -or [IO.File]::ReadAllText($target).Replace("`r`n","`n") -cne $expected.Replace("`r`n","`n")) {
            throw "Common guidelines differ: $folder"
        }
    } else {
        if(Test-Path -LiteralPath $target) {
            $current=[IO.File]::ReadAllText($target).Replace("`r`n","`n")
            if($current -cne $expected.Replace("`r`n","`n") -and $current -cne $priorExpected.Replace("`r`n","`n") -and $current -cne $legacyExpected.Replace("`r`n","`n")) { throw "Unmanaged site guideline edits preserved: $folder" }
        }
        $updates+=@{Path=$target;Text=$expected}
    }
}
if(!$CheckOnly) {
    $previousHash=if($priorHash -cne $sourceHash){$priorHash}elseif($priorState -and $priorState.PSObject.Properties.Name -contains 'previous_source_hash'){$priorState.previous_source_hash}else{$priorHash}
    $state=@{schema=1;source_hash=$sourceHash;previous_source_hash=$previousHash}
    [IO.File]::WriteAllText($statePath,(($state|ConvertTo-Json)+"`n"),(New-Object Text.UTF8Encoding($false)))
}
foreach($update in $updates) {
    if(!(Test-Path -LiteralPath $update.Path) -or [IO.File]::ReadAllText($update.Path) -cne $update.Text) {
        [IO.File]::WriteAllText($update.Path,$update.Text,(New-Object Text.UTF8Encoding($false)))
    }
}
Write-Host "PASS: common /web guidelines for $($Project.Count) opted-in site(s)."
