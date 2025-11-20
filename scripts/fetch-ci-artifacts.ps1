param(
    [string]$Repo = "",
    [int]$Limit = 20
)

function Fail([string]$msg) {
    Write-Error $msg
    exit 1
}

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Fail "gh CLI not found. Install GitHub CLI and authenticate (gh auth login)."
}

if ($Repo -eq "") {
    try {
        $repoInfoJson = gh repo view --json name,owner 2>$null
        $repoInfo = $repoInfoJson | ConvertFrom-Json
        $Repo = "$($repoInfo.owner.login)/$($repoInfo.name)"
    } catch {
        Fail "Unable to determine repo. Pass -Repo owner/repo explicitly."
    }
}

try {
    $branch = git rev-parse --abbrev-ref HEAD
} catch {
    Fail "Unable to determine current git branch. Run this script from a git repo." 
}

Write-Host "Repository: $Repo" -ForegroundColor Cyan
Write-Host "Branch: $branch" -ForegroundColor Cyan

Write-Host "Querying last $Limit runs for branch $branch..."

try {
    $runsJson = gh run list --repo $Repo --branch $branch --limit $Limit --json databaseId,conclusion 2>$null
    $runs = @()
    if ($runsJson) { $runs = $runsJson | ConvertFrom-Json }
    $failedIds = $runs | Where-Object { $_.conclusion -ne 'success' } | Select-Object -ExpandProperty databaseId -ErrorAction SilentlyContinue
} catch {
    $failedIds = @()
}

if (-not $failedIds -or $failedIds.Count -eq 0) {
    Write-Host "No failed runs detected in the last $Limit runs. Will download artifacts for the most recent run."
    try {
        $lastRunJson = gh run list --repo $Repo --branch $branch --limit 1 --json databaseId 2>$null
        $lastRun = $lastRunJson | ConvertFrom-Json
        $lastId = $lastRun[0].databaseId
    } catch {
        Fail "Unable to list runs for $Repo on branch $branch."
    }
    if (-not $lastId) { Fail "No workflow runs found for branch $branch." }
    $failedIds = @($lastId)
}

$outRoot = Join-Path -Path (Get-Location) -ChildPath "ci-artifacts"
if (-not (Test-Path $outRoot)) { New-Item -ItemType Directory -Path $outRoot | Out-Null }

$ids = $failedIds -split "\n" | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" }
foreach ($id in $ids) {
    Write-Host "Downloading artifacts for run: $id" -ForegroundColor Green
    $target = Join-Path $outRoot $id
    if (-not (Test-Path $target)) { New-Item -ItemType Directory -Path $target | Out-Null }
    try {
        gh run download $id --repo $Repo --dir $target --name "*" 2>&1 | Write-Host
        Write-Host "Artifacts downloaded to: $target" -ForegroundColor Yellow
    } catch {
        Write-Warning ("Failed to download artifacts for run {0}: {1}" -f $id, $_)
    }
}

Write-Host "Done." -ForegroundColor Cyan
