#!/bin/bash
# One-time setup for the Mac mini.
# Run this directly on the Mac mini before the first CI deployment.
set -e

echo "=== Garmin Analyzer — Mac mini setup ==="

# ── Prerequisites ──────────────────────────────────────────────────────────────
for cmd in git docker tailscale; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "ERROR: '$cmd' is not installed. Install it and re-run."
    exit 1
  fi
done
echo "git / docker / tailscale ... OK"

# ── Tailscale connected ────────────────────────────────────────────────────────
if ! tailscale status &>/dev/null; then
  echo "ERROR: Tailscale is not connected. Run 'sudo tailscale up' first."
  exit 1
fi
echo "Tailscale .................. OK"

# ── SSH authorized_keys ────────────────────────────────────────────────────────
if [ ! -f ~/.ssh/authorized_keys ] || [ ! -s ~/.ssh/authorized_keys ]; then
  echo "WARNING: ~/.ssh/authorized_keys is empty. Add the CI public key before deploying."
fi

# ── Enable Tailscale Funnel (persistent — only needs to be run once) ───────────
echo ""
echo "Enabling Tailscale Funnel on port 3000..."
sudo tailscale funnel 3000
echo "Funnel enabled."

echo ""
echo "Setup complete. Trigger a deployment by pushing to main or running the workflow manually."
