param(
    [string]$sha = 'b654c2f8aae6237df13eb928f8c7dab3d029f865',
    [string]$repo = 'Abhirajgautam28/PixelPact'
)

Write-Host "Polling up to 2 minutes for a run tied to commit $sha"
$run = $null
for ($i=0; $i -lt 60; $i++) {
  $runsJson = gh run list --repo $repo --limit 50 --json databaseId,workflowName,headBranch,headSha,status,conclusion 2>$null
  if ($runsJson) { $runs = $runsJson | ConvertFrom-Json } else { $runs = @() }
  $run = $runs | Where-Object { $_.headSha -eq $sha } | Select-Object -First 1
  if ($run) { Write-Host "Found run id: $($run.databaseId) workflow: $($run.workflowName) status: $($run.status)"; break }
  Start-Sleep -Seconds 2
}

if (-not $run) { Write-Host "No run found for commit after polling."; exit 2 }

$maxWait=300; $elapsed=0
while ($run.status -ne 'completed' -and $elapsed -lt $maxWait) {
  Write-Host "Run $($run.databaseId) status=$($run.status) sleeping 5s..."
  Start-Sleep -Seconds 5
  $elapsed += 5
  $run = gh run view $run.databaseId --repo $repo --json databaseId,workflowName,headBranch,headSha,status,conclusion | ConvertFrom-Json
}

if ($run.status -ne 'completed') { Write-Host 'Timeout waiting for run to complete'; exit 3 }

Write-Host "Run completed. Conclusion: $($run.conclusion)"
exit 0
