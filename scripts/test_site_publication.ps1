param([Parameter(Mandatory=$true)][string]$ScratchRoot)
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'web_publish.ps1')
$fixture=Join-Path $ScratchRoot 'single website with spaces'
[void](New-Item -ItemType Directory -Path (Join-Path $fixture 'scripts') -Force)
function Write-Fixture([string]$Path,[string]$Text) { [IO.File]::WriteAllText($Path,$Text,(New-Object Text.UTF8Encoding($false))) }
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'web_publish.ps1') -Destination (Join-Path $fixture 'scripts\web_publish.ps1')
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'publish_site.ps1') -Destination (Join-Path $fixture 'scripts\publish_site.ps1')
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'install_push_guard.ps1') -Destination (Join-Path $fixture 'scripts\install_push_guard.ps1')
[void](New-Item -ItemType Directory -Path (Join-Path $fixture '.githooks'))
Copy-Item -LiteralPath (Join-Path (Split-Path -Parent $PSScriptRoot) '.githooks\pre-push') -Destination (Join-Path $fixture '.githooks\pre-push')
Write-Fixture (Join-Path $fixture 'web-site.json') '{"site":"released.github.io","publication":{"owner":"released","repository":"released.github.io","branch":"main"},"pages":[]}'
Write-Fixture (Join-Path $fixture 'site-catalog.json') '{"schema":1,"topics":[]}'
Write-Fixture (Join-Path $fixture 'scripts\verify_publish.ps1') "param([string]`$ReferenceRoot); exit 0"
[void](Invoke-WebGit $fixture @('init','-b','main'))
[void](Invoke-WebGit $fixture @('config','user.name','Website fixture'))
[void](Invoke-WebGit $fixture @('config','user.email','fixture@example.invalid'))
[void](Invoke-WebGit $fixture @('remote','add','origin','https://github.com/released/released.github.io.git'))
[void](Invoke-WebGit $fixture @('add','--all'))
[void](Invoke-WebGit $fixture @('commit','-m','fixture'))
$head=Get-WebHead $fixture
function Check-Entry([int]$Expected,[string]$Pattern) {
    $before=(Invoke-WebGit $fixture @('config','--local','--list')).Text
    $output=& powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $fixture 'scripts\publish_site.ps1') -DryRun 2>&1
    if($LASTEXITCODE -ne $Expected -or ($output -join "`n") -notmatch $Pattern) { throw "Entry result differs: $($output -join ' | ')" }
    if((Get-WebHead $fixture) -cne $head -or (Invoke-WebGit $fixture @('status','--porcelain')).Text -or
       (Invoke-WebGit $fixture @('config','--local','--list')).Text -cne $before) { throw 'Read-only entry changed Git state.' }
    Write-Host ('PASS single-site entry: '+$Pattern)
}
Check-Entry 0 'targets: 1'
[void](Invoke-WebGit $fixture @('remote','set-url','origin','https://github.com/released/slide_RL78.git'))
Check-Entry 1 'Origin does not match'
[void](Invoke-WebGit $fixture @('remote','set-url','origin','https://github.com/released/released.github.io.git'))
[void](Invoke-WebGit $fixture @('config','remote.origin.pushurl','https://github.com/released/slide_RL78.git'))
Check-Entry 1 'Origin does not match'
[void](Invoke-WebGit $fixture @('config','--unset','remote.origin.pushurl'))
[void](Invoke-WebGit $fixture @('checkout','-b','gh-pages'))
Check-Entry 1 'Expected branch main'
[void](Invoke-WebGit $fixture @('checkout','main'))
[void](Invoke-WebGit $fixture @('config','branch.main.remote','origin'))
[void](Invoke-WebGit $fixture @('config','branch.main.merge','refs/heads/gh-pages'))
Check-Entry 1 'Unexpected upstream'
[void](Invoke-WebGit $fixture @('config','--unset','branch.main.remote'))
[void](Invoke-WebGit $fixture @('config','--unset','branch.main.merge'))
Check-Entry 0 'DRY RUN PASS'
$git=(Get-Command git -CommandType Application).Source
$shell=[IO.Path]::GetFullPath((Join-Path (Split-Path -Parent $git) '..\usr\bin\sh.exe'))
if(!(Test-Path -LiteralPath $shell)) { throw 'The installed Git shell is required for the push-guard checks.' }
function Check-Guard([string]$Remote,[string]$LocalRef,[string]$RemoteRef,[int]$Expected) {
    $start=New-Object Diagnostics.ProcessStartInfo
    $start.FileName=$shell
    $start.Arguments='.githooks/pre-push origin '+$Remote
    $start.WorkingDirectory=$fixture
    $start.UseShellExecute=$false; $start.CreateNoWindow=$true
    $start.RedirectStandardInput=$true; $start.RedirectStandardOutput=$true; $start.RedirectStandardError=$true
    $process=New-Object Diagnostics.Process
    $process.StartInfo=$start
    try {
        [void]$process.Start()
        $process.StandardInput.WriteLine($LocalRef+' '+$head+' '+$RemoteRef+' '+('0'*40))
        $process.StandardInput.Close()
        $stdout=$process.StandardOutput.ReadToEndAsync(); $stderr=$process.StandardError.ReadToEndAsync()
        $process.WaitForExit()
        if($process.ExitCode -ne $Expected) { throw ('Push guard result differs: '+$stderr.Result+$stdout.Result) }
        Write-Host ('PASS pre-push guard: '+$LocalRef+' -> '+$RemoteRef+' / '+$Remote)
    } finally { $process.Dispose() }
}
Check-Guard 'https://github.com/released/released.github.io.git' $head 'refs/heads/main' 0
Check-Guard 'https://github.com/released/released.github.io.git' 'refs/heads/main' 'refs/heads/main' 0
Check-Guard 'https://github.com/released/slide_RL78.git' $head 'refs/heads/main' 1
Check-Guard 'https://github.com/released/released.github.io.git' $head 'refs/heads/gh-pages' 1
Check-Guard 'https://github.com/released/released.github.io.git' 'refs/tags/private' 'refs/heads/main' 1
[void](New-Item -ItemType Directory -Path (Join-Path $fixture 'nested\.git') -Force)
$previous=$ErrorActionPreference
try {
    $ErrorActionPreference='Continue'
    $output=& node (Join-Path $PSScriptRoot 'verify_consolidation.mjs') $fixture 2>&1
    $code=$LASTEXITCODE
} finally { $ErrorActionPreference=$previous }
if(!$code -or ($output -join "`n") -notmatch 'Nested Git metadata') { throw 'Nested repository was not rejected.' }
Write-Host 'PASS nested .git rejection; original HEAD/index/config preserved'
Write-Host 'PASS 7 single-site entry cases and 5 actual pre-push guard cases; no network publication'
