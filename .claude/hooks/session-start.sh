#!/bin/bash
set -euo pipefail

# Only run in remote (Claude Code on the web) environments
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

REPO_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"

echo "==> Installing backend dependencies (uv sync)..."
cd "$REPO_DIR/backend"
uv sync --python python3.12

echo "==> Installing frontend dependencies (npm install)..."
cd "$REPO_DIR/frontend"
npm install

echo "==> Session start hook complete."
