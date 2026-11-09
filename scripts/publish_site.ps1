param(
    [string]$CommitMessage='update', [switch]$PushOnly, [switch]$DryRun,
    [string]$ReferenceRoot='', [switch]$Yes
)
$ErrorActionPreference='Stop'
$root=Split-Path -Parent $PSScriptRoot
. (Join-Path $PSScriptRoot 'web_publish.ps1')
$started=$false
try {
    if([string]::IsNullOrWhiteSpace($CommitMessage)) { throw 'Commit message cannot be empty or whitespace.' }
    $settings=Join-Path $root 'github_push.local.psd1'
    if(!$ReferenceRoot -and (Test-Path -LiteralPath $settings)) {
        $local=Import-PowerShellDataFile -LiteralPath $settings
        if($local.ContainsKey('ReferenceRoot')) { $ReferenceRoot=$local.ReferenceRoot }
    }
    if(!$ReferenceRoot) { $ReferenceRoot=$env:WEB_PUBLISH_REFERENCE_ROOT }
    $manifest=Get-Content -LiteralPath (Join-Path $root 'web-site.json') -Raw -Encoding UTF8 | ConvertFrom-Json
    if($manifest.site -cne 'released.github.io' -or $manifest.publication.owner -cne 'released' -or
       $manifest.publication.repository -cne 'released.github.io' -or $manifest.publication.branch -cne 'main') { throw 'The website publication contract is not released/released.github.io main.' }
    $target=@{Name='released.github.io';Path=$root;Branch='main';Remote='released/released.github.io'}
    Assert-WebRepository $target -PushOnly:$PushOnly
    Write-Host 'Repository: released/released.github.io; branch: main; targets: 1'
    Write-Host ('Git root: '+$root)
    if($target.Status) { Write-Host $target.Status } else { Write-Host 'Working tree is clean.' }
    Invoke-WebPublishChecks @($target) $ReferenceRoot
    & (Join-Path $PSScriptRoot 'install_push_guard.ps1')
    if($DryRun) { Write-Host 'DRY RUN PASS: no add, commit, fetch, push or Git configuration changes.'; exit 0 }
    if(!$Yes -and (Read-Host 'Commit/push this website? Type PUSH') -cne 'PUSH') { Write-Host 'Canceled without Git changes.'; exit 0 }
    $started=$true
    & (Join-Path $PSScriptRoot 'install_push_guard.ps1') -Apply
    Invoke-WebPublication @($target) $CommitMessage -PushOnly:$PushOnly
    Write-Host 'Website remote SHA verified. Pages deployment must be verified separately.'
    exit 0
} catch {
    Write-Host ('STOPPED: '+$_.Exception.Message)
    if($started) { Write-Host 'Review the existing commit and remote SHA; no automatic rollback was performed.' }
    else { Write-Host 'Stopped before publication; Git index, commit and remote were not changed.' }
    exit 1
}
