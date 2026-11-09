# Generic Web publication helpers. No source generation, merge or force push.
function Invoke-WebGit {
    param([string]$Root,[string[]]$Arguments,[int[]]$Allowed=@(0))
    $info=New-Object Diagnostics.ProcessStartInfo
    $info.FileName=(Get-Command git -ErrorAction Stop).Source
    $info.Arguments=(@('-C',$Root,'-c','core.quotepath=false')+$Arguments | ForEach-Object {
        '"'+[regex]::Replace([regex]::Replace($_,'(\\*)"','$1$1\"'),'(\\+)$','$1$1')+'"'
    }) -join ' '
    $info.UseShellExecute=$false; $info.CreateNoWindow=$true
    $info.RedirectStandardOutput=$true; $info.RedirectStandardError=$true
    $info.StandardOutputEncoding=New-Object Text.UTF8Encoding($false)
    $info.StandardErrorEncoding=New-Object Text.UTF8Encoding($false)
    $info.EnvironmentVariables['GIT_TERMINAL_PROMPT']='0'
    $info.EnvironmentVariables['GCM_INTERACTIVE']='Never'
    $info.EnvironmentVariables['GIT_OPTIONAL_LOCKS']='0'
    $process=New-Object Diagnostics.Process
    $process.StartInfo=$info
    try {
        [void]$process.Start()
        $output=$process.StandardOutput.ReadToEndAsync(); $errors=$process.StandardError.ReadToEndAsync()
        $process.WaitForExit()
        $result=@{Code=$process.ExitCode;Text=$output.Result.TrimEnd();Error=$errors.Result.TrimEnd()}
        if($result.Code -notin $Allowed) { throw "git $($Arguments -join ' ') failed: $($result.Text) $($result.Error)" }
        return $result
    } finally { $process.Dispose() }
}

function Get-WebRepositories([string]$Workspace,[string[]]$Names,[string]$Owner) {
    $ErrorActionPreference='Stop'
    if([string]::IsNullOrWhiteSpace($Workspace)) { throw 'An explicit website workspace path is required.' }
    if($Owner -cne 'released') { throw 'The website owner is fixed to released.' }
    $root=[IO.Path]::GetFullPath($Workspace)
    if((Split-Path -Leaf $root) -cne 'released.github.io') { $root=Join-Path $root 'released.github.io' }
    if(!(Test-Path -LiteralPath (Join-Path $root '.git'))) { throw 'Consolidated website repository is missing; legacy sibling repositories are never selected.' }
    foreach($name in @($Names | ForEach-Object {$_.Split(',')})) {
        if($name -and $name -cne 'released.github.io') { throw 'Only the consolidated released.github.io repository can be selected.' }
    }
    @{Name='released.github.io';Path=$root;Branch='main';Remote='released/released.github.io'}
}

function Get-WebHead([string]$Root) {
    $head=Invoke-WebGit $Root @('rev-parse','--verify','--quiet','HEAD') @(0,1)
    if(!$head.Code) { return $head.Text }
    $ref=(Invoke-WebGit $Root @('symbolic-ref','HEAD')).Text
    if(!(Invoke-WebGit $Root @('show-ref','--verify','--quiet',$ref) @(0,1)).Code) {
        throw 'HEAD cannot be resolved despite an existing branch reference.'
    }
    return ''
}

function Get-WebChangeFingerprint([string]$Root) {
    if(Get-WebHead $Root) {
        $paths=@((Invoke-WebGit $Root @('diff','--name-only','-z','HEAD','--')).Text.Split([char]0))
    } else {
        $paths=@((Invoke-WebGit $Root @('ls-files','--cached','-z')).Text.Split([char]0))
    }
    $paths+=(Invoke-WebGit $Root @('ls-files','--others','--exclude-standard','-z')).Text.Split([char]0)
    $records=@(foreach($path in $paths | Where-Object {$_} | Sort-Object -Unique) {
        $full=Join-Path $Root $path
        if(Test-Path -LiteralPath $full -PathType Leaf) {
            if((Get-Item -LiteralPath $full -Force).Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Changed reparse file is not allowed.' }
            $path+':'+(Get-FileHash -LiteralPath $full -Algorithm SHA256).Hash
        } else { $path+':deleted' }
    })
    return $records -join '|'
}

function Test-WebLocalRecord([string]$Path) {
    return $Path -match '(^|/)(AGENTS(?:_for_Codex)?\.md|CLAUDE\.md|WORKSPACE_RULES\.md|PROJECT_README_TEMPLATE\.md|SCREENSHOT_CHECKLIST\.md|SELF_CHECK[^/]*\.md|CODEX_HANDOFF\.md|HANDOFF\.md|MANUAL_CLEANUP\.md|github_push\.local\.psd1)$'
}

function Assert-WebStaging($Target) {
    $staged=@((Invoke-WebGit $Target.Path @('diff','--cached','--name-only','-z')).Text.Split([char]0) | Where-Object {$_})
    $Target.LocalRecordRemovals=@()
    if(!$staged.Count) { return }
    $deleted=@((Invoke-WebGit $Target.Path @('diff','--cached','--diff-filter=D','--name-only','-z')).Text.Split([char]0) | Where-Object {$_})
    if($deleted.Count -ne $staged.Count) { throw "Review existing staged changes: $($Target.Name)" }
    foreach($path in $staged) {
        if(!(Test-WebLocalRecord $path)) { throw "Review existing staged changes: $($Target.Name)" }
        $full=Join-Path $Target.Path $path
        if(!(Test-Path -LiteralPath $full -PathType Leaf)) { throw "Keep the local engineering record before untracking: $path" }
        if((Get-Item -LiteralPath $full -Force).Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Reparse local record is not allowed.' }
        if((Invoke-WebGit $Target.Path @('check-ignore','--no-index','--quiet','--',$path) @(0,1)).Code) {
            throw "Ignore the local engineering record before untracking: $path"
        }
    }
    $Target.LocalRecordRemovals=$staged
}

function Assert-WebRepository($Target,[switch]$PushOnly) {
    if((Get-Item -LiteralPath $Target.Path -Force).Attributes -band [IO.FileAttributes]::ReparsePoint) {
        throw "Reparse repository is not allowed: $($Target.Name)"
    }
    $actual=(Invoke-WebGit $Target.Path @('rev-parse','--show-toplevel')).Text.Replace('/','\').TrimEnd('\')
    if($actual -ine [IO.Path]::GetFullPath($Target.Path).TrimEnd('\')) { throw "Not an exact repository root: $($Target.Name)" }
    $branch=(Invoke-WebGit $Target.Path @('symbolic-ref','--short','HEAD')).Text
    if($branch -cne $Target.Branch) { throw "Expected branch $($Target.Branch), found $branch in $($Target.Name)" }
    foreach($gitArguments in @(@('remote','get-url','--all','origin'),@('remote','get-url','--push','--all','origin'))) {
        $url=(Invoke-WebGit $Target.Path $gitArguments).Text
        if($Target.Remote -match '^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$') {
            if($url -notmatch ('^(https://github\.com/|git@github\.com:|ssh://git@github\.com/)'+[regex]::Escape($Target.Remote)+'(?:\.git)?/?$')) {
                throw "Origin does not match $($Target.Remote): $($Target.Name)"
            }
        } elseif($url -cne $Target.Remote) { throw 'Origin does not match the explicit test remote.' }
    }
    if((Invoke-WebGit $Target.Path @('config','--bool','--get','remote.origin.mirror') @(0,1)).Text -eq 'true') {
        throw "Mirror publication is not allowed: $($Target.Name)"
    }
    $upstream=Invoke-WebGit $Target.Path @('rev-parse','--abbrev-ref','--symbolic-full-name','@{u}') @(0,128)
    $trackingRemote=(Invoke-WebGit $Target.Path @('config','--get',('branch.'+$branch+'.remote')) @(0,1)).Text
    $trackingRef=(Invoke-WebGit $Target.Path @('config','--get',('branch.'+$branch+'.merge')) @(0,1)).Text
    if((!$upstream.Code -and $upstream.Text -cne ('origin/'+$Target.Branch)) -or
        ($trackingRemote -and $trackingRemote -cne 'origin') -or
        ($trackingRef -and $trackingRef -cne ('refs/heads/'+$branch))) {
        throw "Unexpected upstream $($upstream.Text): $($Target.Name)"
    }
    foreach($name in @('index.lock','MERGE_HEAD','CHERRY_PICK_HEAD','REVERT_HEAD','rebase-merge','rebase-apply')) {
        $path=(Invoke-WebGit $Target.Path @('rev-parse','--git-path',$name)).Text
        if(![IO.Path]::IsPathRooted($path)) { $path=Join-Path $Target.Path $path }
        if(Test-Path -LiteralPath $path) { throw "Active Git operation $name in $($Target.Name)" }
    }
    Assert-WebStaging $Target
    foreach($key in @('user.name','user.email')) {
        if(!(Invoke-WebGit $Target.Path @('config','--get',$key) @(0,1)).Text) { throw "Missing Git $key in $($Target.Name)" }
    }
    $Target.Head=Get-WebHead $Target.Path
    $Target.Status=(Invoke-WebGit $Target.Path @('status','--short','--untracked-files=all')).Text
    $Target.Fingerprint=Get-WebChangeFingerprint $Target.Path
    if(!$Target.Head) {
        if($PushOnly) { throw "PushOnly requires an existing initial commit: $($Target.Name)" }
        if(!$Target.Status) { throw "Initial publication requires files to commit: $($Target.Name)" }
    }
    if($PushOnly -and $Target.Status) { throw "PushOnly requires a clean worktree so checks cover the published content: $($Target.Name)" }
    $publicPaths=@((Invoke-WebGit $Target.Path @('ls-files','--cached','--others','--exclude-standard','-z')).Text.Split([char]0) | Where-Object {$_})
    if($publicPaths -match '(^|/)(tmp/|push-all\.local\.psd1$)') {
        throw "Local-only path is tracked or unignored: $($Target.Name)"
    }
    if(@($publicPaths | Where-Object {Test-WebLocalRecord $_}).Count) {
        throw "Local engineering records or publication settings are tracked or unignored: $($Target.Name)"
    }
}

function Invoke-WebPublishChecks($Targets,[string]$ReferenceRoot) {
    foreach($target in $Targets) {
        $hook=Join-Path $target.Path 'scripts\verify_publish.ps1'
        if(!(Test-Path -LiteralPath (Join-Path $target.Path 'web-site.json')) -or !(Test-Path -LiteralPath $hook)) {
            throw "Missing required site manifest or read-only publication hook: $($target.Name)"
        }
        if(Test-Path -LiteralPath $hook) {
            if((Get-Item -LiteralPath $hook -Force).Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Reparse verification hook is not allowed.' }
            Write-Host "Checking publication content: $($target.Name)"
            $hookArguments=@('-NoProfile','-ExecutionPolicy','Bypass','-File',$hook)
            if($ReferenceRoot) { $hookArguments+=@('-ReferenceRoot',$ReferenceRoot) }
            & powershell.exe @hookArguments
            if($LASTEXITCODE) { throw "Publication content checks failed: $($target.Name)" }
        }
    }
}

function Assert-WebRemoteAncestry($Targets) {
    foreach($target in $Targets) {
        $ref='refs/heads/'+$target.Branch
        $remote=Invoke-WebGit $target.Path @('ls-remote','--exit-code','origin',$ref) @(0,2)
        if($remote.Code -eq 2) {
            if((Invoke-WebGit $target.Path @('ls-remote','origin')).Text) { throw "Nonempty remote lacks $ref in $($target.Name)" }
        } else {
            if(!$target.Head) { throw "Remote contains history but local HEAD has no initial commit: $($target.Name)" }
            [void](Invoke-WebGit $target.Path @('fetch','--no-tags','origin',$ref))
            if((Invoke-WebGit $target.Path @('merge-base','--is-ancestor','FETCH_HEAD','HEAD') @(0,1)).Code) {
                throw "Remote contains changes not in local HEAD: $($target.Name)"
            }
        }
    }
}

function Invoke-WebPublication($Targets,[string]$Message,[switch]$PushOnly) {
    Assert-WebRemoteAncestry $Targets
    # Revalidate every approved tree before staging the first repository.
    foreach($target in $Targets) {
        $head=$target.Head; $status=$target.Status; $fingerprint=$target.Fingerprint
        Assert-WebRepository $target -PushOnly:$PushOnly
        if($target.Head -cne $head -or $target.Status -cne $status -or $target.Fingerprint -cne $fingerprint) {
            throw "Git state changed after approval: $($target.Name)"
        }
    }
    foreach($target in $Targets) {
        if(!$PushOnly -and $target.Status) {
            [void](Invoke-WebGit $target.Path @('add','--all','--','.'))
            if((Invoke-WebGit $target.Path @('diff','--cached','--quiet') @(0,1)).Code) {
                [void](Invoke-WebGit $target.Path @('commit','-m',$Message))
            }
            if((Invoke-WebGit $target.Path @('status','--short','--untracked-files=all')).Text) {
                throw "Worktree changed during commit: $($target.Name)"
            }
        }
        $target.Head=(Invoke-WebGit $target.Path @('rev-parse','HEAD')).Text
    }
    foreach($target in $Targets) {
        $ref='refs/heads/'+$target.Branch
        [void](Invoke-WebGit $target.Path @('push','--porcelain','--no-force','--no-follow-tags','--recurse-submodules=no','origin',($target.Head+':'+$ref)))
        $remote=(Invoke-WebGit $target.Path @('ls-remote','--exit-code','origin',$ref)).Text.Split("`t")[0]
        if($remote -cne $target.Head) { throw "Remote SHA verification failed: $($target.Name)" }
        Write-Host "PUSH VERIFIED $($target.Name) $($target.Head)"
    }
}
