#!/usr/bin/env node
/**
 * Generates the public prediction documents (in English) from:
 *   - data/backtest-stats.json     (backtest.mjs)
 *   - predicciones/simulacion.json  (simular.mjs --json)
 *   - data/grupos-resultados-2026.json
 *   - deterministic bracket projection (proyeccion.mjs)
 * and updates the predictions block in README.md.
 *
 *   node genera-predicciones.mjs
 *
 * (actualizar.sh runs first: actualizar-elo -> backtest --md -> simular --json)
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { loadData, predictMatch, pick1x2, PARAMS } from "./model.mjs";
import { proyectar } from "./proyeccion.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, "..", "..", "..");
const elo = loadData();
const byIso = Object.fromEntries(elo.equipos.map((t) => [t.iso3, t]));
const fix = JSON.parse(readFileSync(join(__dir, "data", "grupos-resultados-2026.json"), "utf8"));
const bt = JSON.parse(readFileSync(join(__dir, "data", "backtest-stats.json"), "utf8"));
const sim = JSON.parse(readFileSync(join(ROOT, "predicciones", "simulacion.json"), "utf8"));
const proj = proyectar();
const HOSTS = new Set(["MEX", "CAN", "USA"]);
const eloOf = (iso) => byIso[iso].elo_live ?? byIso[iso].elo_2026;
const en = (iso) => byIso[iso].en_name ?? byIso[iso].name;

const pct = (x) => x.toFixed(1) + "%";
const date = fix.meta.generado;

// Predicted scoreline + pick for an upcoming match (live Elo).
function predRow(homeIso, awayIso) {
  const r = predictMatch(byIso[homeIso], byIso[awayIso], {
    eloA: eloOf(homeIso), eloB: eloOf(awayIso),
    homeAdvA: HOSTS.has(homeIso) ? PARAMS.HOME_ADV : 0,
    homeAdvB: HOSTS.has(awayIso) ? PARAMS.HOME_ADV : 0,
  });
  const probs = { "1": r.pWin, "X": r.pDraw, "2": r.pLose };
  return { pred: pick1x2(probs), p1: r.pWin, pX: r.pDraw, p2: r.pLose, score: `${r.scores[0].a}-${r.scores[0].b}` };
}

// ─── Predictions document (English) ───────────────────────────────────
let md = `# Predictions · 2026 FIFA World Cup\n\n`;
md += `> Auto-generated on ${date}. **This is an experiment, do NOT bet.** See [DISCLAIMER](../DISCLAIMER.md).\n\n`;
md += `**Model reliability (backtest over ${bt.n} matches already played):** the model gets the `;
md += `1X2 result right **${(bt.acc * 100).toFixed(1)}%** of the time `;
md += `(random ≈ 33%, "higher-Elo team wins" ≈ ${(bt.baseFav * 100).toFixed(1)}%). `;
md += `Exact scoreline ${(bt.exact * 100).toFixed(1)}%. Everything below inherits that margin of error, `;
md += `which **grows every round** (the finalist predictions are low-confidence). The most likely `;
md += `scoreline is shown for every match: useful as an "expected result", not a certainty.\n\n`;

// 1) Upcoming matches
md += `## 1) Upcoming matches (predicted score)\n\n`;
if (fix.remaining_fixtures.length === 0) md += `_No group-stage matches left to play._\n\n`;
else {
  md += `Matches not yet played or not confirmed by two sources. `;
  md += `Predicted with live Elo. 1 = home win, X = draw, 2 = away win.\n\n`;
  md += `| Date | Group | Match | Pick | Score | p(1/X/2) |\n|---|---|---|---|---|---|\n`;
  for (const m of fix.remaining_fixtures) {
    const r = predRow(m.home, m.away);
    const pick = r.pred === "1" ? en(m.home) : r.pred === "2" ? en(m.away) : "Draw";
    md += `| ${m.date} | ${m.group} | ${en(m.home)} vs ${en(m.away)} | **${pick}** | ${r.score} | ${(r.p1*100)|0}/${(r.pX*100)|0}/${(r.p2*100)|0} |\n`;
  }
  md += `\n`;
}

// 2) Projected knockout bracket (match by match)
md += `## 2) Projected knockout bracket (match by match)\n\n`;
md += `Single most-likely path: real group results + the most-likely score for the remaining `;
md += `group games decide the standings; then every knockout tie is predicted with a decisive `;
md += `score and a winner (in reality many ties go to extra time/penalties; "(tight)" marks the `;
md += `near coin-flips).\n\n`;
let curRound = "";
for (const t of proj.ties) {
  if (t.round !== curRound) { md += `\n### ${t.round}\n\n`; curRound = t.round; }
  md += `- **${t.home} ${t.score} ${t.away}** → advances **${t.winner}**${t.tight ? " _(tight)_" : ""}\n`;
}
md += `\n### 🏆 Projected champion: **${proj.champion}**\n\n`;
md += `Projected final: ${proj.final.home} ${proj.final.score} ${proj.final.away} (winner ${proj.final.winner}, without the actual result).\n\n`;

// 3) Who advances (Monte Carlo probabilities)
md += `## 3) Who advances? Group probabilities\n\n`;
md += `Probability of reaching the Round of 32 (top 2 per group + 8 best third-placed teams), `;
md += `from ${sim.meta.simulaciones.toLocaleString("en")} Monte Carlo runs. ✓ = group already decided.\n\n`;
for (const g of Object.keys(sim.grupos)) {
  const G = sim.grupos[g];
  md += `### Group ${g}${G.completo ? " ✓ (decided)" : ""}\n\n`;
  md += `| Pos | Team | P | Pts | GD | Advance | 1st | 2nd |\n|---|---|---|---|---|---|---|---|\n`;
  G.equipos.forEach((t, i) => {
    md += `| ${i + 1} | ${t.name} | ${t.pj} | ${t.pts} | ${t.gd >= 0 ? "+" : ""}${t.gd} | ${G.completo && i < 2 ? "✓ 100%" : pct(t.advance)} | ${pct(t.p1)} | ${pct(t.p2)} |\n`;
  });
  md += `\n`;
}

// 4) Finalist probabilities
md += `## 4) Finalist probabilities (Monte Carlo)\n\n`;
md += `From ${sim.meta.simulaciones.toLocaleString("en")} simulations of the whole tournament (official bracket, live Elo).\n\n`;
md += `**Most likely final: ${sim.prediccion_finalistas}** `;
md += `(occurs in ${pct(sim.final_mas_probable[0].prob)} of simulations).\n\n`;
md += `| Team | Reaches final | Champion |\n|---|---|---|\n`;
for (const r of sim.finalistas.slice(0, 10)) md += `| ${r.name} | ${pct(r.final)} | ${pct(r.champ)} |\n`;
md += `\n**Most likely finals:**\n\n`;
for (const p of sim.final_mas_probable) md += `- ${p.final} — ${pct(p.prob)}\n`;
md += `\n> Finalist probabilities are low and tightly bunched: the model has NO strong favorite, `;
md += `and the exact bracket pairings after the Round of 32 are the least certain part. Treat as indicative.\n`;

writeFileSync(join(ROOT, "predicciones", "PREDICCIONES.md"), md);
console.log("→ predicciones/PREDICCIONES.md");

// ─── README summary block (between markers) ───────────────────────────
let resumen = `<!-- PRED:START -->\n`;
resumen += `_Last auto-update: **${date}**. Backtest: the model gets the 1X2 right in `;
resumen += `**${(bt.acc * 100).toFixed(1)}%** of ${bt.n} matches played (random ≈ 33%)._\n\n`;
resumen += `**🏆 Projected champion (most-likely bracket): ${proj.champion}.** `;
resumen += `Projected final: **${proj.final.home} ${proj.final.score} ${proj.final.away}**.\n\n`;
resumen += `**Most likely finalists (Monte Carlo):** ${sim.prediccion_finalistas} `;
resumen += `(${pct(sim.final_mas_probable[0].prob)} of simulations).\n\n`;
resumen += `| Team | Reaches final | Champion |\n|---|---|---|\n`;
for (const r of sim.finalistas.slice(0, 6)) resumen += `| ${r.name} | ${pct(r.final)} | ${pct(r.champ)} |\n`;
resumen += `\nFull detail (every group, every upcoming match, the match-by-match bracket) in `;
resumen += `[**predicciones/PREDICCIONES.md**](predicciones/PREDICCIONES.md).\n`;
resumen += `<!-- PRED:END -->`;

const readmePath = join(ROOT, "README.md");
if (existsSync(readmePath)) {
  let r = readFileSync(readmePath, "utf8");
  if (r.includes("<!-- PRED:START -->")) {
    r = r.replace(/<!-- PRED:START -->[\s\S]*<!-- PRED:END -->/, resumen);
    writeFileSync(readmePath, r);
    console.log("→ README.md (predictions block updated)");
  } else console.log("README.md has no PRED markers; left untouched.");
}
