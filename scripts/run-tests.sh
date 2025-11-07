#!/usr/bin/env bash
# Cross-platform test runner for Unix-like systems
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PRELOAD="$PROJECT_ROOT/src/test-preload.js"

# Prepend -r preload to NODE_OPTIONS
if [ -z "$NODE_OPTIONS" ]; then
  export NODE_OPTIONS="-r $PRELOAD"
else
  export NODE_OPTIONS="$NODE_OPTIONS -r $PRELOAD"
fi

npx vitest src/__tests__ --run
