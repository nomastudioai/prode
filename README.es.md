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

🇬🇧 Read it in English: [README.md](README.md).

---

## 🔮 Predicciones actuales

El documento de predicciones (en inglés, autogenerado y actualizado a diario) está en
👉 [**predicciones/PREDICCIONES.md**](predicciones/PREDICCIONES.md). Incluye:

- Próximos partidos con su **marcador más probable**.
- **Cuadro proyectado partido a partido**, de 16avos hasta la final, con marcador.
- Probabilidades de avance por grupo y de finalistas (Monte Carlo, 50.000 corridas).

---

## 📉 Post-mortem: ¿cuánto acertamos?

Con el Mundial en su recta final, medimos el modelo contra los resultados reales de
todo el torneo. Misma metodología que el backtest (Elo pre-torneo + momentum, sin
fuga de datos). En grupos la métrica es 1X2 (gana local / empate / gana visitante,
azar ≈ 33%); en eliminatorias no hay empate, así que la métrica es "acertamos quién
avanza" (moneda al aire = 50%).

| Fase | Partidos | Acertados | Acierto |
|---|---|---|---|
| Fase de grupos (1X2) | 72 | 44 | **61,1%** |
| Eliminatorias (quién avanza) | 30 | 24 | **80,0%** |
| **Torneo hasta ahora** | **102** | **68** | **66,7%** |

**El modelo clavó la final.** Su final proyectada más probable era **España vs
Argentina**, que es exactamente la final real (19/07), y tenía a los dos finalistas
como sus dos máximos candidatos al título (España 32,3%, Argentina 30,9%). Donde falló
fue en los batacazos que el Elo no puede anticipar (Paraguay a Alemania, Marruecos a
Países Bajos, Noruega a Brasil) y en las definiciones por penales, que son otra moneda
al aire. El detalle partido a partido, con las tablas de predicción vs realidad, está en
👉 [**predicciones/POSTMORTEM.md**](predicciones/POSTMORTEM.md).

> Nota: el partido por el tercer puesto (18/07) y la final (19/07) todavía no se
> jugaron cuando se escribió este post-mortem, así que llevan solo el pronóstico del
> modelo, no un resultado real.

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

1. **El modelo nunca predice empate, y eso NO se puede "arreglar" forzándolo.** Los
   empates pasaron en favoritos que pincharon (España 0-0 Cabo Verde, Inglaterra 0-0
   Ghana), no en partidos parejos. Forzar empates baja el acierto sin atrapar los
   empates reales. Lo que sí sirve (Dixon-Coles) es dejar la **probabilidad** de
   empate bien calibrada (~24,5% predicho vs 25% real).

2. **La forma intra-torneo no aporta.** Un backtest walk-forward (sin fuga) dio +0,0
   pp de acierto. Incluso con el Elo "perfectamente fresco" de eloratings (cota
   optimista, con fuga) el techo apenas sube a ~66%.

3. **El modelo ya está bien calibrado.** Atenuar la confianza empeora el Brier.

**Conclusión:** el predictor está **en el techo de lo que el índice Elo puede dar**
para la fase de grupos (~61-62% de acierto 1X2). La única mejora que aportó valor fue
Dixon-Coles. Subir el acierto requeriría datos fuera del índice (plantel, lesiones,
descanso), que es otro proyecto.

---

## 📐 El modelo (specs)

1. **Índice:** rating **Elo** de selecciones (eloratings.net, vía El Atlas).
2. **Probabilidad:** diferencia de Elo (+ localía de anfitriones) → goles esperados →
   **Poisson** → 1X2 y marcadores. Con corrección **Dixon-Coles** para marcadores bajos.
3. **Forma reciente:** ajuste acotado, opcional. No mejora el acierto.
4. **Simulación:** Monte Carlo (50.000 corridas) del torneo completo.
5. **Cuadro proyectado:** camino más probable, partido a partido, hasta la final.

**Backtest:** Elo pre-torneo (sin fuga). **Predicciones a futuro:** Elo en vivo.

Parámetros en [`model.mjs`](.claude/skills/prediccion-mundial-2026/model.mjs).

---

## 🔄 Cómo mantenerlo al día

```bash
bash scripts/actualizar.sh
```

Baja el Elo en vivo de eloratings.net, refresca todo y regenera las predicciones.
Un **GitHub Action** lo corre **todos los días**. Los resultados de partidos nuevos
se agregan a `data/grupos-resultados-2026.json` (único paso manual).

---

## ⚖️ Aviso

Hecho por **NoMa Studio AI** con fines educativos y de investigación sobre IA y
modelos predictivos. **No promovemos las apuestas.** Las predicciones tienen un
margen de error alto y documentado. Uso bajo tu exclusiva responsabilidad.
Leé el [DISCLAIMER](DISCLAIMER.md).
