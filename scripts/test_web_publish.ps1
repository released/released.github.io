param([string]$ScratchRoot=$env:TEMP,[switch]$HookOnly,[switch]$LocalRecordOnly)
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'web_publish.ps1')
$testRoot=Join-Path ([IO.Path]::GetFullPath($ScratchRoot)) ('p'+[guid]::NewGuid().ToString('N').Substring(0,6))
[void](New-Item -ItemType Directory -Path $testRoot)
$passed=0
$caseNumber=0
function Write-Fixture([string]$Path,[string]$Text) {
    [void](New-Item -ItemType Directory -Path (Split-Path -Parent $Path) -Force)
    [IO.File]::WriteAllText($Path,$Text,(New-Object Text.UTF8Encoding($false)))
}
function Assert-Test($Condition,[string]$Message) { if(!$Condition) { throw $Message } }
function Expect-Stop([scriptblock]$Action,[string]$Pattern) {
    try { & $Action } catch { if($_.Exception.Message -notmatch $Pattern) { throw }; return }
    throw "Expected refusal: $Pattern"
}
function Pass([string]$Name) { $script:passed++; Write-Host "PASS: $Name" }
function New-Case([string]$Name,[switch]$Unborn,[string]$Branch='gh-pages') {
    $script:caseNumber++
    $caseName='c'+$script:caseNumber
    if($Name -eq 'normal with spaces') { $caseName+=' with spaces' }
    $caseRoot=Join-Path $testRoot $caseName
    [void](New-Item -ItemType Directory -Path $caseRoot)
    $targets=@()
    foreach($name in @('first_site','second_site')) {
        $root=Join-Path $caseRoot $name
        [void](New-Item -ItemType Directory -Path $root)
        $remote=Join-Path $caseRoot ($name+'.git')
        [void](Invoke-WebGit $caseRoot @('init','--bare',$remote))
        [void](Invoke-WebGit $remote @('config','core.longpaths','true'))
        [void](Invoke-WebGit $root @('init','-b',$Branch))
        [void](Invoke-WebGit $root @('config','core.longpaths','true'))
        [void](Invoke-WebGit $root @('config','user.name','Web publication test'))
        [void](Invoke-WebGit $root @('config','user.email','test@example.invalid'))
        Write-Fixture (Join-Path $root 'index.md') 'initial'
        Write-Fixture (Join-Path $root 'web-site.json') '{}'
        Write-Fixture (Join-Path $root 'scripts\verify_publish.ps1') "param([string]`$ReferenceRoot); exit 0"
        if(!$Unborn) {
            [void](Invoke-WebGit $root @('add','--all'))
            [void](Invoke-WebGit $root @('commit','-m','seed'))
        }
        [void](Invoke-WebGit $root @('remote','add','origin',$remote))
        if(!$Unborn) { [void](Invoke-WebGit $root @('push','-u','origin',$Branch)) }
        Write-Fixture (Join-Path $root 'index.md') 'modified'
        $targets+=@{Name=$name;Path=$root;Branch=$Branch;Remote=$remote}
    }
    return ,$targets
}
function Get-Plan($Targets) { foreach($target in $Targets) { Assert-WebRepository $target }; return ,$Targets }
function Assert-Unchanged($Targets) {
    foreach($target in $Targets) {
        Assert-Test ((Get-WebHead $target.Path) -ceq $target.Head) 'HEAD changed before refusal'
        Assert-Test (!(Invoke-WebGit $target.Path @('diff','--cached','--name-only')).Text) 'index changed before refusal'
    }
}
function Add-TrackedRecord($Target,[switch]$Ignore,[string]$FileName='SELF_CHECK.md') {
    Write-Fixture (Join-Path $Target.Path $FileName) 'existing engineering record'
    [void](Invoke-WebGit $Target.Path @('add','--',$FileName))
    [void](Invoke-WebGit $Target.Path @('commit','-m','seed existing public record'))
    [void](Invoke-WebGit $Target.Path @('push','origin',$Target.Branch))
    if($Ignore) { Write-Fixture (Join-Path $Target.Path '.gitignore') "$FileName`ngithub_push.local.psd1`n" }
}
if($HookOnly) {
    Expect-Stop { Invoke-WebPublishChecks @(@{Name='undeclared';Path=(Join-Path $testRoot 'undeclared')}) '' } 'Missing required site manifest'
    Pass 'undeclared site stops before content/publication'
    $targets=Get-Plan (New-Case 'hook arguments')
    $hook=Join-Path $targets[0].Path 'scripts\verify_publish.ps1'
    Write-Fixture $hook 'param([string]$ReferenceRoot); if($ReferenceRoot){throw "unexpected reference"}; exit 0'
    Invoke-WebPublishChecks $targets ''
    Assert-Unchanged $targets
    Pass 'optional empty reference is omitted and the successful hook actually executes'
    Write-Fixture $hook 'param([string]$ReferenceRoot); if($ReferenceRoot -cne "reference with spaces"){throw "wrong reference"}; exit 0'
    Invoke-WebPublishChecks $targets 'reference with spaces'
    Pass 'reference with spaces reaches the content hook unchanged'
    Write-Fixture $hook 'param([string]$ReferenceRoot); exit 7'
    Expect-Stop {Invoke-WebPublishChecks $targets ''} 'checks failed'
    Assert-Unchanged $targets
    Pass 'actual failing hook exit status blocks publication without Git writes'
    Write-Host "$passed focused hook tests PASS. Fixtures retained: $testRoot"
    exit 0
}
if($LocalRecordOnly) {
    foreach($name in @('AGENTS.md','AGENTS_for_Codex.md','CLAUDE.md','WORKSPACE_RULES.md',
                       'PROJECT_README_TEMPLATE.md','SCREENSHOT_CHECKLIST.md','SELF_CHECK.md',
                       'CODEX_HANDOFF.md','HANDOFF.md','MANUAL_CLEANUP.md','github_push.local.psd1')) {
        Assert-Test (Test-WebLocalRecord $name) "local record was not classified: $name"
    }
    Assert-Test (!(Test-WebLocalRecord 'README.md')) 'public README was misclassified as a local record'
    $targets=New-Case 'focused local record refusal'
    Add-TrackedRecord $targets[0] -Ignore -FileName 'AGENTS.md'
    Expect-Stop {Get-Plan $targets} 'engineering records or publication settings'
    Assert-Unchanged @($targets[0])
    Pass 'local record allowlist and tracked AGENTS refusal'
    Write-Host "$passed focused local-record tests PASS. Fixtures retained: $testRoot"
    exit 0
}
$targets=New-Case 'tracked engineering record'
Add-TrackedRecord $targets[0] -Ignore
Expect-Stop {Get-Plan $targets} 'engineering records or publication settings'
Assert-Unchanged @($targets[0])
Pass 'tracked engineering records are refused even after adding ignore rules'
$targets=New-Case 'additional local records'
Add-TrackedRecord $targets[0] -Ignore -FileName 'AGENTS.md'
Expect-Stop {Get-Plan $targets} 'engineering records or publication settings'
Assert-Unchanged @($targets[0])
Pass 'tracked AGENTS instructions are refused even after adding ignore rules'
$targets=New-Case 'screenshot checklist record'
Add-TrackedRecord $targets[0] -Ignore -FileName 'SCREENSHOT_CHECKLIST.md'
Expect-Stop {Get-Plan $targets} 'engineering records or publication settings'
Assert-Unchanged @($targets[0])
Pass 'tracked screenshot checklist is refused even after adding ignore rules'
$targets=New-Case 'safe local record untracking'
foreach($target in $targets) {
    Add-TrackedRecord $target -Ignore
    Write-Fixture (Join-Path $target.Path 'github_push.local.psd1') "@{ PublisherRoot = 'local settings only' }"
    [void](Invoke-WebGit $target.Path @('rm','--cached','--','SELF_CHECK.md'))
}
$targets=Get-Plan $targets
foreach($target in $targets) {
    Assert-Test ($target.LocalRecordRemovals.Count -eq 1) 'safe untracking was not recognized'
    Assert-Test ([IO.File]::ReadAllText((Join-Path $target.Path 'SELF_CHECK.md')) -ceq 'existing engineering record') 'record changed during preflight'
}
Invoke-WebPublishChecks $targets ''
Invoke-WebPublication $targets 'exclude local engineering records'
foreach($target in $targets) {
    Assert-Test ([IO.File]::ReadAllText((Join-Path $target.Path 'SELF_CHECK.md')) -ceq 'existing engineering record') 'local record was deleted or modified'
    Assert-Test (!(Invoke-WebGit $target.Path @('ls-tree','--name-only','HEAD','--','SELF_CHECK.md','github_push.local.psd1')).Text) 'local-only file entered the published tree'
    Assert-Test ((Invoke-WebGit $target.Path @('ls-remote','origin',('refs/heads/'+$target.Branch))).Text.Split("`t")[0] -ceq $target.Head) 'untracking publication SHA differs'
}
Pass 'ignored staged record removals publish without deleting local records or exposing settings'
$targets=New-Case 'unignored record removal'
Add-TrackedRecord $targets[0]
[void](Invoke-WebGit $targets[0].Path @('rm','--cached','--','SELF_CHECK.md'))
$indexBefore=(Invoke-WebGit $targets[0].Path @('ls-files','--stage')).Text
Expect-Stop {Get-Plan $targets} 'Ignore the local engineering record'
Assert-Test ((Invoke-WebGit $targets[0].Path @('ls-files','--stage')).Text -ceq $indexBefore) 'unignored refusal changed the index'
Assert-Test (Test-Path -LiteralPath (Join-Path $targets[0].Path 'SELF_CHECK.md')) 'unignored refusal lost the record'
Pass 'untracking without an ignore rule is refused without changing staged data'
$targets=New-Case 'main branch and private settings' -Branch 'main'
Write-Fixture (Join-Path $targets[0].Path 'github_push.local.psd1') "@{ PublisherRoot = 'local settings only' }"
Expect-Stop {Get-Plan $targets} 'engineering records or publication settings'
Write-Fixture (Join-Path $targets[0].Path '.gitignore') "github_push.local.psd1`n"
$targets=Get-Plan $targets
$wrong=@{}+$targets[0]
$wrong.Branch='gh-pages'
Expect-Stop {Assert-WebRepository $wrong} 'Expected branch'
Invoke-WebPublication $targets 'main branch publication'
foreach($target in $targets) {
    Assert-Test ((Invoke-WebGit $target.Path @('ls-remote','origin','refs/heads/main')).Text.Split("`t")[0] -ceq $target.Head) 'main branch SHA differs'
    Assert-Test (!(Invoke-WebGit $target.Path @('ls-files','github_push.local.psd1')).Text) 'private settings were committed'
}
Pass 'main is supported; wrong branch and unignored private settings are refused'
$targets=New-Case 'first commit with spaces' -Unborn
foreach($target in $targets) {
    Write-Fixture (Join-Path $target.Path '.gitignore') "/output/`n"
    Write-Fixture (Join-Path $target.Path 'output\private.txt') 'retained locally'
    Write-Fixture (Join-Path $target.Path 'scripts\verify_publish.ps1') 'param([string]$ReferenceRoot); exit 0'
}
$targets=Get-Plan $targets
Invoke-WebPublishChecks $targets ''
Assert-Unchanged $targets
foreach($target in $targets) {
    Assert-Test (!$target.Head) 'unborn repository gained HEAD during preflight'
    Assert-Test (!(Invoke-WebGit $target.Path @('ls-remote','origin')).Text) 'empty remote changed during preflight'
}
Pass 'first publication preflight and hooks accept unborn HEAD without Git writes'
Expect-Stop {Assert-WebRepository $targets[0] -PushOnly} 'existing initial commit'
Assert-Unchanged $targets
Pass 'PushOnly rejects unborn HEAD before staging'
Invoke-WebPublication $targets 'initial website'
foreach($target in $targets) {
    Assert-Test ((Invoke-WebGit $target.Path @('rev-list','--count','HEAD')).Text -eq '1') 'initial commit count differs'
    Assert-Test ((Invoke-WebGit $target.Path @('ls-remote','origin','refs/heads/gh-pages')).Text.Split("`t")[0] -ceq $target.Head) 'initial remote SHA differs'
    Assert-Test (!(Invoke-WebGit $target.Path @('ls-files','output')).Text) 'ignored output was committed'
}
$heads=$targets.Head -join ','
$targets=Get-Plan $targets
Invoke-WebPublication $targets 'repeat initial publication'
Assert-Test (($targets.Head -join ',') -ceq $heads) 'initial retry created another commit'
Pass 'initial commit and explicit-branch push succeed; ignored data stays local; retry is idempotent'
$targets=Get-Plan (New-Case 'unborn change after approval' -Unborn)
Write-Fixture (Join-Path $targets[1].Path 'index.md') 'changed with same untracked status'
Expect-Stop {Invoke-WebPublication $targets 'must not commit'} 'changed after approval'
Assert-Unchanged $targets
Pass 'untracked content changes after approval block the whole initial publication'
$targets=New-Case 'unborn staged' -Unborn
[void](Invoke-WebGit $targets[0].Path @('add','index.md'))
$indexBefore=(Invoke-WebGit $targets[0].Path @('ls-files','--stage')).Text
Expect-Stop {Get-Plan $targets} 'staged changes'
Assert-Test ((Invoke-WebGit $targets[0].Path @('ls-files','--stage')).Text -ceq $indexBefore) 'initial staged content changed'
Assert-Test (!(Get-WebHead $targets[0].Path)) 'staged refusal created a commit'
Pass 'initial publication preserves pre-existing staged changes'
$targets=New-Case 'unborn failed hook' -Unborn
Write-Fixture (Join-Path $targets[1].Path 'scripts\verify_publish.ps1') 'param([string]$ReferenceRoot); exit 7'
$targets=Get-Plan $targets
Expect-Stop {Invoke-WebPublishChecks $targets ''} 'checks failed'
Assert-Unchanged $targets
Pass 'failed content hook leaves unborn HEAD and index unchanged'
$targets=New-Case 'unborn nonempty remote' -Unborn
$seed=New-Case 'seeded remote for unborn refusal'
[void](Invoke-WebGit $targets[1].Path @('remote','set-url','origin',$seed[1].Remote))
$targets[1].Remote=$seed[1].Remote
$targets=Get-Plan $targets
Expect-Stop {Invoke-WebPublication $targets 'must not replace history'} 'no initial commit'
Assert-Unchanged $targets
Assert-Test (!(Invoke-WebGit $targets[0].Path @('ls-remote','origin')).Text) 'earlier empty remote changed'
Assert-Test ((Invoke-WebGit $targets[1].Path @('ls-remote','origin','refs/heads/gh-pages')).Text.Split("`t")[0] -ceq (Get-WebHead $seed[1].Path)) 'existing remote history changed'
Pass 'remote history blocks every initial commit without overwriting remote data'
$targets=Get-Plan (New-Case 'normal with spaces')
[void](Invoke-WebGit $targets[0].Path @('tag','-a','private-tag','-m','retain locally'))
[void](Invoke-WebGit $targets[0].Path @('config','push.followTags','true'))
Invoke-WebPublishChecks $targets ''
Assert-Unchanged $targets
Invoke-WebPublication $targets 'quoted "message"'
foreach($target in $targets) {
    Assert-Test ((Invoke-WebGit $target.Path @('ls-remote','origin','refs/heads/gh-pages')).Text.Split("`t")[0] -ceq $target.Head) 'wrong remote SHA'
    Assert-Test (!(Invoke-WebGit $target.Path @('ls-remote','origin','refs/tags/*')).Text) 'private tag leaked'
}
Pass 'ordinary explicit-branch publication, quoted arguments and no implicit tags'
$heads=$targets.Head -join ','
$targets=Get-Plan $targets
Invoke-WebPublication $targets 'no-op'
Assert-Test (($targets.Head -join ',') -ceq $heads) 'no-op created commits'
Pass 'idempotent rerun'
Expect-Stop {Get-WebRepositories (Split-Path -Parent $targets[0].Path) @('second_site') 'released'} 'legacy sibling repositories are never selected'
Expect-Stop {Get-WebRepositories (Split-Path -Parent $targets[0].Path) @('../escape') 'released'} 'legacy sibling repositories are never selected'
Pass 'legacy sibling repositories and traversal cannot become publication targets'
$targets=New-Case 'bad origin'
$targets[1].Remote='released/wrong_repository'
Expect-Stop {Get-Plan $targets} 'Origin does not match'
Assert-Unchanged @($targets[0])
Pass 'all origins checked before any stage/commit'
$targets=New-Case 'staged'
[void](Invoke-WebGit $targets[0].Path @('add','index.md'))
Expect-Stop {Get-Plan $targets} 'staged changes'
Pass 'pre-existing index preserved'
$targets=Get-Plan (New-Case 'upstream')
[void](Invoke-WebGit $targets[1].Path @('config','branch.gh-pages.merge','refs/heads/wrong'))
Expect-Stop {Get-Plan $targets} 'Unexpected upstream'
Pass 'upstream mismatch rejected'
$targets=Get-Plan (New-Case 'hook failure')
Write-Fixture (Join-Path $targets[1].Path 'scripts\verify_publish.ps1') 'param([string]$ReferenceRoot); exit 7'
Expect-Stop {Invoke-WebPublishChecks $targets ''} 'checks failed'
Assert-Unchanged $targets
Pass 'failed content hook stops before any Git writes'
$targets=Get-Plan (New-Case 'changed after approval')
Write-Fixture (Join-Path $targets[1].Path 'index.md') 'changed again, same status'
Expect-Stop {Invoke-WebPublication $targets 'must not commit'} 'changed after approval'
Assert-Unchanged $targets
Pass 'same-status content changes rejected before staging'
$targets=Get-Plan (New-Case 'remote ahead')
$other=Join-Path $testRoot 'other clone'
[void](Invoke-WebGit $testRoot @('clone','--branch','gh-pages',$targets[1].Remote,$other))
[void](Invoke-WebGit $other @('config','user.name','Web test'))
[void](Invoke-WebGit $other @('config','user.email','test@example.invalid'))
Write-Fixture (Join-Path $other 'remote.md') 'remote-only'
[void](Invoke-WebGit $other @('add','--all'))
[void](Invoke-WebGit $other @('commit','-m','remote advance'))
[void](Invoke-WebGit $other @('push','origin','gh-pages'))
Expect-Stop {Invoke-WebPublication $targets 'must not commit'} 'Remote contains'
Assert-Unchanged $targets
Pass 'remote advance blocks every commit without automatic merge'
$targets=Get-Plan (New-Case 'partial push')
$old=$targets[1].Head
Write-Fixture (Join-Path $targets[1].Remote 'hooks\pre-receive') "#!/bin/sh`nexit 1`n"
Expect-Stop {Invoke-WebPublication $targets 'partial'} 'failed'
Assert-Test ((Invoke-WebGit $targets[0].Path @('ls-remote','origin','refs/heads/gh-pages')).Text.Split("`t")[0] -ceq $targets[0].Head) 'first push lost'
Assert-Test ((Invoke-WebGit $targets[1].Path @('ls-remote','origin','refs/heads/gh-pages')).Text.Split("`t")[0] -ceq $old) 'rejected remote changed'
Pass 'push rejection stops with earlier verified push retained'
Write-Host "$passed Web publication tests PASS. Fixtures retained: $testRoot"
