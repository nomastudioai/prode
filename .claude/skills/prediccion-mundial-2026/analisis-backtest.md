# Backtest del predictor · Mundial 2026

Comparación del predictor (Elo del Atlas + forma) contra los **56 partidos** de fase de grupos ya jugados al 25/06/2026.

## Métricas globales

| Métrica | Valor | Referencia |
|---|---|---|
| Acierto 1X2 (signo) | **62.5%** (35/56) | azar ≈ 33% |
| Acierto marcador exacto | 10.7% (6/56) | difícil >12% |
| Brier score | 0.554 | 0 perfecto, 0.667 azar |
| Log-loss | 0.919 | menor es mejor |
| Error medio dif. de goles | 1.48 goles | |
| Baseline "gana mayor Elo" | 62.5% | |
| Tasa real de empates | 25.0% | |

## Calibración

| Prob. asignada | n | Predicho | Real |
|---|---|---|---|
| 33-45% | 9 | 41.6% | 66.7% |
| 45-55% | 12 | 50.7% | 58.3% |
| 55-65% | 20 | 60.3% | 55.0% |
| 65-80% | 7 | 69.7% | 100.0% |
| 80-101% | 8 | 83.1% | 50.0% |

## Mayores sorpresas

| Partido | Real | Pred | p(modelo→real) |
|---|---|---|---|
| Switzerland 1-1 Qatar | X | 1 | 11.5% |
| Spain 0-0 Cape Verde | X | 1 | 12.5% |
| Ecuador 0-0 Curacao | X | 1 | 13.1% |
| England 0-0 Ghana | X | 1 | 14.4% |
| South Africa 1-0 South Korea | 1 | 2 | 16.8% |
| Ivory Coast 1-0 Ecuador | 1 | 2 | 19.1% |
| Ghana 1-0 Panama | 1 | 2 | 21.4% |
| Portugal 1-1 DR Congo | X | 1 | 21.5% |

## Detalle por partido

| G | Partido | Real | p(1/X/2) | Pred | OK | Marcador pred. |
|---|---|---|---|---|---|---|
| A | Mexico 2-0 South Africa | 1 | 81/14/4 | 1 | ✓ | 2-0 |
| A | South Korea 2-1 Czech Republic | 1 | 38/26/35 | 1 | ✓ | 1-1 |
| A | Czech Republic 1-1 South Africa | X | 59/22/17 | 1 | · | 1-0 |
| A | Mexico 1-0 South Korea | 1 | 59/22/17 | 1 | ✓ | 1-0 |
| A | Czech Republic 0-3 Mexico | 2 | 16/22/61 | 2 | ✓ | 0-1 |
| A | South Africa 1-0 South Korea | 1 | 16/22/60 | 2 | · | 0-1 |
| B | Canada 1-1 Bosnia and Herzegovina | X | 58/23/18 | 1 | · | 1-0 |
| B | Switzerland 1-1 Qatar | X | 86/11/2 | 1 | · | 2-0 |
| B | Switzerland 4-1 Bosnia and Herzegovina | 1 | 65/21/13 | 1 | ✓ | 1-0 |
| B | Canada 6-0 Qatar | 1 | 81/14/4 | 1 | ✓ | 2-0 |
| B | Switzerland 2-1 Canada | 1 | 43/25/30 | 1 | ✓ | 1-1 |
| B | Bosnia and Herzegovina 3-1 Qatar | 1 | 61/22/16 | 1 | ✓ | 1-0 |
| C | Brazil 1-1 Morocco | X | 51/24/23 | 1 | · | 1-1 |
| C | Scotland 1-0 Haiti | 1 | 55/23/20 | 1 | ✓ | 1-0 |
| C | Morocco 1-0 Scotland | 1 | 45/25/28 | 1 | ✓ | 1-1 |
| C | Brazil 3-0 Haiti | 1 | 77/16/6 | 1 | ✓ | 2-0 |
| C | Scotland 0-3 Brazil | 2 | 16/22/60 | 2 | ✓ | 0-1 |
| C | Morocco 4-2 Haiti | 1 | 64/21/14 | 1 | ✓ | 1-0 |
| D | United States 4-1 Paraguay | 1 | 29/25/44 | 2 | · | 1-1 |
| D | Australia 2-0 Turkey | 1 | 24/24/50 | 2 | · | 1-1 |
| D | United States 2-0 Australia | 1 | 34/26/39 | 2 | · | 1-1 |
| D | Paraguay 1-0 Turkey | 1 | 29/25/45 | 2 | · | 1-1 |
| E | Germany 7-1 Curacao | 1 | 80/14/4 | 1 | ✓ | 2-0 |
| E | Ivory Coast 1-0 Ecuador | 1 | 19/23/57 | 2 | · | 0-1 |
| E | Germany 2-1 Ivory Coast | 1 | 54/24/21 | 1 | ✓ | 1-0 |
| E | Ecuador 0-0 Curacao | X | 83/13/3 | 1 | · | 2-0 |
| E | Ecuador 2-1 Germany | 1 | 40/26/33 | 1 | ✓ | 1-1 |
| E | Curacao 0-2 Ivory Coast | 2 | 13/21/65 | 2 | ✓ | 0-1 |
| F | Netherlands 2-2 Japan | X | 40/26/33 | 1 | · | 1-1 |
| F | Sweden 5-1 Tunisia | 1 | 41/25/32 | 1 | ✓ | 1-1 |
| F | Netherlands 5-1 Sweden | 1 | 61/22/16 | 1 | ✓ | 1-0 |
| F | Tunisia 0-4 Japan | 2 | 15/21/63 | 2 | ✓ | 0-1 |
| G | Belgium 1-1 Egypt | X | 56/23/20 | 1 | · | 1-0 |
| G | Iran 2-2 New Zealand | X | 55/23/20 | 1 | · | 1-0 |
| G | Belgium 0-0 Iran | X | 53/24/21 | 1 | · | 1-0 |
| G | Egypt 3-1 New Zealand | 1 | 52/24/22 | 1 | ✓ | 1-0 |
| H | Spain 0-0 Cape Verde | X | 84/12/2 | 1 | · | 2-0 |
| H | Saudi Arabia 1-1 Uruguay | X | 14/21/63 | 2 | · | 0-1 |
| H | Spain 4-0 Saudi Arabia | 1 | 86/11/2 | 1 | ✓ | 2-0 |
| H | Uruguay 2-2 Cape Verde | X | 60/22/16 | 1 | · | 1-0 |
| I | France 3-1 Senegal | 1 | 52/24/23 | 1 | ✓ | 1-1 |
| I | Norway 4-1 Iraq | 1 | 67/20/11 | 1 | ✓ | 1-0 |
| I | France 3-0 Iraq | 1 | 77/16/6 | 1 | ✓ | 2-0 |
| I | Norway 3-2 Senegal | 1 | 41/25/32 | 1 | ✓ | 1-1 |
| J | Argentina 3-0 Algeria | 1 | 67/20/12 | 1 | ✓ | 1-0 |
| J | Austria 3-1 Jordan | 1 | 45/25/28 | 1 | ✓ | 1-1 |
| J | Argentina 2-0 Austria | 1 | 66/20/12 | 1 | ✓ | 1-0 |
| J | Jordan 1-2 Algeria | 2 | 29/25/44 | 2 | ✓ | 1-1 |
| K | Portugal 1-1 DR Congo | X | 64/21/14 | 1 | · | 1-0 |
| K | Colombia 3-1 Uzbekistan | 1 | 60/22/17 | 1 | ✓ | 1-0 |
| K | Portugal 5-0 Uzbekistan | 1 | 60/22/16 | 1 | ✓ | 1-0 |
| K | Colombia 1-0 DR Congo | 1 | 63/21/14 | 1 | ✓ | 1-0 |
| L | England 4-2 Croatia | 1 | 47/25/27 | 1 | ✓ | 1-1 |
| L | Ghana 1-0 Panama | 1 | 21/24/54 | 2 | · | 0-1 |
| L | England 0-0 Ghana | X | 81/14/4 | 1 | · | 2-0 |
| L | Panama 0-1 Croatia | 2 | 21/24/54 | 2 | ✓ | 0-1 |

## Dry-run completo: los 72 partidos de fase de grupos

● = ya jugado (con resultado real y si el modelo acertó el signo).

| G | Partido | Pred | p(1/X/2) | Marcador pred. | Real |
|---|---|---|---|---|---|
| A | Mexico vs South Africa | 1 | 81/14/4 | 2-0 | ● 2-0 (✓) |
| A | Mexico vs South Korea | 1 | 59/22/17 | 1-0 | ● 1-0 (✓) |
| A | Czech Republic vs Mexico | 2 | 16/22/61 | 0-1 | ● 0-3 (✓) |
| A | South Africa vs South Korea | 2 | 16/22/60 | 0-1 | ● 1-0 (·) |
| A | Czech Republic vs South Africa | 1 | 59/22/17 | 1-0 | ● 1-1 (·) |
| A | South Korea vs Czech Republic | 1 | 38/26/35 | 1-1 | ● 2-1 (✓) |
| B | Canada vs Bosnia and Herzegovina | 1 | 58/23/18 | 1-0 | ● 1-1 (·) |
| B | Canada vs Qatar | 1 | 81/14/4 | 2-0 | ● 6-0 (✓) |
| B | Switzerland vs Canada | 1 | 43/25/30 | 1-1 | ● 2-1 (✓) |
| B | Bosnia and Herzegovina vs Qatar | 1 | 61/22/16 | 1-0 | ● 3-1 (✓) |
| B | Switzerland vs Bosnia and Herzegovina | 1 | 65/21/13 | 1-0 | ● 4-1 (✓) |
| B | Switzerland vs Qatar | 1 | 86/11/2 | 2-0 | ● 1-1 (·) |
| C | Brazil vs Morocco | 1 | 51/24/23 | 1-1 | ● 1-1 (·) |
| C | Brazil vs Haiti | 1 | 77/16/6 | 2-0 | ● 3-0 (✓) |
| C | Scotland vs Brazil | 2 | 16/22/60 | 0-1 | ● 0-3 (✓) |
| C | Morocco vs Haiti | 1 | 64/21/14 | 1-0 | ● 4-2 (✓) |
| C | Morocco vs Scotland | 1 | 45/25/28 | 1-1 | ● 1-0 (✓) |
| C | Scotland vs Haiti | 1 | 55/23/20 | 1-0 | ● 1-0 (✓) |
| D | United States vs Paraguay | 2 | 29/25/44 | 1-1 | ● 4-1 (·) |
| D | United States vs Australia | 2 | 34/26/39 | 1-1 | ● 2-0 (·) |
| D | United States vs Turkey | 2 | 22/24/53 | 0-1 | — |
| D | Paraguay vs Australia | 1 | 42/25/31 | 1-1 | — |
| D | Paraguay vs Turkey | 2 | 29/25/45 | 1-1 | ● 1-0 (·) |
| D | Australia vs Turkey | 2 | 24/24/50 | 1-1 | ● 2-0 (·) |
| E | Germany vs Curacao | 1 | 80/14/4 | 2-0 | ● 7-1 (✓) |
| E | Germany vs Ivory Coast | 1 | 54/24/21 | 1-0 | ● 2-1 (✓) |
| E | Ecuador vs Germany | 1 | 40/26/33 | 1-1 | ● 2-1 (✓) |
| E | Curacao vs Ivory Coast | 2 | 13/21/65 | 0-1 | ● 0-2 (✓) |
| E | Ecuador vs Curacao | 1 | 83/13/3 | 2-0 | ● 0-0 (·) |
| E | Ivory Coast vs Ecuador | 2 | 19/23/57 | 0-1 | ● 1-0 (·) |
| F | Netherlands vs Japan | 1 | 40/26/33 | 1-1 | ● 2-2 (·) |
| F | Netherlands vs Sweden | 1 | 61/22/16 | 1-0 | ● 5-1 (✓) |
| F | Netherlands vs Tunisia | 1 | 66/20/13 | 1-0 | — |
| F | Japan vs Sweden | 1 | 58/23/18 | 1-0 | — |
| F | Tunisia vs Japan | 2 | 15/21/63 | 0-1 | ● 0-4 (✓) |
| F | Sweden vs Tunisia | 1 | 41/25/32 | 1-1 | ● 5-1 (✓) |
| G | Belgium vs Egypt | 1 | 56/23/20 | 1-0 | ● 1-1 (·) |
| G | Belgium vs Iran | 1 | 53/24/21 | 1-0 | ● 0-0 (·) |
| G | Belgium vs New Zealand | 1 | 71/18/9 | 2-0 | — |
| G | Egypt vs Iran | 2 | 34/26/39 | 1-1 | — |
| G | Egypt vs New Zealand | 1 | 52/24/22 | 1-0 | ● 3-1 (✓) |
| G | Iran vs New Zealand | 1 | 55/23/20 | 1-0 | ● 2-2 (·) |
| H | Spain vs Cape Verde | 1 | 84/12/2 | 2-0 | ● 0-0 (·) |
| H | Spain vs Saudi Arabia | 1 | 86/11/2 | 2-0 | ● 4-0 (✓) |
| H | Spain vs Uruguay | 1 | 63/21/14 | 1-0 | — |
| H | Cape Verde vs Saudi Arabia | 1 | 40/26/33 | 1-1 | — |
| H | Uruguay vs Cape Verde | 1 | 60/22/16 | 1-0 | ● 2-2 (·) |
| H | Saudi Arabia vs Uruguay | 2 | 14/21/63 | 0-1 | ● 1-1 (·) |
| I | France vs Senegal | 1 | 52/24/23 | 1-1 | ● 3-1 (✓) |
| I | France vs Iraq | 1 | 77/16/6 | 2-0 | ● 3-0 (✓) |
| I | France vs Norway | 1 | 47/25/27 | 1-1 | — |
| I | Senegal vs Iraq | 1 | 63/21/15 | 1-0 | — |
| I | Norway vs Senegal | 1 | 41/25/32 | 1-1 | ● 3-2 (✓) |
| I | Norway vs Iraq | 1 | 67/20/11 | 1-0 | ● 4-1 (✓) |
| J | Argentina vs Algeria | 1 | 67/20/12 | 1-0 | ● 3-0 (✓) |
| J | Argentina vs Austria | 1 | 66/20/12 | 1-0 | ● 2-0 (✓) |
| J | Argentina vs Jordan | 1 | 74/17/7 | 2-0 | — |
| J | Algeria vs Austria | 2 | 35/26/38 | 1-1 | — |
| J | Jordan vs Algeria | 2 | 29/25/44 | 1-1 | ● 1-2 (✓) |
| J | Austria vs Jordan | 1 | 45/25/28 | 1-1 | ● 3-1 (✓) |
| K | Portugal vs DR Congo | 1 | 64/21/14 | 1-0 | ● 1-1 (·) |
| K | Portugal vs Uzbekistan | 1 | 60/22/16 | 1-0 | ● 5-0 (✓) |
| K | Portugal vs Colombia | 1 | 37/26/36 | 1-1 | — |
| K | DR Congo vs Uzbekistan | 2 | 33/26/40 | 1-1 | — |
| K | Colombia vs DR Congo | 1 | 63/21/14 | 1-0 | ● 1-0 (✓) |
| K | Colombia vs Uzbekistan | 1 | 60/22/17 | 1-0 | ● 3-1 (✓) |
| L | England vs Croatia | 1 | 47/25/27 | 1-1 | ● 4-2 (✓) |
| L | England vs Ghana | 1 | 81/14/4 | 2-0 | ● 0-0 (·) |
| L | England vs Panama | 1 | 65/21/13 | 1-0 | — |
| L | Croatia vs Ghana | 1 | 72/18/9 | 2-0 | — |
| L | Panama vs Croatia | 2 | 21/24/54 | 0-1 | ● 0-1 (✓) |
| L | Ghana vs Panama | 2 | 21/24/54 | 0-1 | ● 1-0 (·) |
