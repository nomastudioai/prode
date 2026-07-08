---
name: prediccion-mundial-2026
description: Predicts 2026 FIFA World Cup match results by combining the national-team Elo index (eloratings.net, via El Atlas) with recent form. Use it when the user asks to forecast a match, a tie, a group or the bracket of the 2026 World Cup, or asks for 1X2 / scoreline probabilities between qualified national teams.
---

# Match prediction · 2026 World Cup

Skill to estimate the result of a match between teams qualified for the 2026
World Cup, using the **Elo rating** of each team plus a **recent-form** adjustment.

## Data

- `data/elo-mundial-2026.json` — the 48 qualified teams with their 2026 Elo and
  world rank, plus recent trajectory (2018-2026). `elo_2026` = pre-tournament
  snapshot (backtest); `elo_live` = live eloratings (forward predictions);
  `en_name` = English display name.
- `data/grupos-resultados-2026.json` — the 12 groups, played results and the
  remaining fixtures.
- `data/knockout-2026.json` — official Round-of-32 to Final bracket structure.
- `data/knockout-resultados-2026.json` — real results of the knockout rounds already
  played (Round of 32, Round of 16, …). When present, the projection and the Monte
  Carlo condition on them: the real winners advance and only the unplayed rounds are
  predicted/simulated. Add new results here as each round finishes.
- `data/elo-series-completo-1901-2026.js` — full historical series (195 teams).

**Source:** World Football Elo Ratings (eloratings.net), via the El Atlas chart.
Scotland and Curacao are not in the Atlas extract; they use live eloratings Elo.

## How to use

Requires Node.js. From the skill directory:

```bash
node predict.mjs --list                            # list teams + Elo
node predict.mjs "Spain" "Argentina" --neutral     # one match (neutral)
node predict.mjs USA "Mexico" --host A             # with host advantage
node predict.mjs Japan Croatia --formA W,W,D,L,W --formB L,D,L,L,W --neutral
node predict.mjs Scotland "Spain" --eloA 1745 --neutral   # team without index: manual Elo
```

Accepts English/Spanish name or ISO3 code (`ESP`, `ARG`, `GBR`...).

### Flags

| Flag | What it does |
|------|--------------|
| `--neutral` | No home advantage (default for group stage at a neutral venue). |
| `--host A\|B` | Marks team A or B as host (home advantage). |
| `--home A\|B` | Same as host: that team plays at home. |
| `--formA / --formB` | Recent results `W,D,L,...` (most recent first). Otherwise uses index momentum. |
| `--eloA / --eloB` | Manual Elo override. |
| `--list` | Lists the 48 teams with Elo/rank. |

## Model

Transparent, tunable heuristic (see `PARAMS` in `model.mjs`):

1. **Effective Elo** = index Elo + form adjustment (bounded) + home advantage (if any).
2. **Expected goal difference** = (effective Elo A − effective Elo B) × `GOAL_SCALE`.
3. Split over an expected total (`BASE_TOTAL`) to get each team's expected goals (λ).
4. A per-team **Poisson** model gives 1X2 probabilities and the most likely scorelines.

**Draw model (v2):** a **Dixon-Coles** correction (`DC_RHO`) raises 0-0 and 1-1
probabilities and keeps the draw probability well-calibrated (~24.5% avg vs 25%
real in the backtest). Important: the backtest showed that *forcing* draw picks
does not improve accuracy (World Cup draws came from favorites slipping up, not
even games), so the predictor picks the favorite and reports the calibrated draw
probability (`DRAW_PICK_MARGIN` kept low).

The recent-form adjustment has two modes: index *momentum* by default, or actual
recent results via `--formA/--formB`. Tested: it does not improve accuracy.

## Backtest, simulation and projection

- `backtest.mjs --md` — validates the predictor against the matches already played
  (1X2 accuracy, exact score, Brier, log-loss, calibration, baselines). Writes
  `analisis-backtest.md` and `data/backtest-stats.json`.
- `simular.mjs 50000 --json` — Monte Carlo of the whole tournament: advance/position
  probabilities per group, finalists and champion. Writes `predicciones/simulacion.json`.
- `proyeccion.mjs` — deterministic single-most-likely bracket: predicts every
  knockout tie (score + winner) from the Round of 32 to the final.
- `experiment-forma.mjs` — walk-forward experiment on in-tournament form.
- `genera-predicciones.mjs` — builds the public `predicciones/PREDICCIONES.md` and
  updates the README predictions block (English).

## Limitations

- The index updates daily (live) but is still just Elo: it does not model injuries,
  suspensions, weather or match context. 1X2 accuracy tops out ~61-62%.
- Finalist/champion predictions compound uncertainty each round: low confidence.
- An estimate, not a guarantee. This is a research experiment, not a betting tool.

## Architecture

- `model.mjs` — the model (Elo + form → Poisson + Dixon-Coles) and `PARAMS`.
- `predict.mjs` / `backtest.mjs` / `simular.mjs` / `proyeccion.mjs` / `experiment-forma.mjs`.
- `actualizar-elo.mjs` + `../../../scripts/actualizar.sh` — daily live-Elo refresh.

## Updating the data

`bash scripts/actualizar.sh` (from repo root) refreshes the live Elo and regenerates
everything. New group-stage results go into `data/grupos-resultados-2026.json`; new
knockout results go into `data/knockout-resultados-2026.json` (keyed by bracket match
id, e.g. `M97`).
