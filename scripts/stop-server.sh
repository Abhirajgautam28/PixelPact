#!/usr/bin/env bash
# Stop any node process running the local PixelPact server (server/index.js)
set -euo pipefail
PIDS=$(pgrep -f "server/index.js" || true)
if [ -z "$PIDS" ]; then
  echo "No PixelPact server process found."
  exit 0
fi
echo "Stopping server PIDs: $PIDS"
echo $PIDS | xargs -r kill || true
# remove PID file if exists
if [ -f server.pid ]; then
  rm -f server.pid || true
fi
echo "Stopped PixelPact server processes."
