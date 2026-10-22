#!/usr/bin/env bash
# Run on a machine that can push eightbells-manager + windmill-manager.
# Usage: from kinfold-owner root → bash manager-portals/CHARLES_DEPLOY.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP="${TMPDIR:-/tmp}/varlo-manager-deploy-$$"
mkdir -p "$TMP"
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT

deploy_one() {
  local repo="$1" src="$2"
  shift 2
  echo "=== $repo ==="
  git clone --depth 1 "https://github.com/charlesknew-alt/${repo}.git" "$TMP/$repo"
  for f in "$@"; do
    cp "$ROOT/manager-portals/$src/$f" "$TMP/$repo/$f"
  done
  cd "$TMP/$repo"
  git add "$@"
  if git diff --cached --quiet; then
    echo "No changes for $repo (already up to date)."
    return 0
  fi
  git commit -m "Drink Pricing → app.varlo.co.uk/drinks-pricing (venue-scoped)"
  git push origin HEAD
  echo "Pushed $repo"
}

deploy_one eightbells-manager eightbells index.html
deploy_one windmill-manager windmill index.html theme.js
echo "Done. Hard-refresh manager.eightbellsbolney.com and manager.windmilllittleworth.com"
echo "Expect Drink Pricing → https://app.varlo.co.uk/drinks-pricing?venue=…"
