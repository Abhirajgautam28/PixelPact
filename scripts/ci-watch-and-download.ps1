Param(
  [string]$workflow = 'ci-invite-tests.yml',
  [string]$branch = 'Add/Features',
  [string]$outDir = 'd:\tmp\ci-artifacts'
)

Write-Host "Querying latest run for workflow=$workflow branch=$branch"
$runInfo = gh run list --workflow=$workflow --branch=$branch --limit 1 --json databaseId,status,conclusion 2>$null | ConvertFrom-Json
if (-not $runInfo) {
  Write-Host 'No workflow run found for the specified workflow/branch.'
  exit 1
}
$runId = $runInfo[0].databaseId
Write-Host "Found run id: $runId"

while ($true) {
  $r = gh run view $runId --json status,conclusion 2>$null | ConvertFrom-Json
  if (-not $r) { Write-Host 'Unable to fetch run status. Retrying in 8s'; Start-Sleep -Seconds 8; continue }
  Write-Host "Status=$($r.status)  Conclusion=$($r.conclusion)"
  if ($r.status -eq 'completed') { break }
  Start-Sleep -Seconds 8
}

Write-Host "Download artifacts to: $outDir"
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

gh run download $runId -D $outDir
if ($LASTEXITCODE -ne 0) { Write-Host 'gh run download returned non-zero exit code' }
else { Write-Host 'Download complete' }

exit 0
