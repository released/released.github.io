$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot '..\examples\sync_repositories.ps1')
$project=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$run=Join-Path $project ('.verify\sync_'+[guid]::NewGuid().ToString('N'))
Assert-SyncDirectory $project
if(Test-Path -LiteralPath $run) { throw 'Fixture must be fresh.' }
[void][IO.Directory]::CreateDirectory($run)
$owned=$run
function Write-TestFile([string]$Path,[string]$Text) { [IO.File]::WriteAllText($Path,$Text) }
function Check($Value,[string]$Name) { if(!$Value){throw $Name};Write-Host ('PASS '+$Name) }
function Reject([scriptblock]$Action,[string]$Pattern) {
    try { & $Action } catch { if($_.Exception.Message -notmatch $Pattern){throw};return }
    throw ('Expected rejection: '+$Pattern)
}
function New-Fixture([string]$Name) {
    $base=Join-Path $run $Name
    $root=Join-Path $base 'checkouts'
    $repo=Join-Path $root 'sample with spaces'
    [void][IO.Directory]::CreateDirectory($repo)
    $remote=Join-Path $base 'origin.git'
    [void](Invoke-SyncGit $base @('init','--bare','-b','main',$remote))
    [void](Invoke-SyncGit $repo @('init','-b','main'))
    [void](Invoke-SyncGit $repo @('config','user.name','Sync Fixture'))
    [void](Invoke-SyncGit $repo @('config','user.email','fixture@example.invalid'))
    Write-TestFile (Join-Path $repo '.gitignore') "private.ini`n"
    Write-TestFile (Join-Path $repo 'tracked.txt') 'initial'
    Write-TestFile (Join-Path $repo 'private.ini') 'private sentinel'
    [void](Invoke-SyncGit $repo @('add','.gitignore','tracked.txt'))
    [void](Invoke-SyncGit $repo @('commit','-m','Initial fixture'))
    [void](Invoke-SyncGit $repo @('remote','add','origin',$remote))
    [void](Invoke-SyncGit $repo @('push','-u','origin','main'))
    $writer=Join-Path $base 'remote writer'
    [void](Invoke-SyncGit $base @('clone',$remote,$writer))
    [void](Invoke-SyncGit $writer @('config','user.name','Sync Fixture'))
    [void](Invoke-SyncGit $writer @('config','user.email','fixture@example.invalid'))
    @{Root=$root;Repo=$repo;Writer=$writer}
}
function Publish-Remote($Fixture,[string]$Name,[string]$Content,[switch]$ForceAdd) {
    Write-TestFile (Join-Path $Fixture.Writer $Name) $Content
    $arguments=@('add');if($ForceAdd){$arguments+='-f'};$arguments+=@('--',$Name)
    [void](Invoke-SyncGit $Fixture.Writer $arguments)
    [void](Invoke-SyncGit $Fixture.Writer @('commit','-m','Remote fixture update'))
    [void](Invoke-SyncGit $Fixture.Writer @('push','origin','main'))
}
try {
    $f=New-Fixture 'ordinary'
    $head=(Invoke-SyncGit $f.Repo @('rev-parse','HEAD')).Text
    $index=(Get-FileHash -LiteralPath (Join-Path $f.Repo '.git/index')).Hash
    [IO.File]::SetLastWriteTimeUtc((Join-Path $f.Repo 'tracked.txt'),[DateTime]::UtcNow.AddSeconds(5))
    Invoke-RepositorySync $f.Root $false $false
    Check (((Invoke-SyncGit $f.Repo @('rev-parse','HEAD')).Text -ceq $head) -and
        ((Get-FileHash -LiteralPath (Join-Path $f.Repo '.git/index')).Hash -ceq $index) -and
        !(Test-Path -LiteralPath (Join-Path $f.Repo '.git/FETCH_HEAD'))) 'preview leaves HEAD/index and fetch state unchanged'
    Write-TestFile (Join-Path $f.Repo 'tracked.txt') 'unsaved fixture'
    Reject {Invoke-RepositorySync $f.Root $true $true} 'Local changes preserved'
    Check (([IO.File]::ReadAllText((Join-Path $f.Repo 'tracked.txt'))) -ceq 'unsaved fixture') 'dirty source survives refusal'
    Write-TestFile (Join-Path $f.Repo 'tracked.txt') 'initial'
    Publish-Remote $f 'tracked.txt' 'remote advance'
    Invoke-RepositorySync $f.Root $true $true
    Check (([IO.File]::ReadAllText((Join-Path $f.Repo 'tracked.txt'))) -ceq 'remote advance') 'clean checkout fast-forwards'
    Check (([IO.File]::ReadAllText((Join-Path $f.Repo 'private.ini'))) -ceq 'private sentinel') 'ignored private data survives fast-forward'
    Write-TestFile (Join-Path $f.Repo 'local.txt') 'local commit'
    [void](Invoke-SyncGit $f.Repo @('add','local.txt'))
    [void](Invoke-SyncGit $f.Repo @('commit','-m','Local fixture branch'))
    $local=(Invoke-SyncGit $f.Repo @('rev-parse','HEAD')).Text
    Publish-Remote $f 'remote.txt' 'separate remote change'
    Reject {Invoke-RepositorySync $f.Root $true $true} 'Diverged history preserved'
    Check ((Invoke-SyncGit $f.Repo @('rev-parse','HEAD')).Text -ceq $local) 'diverged history preserves local commit'
    $f=New-Fixture 'collision'
    $head=(Invoke-SyncGit $f.Repo @('rev-parse','HEAD')).Text
    Publish-Remote $f 'private.ini' 'remote replacement' -ForceAdd
    Reject {Invoke-RepositorySync $f.Root $true $true} 'Git merge failed'
    Check (((Invoke-SyncGit $f.Repo @('rev-parse','HEAD')).Text -ceq $head) -and
        ([IO.File]::ReadAllText((Join-Path $f.Repo 'private.ini'))) -ceq 'private sentinel') 'ignored collision preserves private file and HEAD'
    Write-Host 'PASS 6 isolated sync checks; no GitHub or user repository operations.'
} finally {
    $full=[IO.Path]::GetFullPath($run)
    if($run -cne $owned -or !$full.StartsWith($project+'\',[StringComparison]::OrdinalIgnoreCase)){throw 'Fixture cleanup escaped project'}
    Assert-SyncDirectory $run
    $files=@(Get-ChildItem -LiteralPath $run -Recurse -Force -File)
    $dirs=@(Get-ChildItem -LiteralPath $run -Recurse -Force -Directory)
    foreach($entry in @($files)+@($dirs)) { if($entry.Attributes -band [IO.FileAttributes]::ReparsePoint){throw 'Reparse fixture retained'} }
    foreach($file in $files) { Remove-Item -LiteralPath $file.FullName -Force }
    foreach($dir in @($dirs|Sort-Object {$_.FullName.Length} -Descending|ForEach-Object FullName)+@($run)) { [IO.Directory]::Delete($dir,$false) }
    Write-Host ('RETIRED owned sync fixture; absent='+!(Test-Path -LiteralPath $run))
}
