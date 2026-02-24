#!/bin/bash
# One-time setup script for the Mac mini.
# Run this directly on the Mac mini, not via CI.
set -e

echo "=== Garmin Analyzer — Mac mini setup ==="

# ── 1. Prerequisites check ────────────────────────────────────────────────────
for cmd in git docker tailscale; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "ERROR: '$cmd' is not installed. Install it and re-run."
    exit 1
  fi
done

# ── 2. Clone repo (skip if already present) ───────────────────────────────────
REPO_DIR="$HOME/garmin-analyzer"
if [ ! -d "$REPO_DIR" ]; then
  echo "Cloning repository..."
  git clone https://github.com/lauderdice/garmin-analyzer.git "$REPO_DIR"
else
  echo "Repository already present at $REPO_DIR"
fi

cd "$REPO_DIR"

# ── 3. Write .env ─────────────────────────────────────────────────────────────
if [ ! -f .env ]; then
  echo ""
  echo "Enter your Garmin Connect credentials (stored only in .env, never committed):"
  read -rp "  GARMIN_USERNAME: " GARMIN_USERNAME
  read -rsp "  GARMIN_PASSWORD: " GARMIN_PASSWORD
  echo ""

  cat > .env <<EOF
GARMIN_USERNAME=${GARMIN_USERNAME}
GARMIN_PASSWORD=${GARMIN_PASSWORD}
EOF
  chmod 600 .env
  echo ".env written."
else
  echo ".env already exists — skipping credential prompt."
fi

# ── 4. Build and start containers ─────────────────────────────────────────────
echo ""
echo "Building and starting containers..."
docker compose up --build -d

echo ""
echo "Containers running:"
docker compose ps

# ── 5. Enable Tailscale Funnel on port 3000 ───────────────────────────────────
echo ""
echo "Enabling Tailscale Funnel on port 3000..."
sudo tailscale funnel 3000

echo ""
echo "=== Setup complete ==="
echo "Your app is now available at: https://$(tailscale status --json | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['Self']['DNSName'].rstrip('.'))" 2>/dev/null || echo '<your-tailscale-hostname>')"
