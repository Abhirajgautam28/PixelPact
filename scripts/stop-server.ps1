# Stop any node process running the local PixelPact server (server/index.js)
try{
  $procs = Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -and ($_.CommandLine -match 'server\\index\.js') }
  if (-not $procs) { Write-Output 'No PixelPact server process found.' ; exit 0 }
  foreach ($p in $procs) {
    Write-Output "Stopping PID $($p.ProcessId) (cmd: $($p.CommandLine))"
    Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue
  }
  # also attempt to remove a PID file if present
  $pidPath = Join-Path (Get-Location) 'server.pid'
  if (Test-Path $pidPath) { Remove-Item $pidPath -ErrorAction SilentlyContinue }
  Write-Output 'Stopped PixelPact server processes.'
} catch {
  Write-Error "Failed to stop server: $_"
  exit 1
}
