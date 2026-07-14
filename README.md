# ⚽️ 2026 World Cup · Elo Predictor (case study)

> **⚠️ This is an EDUCATIONAL EXPERIMENT about predictive models and AI. It is NOT
> a betting tool. We are against gambling. We accept no responsibility for any use
> of this material. Read the [full DISCLAIMER](DISCLAIMER.md).**

Open project by **NoMa Studio AI**: how well does a simple statistical model based
on national-team **Elo ratings** predict the 2026 World Cup? We built it, measured
it against the real results, and document honestly **what works and what doesn't**.

The point of the case study isn't "beating the World Cup": it's showing, with data,
**where the ceiling of a model like this is, and why.**

🇦🇷 ¿Preferís leerlo en español? Ver [README.es.md](README.es.md).

---

## 🔮 Current predictions

<!-- PRED:START -->
_Last auto-update: **2026-06-28**. Backtest: the model gets the 1X2 right in **61.1%** of 72 matches played (random ≈ 33%)._

**🏆 Projected champion (most-likely bracket): Spain.** Projected final: **Spain 2-1 Argentina**.

**Most likely finalists (Monte Carlo):** Argentina vs France (18.1% of simulations).

| Team | Reaches final | Champion |
|---|---|---|
| Argentina | 47.7% | 27.2% |
| Spain | 38.3% | 23.9% |
| France | 37.3% | 21.8% |
| England | 22.0% | 10.3% |
| Colombia | 9.8% | 3.6% |
| Brazil | 6.1% | 2.1% |

Full detail (our group-stage predictions vs the results, the match-by-match bracket) in [**predicciones/PREDICCIONES.md**](predicciones/PREDICCIONES.md).
<!-- PRED:END -->

---

## 🧪 What we tried (and what we learned)

We started from a base model (Elo → expected goals → Poisson) and evaluated it with
a **backtest** against the matches already played. Then we tried to improve it on
three fronts. Honest result:

| Improvement we tried | Did accuracy improve? | Did probability quality improve? |
|---|---|---|
| **#1 Model draws** (Dixon-Coles) | No | **Yes** (exact score and well-calibrated draw prob.) |
| **#2 In-tournament form** (fresh match-by-match Elo) | No | No |
| **#3 Reduce overconfidence** (temper / shrink) | No | No |

**Key findings:**

1. **The model never predicts a draw, and that CANNOT be "fixed" by forcing it.** In
   the backtest, draws happened when favorites slipped up (Spain 0-0 Cape Verde,
   England 0-0 Ghana), not in evenly-matched games. Forcing draws lowers accuracy
   without catching the real draws. What does help (Dixon-Coles) is making the draw
   **probability** well-calibrated (~24.5% predicted vs 25% real).

2. **In-tournament form doesn't help.** A walk-forward backtest (no data leakage)
   showed +0.0 pp of accuracy. Even using the "perfectly fresh" live Elo from
   eloratings (an optimistic, leaky upper bound) the ceiling barely rises to ~66%.

3. **The model is already well-calibrated.** Tempering confidence worsens the Brier
   score: the apparent overconfidence on big favorites was offset by underconfidence
   on close games.

**Conclusion and why we leave the model as-is:** the predictor is **at the ceiling
of what the Elo index can deliver** for the group stage (~61-62% 1X2 accuracy, the
same as "the higher-Elo team wins"), with already-calibrated probabilities. The only
improvement that added real value was Dixon-Coles (probability quality), so that's
the one we kept. Genuinely raising accuracy would need data outside the index (squad
value, injuries, rest, etc.), which is another project.

📄 Backtest detail: [`.claude/skills/prediccion-mundial-2026/analisis-backtest.md`](.claude/skills/prediccion-mundial-2026/analisis-backtest.md)

---

## 📐 The model (specs)

1. **Index:** national-team **Elo** rating (World Football Elo Ratings,
   [eloratings.net](https://www.eloratings.net/)), taken from the
   [El Atlas](https://dschteingart.github.io/el-atlas-charts/03-futbol/chart-elo-trayectoria.html) chart.
2. **Result probability:** the Elo difference (plus home advantage for the hosts
   Mexico/Canada/USA) is mapped to an expected goal difference, which feeds a
   **Poisson** model per team → 1X2 probabilities and scorelines. With a
   **Dixon-Coles** correction for low scores.
3. **Recent form:** a bounded adjustment from index *momentum* or recent results
   (optional). Tested: does not improve accuracy (see above).
4. **Tournament simulation:** Monte Carlo (50,000 runs) combining real results with
   simulations of the remaining matches, resolving groups, best thirds and the
   official knockout bracket up to the final.
5. **Projected bracket:** a single most-likely path that predicts every knockout tie
   (score + winner) from the Round of 32 to the final.

**Backtest (pre-tournament, no leakage):** uses the Elo from *before* the World Cup.
**Forward predictions:** use the *live* Elo from eloratings (most current).

All parameters live in
[`model.mjs`](.claude/skills/prediccion-mundial-2026/model.mjs) and are tunable.

---

## 🚀 Usage

Requires Node.js (no external dependencies).

```bash
cd .claude/skills/prediccion-mundial-2026

node predict.mjs "Spain" "Argentina" --neutral    # one match
node predict.mjs USA "Mexico" --host A             # with host advantage
node backtest.mjs --md                             # backtest vs reality
node simular.mjs 50000 --json                      # simulate the tournament
node experiment-forma.mjs                          # form experiment
```

---

## 🔄 Keeping it up to date

The Elo index and the predictions **update themselves** with:

```bash
bash scripts/actualizar.sh
```

This pulls the live Elo from eloratings.net, refreshes everything and regenerates
the predictions and this README. A **GitHub Action**
([`.github/workflows/actualizar.yml`](.github/workflows/actualizar.yml)) runs it
**every day** during the World Cup and commits the changes.

**New match results:** add them to
[`data/grupos-resultados-2026.json`](.claude/skills/prediccion-mundial-2026/data/grupos-resultados-2026.json)
(`played_matches` field), moving them out of `remaining_fixtures`. That's the only
manual step; the rest is automatic.

---

## 📊 Data and sources

- **Elo:** eloratings.net (via El Atlas). 46 of 48 teams come from the Atlas
  extract; **Scotland and Curacao** are filled in with the live Elo from eloratings.
- **Results and fixtures:** collected and cross-checked across multiple public
  sources (Wikipedia, ESPN, FIFA, Yahoo, FOX, CBS, NBC). Nothing is invented:
  results not confirmed by two sources are kept as "pending".
- **Knockout bracket:** official FIFA structure; the fine pairings after the Round
  of 32 are the least certain part (see notes in the data).

---

## 🧭 Repo structure

```
README.md                     · this case study (English)
README.es.md                  · Spanish version
DISCLAIMER.md                 · legal notice (EN/ES)
LICENSE                       · MIT (code) + data note
scripts/actualizar.sh         · automatic update
.github/workflows/            · daily Action
predicciones/PREDICCIONES.md  · full predictions (auto-generated)
.claude/skills/prediccion-mundial-2026/
  ├── model.mjs               · the model (Elo + Poisson + Dixon-Coles)
  ├── predict.mjs             · predict one match
  ├── backtest.mjs            · validation against real results
  ├── simular.mjs             · tournament Monte Carlo
  ├── proyeccion.mjs          · deterministic bracket projection
  ├── experiment-forma.mjs    · in-tournament form experiment
  ├── actualizar-elo.mjs      · live Elo refresh
  ├── genera-predicciones.mjs · generates the public documents
  └── data/                   · Elo index, groups, results, bracket
```

---

## ⚖️ Notice

Built by **NoMa Studio AI** for educational and research purposes about AI and
predictive models. **We do not promote gambling.** The predictions carry a high,
documented margin of error. Use at your own sole risk. Read the
[DISCLAIMER](DISCLAIMER.md).
