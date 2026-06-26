# Backtest del predictor · Mundial 2026

Comparación del predictor (Elo del Atlas + forma) contra los **56 partidos** de fase de grupos ya jugados al 25/06/2026.

## Métricas globales

| Métrica | Valor | Referencia |
|---|---|---|
| Acierto 1X2 (signo) | **62.5%** (35/56) | azar ≈ 33% |
| Acierto marcador exacto | 12.5% (7/56) | difícil >12% |
| Brier score | 0.555 | 0 perfecto, 0.667 azar |
| Log-loss | 0.916 | menor es mejor |
| Error medio dif. de goles | 1.48 goles | |
| Baseline "gana mayor Elo" | 62.5% | |
| Tasa real de empates | 25.0% | |

> **Nota sobre el empate (modelo v2, Dixon-Coles):** la corrección Dixon-Coles deja la probabilidad media de empate del modelo (~24,5%) casi igual a la tasa real (25%), y mejora el marcador exacto y el log-loss. Pero **forzar la predicción de empates no mejora el acierto**: los empates de esta muestra no se dieron en partidos parejos sino en favoritos que pincharon (España 0-0 Cabo Verde, Inglaterra 0-0 Ghana, Suiza 1-1 Catar), que el Elo no anticipa. Por eso el predictor sigue eligiendo al favorito y reporta la probabilidad de empate ya calibrada.

## Calibración

| Prob. asignada | n | Predicho | Real |
|---|---|---|---|
| 33-45% | 12 | 41.0% | 66.7% |
| 45-55% | 12 | 51.7% | 50.0% |
| 55-65% | 19 | 60.3% | 63.2% |
| 65-80% | 6 | 71.9% | 100.0% |
| 80-101% | 7 | 82.8% | 42.9% |

## Mayores sorpresas

| Partido | Real | Pred | p(modelo→real) |
|---|---|---|---|
| Switzerland 1-1 Qatar | X | 1 | 12.6% |
| Spain 0-0 Cape Verde | X | 1 | 13.7% |
| Ecuador 0-0 Curacao | X | 1 | 14.4% |
| South Africa 1-0 South Korea | 1 | 2 | 15.4% |
| England 0-0 Ghana | X | 1 | 15.9% |
| Ivory Coast 1-0 Ecuador | 1 | 2 | 17.6% |
| Ghana 1-0 Panama | 1 | 2 | 19.9% |
| Australia 2-0 Turkey | 1 | 2 | 22.8% |

## Detalle por partido

| G | Partido | Real | p(1/X/2) | Pred | OK | Marcador pred. |
|---|---|---|---|---|---|---|
| A | Mexico 2-0 South Africa | 1 | 80/15/3 | 1 | ✓ | 2-0 |
| A | South Korea 2-1 Czech Republic | 1 | 36/29/33 | 1 | ✓ | 1-1 |
| A | Czech Republic 1-1 South Africa | X | 57/25/16 | 1 | · | 1-1 |
| A | Mexico 1-0 South Korea | 1 | 58/25/16 | 1 | ✓ | 1-1 |
| A | Czech Republic 0-3 Mexico | 2 | 15/25/59 | 2 | ✓ | 1-1 |
| A | South Africa 1-0 South Korea | 1 | 15/25/59 | 2 | · | 1-1 |
| B | Canada 1-1 Bosnia and Herzegovina | X | 57/25/16 | 1 | · | 1-1 |
| B | Switzerland 1-1 Qatar | X | 85/12/1 | 1 | · | 2-0 |
| B | Switzerland 4-1 Bosnia and Herzegovina | 1 | 63/23/12 | 1 | ✓ | 2-0 |
| B | Canada 6-0 Qatar | 1 | 80/15/3 | 1 | ✓ | 2-0 |
| B | Switzerland 2-1 Canada | 1 | 41/28/29 | 1 | ✓ | 1-1 |
| B | Bosnia and Herzegovina 3-1 Qatar | 1 | 60/25/14 | 1 | ✓ | 1-1 |
| C | Brazil 1-1 Morocco | X | 50/27/22 | 1 | · | 1-1 |
| C | Scotland 1-0 Haiti | 1 | 53/26/19 | 1 | ✓ | 1-1 |
| C | Morocco 1-0 Scotland | 1 | 43/28/27 | 1 | ✓ | 1-1 |
| C | Brazil 3-0 Haiti | 1 | 76/17/5 | 1 | ✓ | 2-0 |
| C | Scotland 0-3 Brazil | 2 | 15/25/59 | 2 | ✓ | 1-1 |
| C | Morocco 4-2 Haiti | 1 | 62/24/13 | 1 | ✓ | 2-0 |
| D | United States 4-1 Paraguay | 1 | 27/28/43 | 2 | · | 1-1 |
| D | Australia 2-0 Turkey | 1 | 22/27/49 | 2 | · | 1-1 |
| D | United States 2-0 Australia | 1 | 32/29/37 | 2 | · | 1-1 |
| D | Paraguay 1-0 Turkey | 1 | 27/28/43 | 2 | · | 1-1 |
| E | Germany 7-1 Curacao | 1 | 79/16/3 | 1 | ✓ | 2-0 |
| E | Ivory Coast 1-0 Ecuador | 1 | 17/26/56 | 2 | · | 1-1 |
| E | Germany 2-1 Ivory Coast | 1 | 52/27/20 | 1 | ✓ | 1-1 |
| E | Ecuador 0-0 Curacao | X | 82/14/2 | 1 | · | 2-0 |
| E | Ecuador 2-1 Germany | 1 | 38/29/32 | 1 | ✓ | 1-1 |
| E | Curacao 0-2 Ivory Coast | 2 | 12/23/64 | 2 | ✓ | 0-2 |
| F | Netherlands 2-2 Japan | X | 38/29/32 | 1 | · | 1-1 |
| F | Sweden 5-1 Tunisia | 1 | 40/29/30 | 1 | ✓ | 1-1 |
| F | Netherlands 5-1 Sweden | 1 | 59/25/15 | 1 | ✓ | 1-1 |
| F | Tunisia 0-4 Japan | 2 | 13/24/61 | 2 | ✓ | 0-2 |
| G | Belgium 1-1 Egypt | X | 54/26/18 | 1 | · | 1-1 |
| G | Iran 2-2 New Zealand | X | 53/26/19 | 1 | · | 1-1 |
| G | Belgium 0-0 Iran | X | 52/27/20 | 1 | · | 1-1 |
| G | Egypt 3-1 New Zealand | 1 | 51/27/21 | 1 | ✓ | 1-1 |
| H | Spain 0-0 Cape Verde | X | 83/13/2 | 1 | · | 2-0 |
| H | Saudi Arabia 1-1 Uruguay | X | 13/24/62 | 2 | · | 0-2 |
| H | Spain 4-0 Saudi Arabia | 1 | 86/12/1 | 1 | ✓ | 2-0 |
| H | Uruguay 2-2 Cape Verde | X | 59/25/15 | 1 | · | 1-1 |
| I | France 3-1 Senegal | 1 | 50/27/21 | 1 | ✓ | 1-1 |
| I | Norway 4-1 Iraq | 1 | 66/22/10 | 1 | ✓ | 2-0 |
| I | France 3-0 Iraq | 1 | 76/18/5 | 1 | ✓ | 2-0 |
| I | Norway 3-2 Senegal | 1 | 40/29/30 | 1 | ✓ | 1-1 |
| J | Argentina 3-0 Algeria | 1 | 66/22/10 | 1 | ✓ | 2-0 |
| J | Austria 3-1 Jordan | 1 | 43/28/27 | 1 | ✓ | 1-1 |
| J | Argentina 2-0 Austria | 1 | 65/23/11 | 1 | ✓ | 2-0 |
| J | Jordan 1-2 Algeria | 2 | 28/28/42 | 2 | ✓ | 1-1 |
| K | Portugal 1-1 DR Congo | X | 62/24/13 | 1 | · | 2-0 |
| K | Colombia 3-1 Uzbekistan | 1 | 58/25/15 | 1 | ✓ | 1-1 |
| K | Portugal 5-0 Uzbekistan | 1 | 59/25/15 | 1 | ✓ | 1-1 |
| K | Colombia 1-0 DR Congo | 1 | 62/24/13 | 1 | ✓ | 2-0 |
| L | England 4-2 Croatia | 1 | 45/28/25 | 1 | ✓ | 1-1 |
| L | Ghana 1-0 Panama | 1 | 19/27/52 | 2 | · | 1-1 |
| L | England 0-0 Ghana | X | 80/15/3 | 1 | · | 2-0 |
| L | Panama 0-1 Croatia | 2 | 19/26/53 | 2 | ✓ | 1-1 |

## Dry-run completo: los 72 partidos de fase de grupos

● = ya jugado (con resultado real y si el modelo acertó el signo).

| G | Partido | Pred | p(1/X/2) | Marcador pred. | Real |
|---|---|---|---|---|---|
| A | Mexico vs South Africa | 1 | 80/15/3 | 2-0 | ● 2-0 (✓) |
| A | Mexico vs South Korea | 1 | 58/25/16 | 1-1 | ● 1-0 (✓) |
| A | Czech Republic vs Mexico | 2 | 15/25/59 | 1-1 | ● 0-3 (✓) |
| A | South Africa vs South Korea | 2 | 15/25/59 | 1-1 | ● 1-0 (·) |
| A | Czech Republic vs South Africa | 1 | 57/25/16 | 1-1 | ● 1-1 (·) |
| A | South Korea vs Czech Republic | 1 | 36/29/33 | 1-1 | ● 2-1 (✓) |
| B | Canada vs Bosnia and Herzegovina | 1 | 57/25/16 | 1-1 | ● 1-1 (·) |
| B | Canada vs Qatar | 1 | 80/15/3 | 2-0 | ● 6-0 (✓) |
| B | Switzerland vs Canada | 1 | 41/28/29 | 1-1 | ● 2-1 (✓) |
| B | Bosnia and Herzegovina vs Qatar | 1 | 60/25/14 | 1-1 | ● 3-1 (✓) |
| B | Switzerland vs Bosnia and Herzegovina | 1 | 63/23/12 | 2-0 | ● 4-1 (✓) |
| B | Switzerland vs Qatar | 1 | 85/12/1 | 2-0 | ● 1-1 (·) |
| C | Brazil vs Morocco | 1 | 50/27/22 | 1-1 | ● 1-1 (·) |
| C | Brazil vs Haiti | 1 | 76/17/5 | 2-0 | ● 3-0 (✓) |
| C | Scotland vs Brazil | 2 | 15/25/59 | 1-1 | ● 0-3 (✓) |
| C | Morocco vs Haiti | 1 | 62/24/13 | 2-0 | ● 4-2 (✓) |
| C | Morocco vs Scotland | 1 | 43/28/27 | 1-1 | ● 1-0 (✓) |
| C | Scotland vs Haiti | 1 | 53/26/19 | 1-1 | ● 1-0 (✓) |
| D | United States vs Paraguay | 2 | 27/28/43 | 1-1 | ● 4-1 (·) |
| D | United States vs Australia | 2 | 32/29/37 | 1-1 | ● 2-0 (·) |
| D | United States vs Turkey | 2 | 20/27/51 | 1-1 | — |
| D | Paraguay vs Australia | 1 | 40/29/30 | 1-1 | — |
| D | Paraguay vs Turkey | 2 | 27/28/43 | 1-1 | ● 1-0 (·) |
| D | Australia vs Turkey | 2 | 22/27/49 | 1-1 | ● 2-0 (·) |
| E | Germany vs Curacao | 1 | 79/16/3 | 2-0 | ● 7-1 (✓) |
| E | Germany vs Ivory Coast | 1 | 52/27/20 | 1-1 | ● 2-1 (✓) |
| E | Ecuador vs Germany | 1 | 38/29/32 | 1-1 | ● 2-1 (✓) |
| E | Curacao vs Ivory Coast | 2 | 12/23/64 | 0-2 | ● 0-2 (✓) |
| E | Ecuador vs Curacao | 1 | 82/14/2 | 2-0 | ● 0-0 (·) |
| E | Ivory Coast vs Ecuador | 2 | 17/26/56 | 1-1 | ● 1-0 (·) |
| F | Netherlands vs Japan | 1 | 38/29/32 | 1-1 | ● 2-2 (·) |
| F | Netherlands vs Sweden | 1 | 59/25/15 | 1-1 | ● 5-1 (✓) |
| F | Netherlands vs Tunisia | 1 | 64/23/11 | 2-0 | — |
| F | Japan vs Sweden | 1 | 56/26/17 | 1-1 | — |
| F | Tunisia vs Japan | 2 | 13/24/61 | 0-2 | ● 0-4 (✓) |
| F | Sweden vs Tunisia | 1 | 40/29/30 | 1-1 | ● 5-1 (✓) |
| G | Belgium vs Egypt | 1 | 54/26/18 | 1-1 | ● 1-1 (·) |
| G | Belgium vs Iran | 1 | 52/27/20 | 1-1 | ● 0-0 (·) |
| G | Belgium vs New Zealand | 1 | 70/21/8 | 2-0 | — |
| G | Egypt vs Iran | 2 | 33/29/37 | 1-1 | — |
| G | Egypt vs New Zealand | 1 | 51/27/21 | 1-1 | ● 3-1 (✓) |
| G | Iran vs New Zealand | 1 | 53/26/19 | 1-1 | ● 2-2 (·) |
| H | Spain vs Cape Verde | 1 | 83/13/2 | 2-0 | ● 0-0 (·) |
| H | Spain vs Saudi Arabia | 1 | 86/12/1 | 2-0 | ● 4-0 (✓) |
| H | Spain vs Uruguay | 1 | 62/24/13 | 2-0 | — |
| H | Cape Verde vs Saudi Arabia | 1 | 38/29/32 | 1-1 | — |
| H | Uruguay vs Cape Verde | 1 | 59/25/15 | 1-1 | ● 2-2 (·) |
| H | Saudi Arabia vs Uruguay | 2 | 13/24/62 | 0-2 | ● 1-1 (·) |
| I | France vs Senegal | 1 | 50/27/21 | 1-1 | ● 3-1 (✓) |
| I | France vs Iraq | 1 | 76/18/5 | 2-0 | ● 3-0 (✓) |
| I | France vs Norway | 1 | 45/28/25 | 1-1 | — |
| I | Senegal vs Iraq | 1 | 61/24/13 | 2-0 | — |
| I | Norway vs Senegal | 1 | 40/29/30 | 1-1 | ● 3-2 (✓) |
| I | Norway vs Iraq | 1 | 66/22/10 | 2-0 | ● 4-1 (✓) |
| J | Argentina vs Algeria | 1 | 66/22/10 | 2-0 | ● 3-0 (✓) |
| J | Argentina vs Austria | 1 | 65/23/11 | 2-0 | ● 2-0 (✓) |
| J | Argentina vs Jordan | 1 | 73/19/6 | 2-0 | — |
| J | Algeria vs Austria | 2 | 34/29/36 | 1-1 | — |
| J | Jordan vs Algeria | 2 | 28/28/42 | 1-1 | ● 1-2 (✓) |
| J | Austria vs Jordan | 1 | 43/28/27 | 1-1 | ● 3-1 (✓) |
| K | Portugal vs DR Congo | 1 | 62/24/13 | 2-0 | ● 1-1 (·) |
| K | Portugal vs Uzbekistan | 1 | 59/25/15 | 1-1 | ● 5-0 (✓) |
| K | Portugal vs Colombia | 1 | 35/29/34 | 1-1 | — |
| K | DR Congo vs Uzbekistan | 2 | 32/29/38 | 1-1 | — |
| K | Colombia vs DR Congo | 1 | 62/24/13 | 2-0 | ● 1-0 (✓) |
| K | Colombia vs Uzbekistan | 1 | 58/25/15 | 1-1 | ● 3-1 (✓) |
| L | England vs Croatia | 1 | 45/28/25 | 1-1 | ● 4-2 (✓) |
| L | England vs Ghana | 1 | 80/15/3 | 2-0 | ● 0-0 (·) |
| L | England vs Panama | 1 | 64/23/12 | 2-0 | — |
| L | Croatia vs Ghana | 1 | 70/20/8 | 2-0 | — |
| L | Panama vs Croatia | 2 | 19/26/53 | 1-1 | ● 0-1 (✓) |
| L | Ghana vs Panama | 2 | 19/27/52 | 1-1 | ● 1-0 (·) |
