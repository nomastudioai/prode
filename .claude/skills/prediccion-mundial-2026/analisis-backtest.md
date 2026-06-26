# Backtest del predictor · Mundial 2026

Comparación del predictor (Elo del Atlas + forma) contra los **57 partidos** de fase de grupos ya jugados al 2026-06-26.

## Métricas globales

| Métrica | Valor | Referencia |
|---|---|---|
| Acierto 1X2 (signo) | **61.4%** (35/57) | azar ≈ 33% |
| Acierto marcador exacto | 14.0% (8/57) | difícil >12% |
| Brier score | 0.561 | 0 perfecto, 0.667 azar |
| Log-loss | 0.923 | menor es mejor |
| Error medio dif. de goles | 1.47 goles | |
| Baseline "gana mayor Elo" | 61.4% | |
| Tasa real de empates | 26.3% | |

> **Nota sobre el empate (modelo v2, Dixon-Coles):** la corrección Dixon-Coles deja la probabilidad media de empate del modelo (~24,5%) casi igual a la tasa real (25%), y mejora el marcador exacto y el log-loss. Pero **forzar la predicción de empates no mejora el acierto**: los empates de esta muestra no se dieron en partidos parejos sino en favoritos que pincharon (España 0-0 Cabo Verde, Inglaterra 0-0 Ghana, Suiza 1-1 Catar), que el Elo no anticipa. Por eso el predictor sigue eligiendo al favorito y reporta la probabilidad de empate ya calibrada.

## Calibración

| Prob. asignada | n | Predicho | Real |
|---|---|---|---|
| 33-45% | 12 | 41.0% | 66.7% |
| 45-55% | 12 | 51.7% | 50.0% |
| 55-65% | 20 | 60.1% | 60.0% |
| 65-80% | 6 | 71.9% | 100.0% |
| 80-101% | 7 | 82.8% | 42.9% |

## Mayores sorpresas

| Partido | Real | Pred | p(modelo→real) |
|---|---|---|---|
| Catar 1-1 Suiza | X | 2 | 12.6% |
| España 0-0 Cabo Verde | X | 1 | 13.7% |
| Ecuador 0-0 Curaçao | X | 1 | 14.4% |
| Sudáfrica 1-0 Corea del Sur | 1 | 2 | 15.4% |
| Inglaterra 0-0 Ghana | X | 1 | 15.9% |
| Costa de Marfil 1-0 Ecuador | 1 | 2 | 17.6% |
| Ghana 1-0 Panamá | 1 | 2 | 19.9% |
| Australia 2-0 Turquía | 1 | 2 | 22.8% |

## Detalle por partido

| G | Partido | Real | p(1/X/2) | Pred | OK | Marcador pred. |
|---|---|---|---|---|---|---|
| A | México 2-0 Sudáfrica | 1 | 80/15/3 | 1 | ✓ | 2-0 |
| A | Corea del Sur 2-1 República Checa | 1 | 36/29/33 | 1 | ✓ | 1-1 |
| A | República Checa 1-1 Sudáfrica | X | 57/25/16 | 1 | · | 1-1 |
| A | México 1-0 Corea del Sur | 1 | 58/25/16 | 1 | ✓ | 1-1 |
| A | República Checa 0-3 México | 2 | 15/25/59 | 2 | ✓ | 1-1 |
| A | Sudáfrica 1-0 Corea del Sur | 1 | 15/25/59 | 2 | · | 1-1 |
| B | Canadá 1-1 Bosnia y Herzegovina | X | 57/25/16 | 1 | · | 1-1 |
| B | Catar 1-1 Suiza | X | 1/12/85 | 2 | · | 0-2 |
| B | Suiza 4-1 Bosnia y Herzegovina | 1 | 63/23/12 | 1 | ✓ | 2-0 |
| B | Canadá 6-0 Catar | 1 | 80/15/3 | 1 | ✓ | 2-0 |
| B | Suiza 2-1 Canadá | 1 | 41/28/29 | 1 | ✓ | 1-1 |
| B | Bosnia y Herzegovina 3-1 Catar | 1 | 60/25/14 | 1 | ✓ | 1-1 |
| C | Brasil 1-1 Marruecos | X | 50/27/22 | 1 | · | 1-1 |
| C | Haití 0-1 Escocia | 2 | 19/26/53 | 2 | ✓ | 1-1 |
| C | Escocia 0-1 Marruecos | 2 | 27/28/43 | 2 | ✓ | 1-1 |
| C | Brasil 3-0 Haití | 1 | 76/17/5 | 1 | ✓ | 2-0 |
| C | Escocia 0-3 Brasil | 2 | 15/25/59 | 2 | ✓ | 1-1 |
| C | Marruecos 4-2 Haití | 1 | 62/24/13 | 1 | ✓ | 2-0 |
| D | Estados Unidos 4-1 Paraguay | 1 | 27/28/43 | 2 | · | 1-1 |
| D | Australia 2-0 Turquía | 1 | 22/27/49 | 2 | · | 1-1 |
| D | Estados Unidos 2-0 Australia | 1 | 32/29/37 | 2 | · | 1-1 |
| D | Turquía 0-1 Paraguay | 2 | 43/28/27 | 1 | · | 1-1 |
| E | Alemania 7-1 Curaçao | 1 | 79/16/3 | 1 | ✓ | 2-0 |
| E | Costa de Marfil 1-0 Ecuador | 1 | 17/26/56 | 2 | · | 1-1 |
| E | Alemania 2-1 Costa de Marfil | 1 | 52/27/20 | 1 | ✓ | 1-1 |
| E | Ecuador 0-0 Curaçao | X | 82/14/2 | 1 | · | 2-0 |
| E | Curaçao 0-2 Costa de Marfil | 2 | 12/23/64 | 2 | ✓ | 0-2 |
| E | Ecuador 2-1 Alemania | 1 | 38/29/32 | 1 | ✓ | 1-1 |
| F | Países Bajos 2-2 Japón | X | 38/29/32 | 1 | · | 1-1 |
| F | Suecia 5-1 Túnez | 1 | 40/29/30 | 1 | ✓ | 1-1 |
| F | Países Bajos 5-1 Suecia | 1 | 59/25/15 | 1 | ✓ | 1-1 |
| F | Túnez 0-4 Japón | 2 | 13/24/61 | 2 | ✓ | 0-2 |
| F | Japón 1-1 Suecia | X | 56/26/17 | 1 | · | 1-1 |
| G | Bélgica 1-1 Egipto | X | 54/26/18 | 1 | · | 1-1 |
| G | Irán 2-2 Nueva Zelanda | X | 53/26/19 | 1 | · | 1-1 |
| G | Bélgica 0-0 Irán | X | 52/27/20 | 1 | · | 1-1 |
| G | Nueva Zelanda 1-3 Egipto | 2 | 21/27/51 | 2 | ✓ | 1-1 |
| H | España 0-0 Cabo Verde | X | 83/13/2 | 1 | · | 2-0 |
| H | Arabia Saudí 1-1 Uruguay | X | 13/24/62 | 2 | · | 0-2 |
| H | España 4-0 Arabia Saudí | 1 | 86/12/1 | 1 | ✓ | 2-0 |
| H | Uruguay 2-2 Cabo Verde | X | 59/25/15 | 1 | · | 1-1 |
| I | Francia 3-1 Senegal | 1 | 50/27/21 | 1 | ✓ | 1-1 |
| I | Irak 1-4 Noruega | 2 | 10/22/66 | 2 | ✓ | 0-2 |
| I | Francia 3-0 Irak | 1 | 76/18/5 | 1 | ✓ | 2-0 |
| I | Noruega 3-2 Senegal | 1 | 40/29/30 | 1 | ✓ | 1-1 |
| J | Argentina 3-0 Argelia | 1 | 66/22/10 | 1 | ✓ | 2-0 |
| J | Austria 3-1 Jordania | 1 | 43/28/27 | 1 | ✓ | 1-1 |
| J | Argentina 2-0 Austria | 1 | 65/23/11 | 1 | ✓ | 2-0 |
| J | Jordania 1-2 Argelia | 2 | 28/28/42 | 2 | ✓ | 1-1 |
| K | Portugal 1-1 RD del Congo | X | 62/24/13 | 1 | · | 2-0 |
| K | Uzbekistán 1-3 Colombia | 2 | 15/25/58 | 2 | ✓ | 1-1 |
| K | Portugal 5-0 Uzbekistán | 1 | 59/25/15 | 1 | ✓ | 1-1 |
| K | Colombia 1-0 RD del Congo | 1 | 62/24/13 | 1 | ✓ | 2-0 |
| L | Inglaterra 4-2 Croacia | 1 | 45/28/25 | 1 | ✓ | 1-1 |
| L | Ghana 1-0 Panamá | 1 | 19/27/52 | 2 | · | 1-1 |
| L | Inglaterra 0-0 Ghana | X | 80/15/3 | 1 | · | 2-0 |
| L | Panamá 0-1 Croacia | 2 | 19/26/53 | 2 | ✓ | 1-1 |

## Dry-run completo: los 72 partidos de fase de grupos

● = ya jugado (con resultado real y si el modelo acertó el signo).

| G | Partido | Pred | p(1/X/2) | Marcador pred. | Real |
|---|---|---|---|---|---|
| A | México vs Sudáfrica | 1 | 80/15/3 | 2-0 | ● 2-0 (✓) |
| A | México vs Corea del Sur | 1 | 58/25/16 | 1-1 | ● 1-0 (✓) |
| A | República Checa vs México | 2 | 15/25/59 | 1-1 | ● 0-3 (✓) |
| A | Sudáfrica vs Corea del Sur | 2 | 15/25/59 | 1-1 | ● 1-0 (·) |
| A | República Checa vs Sudáfrica | 1 | 57/25/16 | 1-1 | ● 1-1 (·) |
| A | Corea del Sur vs República Checa | 1 | 36/29/33 | 1-1 | ● 2-1 (✓) |
| B | Canadá vs Bosnia y Herzegovina | 1 | 57/25/16 | 1-1 | ● 1-1 (·) |
| B | Canadá vs Catar | 1 | 80/15/3 | 2-0 | ● 6-0 (✓) |
| B | Suiza vs Canadá | 1 | 41/28/29 | 1-1 | ● 2-1 (✓) |
| B | Bosnia y Herzegovina vs Catar | 1 | 60/25/14 | 1-1 | ● 3-1 (✓) |
| B | Suiza vs Bosnia y Herzegovina | 1 | 63/23/12 | 2-0 | ● 4-1 (✓) |
| B | Catar vs Suiza | 2 | 1/12/85 | 0-2 | ● 1-1 (·) |
| C | Brasil vs Marruecos | 1 | 50/27/22 | 1-1 | ● 1-1 (·) |
| C | Brasil vs Haití | 1 | 76/17/5 | 2-0 | ● 3-0 (✓) |
| C | Escocia vs Brasil | 2 | 15/25/59 | 1-1 | ● 0-3 (✓) |
| C | Marruecos vs Haití | 1 | 62/24/13 | 2-0 | ● 4-2 (✓) |
| C | Escocia vs Marruecos | 2 | 27/28/43 | 1-1 | ● 0-1 (✓) |
| C | Haití vs Escocia | 2 | 19/26/53 | 1-1 | ● 0-1 (✓) |
| D | Estados Unidos vs Paraguay | 2 | 27/28/43 | 1-1 | ● 4-1 (·) |
| D | Estados Unidos vs Australia | 2 | 32/29/37 | 1-1 | ● 2-0 (·) |
| D | Estados Unidos vs Turquía | 2 | 20/27/51 | 1-1 | — |
| D | Paraguay vs Australia | 1 | 40/29/30 | 1-1 | — |
| D | Turquía vs Paraguay | 1 | 43/28/27 | 1-1 | ● 0-1 (·) |
| D | Australia vs Turquía | 2 | 22/27/49 | 1-1 | ● 2-0 (·) |
| E | Alemania vs Curaçao | 1 | 79/16/3 | 2-0 | ● 7-1 (✓) |
| E | Alemania vs Costa de Marfil | 1 | 52/27/20 | 1-1 | ● 2-1 (✓) |
| E | Ecuador vs Alemania | 1 | 38/29/32 | 1-1 | ● 2-1 (✓) |
| E | Curaçao vs Costa de Marfil | 2 | 12/23/64 | 0-2 | ● 0-2 (✓) |
| E | Ecuador vs Curaçao | 1 | 82/14/2 | 2-0 | ● 0-0 (·) |
| E | Costa de Marfil vs Ecuador | 2 | 17/26/56 | 1-1 | ● 1-0 (·) |
| F | Países Bajos vs Japón | 1 | 38/29/32 | 1-1 | ● 2-2 (·) |
| F | Países Bajos vs Suecia | 1 | 59/25/15 | 1-1 | ● 5-1 (✓) |
| F | Países Bajos vs Túnez | 1 | 64/23/11 | 2-0 | — |
| F | Japón vs Suecia | 1 | 56/26/17 | 1-1 | ● 1-1 (·) |
| F | Túnez vs Japón | 2 | 13/24/61 | 0-2 | ● 0-4 (✓) |
| F | Suecia vs Túnez | 1 | 40/29/30 | 1-1 | ● 5-1 (✓) |
| G | Bélgica vs Egipto | 1 | 54/26/18 | 1-1 | ● 1-1 (·) |
| G | Bélgica vs Irán | 1 | 52/27/20 | 1-1 | ● 0-0 (·) |
| G | Bélgica vs Nueva Zelanda | 1 | 70/21/8 | 2-0 | — |
| G | Egipto vs Irán | 2 | 33/29/37 | 1-1 | — |
| G | Nueva Zelanda vs Egipto | 2 | 21/27/51 | 1-1 | ● 1-3 (✓) |
| G | Irán vs Nueva Zelanda | 1 | 53/26/19 | 1-1 | ● 2-2 (·) |
| H | España vs Cabo Verde | 1 | 83/13/2 | 2-0 | ● 0-0 (·) |
| H | España vs Arabia Saudí | 1 | 86/12/1 | 2-0 | ● 4-0 (✓) |
| H | España vs Uruguay | 1 | 62/24/13 | 2-0 | — |
| H | Cabo Verde vs Arabia Saudí | 1 | 38/29/32 | 1-1 | — |
| H | Uruguay vs Cabo Verde | 1 | 59/25/15 | 1-1 | ● 2-2 (·) |
| H | Arabia Saudí vs Uruguay | 2 | 13/24/62 | 0-2 | ● 1-1 (·) |
| I | Francia vs Senegal | 1 | 50/27/21 | 1-1 | ● 3-1 (✓) |
| I | Francia vs Irak | 1 | 76/18/5 | 2-0 | ● 3-0 (✓) |
| I | Francia vs Noruega | 1 | 45/28/25 | 1-1 | — |
| I | Senegal vs Irak | 1 | 61/24/13 | 2-0 | — |
| I | Noruega vs Senegal | 1 | 40/29/30 | 1-1 | ● 3-2 (✓) |
| I | Irak vs Noruega | 2 | 10/22/66 | 0-2 | ● 1-4 (✓) |
| J | Argentina vs Argelia | 1 | 66/22/10 | 2-0 | ● 3-0 (✓) |
| J | Argentina vs Austria | 1 | 65/23/11 | 2-0 | ● 2-0 (✓) |
| J | Argentina vs Jordania | 1 | 73/19/6 | 2-0 | — |
| J | Argelia vs Austria | 2 | 34/29/36 | 1-1 | — |
| J | Jordania vs Argelia | 2 | 28/28/42 | 1-1 | ● 1-2 (✓) |
| J | Austria vs Jordania | 1 | 43/28/27 | 1-1 | ● 3-1 (✓) |
| K | Portugal vs RD del Congo | 1 | 62/24/13 | 2-0 | ● 1-1 (·) |
| K | Portugal vs Uzbekistán | 1 | 59/25/15 | 1-1 | ● 5-0 (✓) |
| K | Portugal vs Colombia | 1 | 35/29/34 | 1-1 | — |
| K | RD del Congo vs Uzbekistán | 2 | 32/29/38 | 1-1 | — |
| K | Colombia vs RD del Congo | 1 | 62/24/13 | 2-0 | ● 1-0 (✓) |
| K | Uzbekistán vs Colombia | 2 | 15/25/58 | 1-1 | ● 1-3 (✓) |
| L | Inglaterra vs Croacia | 1 | 45/28/25 | 1-1 | ● 4-2 (✓) |
| L | Inglaterra vs Ghana | 1 | 80/15/3 | 2-0 | ● 0-0 (·) |
| L | Inglaterra vs Panamá | 1 | 64/23/12 | 2-0 | — |
| L | Croacia vs Ghana | 1 | 70/20/8 | 2-0 | — |
| L | Panamá vs Croacia | 2 | 19/26/53 | 1-1 | ● 0-1 (✓) |
| L | Ghana vs Panamá | 2 | 19/27/52 | 1-1 | ● 1-0 (·) |
