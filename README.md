# ⚽️ Mundial 2026 · Predictor Elo (caso de estudio)

> **⚠️ Esto es un EXPERIMENTO educativo sobre modelos predictivos e IA. NO es una
> herramienta para apostar. Estamos en contra de las apuestas. No nos hacemos
> responsables de ningún uso de este material. Leé el [DISCLAIMER completo](DISCLAIMER.md).**

Proyecto abierto de **NoMa Studio AI**: ¿qué tan bien predice los partidos del
Mundial 2026 un modelo estadístico simple basado en el **rating Elo** de las
selecciones? Lo construimos, lo medimos contra los resultados reales y
documentamos honestamente **qué funciona y qué no**.

La gracia del caso de estudio no es "ganarle al Mundial": es mostrar, con datos,
**dónde está el techo de un modelo de este tipo y por qué.**

---

## 🔮 Predicciones actuales

<!-- PRED:START -->
_Última actualización automática: **2026-06-26**. Backtest: el modelo acierta el 1X2 en **61.4%** de 57 partidos jugados (azar ≈ 33%)._

**Predicción de finalistas:** Argentina vs Inglaterra (4.8% de las simulaciones).

**Máximas candidatas a llegar a la final:**

| Selección | Llega a la final | Campeón |
|---|---|---|
| Argentina | 28.6% | 20.4% |
| Francia | 25.0% | 15.8% |
| España | 21.8% | 15.1% |
| Inglaterra | 18.6% | 8.6% |
| Colombia | 15.9% | 7.0% |
| Brasil | 12.5% | 5.1% |

Ver el detalle completo (todos los grupos y próximos partidos) en [**predicciones/PREDICCIONES.md**](predicciones/PREDICCIONES.md).
<!-- PRED:END -->

---

## 🧪 Qué probamos (y qué aprendimos)

Partimos de un modelo base (Elo → goles esperados → Poisson) y lo evaluamos con un
**backtest** contra los partidos ya jugados. Después intentamos mejorarlo en tres
frentes. Resultado honesto:

| Mejora que probamos | ¿Mejoró el acierto? | ¿Mejoró la calidad de probabilidad? |
|---|---|---|
| **#1 Modelar el empate** (Dixon-Coles) | No | **Sí** (marcador exacto y empate bien calibrado) |
| **#2 Forma intra-torneo** (Elo fresco partido a partido) | No | No |
| **#3 Atenuar la sobreconfianza** (temple / shrink) | No | No |

**Hallazgos clave:**

1. **El modelo nunca predice empate, y eso NO se puede "arreglar" forzándolo.** En
   el backtest, los empates ocurrieron en favoritos que pincharon (España 0-0 Cabo
   Verde, Inglaterra 0-0 Ghana), no en partidos parejos. Forzar empates baja el
   acierto sin atrapar los empates reales. Lo que sí sirve (Dixon-Coles) es dejar
   la **probabilidad** de empate bien calibrada (~24,5% predicho vs 25% real).

2. **La forma intra-torneo no aporta.** Un backtest walk-forward (sin fuga de datos)
   mostró +0,0 pp de acierto. Incluso usando el Elo "perfectamente fresco" de
   eloratings (cota optimista, con fuga) el techo apenas sube a ~66%.

3. **El modelo ya está bien calibrado.** Atenuar la confianza empeora el Brier:
   la aparente sobreconfianza en favoritos grandes se compensaba con subconfianza
   en partidos parejos.

**Conclusión y por qué dejamos el modelo así:** el predictor está **en el techo de
lo que el índice Elo puede dar** para la fase de grupos (~61-62% de acierto 1X2,
igual que "gana el de mayor Elo"), con probabilidades ya calibradas. La única
mejora que aportó valor real fue Dixon-Coles (calidad de probabilidad), así que es
la que quedó. Subir el acierto de verdad requeriría datos fuera del índice (valor
de plantel, lesiones, descanso, etc.), que es otro proyecto.

📄 Detalle del backtest: [`.claude/skills/prediccion-mundial-2026/analisis-backtest.md`](.claude/skills/prediccion-mundial-2026/analisis-backtest.md)

---

## 📐 El modelo (specs)

1. **Índice:** rating **Elo** de selecciones (World Football Elo Ratings,
   [eloratings.net](https://www.eloratings.net/)), tomado del chart de
   [El Atlas](https://dschteingart.github.io/el-atlas-charts/03-futbol/chart-elo-trayectoria.html).
2. **Probabilidad de resultado:** la diferencia de Elo (más ventaja de localía para
   los anfitriones México/Canadá/EE.UU.) se traduce a una diferencia de goles
   esperada, que alimenta un modelo **Poisson** por equipo → probabilidades 1X2 y
   marcadores. Con corrección **Dixon-Coles** para los marcadores bajos.
3. **Forma reciente:** ajuste acotado por el *momentum* del índice o por resultados
   recientes (opcional). Probado: no mejora el acierto (ver arriba).
4. **Simulación del torneo:** Monte Carlo (50.000 corridas) que combina los
   resultados reales con la simulación de los partidos restantes, resuelve grupos,
   mejores terceros y el cuadro de eliminación oficial hasta la final.

**Backtest (pre-torneo, sin fuga):** se usa el Elo *previo* al Mundial.
**Predicciones a futuro:** se usa el Elo *en vivo* de eloratings (más actual).

Todos los parámetros viven en
[`model.mjs`](.claude/skills/prediccion-mundial-2026/model.mjs) y son ajustables.

---

## 🚀 Uso

Requiere Node.js (sin dependencias externas).

```bash
cd .claude/skills/prediccion-mundial-2026

node predict.mjs "España" "Argentina" --neutral   # un partido
node predict.mjs USA "México" --host A             # con anfitrión
node backtest.mjs --md                             # backtest vs realidad
node simular.mjs 50000 --json                      # simular el torneo
node experiment-forma.mjs                          # experimento de forma
```

---

## 🔄 Cómo mantenerlo al día

El índice Elo y las predicciones se **actualizan solos** con:

```bash
bash scripts/actualizar.sh
```

Esto baja el Elo en vivo de eloratings.net, refresca todo y regenera las
predicciones y este README. Hay un **GitHub Action** ([`.github/workflows/actualizar.yml`](.github/workflows/actualizar.yml))
que lo corre **todos los días** durante el Mundial y commitea los cambios.

**Resultados de partidos nuevos:** se agregan a
[`data/grupos-resultados-2026.json`](.claude/skills/prediccion-mundial-2026/data/grupos-resultados-2026.json)
(campo `played_matches`), moviéndolos desde `remaining_fixtures`. Es el único paso
manual; el resto es automático.

---

## 📊 Datos y fuentes

- **Elo:** eloratings.net (vía El Atlas). 46 de 48 selecciones salen del extracto
  del Atlas; **Escocia y Curaçao** se completan con el Elo en vivo de eloratings.
- **Resultados y fixture:** recopilados y cruzados entre múltiples fuentes públicas
  (Wikipedia, ESPN, FIFA, Yahoo, FOX, CBS, NBC). Ningún resultado se inventa: los
  no confirmados por dos fuentes quedan como "pendientes".
- **Cuadro de eliminación:** estructura oficial de la FIFA; el emparejamiento fino
  tras 16avos es la parte de menor certeza (ver notas en los datos).

---

## 🧭 Estructura del repo

```
README.md                     · este caso de estudio
DISCLAIMER.md                 · aviso legal (ES/EN)
LICENSE                       · MIT (código) + nota sobre datos
scripts/actualizar.sh         · actualización automática
.github/workflows/            · Action diaria
predicciones/PREDICCIONES.md  · predicciones completas (autogenerado)
.claude/skills/prediccion-mundial-2026/
  ├── model.mjs               · el modelo (Elo + Poisson + Dixon-Coles)
  ├── predict.mjs             · predecir un partido
  ├── backtest.mjs            · validación contra resultados reales
  ├── simular.mjs             · Monte Carlo del torneo
  ├── experiment-forma.mjs    · experimento de forma intra-torneo
  ├── actualizar-elo.mjs      · refresco del Elo en vivo
  ├── genera-predicciones.mjs · genera los documentos públicos
  └── data/                   · índice Elo, grupos, resultados, cuadro
```

---

## ⚖️ Aviso

Hecho por **NoMa Studio AI** con fines educativos y de investigación sobre IA y
modelos predictivos. **No promovemos las apuestas.** Las predicciones tienen un
margen de error alto y documentado. Uso bajo tu exclusiva responsabilidad.
Leé el [DISCLAIMER](DISCLAIMER.md).
