# Post-mortem · 2026 FIFA World Cup predictor

> Generated on 2026-07-18. How the Elo model did against the **real** results, stage by stage. Same methodology as the backtest (pre-tournament Elo + momentum, no leakage).

## Scoreboard

| Stage | Matches | Right | Accuracy |
|---|---|---|---|
| Group stage (1X2) | 72 | 44 | 61.1% |
| Knockouts (who advances) | 30 | 24 | 80.0% |
| Whole tournament so far | 102 | 68 | 66.7% |

Group-stage exact scorelines: 10/72 (13.9%).

## Knockouts: prediction vs reality

| Round | Match | Real result | Advanced | Our pick | Pred. score | p(1/X/2) | Hit |
|---|---|---|---|---|---|---|---|
| Round of 32 | South Africa vs Canada | 0-1 | Canada | Canada | 0-2 | 8/21/69 | ✓ |
| Round of 32 | Germany vs Paraguay | 1-1 (pens 3-4) | Paraguay | Germany | 2-1 | 40/29/30 | ✗ |
| Round of 32 | Netherlands vs Morocco | 1-1 (pens 2-3) | Morocco | Netherlands | 1-0 | 46/28/25 | ✗ |
| Round of 32 | Brazil vs Japan | 2-1 | Brazil | Brazil | 2-1 | 42/28/28 | ✓ |
| Round of 32 | France vs Sweden | 3-0 | France | France | 2-0 | 70/20/8 | ✓ |
| Round of 32 | Ivory Coast vs Norway | 1-2 | Norway | Norway | 0-1 | 17/26/56 | ✓ |
| Round of 32 | Mexico vs Ecuador | 2-0 | Mexico | Mexico | 2-1 | 38/29/31 | ✓ |
| Round of 32 | England vs DR Congo | 2-1 | England | England | 2-0 | 67/22/10 | ✓ |
| Round of 32 | United States vs Bosnia and Herzegovina | 2-0 | United States | United States | 1-0 | 49/27/22 | ✓ |
| Round of 32 | Belgium vs Senegal | 3-2 (a.e.t.) | Belgium | Belgium | 2-1 | 36/29/34 | ✓ |
| Round of 32 | Portugal vs Croatia | 2-1 | Portugal | Portugal | 2-1 | 41/29/29 | ✓ |
| Round of 32 | Spain vs Austria | 3-0 | Spain | Spain | 2-0 | 67/22/10 | ✓ |
| Round of 32 | Switzerland vs Algeria | 2-0 | Switzerland | Switzerland | 1-0 | 48/28/23 | ✓ |
| Round of 32 | Argentina vs Cape Verde | 3-2 (a.e.t.) | Argentina | Argentina | 2-0 | 81/14/3 | ✓ |
| Round of 32 | Colombia vs Ghana | 1-0 | Colombia | Colombia | 2-0 | 76/18/5 | ✓ |
| Round of 32 | Australia vs Egypt | 1-1 (pens 2-4) | Egypt | Australia | 2-1 | 44/28/27 | ✗ |
| Round of 16 | Paraguay vs France | 0-1 | France | France | 0-1 | 18/26/55 | ✓ |
| Round of 16 | Canada vs Morocco | 0-3 | Morocco | Canada | 2-1 | 37/29/33 | ✗ |
| Round of 16 | Brazil vs Norway | 1-2 | Norway | Brazil | 2-1 | 38/29/32 | ✗ |
| Round of 16 | Mexico vs England | 2-3 | England | England | 1-2 | 31/29/39 | ✓ |
| Round of 16 | Portugal vs Spain | 0-1 | Spain | Spain | 0-1 | 21/27/50 | ✓ |
| Round of 16 | United States vs Belgium | 1-4 | Belgium | Belgium | 0-1 | 23/28/48 | ✓ |
| Round of 16 | Argentina vs Egypt | 3-2 (a.e.t.) | Argentina | Argentina | 2-0 | 73/19/6 | ✓ |
| Round of 16 | Switzerland vs Colombia | 0-0 (pens 4-3) | Switzerland | Colombia | 1-2 | 31/29/39 | ✗ |
| Quarter-finals | France vs Morocco | 2-0 | France | France | 2-0 | 57/25/16 | ✓ |
| Quarter-finals | Spain vs Belgium | 2-1 | Spain | Spain | 2-0 | 57/25/16 | ✓ |
| Quarter-finals | Norway vs England | 1-2 | England | England | 1-2 | 28/28/42 | ✓ |
| Quarter-finals | Argentina vs Switzerland | 3-1 | Argentina | Argentina | 1-0 | 53/26/19 | ✓ |
| Semi-finals | France vs Spain | 0-2 | Spain | Spain | 1-2 | 28/28/42 | ✓ |
| Semi-finals | England vs Argentina | 1-2 | Argentina | Argentina | 1-2 | 27/28/43 | ✓ |

## Group stage: accuracy by group

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
| Total | 44 | 72 | 10 |

## Still to play (forward forecast: live Elo + Monte Carlo, no real result yet)

Live eloratings.net Elo (same method as the projected bracket) + a 50,000-run Monte Carlo resolving draws by penalties. "1/X/2" = 90-minute result; "Wins the tie" = incl. extra time / shoot-out.

| Match | Round | Date | Favourite | Pred. score | p(1/X/2) at 90' | Wins the tie (MC) |
|---|---|---|---|---|---|---|
| France vs England | Third place play-off | 2026-07-18 | England | 1-2 | 30/29/40 | England 57.5% |
| Spain vs Argentina | Final | 2026-07-19 | Spain | 2-1 | 43/28/27 | Spain 61.8% |

