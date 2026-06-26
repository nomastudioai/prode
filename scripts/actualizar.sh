#!/usr/bin/env bash
# Actualiza el Mundial 2026 al día: refresca el Elo en vivo de eloratings.net
# y regenera todas las predicciones + las secciones del README.
#
# Uso:  bash scripts/actualizar.sh
#
# Nota: esto actualiza el ÍNDICE (Elo) y las PREDICCIONES automáticamente.
# Los RESULTADOS de partidos nuevos se agregan a mano en
# .claude/skills/prediccion-mundial-2026/data/grupos-resultados-2026.json
# (ver README → "Cómo mantenerlo al día").
set -euo pipefail

SKILL="$(cd "$(dirname "$0")/.." && pwd)/.claude/skills/prediccion-mundial-2026"
DATA="$SKILL/data"

echo "1/3 · Bajando Elo en vivo de eloratings.net ..."
curl -sSL "https://www.eloratings.net/2026.tsv" -o "$DATA/2026.tsv"

echo "2/3 · Refrescando elo_live en el dataset ..."
node "$SKILL/actualizar-elo.mjs" "$DATA/2026.tsv"

echo "3/3 · Regenerando predicciones y README ..."
node "$SKILL/genera-predicciones.mjs"

echo "Listo. Revisá los cambios con: git diff"
