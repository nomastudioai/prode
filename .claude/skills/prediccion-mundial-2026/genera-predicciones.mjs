#!/usr/bin/env node
/**
 * Genera los documentos públicos de predicciones a partir de:
 *   - data/backtest-stats.json   (backtest.mjs)
 *   - predicciones/simulacion.json (simular.mjs --json)
 *   - data/grupos-resultados-2026.json
 * y actualiza la sección de predicciones del README.
 *
 *   node genera-predicciones.mjs
 *
 * (actualizar.sh corre antes: actualizar-elo → backtest --md → simular --json)
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { loadData, findTeam, predictMatch, pick1x2, PARAMS } from "./model.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, "..", "..", "..");
const elo = loadData();
const byIso = Object.fromEntries(elo.equipos.map((t) => [t.iso3, t]));
const fix = JSON.parse(readFileSync(join(__dir, "data", "grupos-resultados-2026.json"), "utf8"));
const bt = JSON.parse(readFileSync(join(__dir, "data", "backtest-stats.json"), "utf8"));
const sim = JSON.parse(readFileSync(join(ROOT, "predicciones", "simulacion.json"), "utf8"));
const HOSTS = new Set(["MEX", "CAN", "USA"]);
const eloOf = (iso) => byIso[iso].elo_live ?? byIso[iso].elo_2026;

const pct = (x) => x.toFixed(1) + "%";
const fecha = fix.meta.generado;

// ─── Pronóstico de los partidos pendientes (Elo en vivo) ──────────────
function predRow(homeIso, awayIso) {
  const A = byIso[homeIso], B = byIso[awayIso];
  const r = predictMatch(A, B, {
    eloA: eloOf(homeIso), eloB: eloOf(awayIso),
    homeAdvA: HOSTS.has(homeIso) ? PARAMS.HOME_ADV : 0,
    homeAdvB: HOSTS.has(awayIso) ? PARAMS.HOME_ADV : 0,
  });
  const probs = { "1": r.pWin, "X": r.pDraw, "2": r.pLose };
  return { pred: pick1x2(probs), p1: r.pWin, pX: r.pDraw, p2: r.pLose, score: `${r.scores[0].a}-${r.scores[0].b}` };
}

// ─── Documento de predicciones ────────────────────────────────────────
let md = `# Predicciones · Mundial 2026\n\n`;
md += `> Generado automáticamente el ${fecha}. **Experimento, no apuestes.** Ver [DISCLAIMER](../DISCLAIMER.md).\n\n`;
md += `**Confiabilidad del modelo (backtest sobre ${bt.n} partidos jugados):** acierta el resultado 1X2 `;
md += `en **${(bt.acc * 100).toFixed(1)}%** de los casos `;
md += `(azar ≈ 33%, "gana el de mayor Elo" ≈ ${(bt.baseFav * 100).toFixed(1)}%). `;
md += `Marcador exacto ${(bt.exact * 100).toFixed(1)}%. Todo lo que sigue hereda ese margen de error, `;
md += `que **se agranda en cada ronda** (las predicciones de finalistas son de baja confianza).\n\n`;

// 1) Partidos pendientes
md += `## 1) Partidos pendientes (pronóstico)\n\n`;
if (fix.remaining_fixtures.length === 0) md += `_No quedan partidos de fase de grupos por jugar._\n\n`;
else {
  md += `Partidos aún no jugados o sin resultado confirmado por dos fuentes. `;
  md += `Pronóstico con Elo en vivo. 1 = gana local, X = empate, 2 = gana visitante.\n\n`;
  md += `| Fecha | Grupo | Partido | Pronóstico | p(1/X/2) | Marcador prob. |\n|---|---|---|---|---|---|\n`;
  for (const m of fix.remaining_fixtures) {
    const r = predRow(m.home, m.away);
    const favName = r.pred === "1" ? m.home_name : r.pred === "2" ? m.away_name : "Empate";
    md += `| ${m.date} | ${m.group} | ${m.home_name} vs ${m.away_name} | **${favName}** | ${(r.p1*100)|0}/${(r.pX*100)|0}/${(r.p2*100)|0} | ${r.score} |\n`;
  }
  md += `\n`;
}

// 2) Clasificación proyectada por grupo
md += `## 2) ¿Quién avanza? Clasificación proyectada por grupo\n\n`;
md += `Probabilidad de avanzar a 16avos (top 2 de cada grupo + 8 mejores terceros), `;
md += `de ${sim.meta.simulaciones.toLocaleString("es")} simulaciones Monte Carlo. `;
md += `✓ = grupo ya cerrado (resultado definitivo).\n\n`;
for (const g of Object.keys(sim.grupos)) {
  const G = sim.grupos[g];
  md += `### Grupo ${g}${G.completo ? " ✓ (cerrado)" : ""}\n\n`;
  md += `| Pos | Equipo | PJ | Pts | DG | Avanza | 1º | 2º |\n|---|---|---|---|---|---|---|---|\n`;
  G.equipos.forEach((t, i) => {
    md += `| ${i + 1} | ${t.name} | ${t.pj} | ${t.pts} | ${t.gd >= 0 ? "+" : ""}${t.gd} | ${G.completo && i < 2 ? "✓ 100%" : pct(t.advance)} | ${pct(t.p1)} | ${pct(t.p2)} |\n`;
  });
  md += `\n`;
}

// 3) Finalistas
md += `## 3) Predicción de finalistas\n\n`;
md += `De ${sim.meta.simulaciones.toLocaleString("es")} simulaciones del torneo completo (cuadro oficial, Elo en vivo).\n\n`;
md += `**Final más probable: ${sim.prediccion_finalistas}** `;
md += `(se da en ${pct(sim.final_mas_probable[0].prob)} de las simulaciones; sin resultado del partido final).\n\n`;
md += `Probabilidad de llegar a la final (y de salir campeón):\n\n`;
md += `| Selección | Llega a la final | Campeón |\n|---|---|---|\n`;
for (const r of sim.finalistas.slice(0, 10)) md += `| ${r.name} | ${pct(r.final)} | ${pct(r.champ)} |\n`;
md += `\n**Finales más probables:**\n\n`;
for (const p of sim.final_mas_probable) md += `- ${p.final} — ${pct(p.prob)}\n`;
md += `\n> Las probabilidades de finalista son bajas y muy parejas: el modelo NO tiene un favorito fuerte, `;
md += `y el emparejamiento exacto del cuadro tras 16avos es la parte de menor certeza. Tomar como orientativo.\n`;

writeFileSync(join(ROOT, "predicciones", "PREDICCIONES.md"), md);
console.log("→ predicciones/PREDICCIONES.md");

// ─── Bloque resumen para el README (entre marcadores) ─────────────────
let resumen = `<!-- PRED:START -->\n`;
resumen += `_Última actualización automática: **${fecha}**. Backtest: el modelo acierta el 1X2 en `;
resumen += `**${(bt.acc * 100).toFixed(1)}%** de ${bt.n} partidos jugados (azar ≈ 33%)._\n\n`;
resumen += `**Predicción de finalistas:** ${sim.prediccion_finalistas} `;
resumen += `(${pct(sim.final_mas_probable[0].prob)} de las simulaciones).\n\n`;
resumen += `**Máximas candidatas a llegar a la final:**\n\n`;
resumen += `| Selección | Llega a la final | Campeón |\n|---|---|---|\n`;
for (const r of sim.finalistas.slice(0, 6)) resumen += `| ${r.name} | ${pct(r.final)} | ${pct(r.champ)} |\n`;
resumen += `\nVer el detalle completo (todos los grupos y próximos partidos) en `;
resumen += `[**predicciones/PREDICCIONES.md**](predicciones/PREDICCIONES.md).\n`;
resumen += `<!-- PRED:END -->`;

const readmePath = join(ROOT, "README.md");
if (existsSync(readmePath)) {
  let r = readFileSync(readmePath, "utf8");
  if (r.includes("<!-- PRED:START -->")) {
    r = r.replace(/<!-- PRED:START -->[\s\S]*<!-- PRED:END -->/, resumen);
    writeFileSync(readmePath, r);
    console.log("→ README.md (bloque de predicciones actualizado)");
  } else {
    console.log("README.md sin marcadores PRED:START/END; no se tocó.");
  }
}
