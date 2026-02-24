#!/bin/bash
# Pre-flight check for the Mac mini.
# Run once to confirm the machine is ready for CI deployments.
# CI handles everything else (clone, .env, Funnel, Docker).
set -e

echo "=== Garmin Analyzer — Mac mini pre-flight check ==="

# ── Prerequisites ──────────────────────────────────────────────────────────────
for cmd in git docker tailscale; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "ERROR: '$cmd' is not installed. Install it before triggering CI."
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

echo ""
echo "Machine is ready. Trigger a deployment by pushing to main or running the workflow manually."
