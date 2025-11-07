# PowerShell script to run tests with preload
$projectRoot = Split-Path -Parent $PSScriptRoot
$preload = Join-Path $projectRoot 'src\test-preload.js'

if (-not [string]::IsNullOrEmpty($env:NODE_OPTIONS)) {
    $env:NODE_OPTIONS = "$env:NODE_OPTIONS -r $preload"
} else {
    $env:NODE_OPTIONS = "-r $preload"
}

npx vitest src/__tests__ --run
