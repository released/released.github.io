[CmdletBinding()]
param([string]$Root=$PSScriptRoot,[switch]$Apply,[switch]$Yes)

$ErrorActionPreference='Stop'
function Invoke-SyncGit([string]$Path,[string[]]$Arguments,[int[]]$Allowed=@(0)) {
    foreach($name in @('GIT_DIR','GIT_WORK_TREE','GIT_COMMON_DIR','GIT_INDEX_FILE','GIT_OBJECT_DIRECTORY','GIT_ALTERNATE_OBJECT_DIRECTORIES','GIT_NAMESPACE','GIT_CONFIG_PARAMETERS')) {
        if([Environment]::GetEnvironmentVariable($name)) { throw "Git environment override refused: $name" }
    }
    if($env:GIT_CONFIG_COUNT -and $env:GIT_CONFIG_COUNT -ne '0') { throw 'Git environment override refused: GIT_CONFIG_COUNT' }
    $old=$ErrorActionPreference
    try {
        $ErrorActionPreference='Continue'
        $output=@(& git --no-optional-locks --literal-pathspecs -C $Path @Arguments 2>&1)
        $code=$LASTEXITCODE
    } finally { $ErrorActionPreference=$old }
    if($code -notin $Allowed) { throw ('Git '+$Arguments[0]+' failed: '+($output -join "`n")) }
    @{Code=$code;Text=($output -join "`n").TrimEnd()}
}
function Assert-SyncDirectory([string]$Path) {
    $item=Get-Item -LiteralPath $Path -Force
    if(!$item.PSIsContainer -or ($item.Attributes -band [IO.FileAttributes]::ReparsePoint)) { throw "Linked/non-directory path refused: $Path" }
    $ancestor=Split-Path -Parent $item.FullName
    while($ancestor) {
        if((Get-Item -LiteralPath $ancestor -Force).Attributes -band [IO.FileAttributes]::ReparsePoint) { throw "Linked ancestor refused: $Path" }
        $ancestor=Split-Path -Parent $ancestor
    }
}
function Get-SyncState([string]$Path) {
    Assert-SyncDirectory $Path
    Assert-SyncDirectory (Join-Path $Path '.git')
    if(Test-Path -LiteralPath (Join-Path $Path '.git/commondir')) { throw "Shared Git directory requires separate review: $Path" }
    if((Invoke-SyncGit $Path @('rev-parse','--show-toplevel')).Text.Replace('/','\').TrimEnd('\') -ine $Path.TrimEnd('\')) { throw "Repository root mismatch: $Path" }
    if((Invoke-SyncGit $Path @('status','--porcelain=v1','--untracked-files=all')).Text) { throw "Local changes preserved; synchronization stopped: $Path" }
    foreach($name in @('index.lock','MERGE_HEAD','CHERRY_PICK_HEAD','REVERT_HEAD','rebase-merge','rebase-apply')) {
        if(Test-Path -LiteralPath (Join-Path $Path ('.git/'+$name))) { throw "Active Git operation preserved: $Path / $name" }
    }
    $branch=(Invoke-SyncGit $Path @('symbolic-ref','--short','HEAD')).Text
    $remote=(Invoke-SyncGit $Path @('config','--get',('branch.'+$branch+'.remote'))).Text
    $ref=(Invoke-SyncGit $Path @('config','--get',('branch.'+$branch+'.merge'))).Text
    if($remote -cne 'origin' -or $ref -notmatch '^refs/heads/.+') { throw "An explicit origin upstream branch is required: $Path" }
    $url=(Invoke-SyncGit $Path @('remote','get-url','--all','origin')).Text
    if($url -match "[\r\n]|::" -or $url -match '^https?://[^/]*@') { throw 'Multiple, indirect or credential-bearing remotes require separate review.' }
    @{Path=$Path;Branch=$branch;Ref=$ref;Url=$url;Head=(Invoke-SyncGit $Path @('rev-parse','HEAD')).Text}
}
function Invoke-RepositorySync([string]$SelectedRoot,[bool]$Execute,[bool]$Confirmed) {
    $absolute=[IO.Path]::GetFullPath($SelectedRoot)
    if($absolute.TrimEnd('\') -ieq [IO.Path]::GetPathRoot($absolute).TrimEnd('\')) { throw 'Select a checkout workspace directory, not a volume root.' }
    $base=$absolute.TrimEnd('\')
    Assert-SyncDirectory $base
    $roots=New-Object 'Collections.Generic.List[string]'
    if(Test-Path -LiteralPath (Join-Path $base '.git')) { $roots.Add($base) }
    else {
        foreach($child in Get-ChildItem -LiteralPath $base -Directory -Force) {
            Assert-SyncDirectory $child.FullName
            if(Test-Path -LiteralPath (Join-Path $child.FullName '.git')) { $roots.Add($child.FullName); continue }
            foreach($nested in Get-ChildItem -LiteralPath $child.FullName -Directory -Force) {
                Assert-SyncDirectory $nested.FullName
                if(Test-Path -LiteralPath (Join-Path $nested.FullName '.git')) { $roots.Add($nested.FullName) }
            }
        }
    }
    if(!$roots.Count) { throw 'No dedicated Git repositories in the selected two-level scope.' }
    $plans=@(foreach($path in $roots) { Get-SyncState $path })
    foreach($p in $plans) { Write-Host ($p.Path+' ['+$p.Branch+'] <- '+$p.Url+' / '+$p.Ref) }
    if(!$Execute) { Write-Host 'PREVIEW PASS; no fetch or working-tree changes.'; return }
    if(!$Confirmed -and (Read-Host 'Type SYNC to fetch and fast-forward the displayed repositories') -cne 'SYNC') { Write-Host 'Canceled.'; return }
    foreach($p in $plans) {
        [void](Invoke-SyncGit $p.Path @('fetch','--no-tags','origin',$p.Ref))
        $p.RemoteHead=(Invoke-SyncGit $p.Path @('rev-parse','FETCH_HEAD')).Text
        $behind=(Invoke-SyncGit $p.Path @('merge-base','--is-ancestor',$p.Head,$p.RemoteHead) @(0,1)).Code -eq 0
        $ahead=(Invoke-SyncGit $p.Path @('merge-base','--is-ancestor',$p.RemoteHead,$p.Head) @(0,1)).Code -eq 0
        if(!$behind -and !$ahead) { throw "Diverged history preserved: $($p.Path)" }
        $p.Advance=$behind -and ($p.Head -cne $p.RemoteHead)
    }
    foreach($p in $plans) {
        $now=Get-SyncState $p.Path
        foreach($field in @('Branch','Ref','Url','Head')) {
            if($now[$field] -cne $p[$field]) { throw "Repository changed during review: $($p.Path)" }
        }
    }
    foreach($p in $plans) {
        $now=Get-SyncState $p.Path
        if($now.Head -cne $p.Head) { throw "Concurrent update preserved: $($p.Path)" }
        if($p.Advance) {
            [void](Invoke-SyncGit $p.Path @('merge','--ff-only','--no-autostash','--no-overwrite-ignore',$p.RemoteHead))
            if((Invoke-SyncGit $p.Path @('rev-parse','HEAD')).Text -cne $p.RemoteHead) { throw 'Fast-forward SHA verification failed.' }
        }
        Write-Host ('SYNC VERIFIED '+$p.Path+' '+(Invoke-SyncGit $p.Path @('rev-parse','HEAD')).Text)
    }
}
if($MyInvocation.InvocationName -ne '.') {
    try { Invoke-RepositorySync $Root ([bool]$Apply) ([bool]$Yes) }
    catch { Write-Error $_; exit 1 }
}
