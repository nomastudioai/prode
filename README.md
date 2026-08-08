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

**Most likely finalists (Monte Carlo):** Argentina vs Spain (25.9% of simulations).

| Team | Reaches final | Champion |
|---|---|---|
| Spain | 57.5% | 40.0% |
| Argentina | 45.1% | 24.0% |
| England | 26.4% | 12.4% |
| France | 18.0% | 8.1% |
| Colombia | 9.1% | 3.1% |
| Netherlands | 6.0% | 2.0% |

Full detail (our group-stage predictions vs the results, the match-by-match bracket) in [**predicciones/PREDICCIONES.md**](predicciones/PREDICCIONES.md).
<!-- PRED:END -->

---

## 📉 Post-mortem: how well did we do?

<!-- POSTMORTEM:START -->
_Post-mortem generated on **2026-07-18**. Every match was predicted with the same model (Elo pre-tournament + momentum, host advantage only). The group figure is the backtest; the knockout figure applies the identical model to each real tie._

### 🎯 Headline

| Stage | Matches | We got right | Accuracy | Reference |
|---|---|---|---|---|
| Group stage (1X2) | 72 | 44 | **61.1%** | random ≈ 33% · "higher Elo wins" ≈ 61% |
| Knockouts (who advances) | 30 | 24 | **80.0%** | coin-flip = 50% |
| **Whole tournament so far** | **102** | **68** | **66.7%** | |

> The two metrics are **not** the same thing. In the group stage a match has three outcomes (win / draw / loss), so 33% is the random baseline. In the knockouts there are no draws: someone always advances, so the honest baseline is a 50/50 coin-flip. The knockout number is measured as "did we call the team that advanced", running the same Elo model on each **real** tie.

**The model called the final right.** Its most-likely projected final was **Spain vs Argentina**, and that is exactly the real final (19/07). It also had both eventual finalists as the two most likely champions in the Monte Carlo (Spain 32.3%, Argentina 30.9%).

### 🟦 Group stage: accuracy by group (44/72 = 61.1%)

1X2 pick before kick-off vs the real result. Full match-by-match table (72 games) in [predicciones/PREDICCIONES.md](predicciones/PREDICCIONES.md).

| Group | Right | Matches | Exact score |
|---|---|---|---|
| A | 4 | 6 | 2 |
| B | 4 | 6 | 1 |
| C | 5 | 6 | 1 |
| D | 1 | 6 | 0 |
| E | 4 | 6 | 1 |
| F | 4 | 6 | 1 |
| G | 2 | 6 | 2 |
| H | 2 | 6 | 0 |
| I | 6 | 6 | 0 |
| J | 5 | 6 | 1 |
| K | 3 | 6 | 0 |
| L | 4 | 6 | 1 |
| **Total** | **44** | **72** | **10** |

### 🟥 Knockouts: accuracy by round (24/30 = 80.0%)

| Round | Right | Matches |
|---|---|---|
| Round of 32 | 13 | 16 |
| Round of 16 | 5 | 8 |
| Quarter-finals | 4 | 4 |
| Semi-finals | 2 | 2 |
| **Total** | **24** | **30** |

### 🔁 Knockouts: our prediction vs the real result (match by match)

Our pick = the team the model made favourite. Pred. score = the model's most-likely decisive scoreline. ✓ = we called who advanced, ✗ = miss. `(a.e.t.)` extra time, `(pens)` penalties.

| Round | Match | Real result | Advanced | Our pick | Pred. score | Hit |
|---|---|---|---|---|---|---|
| Round of 32 | South Africa vs Canada | **0-1** | Canada | Canada | 0-2 | ✓ |
| Round of 32 | Germany vs Paraguay | **1-1 (pens 3-4)** | Paraguay | Germany | 2-1 | ✗ |
| Round of 32 | Netherlands vs Morocco | **1-1 (pens 2-3)** | Morocco | Netherlands | 1-0 | ✗ |
| Round of 32 | Brazil vs Japan | **2-1** | Brazil | Brazil | 2-1 | ✓ |
| Round of 32 | France vs Sweden | **3-0** | France | France | 2-0 | ✓ |
| Round of 32 | Ivory Coast vs Norway | **1-2** | Norway | Norway | 0-1 | ✓ |
| Round of 32 | Mexico vs Ecuador | **2-0** | Mexico | Mexico | 2-1 | ✓ |
| Round of 32 | England vs DR Congo | **2-1** | England | England | 2-0 | ✓ |
| Round of 32 | United States vs Bosnia and Herzegovina | **2-0** | United States | United States | 1-0 | ✓ |
| Round of 32 | Belgium vs Senegal | **3-2 (a.e.t.)** | Belgium | Belgium | 2-1 | ✓ |
| Round of 32 | Portugal vs Croatia | **2-1** | Portugal | Portugal | 2-1 | ✓ |
| Round of 32 | Spain vs Austria | **3-0** | Spain | Spain | 2-0 | ✓ |
| Round of 32 | Switzerland vs Algeria | **2-0** | Switzerland | Switzerland | 1-0 | ✓ |
| Round of 32 | Argentina vs Cape Verde | **3-2 (a.e.t.)** | Argentina | Argentina | 2-0 | ✓ |
| Round of 32 | Colombia vs Ghana | **1-0** | Colombia | Colombia | 2-0 | ✓ |
| Round of 32 | Australia vs Egypt | **1-1 (pens 2-4)** | Egypt | Australia | 2-1 | ✗ |
| Round of 16 | Paraguay vs France | **0-1** | France | France | 0-1 | ✓ |
| Round of 16 | Canada vs Morocco | **0-3** | Morocco | Canada | 2-1 | ✗ |
| Round of 16 | Brazil vs Norway | **1-2** | Norway | Brazil | 2-1 | ✗ |
| Round of 16 | Mexico vs England | **2-3** | England | England | 1-2 | ✓ |
| Round of 16 | Portugal vs Spain | **0-1** | Spain | Spain | 0-1 | ✓ |
| Round of 16 | United States vs Belgium | **1-4** | Belgium | Belgium | 0-1 | ✓ |
| Round of 16 | Argentina vs Egypt | **3-2 (a.e.t.)** | Argentina | Argentina | 2-0 | ✓ |
| Round of 16 | Switzerland vs Colombia | **0-0 (pens 4-3)** | Switzerland | Colombia | 1-2 | ✗ |
| Quarter-finals | France vs Morocco | **2-0** | France | France | 2-0 | ✓ |
| Quarter-finals | Spain vs Belgium | **2-1** | Spain | Spain | 2-0 | ✓ |
| Quarter-finals | Norway vs England | **1-2** | England | England | 1-2 | ✓ |
| Quarter-finals | Argentina vs Switzerland | **3-1** | Argentina | Argentina | 1-0 | ✓ |
| Semi-finals | France vs Spain | **0-2** | Spain | Spain | 1-2 | ✓ |
| Semi-finals | England vs Argentina | **1-2** | Argentina | Argentina | 1-2 | ✓ |

**Where the model missed in the knockouts (6):** Germany was favoured but Paraguay advanced (Germany vs Paraguay); Netherlands was favoured but Morocco advanced (Netherlands vs Morocco); Australia was favoured but Egypt advanced (Australia vs Egypt); Canada was favoured but Morocco advanced (Canada vs Morocco); Brazil was favoured but Norway advanced (Brazil vs Norway); Colombia was favoured but Switzerland advanced (Switzerland vs Colombia).

### ⏳ Still to play: the model's prediction

These two matches had **not been played** when this post-mortem was generated (third place 2026-07-18, final 2026-07-19). No real result yet, here is only the model's forecast, to be checked afterwards. Forecast made the **forward** way (live eloratings.net Elo, same as the projected bracket), with a **50,000-run Monte Carlo** resolving draws by penalties: "1/X/2" is the 90-minute result, "Wins the tie" includes extra time and shoot-outs.

| Match | Round | Date | Favourite | Pred. score | p(1/X/2) at 90' | Wins the tie (MC) |
|---|---|---|---|---|---|---|
| France vs England | Third place play-off | 2026-07-18 | **England** | 1-2 | 30/29/40 | England 57.5% |
| Spain vs Argentina | Final | 2026-07-19 | **Spain** | 2-1 | 43/28/27 | Spain 61.8% |

### 🧠 What the post-mortem says about the model

1. **Consistent, not clairvoyant.** ~61.1% in groups and 80.0% in knockouts is roughly "the higher-Elo team wins": solid, but it lives or dies with the favourites. It cannot see an upset coming (Paraguay over Germany, Morocco over the Netherlands, Norway over Brazil), which is exactly where a pure-Elo index hits its ceiling.
2. **Penalties are a coin-flip the model doesn't model.** Several ties it "lost" were 90-minute draws decided from the spot, and the Elo index has nothing to say about a shootout.
3. **It nailed the big picture.** The projected bracket's final (Spain vs Argentina) is the real final, and the two finalists were the model's top-2 title favourites. The signal is strongest exactly where there is the most data (elite teams, large Elo gaps) and weakest in the close, one-off games.
<!-- POSTMORTEM:END -->

Full detail in [**predicciones/POSTMORTEM.md**](predicciones/POSTMORTEM.md).

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

**New match results:** add group games to
[`data/grupos-resultados-2026.json`](.claude/skills/prediccion-mundial-2026/data/grupos-resultados-2026.json)
(`played_matches` field), moving them out of `remaining_fixtures`; add knockout
games to
[`data/knockout-resultados-2026.json`](.claude/skills/prediccion-mundial-2026/data/knockout-resultados-2026.json)
(move a tie from `pending` to `played` with its score and who advanced). That's the
only manual step; the rest is automatic.

---

## 📊 Data and sources

- **Elo:** eloratings.net (via El Atlas). 46 of 48 teams come from the Atlas
  extract; **Scotland and Curacao** are filled in with the live Elo from eloratings.
- **Results and fixtures:** collected and cross-checked across multiple public
  sources (FIFA match centre, Wikipedia, ESPN, Sky Sports, Yahoo, FOX, CBS, Al
  Jazeera). Nothing is invented: results not confirmed by two sources are kept as
  "pending" (the third-place match and the final had not been played when the
  post-mortem was written, so they carry only the model's forecast, not a result).
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
predicciones/POSTMORTEM.md    · tournament post-mortem (auto-generated)
.claude/skills/prediccion-mundial-2026/
  ├── model.mjs               · the model (Elo + Poisson + Dixon-Coles)
  ├── predict.mjs             · predict one match
  ├── backtest.mjs            · validation against real results
  ├── simular.mjs             · tournament Monte Carlo
  ├── proyeccion.mjs          · deterministic bracket projection
  ├── experiment-forma.mjs    · in-tournament form experiment
  ├── actualizar-elo.mjs      · live Elo refresh
  ├── genera-predicciones.mjs · generates the public documents
  ├── postmortem.mjs          · groups + knockouts prediction vs reality
  └── data/                   · Elo index, groups, results, bracket
```

---

## ⚖️ Notice

Built by **NoMa Studio AI** for educational and research purposes about AI and
predictive models. **We do not promote gambling.** The predictions carry a high,
documented margin of error. Use at your own sole risk. Read the
[DISCLAIMER](DISCLAIMER.md).
