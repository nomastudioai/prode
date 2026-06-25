---
name: prediccion-mundial-2026
description: Predice resultados de partidos del Mundial 2026 combinando el índice Elo de selecciones (eloratings.net, vía El Atlas) con la forma reciente. Úsala cuando el usuario pida pronosticar un partido, un cruce, un grupo o el bracket del Mundial 2026, o pregunte probabilidades 1X2 / marcador de un enfrentamiento entre selecciones clasificadas.
---

# Predicción de partidos · Mundial 2026

Skill para estimar el resultado de un partido entre selecciones clasificadas al
Mundial 2026, usando como base el **rating Elo** de cada selección más un ajuste
por **forma reciente**.

## Datos

- `data/elo-mundial-2026.json` — los 48 clasificados con su Elo y ranking mundial
  2026, más la trayectoria reciente (2018-2026) para calcular el momentum.
- `data/elo-mundial-2026.csv` — misma data en formato plano.
- `data/elo-series-completo-1901-2026.js` — serie histórica completa de las 195
  selecciones (por si se necesita contexto o re-cálculo).

**Fuente:** World Football Elo Ratings (eloratings.net), tomado del chart de
El Atlas (`dschteingart.github.io/el-atlas-charts/03-futbol`). El índice es un
valor **anual al cierre de año**; el campo 2026 es el último disponible al
25/06/2026.

> **Cobertura: 46 de 48 equipos.** **Escocia** y **Curaçao** no figuran en este
> índice (el Atlas indexa por país ISO3: agrupa al Reino Unido como
> "Inglaterra/GBR" y Curaçao no es estado de la ONU). Para predecir partidos de
> esas dos selecciones hay que pasar el Elo a mano con `--eloA`/`--eloB`.

## Cómo usar

Requiere Node.js. Desde el directorio de la skill:

```bash
# Listar equipos disponibles y su Elo
node predict.mjs --list

# Partido en cancha neutral (default fase de grupos)
node predict.mjs "España" "Argentina" --neutral

# Con anfitrión (USA / Canadá / México tienen ventaja de localía)
node predict.mjs USA "México" --host A

# Con forma reciente manual (W=victoria, D=empate, L=derrota; más reciente primero)
node predict.mjs Japon Croacia --formA W,W,D,L,W --formB L,D,L,L,W --neutral

# Equipo sin índice → pasar Elo a mano
node predict.mjs Escocia "España" --eloA 1700 --neutral
```

Acepta nombre en español, en inglés o el código ISO3 (`ESP`, `ARG`, `GBR`...).

### Flags

| Flag | Qué hace |
|------|----------|
| `--neutral` | Sin ventaja de localía (recomendado para fase de grupos en sede neutral). |
| `--host A\|B` | Marca al equipo A o B como anfitrión (ventaja de localía). |
| `--home A\|B` | Igual que host: ese equipo juega de local. |
| `--formA / --formB` | Resultados recientes `W,D,L,...` (más reciente primero). Si no se pasan, se usa el *momentum* del índice (cuánto subió/bajó el Elo 2024→2026). |
| `--eloA / --eloB` | Override manual del Elo. Obligatorio para Escocia y Curaçao. |
| `--list` | Lista los 48 equipos con su Elo/ranking. |

## Modelo

Heurística transparente y ajustable (ver `PARAMS` arriba de `predict.mjs`):

1. **Elo efectivo** = Elo del índice + ajuste de forma (± acotado) + ventaja de
   localía (si aplica).
2. **Diferencia de goles esperada** = (Elo efectivo A − Elo efectivo B) ×
   `GOAL_SCALE` (≈ 0,4 gol cada 100 puntos Elo).
3. Se reparte sobre un total esperado (`BASE_TOTAL` ≈ 2,65 goles) para obtener
   los goles esperados de cada equipo (λ).
4. Con un modelo **Poisson** por equipo se calculan las probabilidades 1X2
   (gana / empata / pierde) y los marcadores más probables.

La forma reciente tiene dos modos: por defecto usa el *momentum* del propio
índice (delta de Elo de los últimos años, tope ±40 pts); si se pasan resultados
con `--formA/--formB`, los pondera dándole más peso a los más recientes
(tope ±60 pts).

## Limitaciones (importante)

- El índice es **anual**, no se actualiza partido a partido: cerca o durante el
  torneo puede estar algo desfasado. Para mayor precisión, pasá la forma
  reciente real con `--formA/--formB`.
- No modela bajas, lesiones, suspensiones, clima ni contexto del partido.
- Los parámetros (`GOAL_SCALE`, `BASE_TOTAL`, `HOME_ADV`, pesos de forma) son
  configurables y no están calibrados contra un histórico de apuestas: es una
  estimación **orientativa**, no un pronóstico garantizado.

## Actualizar los datos

Para refrescar el índice (p. ej. cuando el Atlas publique nuevos valores),
volvé a descargar `data-elo-series.js` desde el chart de El Atlas y regenerá los
archivos de `data/` con el mismo mapeo de los 48 clasificados.
