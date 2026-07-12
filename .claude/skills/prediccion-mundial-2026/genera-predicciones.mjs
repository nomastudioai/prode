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
import { proyectar, cargarEliminatorias } from "./proyeccion.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, "..", "..", "..");
const elo = loadData();
const byIso = Object.fromEntries(elo.equipos.map((t) => [t.iso3, t]));
const fix = JSON.parse(readFileSync(join(__dir, "data", "grupos-resultados-2026.json"), "utf8"));
const bt = JSON.parse(readFileSync(join(__dir, "data", "backtest-stats.json"), "utf8"));
const sim = JSON.parse(readFileSync(join(ROOT, "predicciones", "simulacion.json"), "utf8"));
const proj = proyectar();
const ko = cargarEliminatorias();
const HOSTS = new Set(["MEX", "CAN", "USA"]);
const eloOf = (iso) => byIso[iso].elo_live ?? byIso[iso].elo_2026;
const en = (iso) => byIso[iso].en_name ?? byIso[iso].name;

const pct = (x) => x.toFixed(1) + "%";
const date = [fix.meta.generado, ko.meta?.actualizado].filter(Boolean).sort().pop();
const upcomingById = Object.fromEntries(ko.upcoming.map((u) => [u.id, u]));
// Next unplayed knockout round (if any): the matches to predict now.
const nextTies = (() => {
  const t = proj.ties.find((x) => !x.real);
  return t ? proj.ties.filter((x) => x.round === t.round && !x.real) : [];
})();

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

// 1) Group stage: predictions vs results (when complete) — otherwise upcoming matches
const btMatchesPath = join(__dir, "data", "backtest-matches.json");
if (fix.remaining_fixtures.length === 0 && existsSync(btMatchesPath)) {
  const bm = JSON.parse(readFileSync(btMatchesPath, "utf8"));
  const hits = bm.filter((m) => m.hit).length;
  const exacts = bm.filter((m) => m.exact).length;
  md += `## 1) Group stage: our predictions vs the final results\n\n`;
  md += `The group stage is over: all **${bm.length} matches** have been played. Each one was predicted `;
  md += `**before kick-off** with the same Elo + Poisson model as the backtest (pre-tournament Elo, no leakage). `;
  md += `The **Hit** column marks where the model's 1X2 pick matched the real result.\n\n`;
  md += `**Scoreboard: we called ${hits} of ${bm.length} group-stage results right `;
  md += `(${((100 * hits) / bm.length).toFixed(1)}%)**, and nailed the exact scoreline ${exacts} times `;
  md += `(${((100 * exacts) / bm.length).toFixed(1)}%). ✓ = correct pick, ✗ = miss. `;
  md += `1 = home win, X = draw, 2 = away win.\n\n`;
  md += `| Date | Group | Match | Result | Our pick | Pred. score | Hit |\n|---|---|---|---|---|---|---|\n`;
  for (const m of bm) {
    const pick = m.pred === "1" ? m.homeName : m.pred === "2" ? m.awayName : "Draw";
    md += `| ${m.date} | ${m.group} | ${m.homeName} vs ${m.awayName} | **${m.home_goals}-${m.away_goals}** | ${pick} | ${m.predScore} | ${m.hit ? "✓" : "✗"} |\n`;
  }
  md += `\n`;
} else {
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
}

// 2) Next round to be played (predictions with full probabilities)
let sec = 2;
if (nextTies.length > 0) {
  md += `## ${sec}) Coming up: ${nextTies[0].round} (our predictions)\n\n`;
  md += `The bracket below is **real** up to the last round played; these are the next matches, `;
  md += `predicted with live Elo. 1 = first team wins, X = draw (in 90'), 2 = second team wins. `;
  md += `The pick is the model's winner of the tie (a 90' draw goes to extra time/penalties).\n\n`;
  md += `| Date | Match | Pick | Pred. score | p(1/X/2) |\n|---|---|---|---|---|\n`;
  for (const t of nextTies) {
    const r = predRow(t.isoHome, t.isoAway);
    const u = upcomingById[t.id];
    md += `| ${u?.date ?? "TBD"} | ${t.home} vs ${t.away} | **${t.winner}** | ${t.score} | ${(r.p1*100).toFixed(0)}/${(r.pX*100).toFixed(0)}/${(r.p2*100).toFixed(0)} |\n`;
  }
  md += `\n`;
  sec++;
}

// 3) Knockout bracket: real results + projected remainder (match by match)
md += `## ${sec}) Knockout bracket: results and projection (match by match)\n\n`;
sec++;
const groupsDone = fix.remaining_fixtures.length === 0;
const anyReal = proj.ties.some((t) => t.real);
md += `Single most-likely path: ${groupsDone ? "the **final** group standings" : "real group results + the most-likely score for the remaining group games"} `;
md += `${groupsDone ? "set the bracket" : "decide the standings"}; `;
md += anyReal
  ? `ties already played show the **real result** (marked ✓, with a.e.t./penalties where it applied); the rest are predicted with a decisive `
  : `then every knockout tie is predicted with a decisive `;
md += `score and a winner (in reality many ties go to extra time/penalties; "(tight)" marks the `;
md += `near coin-flips).\n\n`;
let curRound = "";
for (const t of proj.ties) {
  if (t.round !== curRound) { md += `\n### ${t.round}\n\n`; curRound = t.round; }
  if (t.real) {
    const extra = t.pens ? ` (a.e.t., ${t.pens} on penalties)` : t.aet ? ` (a.e.t.)` : "";
    md += `- ✓ **${t.home} ${t.score} ${t.away}**${extra} → advanced **${t.winner}** _(played)_\n`;
  } else {
    md += `- **${t.home} ${t.score} ${t.away}** → advances **${t.winner}**${t.tight ? " _(tight)_" : ""}\n`;
  }
}
md += `\n### 🏆 Projected champion: **${proj.champion}**\n\n`;
md += `Projected final: ${proj.final.home} ${proj.final.score} ${proj.final.away} (winner ${proj.final.winner}, without the actual result).\n\n`;

// Who advances (Monte Carlo probabilities)
md += `## ${sec}) Who advances? Group probabilities\n\n`;
sec++;
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

// Finalist probabilities
md += `## ${sec}) Finalist probabilities (Monte Carlo)\n\n`;
md += `From ${sim.meta.simulaciones.toLocaleString("en")} simulations of the whole tournament (official bracket, live Elo`;
md += anyReal ? `; knockout ties already played are fixed to their real result).\n\n` : `).\n\n`;
md += `**Most likely final: ${sim.prediccion_finalistas}** `;
md += `(occurs in ${pct(sim.final_mas_probable[0].prob)} of simulations).\n\n`;
md += `| Team | Reaches final | Champion |\n|---|---|---|\n`;
for (const r of sim.finalistas.filter((x) => x.final > 0).slice(0, 10)) md += `| ${r.name} | ${pct(r.final)} | ${pct(r.champ)} |\n`;
md += `\n**Most likely finals:**\n\n`;
for (const p of sim.final_mas_probable) md += `- ${p.final} — ${pct(p.prob)}\n`;
md += anyReal
  ? `\n> Probabilities are conditioned on the real bracket so far: only the teams still alive can reach the final. Treat as indicative.\n`
  : `\n> Finalist probabilities are low and tightly bunched: the model has NO strong favorite, ` +
    `and the exact bracket pairings after the Round of 32 are the least certain part. Treat as indicative.\n`;

writeFileSync(join(ROOT, "predicciones", "PREDICCIONES.md"), md);
console.log("→ predicciones/PREDICCIONES.md");

// ─── README summary block (between markers) ───────────────────────────
let resumen = `<!-- PRED:START -->\n`;
resumen += `_Last auto-update: **${date}**. Backtest: the model gets the 1X2 right in `;
resumen += `**${(bt.acc * 100).toFixed(1)}%** of ${bt.n} matches played (random ≈ 33%)._\n\n`;
resumen += `**🏆 Projected champion (most-likely bracket): ${proj.champion}.** `;
resumen += `Projected final: **${proj.final.home} ${proj.final.score} ${proj.final.away}**.\n\n`;
if (nextTies.length > 0) {
  resumen += `**Next up, ${nextTies[0].round}:** `;
  resumen += nextTies.map((t) => {
    const u = upcomingById[t.id];
    return `${t.home} vs ${t.away}${u ? ` (${u.date})` : ""}: pick **${t.winner}** ${t.score}`;
  }).join(" · ") + `.\n\n`;
}
resumen += `**Most likely finalists (Monte Carlo):** ${sim.prediccion_finalistas} `;
resumen += `(${pct(sim.final_mas_probable[0].prob)} of simulations).\n\n`;
resumen += `| Team | Reaches final | Champion |\n|---|---|---|\n`;
for (const r of sim.finalistas.filter((x) => x.final > 0).slice(0, 6)) resumen += `| ${r.name} | ${pct(r.final)} | ${pct(r.champ)} |\n`;
resumen += `\nFull detail (${groupsDone ? "our group-stage predictions vs the results" : "every group, every upcoming match"}, the match-by-match bracket) in `;
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
