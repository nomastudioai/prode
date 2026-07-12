# Predictions · 2026 FIFA World Cup

> Auto-generated on 2026-07-12. **This is an experiment, do NOT bet.** See [DISCLAIMER](../DISCLAIMER.md).

**Model reliability (backtest over 72 matches already played):** the model gets the 1X2 result right **61.1%** of the time (random ≈ 33%, "higher-Elo team wins" ≈ 61.1%). Exact scoreline 13.9%. Everything below inherits that margin of error, which **grows every round** (the finalist predictions are low-confidence). The most likely scoreline is shown for every match: useful as an "expected result", not a certainty.

## 1) Group stage: our predictions vs the final results

The group stage is over: all **72 matches** have been played. Each one was predicted **before kick-off** with the same Elo + Poisson model as the backtest (pre-tournament Elo, no leakage). The **Hit** column marks where the model's 1X2 pick matched the real result.

**Scoreboard: we called 44 of 72 group-stage results right (61.1%)**, and nailed the exact scoreline 10 times (13.9%). ✓ = correct pick, ✗ = miss. 1 = home win, X = draw, 2 = away win.

| Date | Group | Match | Result | Our pick | Pred. score | Hit |
|---|---|---|---|---|---|---|
| 2026-06-11 | A | Mexico vs South Africa | **2-0** | Mexico | 2-0 | ✓ |
| 2026-06-11 | A | South Korea vs Czech Republic | **2-1** | South Korea | 1-1 | ✓ |
| 2026-06-18 | A | Czech Republic vs South Africa | **1-1** | Czech Republic | 1-1 | ✗ |
| 2026-06-18 | A | Mexico vs South Korea | **1-0** | Mexico | 1-1 | ✓ |
| 2026-06-24 | A | Czech Republic vs Mexico | **0-3** | Mexico | 1-1 | ✓ |
| 2026-06-24 | A | South Africa vs South Korea | **1-0** | South Korea | 1-1 | ✗ |
| 2026-06-12 | B | Canada vs Bosnia and Herzegovina | **1-1** | Canada | 1-1 | ✗ |
| 2026-06-13 | B | Qatar vs Switzerland | **1-1** | Switzerland | 0-2 | ✗ |
| 2026-06-18 | B | Switzerland vs Bosnia and Herzegovina | **4-1** | Switzerland | 2-0 | ✓ |
| 2026-06-18 | B | Canada vs Qatar | **6-0** | Canada | 2-0 | ✓ |
| 2026-06-24 | B | Switzerland vs Canada | **2-1** | Switzerland | 1-1 | ✓ |
| 2026-06-24 | B | Bosnia and Herzegovina vs Qatar | **3-1** | Bosnia and Herzegovina | 1-1 | ✓ |
| 2026-06-13 | C | Brazil vs Morocco | **1-1** | Brazil | 1-1 | ✗ |
| 2026-06-13 | C | Haiti vs Scotland | **0-1** | Scotland | 1-1 | ✓ |
| 2026-06-19 | C | Scotland vs Morocco | **0-1** | Morocco | 1-1 | ✓ |
| 2026-06-19 | C | Brazil vs Haiti | **3-0** | Brazil | 2-0 | ✓ |
| 2026-06-24 | C | Scotland vs Brazil | **0-3** | Brazil | 1-1 | ✓ |
| 2026-06-24 | C | Morocco vs Haiti | **4-2** | Morocco | 2-0 | ✓ |
| 2026-06-12 | D | United States vs Paraguay | **4-1** | Paraguay | 1-1 | ✗ |
| 2026-06-13 | D | Australia vs Turkey | **2-0** | Turkey | 1-1 | ✗ |
| 2026-06-19 | D | United States vs Australia | **2-0** | Australia | 1-1 | ✗ |
| 2026-06-19 | D | Turkey vs Paraguay | **0-1** | Turkey | 1-1 | ✗ |
| 2026-06-25 | D | Turkey vs United States | **3-2** | Turkey | 1-1 | ✓ |
| 2026-06-25 | D | Paraguay vs Australia | **0-0** | Paraguay | 1-1 | ✗ |
| 2026-06-14 | E | Germany vs Curacao | **7-1** | Germany | 2-0 | ✓ |
| 2026-06-14 | E | Ivory Coast vs Ecuador | **1-0** | Ecuador | 1-1 | ✗ |
| 2026-06-20 | E | Germany vs Ivory Coast | **2-1** | Germany | 1-1 | ✓ |
| 2026-06-20 | E | Ecuador vs Curacao | **0-0** | Ecuador | 2-0 | ✗ |
| 2026-06-25 | E | Curacao vs Ivory Coast | **0-2** | Ivory Coast | 0-2 | ✓ |
| 2026-06-25 | E | Ecuador vs Germany | **2-1** | Ecuador | 1-1 | ✓ |
| 2026-06-14 | F | Netherlands vs Japan | **2-2** | Netherlands | 1-1 | ✗ |
| 2026-06-14 | F | Sweden vs Tunisia | **5-1** | Sweden | 1-1 | ✓ |
| 2026-06-20 | F | Netherlands vs Sweden | **5-1** | Netherlands | 1-1 | ✓ |
| 2026-06-20 | F | Tunisia vs Japan | **0-4** | Japan | 0-2 | ✓ |
| 2026-06-25 | F | Japan vs Sweden | **1-1** | Japan | 1-1 | ✗ |
| 2026-06-25 | F | Tunisia vs Netherlands | **1-3** | Netherlands | 0-2 | ✓ |
| 2026-06-15 | G | Belgium vs Egypt | **1-1** | Belgium | 1-1 | ✗ |
| 2026-06-15 | G | Iran vs New Zealand | **2-2** | Iran | 1-1 | ✗ |
| 2026-06-21 | G | Belgium vs Iran | **0-0** | Belgium | 1-1 | ✗ |
| 2026-06-21 | G | New Zealand vs Egypt | **1-3** | Egypt | 1-1 | ✓ |
| 2026-06-26 | G | Egypt vs Iran | **1-1** | Iran | 1-1 | ✗ |
| 2026-06-26 | G | New Zealand vs Belgium | **1-5** | Belgium | 0-2 | ✓ |
| 2026-06-15 | H | Spain vs Cape Verde | **0-0** | Spain | 2-0 | ✗ |
| 2026-06-15 | H | Saudi Arabia vs Uruguay | **1-1** | Uruguay | 0-2 | ✗ |
| 2026-06-21 | H | Spain vs Saudi Arabia | **4-0** | Spain | 2-0 | ✓ |
| 2026-06-21 | H | Uruguay vs Cape Verde | **2-2** | Uruguay | 1-1 | ✗ |
| 2026-06-26 | H | Cape Verde vs Saudi Arabia | **0-0** | Cape Verde | 1-1 | ✗ |
| 2026-06-26 | H | Uruguay vs Spain | **0-1** | Spain | 0-2 | ✓ |
| 2026-06-16 | I | France vs Senegal | **3-1** | France | 1-1 | ✓ |
| 2026-06-16 | I | Iraq vs Norway | **1-4** | Norway | 0-2 | ✓ |
| 2026-06-22 | I | France vs Iraq | **3-0** | France | 2-0 | ✓ |
| 2026-06-22 | I | Norway vs Senegal | **3-2** | Norway | 1-1 | ✓ |
| 2026-06-26 | I | Norway vs France | **1-4** | France | 1-1 | ✓ |
| 2026-06-26 | I | Senegal vs Iraq | **5-0** | Senegal | 2-0 | ✓ |
| 2026-06-16 | J | Argentina vs Algeria | **3-0** | Argentina | 2-0 | ✓ |
| 2026-06-16 | J | Austria vs Jordan | **3-1** | Austria | 1-1 | ✓ |
| 2026-06-22 | J | Argentina vs Austria | **2-0** | Argentina | 2-0 | ✓ |
| 2026-06-22 | J | Jordan vs Algeria | **1-2** | Algeria | 1-1 | ✓ |
| 2026-06-27 | J | Algeria vs Austria | **3-3** | Austria | 1-1 | ✗ |
| 2026-06-27 | J | Jordan vs Argentina | **1-3** | Argentina | 0-2 | ✓ |
| 2026-06-17 | K | Portugal vs DR Congo | **1-1** | Portugal | 2-0 | ✗ |
| 2026-06-17 | K | Uzbekistan vs Colombia | **1-3** | Colombia | 1-1 | ✓ |
| 2026-06-23 | K | Portugal vs Uzbekistan | **5-0** | Portugal | 1-1 | ✓ |
| 2026-06-23 | K | Colombia vs DR Congo | **1-0** | Colombia | 2-0 | ✓ |
| 2026-06-27 | K | Colombia vs Portugal | **0-0** | Portugal | 1-1 | ✗ |
| 2026-06-27 | K | DR Congo vs Uzbekistan | **3-1** | Uzbekistan | 1-1 | ✗ |
| 2026-06-17 | L | England vs Croatia | **4-2** | England | 1-1 | ✓ |
| 2026-06-17 | L | Ghana vs Panama | **1-0** | Panama | 1-1 | ✗ |
| 2026-06-23 | L | England vs Ghana | **0-0** | England | 2-0 | ✗ |
| 2026-06-23 | L | Panama vs Croatia | **0-1** | Croatia | 1-1 | ✓ |
| 2026-06-27 | L | Panama vs England | **0-2** | England | 0-2 | ✓ |
| 2026-06-27 | L | Croatia vs Ghana | **2-1** | Croatia | 2-0 | ✓ |

## 2) Coming up: Semi-finals (our predictions)

The bracket below is **real** up to the last round played; these are the next matches, predicted with live Elo. 1 = first team wins, X = draw (in 90'), 2 = second team wins. The pick is the model's winner of the tie (a 90' draw goes to extra time/penalties).

| Date | Match | Pick | Pred. score | p(1/X/2) |
|---|---|---|---|---|
| 2026-07-14 | France vs Spain | **Spain** | 1-2 | 34/29/36 |
| 2026-07-15 | England vs Argentina | **Argentina** | 1-2 | 29/29/43 |

## 3) Knockout bracket: results and projection (match by match)

Single most-likely path: the **final** group standings set the bracket; ties already played show the **real result** (marked ✓, with a.e.t./penalties where it applied); the rest are predicted with a decisive score and a winner (in reality many ties go to extra time/penalties; "(tight)" marks the near coin-flips).


### Round of 32

- ✓ **South Africa 0-1 Canada** → advanced **Canada** _(played)_
- ✓ **Germany 1-1 Paraguay** (a.e.t., 3-4 on penalties) → advanced **Paraguay** _(played)_
- ✓ **Netherlands 1-1 Morocco** (a.e.t., 2-3 on penalties) → advanced **Morocco** _(played)_
- ✓ **Brazil 2-1 Japan** → advanced **Brazil** _(played)_
- ✓ **France 3-0 Sweden** → advanced **France** _(played)_
- ✓ **Ivory Coast 1-2 Norway** → advanced **Norway** _(played)_
- ✓ **Mexico 2-0 Ecuador** → advanced **Mexico** _(played)_
- ✓ **England 2-1 DR Congo** → advanced **England** _(played)_
- ✓ **United States 2-0 Bosnia and Herzegovina** → advanced **United States** _(played)_
- ✓ **Belgium 3-2 Senegal** (a.e.t.) → advanced **Belgium** _(played)_
- ✓ **Portugal 2-1 Croatia** → advanced **Portugal** _(played)_
- ✓ **Spain 3-0 Austria** → advanced **Spain** _(played)_
- ✓ **Switzerland 2-0 Algeria** → advanced **Switzerland** _(played)_
- ✓ **Argentina 3-2 Cape Verde** (a.e.t.) → advanced **Argentina** _(played)_
- ✓ **Colombia 1-0 Ghana** → advanced **Colombia** _(played)_
- ✓ **Australia 1-1 Egypt** (a.e.t., 2-4 on penalties) → advanced **Egypt** _(played)_

### Round of 16

- ✓ **Paraguay 0-1 France** → advanced **France** _(played)_
- ✓ **Canada 0-3 Morocco** → advanced **Morocco** _(played)_
- ✓ **Brazil 1-2 Norway** → advanced **Norway** _(played)_
- ✓ **Mexico 2-3 England** → advanced **England** _(played)_
- ✓ **Portugal 0-1 Spain** → advanced **Spain** _(played)_
- ✓ **United States 1-4 Belgium** → advanced **Belgium** _(played)_
- ✓ **Argentina 3-2 Egypt** (a.e.t.) → advanced **Argentina** _(played)_
- ✓ **Switzerland 0-0 Colombia** (a.e.t., 4-3 on penalties) → advanced **Switzerland** _(played)_

### Quarter-finals

- ✓ **France 2-0 Morocco** → advanced **France** _(played)_
- ✓ **Spain 2-1 Belgium** → advanced **Spain** _(played)_
- ✓ **Norway 1-2 England** (a.e.t.) → advanced **England** _(played)_
- ✓ **Argentina 3-1 Switzerland** (a.e.t.) → advanced **Argentina** _(played)_

### Semi-finals

- **France 1-2 Spain** → advances **Spain** _(tight)_
- **England 1-2 Argentina** → advances **Argentina**

### Final

- **Spain 2-1 Argentina** → advances **Spain**

### 🏆 Projected champion: **Spain**

Projected final: Spain 2-1 Argentina (winner Spain, without the actual result).

## 4) Who advances? Group probabilities

Probability of reaching the Round of 32 (top 2 per group + 8 best third-placed teams), from 50,000 Monte Carlo runs. ✓ = group already decided.

### Group A ✓ (decided)

| Pos | Team | P | Pts | GD | Advance | 1st | 2nd |
|---|---|---|---|---|---|---|---|
| 1 | Mexico | 3 | 9 | +6 | ✓ 100% | 100.0% | 0.0% |
| 2 | South Africa | 3 | 4 | -1 | ✓ 100% | 0.0% | 100.0% |
| 3 | South Korea | 3 | 3 | -1 | 0.0% | 0.0% | 0.0% |
| 4 | Czech Republic | 3 | 1 | -4 | 0.0% | 0.0% | 0.0% |

### Group B ✓ (decided)

| Pos | Team | P | Pts | GD | Advance | 1st | 2nd |
|---|---|---|---|---|---|---|---|
| 1 | Switzerland | 3 | 7 | +4 | ✓ 100% | 100.0% | 0.0% |
| 2 | Canada | 3 | 4 | +5 | ✓ 100% | 0.0% | 100.0% |
| 3 | Bosnia and Herzegovina | 3 | 4 | -1 | 100.0% | 0.0% | 0.0% |
| 4 | Qatar | 3 | 1 | -8 | 0.0% | 0.0% | 0.0% |

### Group C ✓ (decided)

| Pos | Team | P | Pts | GD | Advance | 1st | 2nd |
|---|---|---|---|---|---|---|---|
| 1 | Brazil | 3 | 7 | +6 | ✓ 100% | 100.0% | 0.0% |
| 2 | Morocco | 3 | 7 | +3 | ✓ 100% | 0.0% | 100.0% |
| 3 | Scotland | 3 | 3 | -3 | 0.0% | 0.0% | 0.0% |
| 4 | Haiti | 3 | 0 | -6 | 0.0% | 0.0% | 0.0% |

### Group D ✓ (decided)

| Pos | Team | P | Pts | GD | Advance | 1st | 2nd |
|---|---|---|---|---|---|---|---|
| 1 | United States | 3 | 6 | +4 | ✓ 100% | 100.0% | 0.0% |
| 2 | Australia | 3 | 4 | +0 | ✓ 100% | 0.0% | 100.0% |
| 3 | Paraguay | 3 | 4 | -2 | 100.0% | 0.0% | 0.0% |
| 4 | Turkey | 3 | 3 | -2 | 0.0% | 0.0% | 0.0% |

### Group E ✓ (decided)

| Pos | Team | P | Pts | GD | Advance | 1st | 2nd |
|---|---|---|---|---|---|---|---|
| 1 | Germany | 3 | 6 | +6 | ✓ 100% | 100.0% | 0.0% |
| 2 | Ivory Coast | 3 | 6 | +2 | ✓ 100% | 0.0% | 100.0% |
| 3 | Ecuador | 3 | 4 | +0 | 100.0% | 0.0% | 0.0% |
| 4 | Curacao | 3 | 1 | -8 | 0.0% | 0.0% | 0.0% |

### Group F ✓ (decided)

| Pos | Team | P | Pts | GD | Advance | 1st | 2nd |
|---|---|---|---|---|---|---|---|
| 1 | Netherlands | 3 | 7 | +6 | ✓ 100% | 100.0% | 0.0% |
| 2 | Japan | 3 | 5 | +4 | ✓ 100% | 0.0% | 100.0% |
| 3 | Sweden | 3 | 4 | +0 | 100.0% | 0.0% | 0.0% |
| 4 | Tunisia | 3 | 0 | -10 | 0.0% | 0.0% | 0.0% |

### Group G ✓ (decided)

| Pos | Team | P | Pts | GD | Advance | 1st | 2nd |
|---|---|---|---|---|---|---|---|
| 1 | Belgium | 3 | 5 | +4 | ✓ 100% | 100.0% | 0.0% |
| 2 | Egypt | 3 | 5 | +2 | ✓ 100% | 0.0% | 100.0% |
| 3 | Iran | 3 | 3 | +0 | 0.0% | 0.0% | 0.0% |
| 4 | New Zealand | 3 | 1 | -6 | 0.0% | 0.0% | 0.0% |

### Group H ✓ (decided)

| Pos | Team | P | Pts | GD | Advance | 1st | 2nd |
|---|---|---|---|---|---|---|---|
| 1 | Spain | 3 | 7 | +5 | ✓ 100% | 100.0% | 0.0% |
| 2 | Cape Verde | 3 | 3 | +0 | ✓ 100% | 0.0% | 100.0% |
| 3 | Uruguay | 3 | 2 | -1 | 0.0% | 0.0% | 0.0% |
| 4 | Saudi Arabia | 3 | 2 | -4 | 0.0% | 0.0% | 0.0% |

### Group I ✓ (decided)

| Pos | Team | P | Pts | GD | Advance | 1st | 2nd |
|---|---|---|---|---|---|---|---|
| 1 | France | 3 | 9 | +8 | ✓ 100% | 100.0% | 0.0% |
| 2 | Norway | 3 | 6 | +1 | ✓ 100% | 0.0% | 100.0% |
| 3 | Senegal | 3 | 3 | +2 | 100.0% | 0.0% | 0.0% |
| 4 | Iraq | 3 | 0 | -11 | 0.0% | 0.0% | 0.0% |

### Group J ✓ (decided)

| Pos | Team | P | Pts | GD | Advance | 1st | 2nd |
|---|---|---|---|---|---|---|---|
| 1 | Argentina | 3 | 9 | +7 | ✓ 100% | 100.0% | 0.0% |
| 2 | Austria | 3 | 4 | +0 | ✓ 100% | 0.0% | 100.0% |
| 3 | Algeria | 3 | 4 | -2 | 100.0% | 0.0% | 0.0% |
| 4 | Jordan | 3 | 0 | -5 | 0.0% | 0.0% | 0.0% |

### Group K ✓ (decided)

| Pos | Team | P | Pts | GD | Advance | 1st | 2nd |
|---|---|---|---|---|---|---|---|
| 1 | Colombia | 3 | 7 | +3 | ✓ 100% | 100.0% | 0.0% |
| 2 | Portugal | 3 | 5 | +5 | ✓ 100% | 0.0% | 100.0% |
| 3 | DR Congo | 3 | 4 | +1 | 100.0% | 0.0% | 0.0% |
| 4 | Uzbekistan | 3 | 0 | -9 | 0.0% | 0.0% | 0.0% |

### Group L ✓ (decided)

| Pos | Team | P | Pts | GD | Advance | 1st | 2nd |
|---|---|---|---|---|---|---|---|
| 1 | England | 3 | 7 | +4 | ✓ 100% | 100.0% | 0.0% |
| 2 | Croatia | 3 | 6 | +0 | ✓ 100% | 0.0% | 100.0% |
| 3 | Ghana | 3 | 4 | +0 | 100.0% | 0.0% | 0.0% |
| 4 | Panama | 3 | 0 | -4 | 0.0% | 0.0% | 0.0% |

## 5) Finalist probabilities (Monte Carlo)

From 50,000 simulations of the whole tournament (official bracket, live Elo; knockout ties already played are fixed to their real result).

**Most likely final: Argentina vs Spain** (occurs in 32.9% of simulations).

| Team | Reaches final | Champion |
|---|---|---|
| Argentina | 60.7% | 28.7% |
| Spain | 53.8% | 31.4% |
| France | 46.2% | 25.6% |
| England | 39.3% | 14.4% |

**Most likely finals:**

- Argentina vs Spain — 32.9%
- Argentina vs France — 27.8%
- England vs Spain — 20.9%
- England vs France — 18.3%

> Probabilities are conditioned on the real bracket so far: only the teams still alive can reach the final. Treat as indicative.
