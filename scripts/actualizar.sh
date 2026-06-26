#!/usr/bin/env bash
# Updates the 2026 World Cup daily: refreshes live Elo from eloratings.net
# and regenerates all predictions + the README sections.
#
# Usage:  bash scripts/actualizar.sh
#
# Note: this updates the INDEX (Elo) and the PREDICTIONS automatically.
# New match RESULTS are added by hand in
# .claude/skills/prediccion-mundial-2026/data/grupos-resultados-2026.json
# (see README -> "Keeping it up to date").
set -euo pipefail

SKILL="$(cd "$(dirname "$0")/.." && pwd)/.claude/skills/prediccion-mundial-2026"
DATA="$SKILL/data"

echo "1/5 - Fetching live Elo from eloratings.net ..."
curl -sSL "https://www.eloratings.net/2026.tsv" -o "$DATA/2026.tsv"

echo "2/5 - Refreshing elo_live in the dataset ..."
node "$SKILL/actualizar-elo.mjs" "$DATA/2026.tsv"

echo "3/5 - Backtest against real results ..."
node "$SKILL/backtest.mjs" --md > /dev/null

echo "4/5 - Monte Carlo tournament simulation ..."
node "$SKILL/simular.mjs" 50000 --json > /dev/null

echo "5/5 - Regenerating predictions and README ..."
node "$SKILL/genera-predicciones.mjs"

echo "Done. Review the changes with: git diff"
