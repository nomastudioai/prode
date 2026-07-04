#!/usr/bin/env bash
# Updates the 2026 World Cup daily: refreshes live Elo from eloratings.net
# and regenerates all predictions + the README sections.
#
# Usage:  bash scripts/actualizar.sh
#
# Note: this updates the INDEX (Elo) and the PREDICTIONS automatically.
# New match RESULTS are added by hand (see README -> "Keeping it up to date"):
#   group stage -> .claude/skills/prediccion-mundial-2026/data/grupos-resultados-2026.json
#   knockouts   -> .claude/skills/prediccion-mundial-2026/data/knockout-resultados-2026.json
set -euo pipefail

SKILL="$(cd "$(dirname "$0")/.." && pwd)/.claude/skills/prediccion-mundial-2026"
DATA="$SKILL/data"

echo "1/5 - Fetching live Elo from eloratings.net ..."
curl -sSL -A "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36" \
  "https://www.eloratings.net/2026.tsv" -o "$DATA/2026.tsv.tmp"
# Sanity check: on 2026-07-04 the server returned an HTML error page (415) and the
# corrupt file was committed. Only accept a real TSV with a plausible team count.
if grep -qi "<html" "$DATA/2026.tsv.tmp" || [ "$(wc -l < "$DATA/2026.tsv.tmp")" -lt 100 ]; then
  echo "ERROR: downloaded 2026.tsv does not look like the Elo TSV; keeping the previous one." >&2
  rm -f "$DATA/2026.tsv.tmp"
  exit 1
fi
mv "$DATA/2026.tsv.tmp" "$DATA/2026.tsv"

echo "2/5 - Refreshing elo_live in the dataset ..."
node "$SKILL/actualizar-elo.mjs" "$DATA/2026.tsv"

echo "3/5 - Backtest against real results ..."
node "$SKILL/backtest.mjs" --md > /dev/null

echo "4/5 - Monte Carlo tournament simulation ..."
node "$SKILL/simular.mjs" 50000 --json > /dev/null

echo "5/5 - Regenerating predictions and README ..."
node "$SKILL/genera-predicciones.mjs"

echo "Done. Review the changes with: git diff"
