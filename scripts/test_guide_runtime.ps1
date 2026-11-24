param([string]$HubRoot='',[string]$ToolRoot='',[switch]$InteractionsOnly)
$ErrorActionPreference='Stop'
$project=Split-Path -Parent $PSScriptRoot
if(!$HubRoot){$HubRoot=[IO.Path]::GetFullPath((Join-Path $project '..\..\..\python\#READ_ME_FIRST#'))}
if(!$ToolRoot){$ToolRoot=[IO.Path]::GetFullPath((Join-Path $HubRoot '..\simple_renesas_isp_tool'))}
. (Join-Path $HubRoot 'scripts\invoke_hub_test.ps1')
$script:guideWorker=$null
$guideEvidenceDirectory=Join-Path $project 'docs\internal\guide-review-20261120'
$result=Invoke-HubOwnedTest -ProjectRoot $project -Purpose 'Guide DOM, navigation, layout, SVG references and renderer recovery; existing installed Chromium only' -MaxBytes 500MB -Action {
    param($run)
    $runFile=Join-Path $run.Work 'test-run.json'
    [IO.File]::WriteAllText($runFile,($run | ConvertTo-Json),(New-Object Text.UTF8Encoding($false)))
    Register-HubArtifact -Run $run -Path $runFile -Producer 'Registered browser test identity'
    $savedOutput=$env:WEB_TEST_OUTPUT
    $savedRun=$env:WEB_TEST_RUN_FILE
    $savedHub=$env:WEB_TEST_HUB_ROOT
    try {
        $env:WEB_TEST_OUTPUT=Join-Path $run.Work 'browser'
        $env:WEB_TEST_RUN_FILE=$runFile
        $env:WEB_TEST_HUB_ROOT=$HubRoot
        New-Item -ItemType Directory -Path $env:WEB_TEST_OUTPUT | Out-Null
        $node=(Get-Command node -CommandType Application | Select-Object -First 1).Source
        $mode=if($InteractionsOnly){'--guide-interactions'}else{'--guide-review'}
        $script:guideWorker=Start-Process -FilePath $node -WindowStyle Hidden -PassThru -ArgumentList @(('"{0}"' -f (Join-Path $PSScriptRoot 'test_web_runtime.mjs')),$mode) -RedirectStandardOutput (Join-Path $run.Work 'stdout.txt') -RedirectStandardError (Join-Path $run.Work 'stderr.txt')
        [void]$script:guideWorker.Handle
        Register-HubTestProcess -Run $run -ProcessId $script:guideWorker.Id
        if(!$script:guideWorker.WaitForExit(480000)){throw 'Guide browser verification timed out.'}
        Get-Content -LiteralPath (Join-Path $run.Work 'stdout.txt') -Encoding UTF8
        Get-Content -LiteralPath (Join-Path $run.Work 'stderr.txt') -Encoding UTF8
        if($script:guideWorker.ExitCode -ne 0){throw ('Guide browser exit '+$script:guideWorker.ExitCode)}
        if(!$InteractionsOnly){
            & $node (Join-Path $ToolRoot 'scripts\verify_web_guide_layout.mjs') $project (Join-Path $env:WEB_TEST_OUTPUT 'results-guides.json')
            if($LASTEXITCODE){throw 'Actual guide destination IDs failed.'}
        }
    } finally {
        $env:WEB_TEST_OUTPUT=$savedOutput
        $env:WEB_TEST_RUN_FILE=$savedRun
        $env:WEB_TEST_HUB_ROOT=$savedHub
    }
} -Teardown {
    param($run)
    $record=Read-HubTestRun $run.Root
    foreach($identity in $record.processes) {
        if(Test-HubProcessAlive $identity){
            Stop-Process -Id $identity.pid -ErrorAction Stop
            Wait-Process -Id $identity.pid -Timeout 15 -ErrorAction SilentlyContinue
        }
    }
    $until=[DateTime]::UtcNow.AddSeconds(15)
    do {
        $active=@($record.processes | Where-Object {Test-HubProcessAlive $_})
        if(!$active.Count){break}
        Start-Sleep -Milliseconds 200
    } while([DateTime]::UtcNow -lt $until)
    if($active.Count){throw 'Registered browser workers did not stop.'}
    Start-Sleep -Seconds 2
} -CollectArtifacts {
    param($run)
    foreach($name in @('stdout.txt','stderr.txt','test-run.json')) {
        $path=Join-Path $run.Work $name
        if(Test-Path -LiteralPath $path){Register-HubArtifact -Run $run -Path $path -Producer 'Owned guide test runner output'}
    }
    $browserOutput=Join-Path $run.Work 'browser'
    if(Test-Path -LiteralPath $browserOutput) {
        foreach($file in Get-ChildItem -LiteralPath $browserOutput -File -Recurse -Force) {
            Register-HubArtifact -Run $run -Path $file.FullName -Producer 'Fresh isolated Chromium profile or test capture'
        }
    }
} -Evidence {
    param($run)
    New-Item -ItemType Directory -Path $guideEvidenceDirectory -Force | Out-Null
    foreach($name in @('stdout.txt','stderr.txt','browser\results-guides.json','browser\results-interactions.json','browser\guide-desktop.png','browser\guide-narrow.png','browser\guide-diagram.png','browser\view-failure.png')) {
        $path=Join-Path $run.Work $name
        if(Test-Path -LiteralPath $path){Copy-Item -LiteralPath $path -Destination (Join-Path $guideEvidenceDirectory (Split-Path -Leaf $name))}
    }
}
$result.Output | ForEach-Object { Write-Host $_ }
$result | Select-Object Success,Outcome,CleanupRemoved,Errors | ConvertTo-Json -Depth 5
if(!$result.Success){exit 1}
