#!/usr/bin/env node
/**
 * POST-MORTEM del predictor: mide el modelo contra los resultados REALES de todo
 * el torneo (fase de grupos + fase eliminatoria) y escribe:
 *   - el bloque <!-- POSTMORTEM --> del README.md (resumen + tablas)
 *   - predicciones/POSTMORTEM.md (detalle completo)
 *
 *   node postmortem.mjs
 *
 * Metodologia (identica al backtest de grupos, sin fuga de datos):
 *   cada partido se predice con el Elo PRE-torneo (elo_2026 del Atlas) + momentum
 *   del indice; localia solo para las anfitrionas (MEX/CAN/USA).
 *   - Grupos: metrica 1X2 (1 = gana local, X = empate, 2 = gana visitante).
 *   - Eliminatorias: no hay empate, la metrica es "acerto quien AVANZA" (el modelo
 *     elige al de mayor probabilidad de ganar; si el partido real fue a alargue o
 *     penales, igual avanza uno solo y esa es la referencia).
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { loadData, predictMatch, predictFromEff, pick1x2, PARAMS } from "./model.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, "..", "..", "..");
const elo = loadData();
const byIso = Object.fromEntries(elo.equipos.map((t) => [t.iso3, t]));
const HOSTS = new Set(["MEX", "CAN", "USA"]);
const en = (iso) => byIso[iso].en_name ?? byIso[iso].en ?? byIso[iso].name;

const ko = JSON.parse(readFileSync(join(__dir, "data", "knockout-resultados-2026.json"), "utf8"));
const btPath = join(__dir, "data", "backtest-matches.json");
const bt = existsSync(btPath) ? JSON.parse(readFileSync(btPath, "utf8")) : [];

// ─── Prediccion de un partido (mismo modelo que el backtest) ───────────
function predict(homeIso, awayIso) {
  const r = predictMatch(byIso[homeIso], byIso[awayIso], {
    homeAdvA: HOSTS.has(homeIso) ? PARAMS.HOME_ADV : 0,
    homeAdvB: HOSTS.has(awayIso) ? PARAMS.HOME_ADV : 0,
  });
  const probs = { "1": r.pWin, "X": r.pDraw, "2": r.pLose };
  // Ganador (eliminatoria): el de mayor probabilidad de ganar.
  const homeWins = r.pWin >= r.pLose;
  const winner = homeWins ? homeIso : awayIso;
  // Marcador decisivo mas probable (no empate) para el ganador previsto.
  const dec = r.scores.find((s) => (homeWins ? s.a > s.b : s.b > s.a)) || r.scores[0];
  return { probs, pick1x2: pick1x2(probs), winner, decScore: `${dec.a}-${dec.b}`,
           topScore: `${r.scores[0].a}-${r.scores[0].b}`, ...r };
}

// Formato del resultado real de una llave.
function realLabel(m) {
  let s = `${m.home_goals}-${m.away_goals}`;
  if (m.decision === "aet") s += " (a.e.t.)";
  else if (m.decision === "pens") s += ` (pens ${m.pens.home}-${m.pens.away})`;
  return s;
}

// ─── 1) Fase de grupos (desde backtest-matches.json) ───────────────────
const gHits = bt.filter((m) => m.hit).length;
const gExact = bt.filter((m) => m.exact).length;
const gN = bt.length;
// Resumen por grupo.
const groups = {};
for (const m of bt) {
  (groups[m.group] ??= { n: 0, hits: 0, exact: 0 });
  groups[m.group].n++; if (m.hit) groups[m.group].hits++; if (m.exact) groups[m.group].exact++;
}

// ─── 2) Fase eliminatoria (prediccion vs realidad, llave por llave) ────
const koRows = ko.played.map((m) => {
  const p = predict(m.home, m.away);
  return {
    ...m,
    predWinner: p.winner, predScore: p.decScore,
    p1: p.probs["1"], pX: p.probs["X"], p2: p.probs["2"],
    hit: p.winner === m.advancer,
    exact: p.topScore === `${m.home_goals}-${m.away_goals}` && m.decision === "reg",
    real: realLabel(m),
  };
});
const kByRound = {};
for (const r of koRows) {
  (kByRound[r.round] ??= { n: 0, hits: 0 });
  kByRound[r.round].n++; if (r.hit) kByRound[r.round].hits++;
}
const kHits = koRows.filter((r) => r.hit).length;
const kN = koRows.length;

// ─── 3) Partidos pendientes: prediccion FORWARD (Elo EN VIVO + Monte Carlo) ─
// Mismo metodo que proyeccion.mjs / simular.mjs: Elo en vivo (eloratings) + localia
// de anfitrion, SIN el momentum del backtest; el ganador incluye alargue/penales
// por Monte Carlo (empate resuelto con una logistica sobre la diferencia de Elo).
const MC_N = 50000;
const eloLive = (iso) => byIso[iso].elo_live ?? byIso[iso].elo_2026;
const haOf = (iso) => (HOSTS.has(iso) ? PARAMS.HOME_ADV : 0);
// PRNG determinista (mulberry32), igual que simular.mjs (sin Math.random global).
function makeRng(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
function predictForward(homeIso, awayIso) {
  const r = predictFromEff(eloLive(homeIso) + haOf(homeIso), eloLive(awayIso) + haOf(awayIso));
  const homeWins90 = r.pWin >= r.pLose;
  const dec = r.scores.find((s) => (homeWins90 ? s.a > s.b : s.b > s.a)) || r.scores[0];
  // Monte Carlo: muestreo de marcador; si hay empate, penales ~ logistica de Elo.
  let acc = 0;
  const cdf = r.scores.map((s) => { acc += s.p; return { a: s.a, b: s.b, c: acc }; });
  const pe = 1 / (1 + Math.pow(10, -(eloLive(homeIso) - eloLive(awayIso)) / 400)); // p(local gana penales)
  const rng = makeRng(20260719);
  let winH = 0;
  for (let i = 0; i < MC_N; i++) {
    const x = rng() * acc;
    let a = cdf[cdf.length - 1].a, b = cdf[cdf.length - 1].b;
    for (const s of cdf) { if (x <= s.c) { a = s.a; b = s.b; break; } }
    if (a > b) winH++;
    else if (a === b) { if (rng() < pe) winH++; }
  }
  return { probs: { "1": r.pWin, "X": r.pDraw, "2": r.pLose }, decScore: `${dec.a}-${dec.b}`,
           winner: homeWins90 ? homeIso : awayIso, mcHome: winH / MC_N };
}
const pendRows = (ko.pending || []).map((m) => {
  const p = predictForward(m.home, m.away);
  const mcWinnerIso = p.mcHome >= 0.5 ? m.home : m.away;
  const mcWinnerProb = p.mcHome >= 0.5 ? p.mcHome : 1 - p.mcHome;
  return { ...m, predWinner: p.winner, predScore: p.decScore,
           p1: p.probs["1"], pX: p.probs["X"], p2: p.probs["2"],
           favProb: p.winner === m.home ? p.probs["1"] : p.probs["2"],
           mcWinnerIso, mcWinnerProb };
});

// ─── 4) Totales ────────────────────────────────────────────────────────
const totHits = gHits + kHits, totN = gN + kN;
const pc = (x) => (x * 100).toFixed(1) + "%";
const ROUND_ES = {
  "Round of 32": "Round of 32", "Round of 16": "Round of 16",
  "Quarter-finals": "Quarter-finals", "Semi-finals": "Semi-finals",
};

// ─── 5) Bloque del README (resumen + tablas) ───────────────────────────
let b = `<!-- POSTMORTEM:START -->\n`;
b += `_Post-mortem generated on **${ko.meta.generado}**. Every match was predicted with the same `;
b += `model (Elo pre-tournament + momentum, host advantage only). The group figure is the backtest; `;
b += `the knockout figure applies the identical model to each real tie._\n\n`;

b += `### 🎯 Headline\n\n`;
b += `| Stage | Matches | We got right | Accuracy | Reference |\n|---|---|---|---|---|\n`;
b += `| Group stage (1X2) | ${gN} | ${gHits} | **${pc(gHits / gN)}** | random ≈ 33% · "higher Elo wins" ≈ 61% |\n`;
b += `| Knockouts (who advances) | ${kN} | ${kHits} | **${pc(kHits / kN)}** | coin-flip = 50% |\n`;
b += `| **Whole tournament so far** | **${totN}** | **${totHits}** | **${pc(totHits / totN)}** | |\n\n`;
b += `> The two metrics are **not** the same thing. In the group stage a match has three outcomes `;
b += `(win / draw / loss), so 33% is the random baseline. In the knockouts there are no draws: someone `;
b += `always advances, so the honest baseline is a 50/50 coin-flip. The knockout number is measured as `;
b += `"did we call the team that advanced", running the same Elo model on each **real** tie.\n\n`;

b += `**The model called the final right.** Its most-likely projected final was **Spain vs Argentina**, `;
b += `and that is exactly the real final (19/07). It also had both eventual finalists as the two most `;
b += `likely champions in the Monte Carlo (Spain 32.3%, Argentina 30.9%).\n\n`;

// Group summary by group
b += `### 🟦 Group stage: accuracy by group (${gHits}/${gN} = ${pc(gHits / gN)})\n\n`;
b += `1X2 pick before kick-off vs the real result. Full match-by-match table (72 games) in `;
b += `[predicciones/PREDICCIONES.md](predicciones/PREDICCIONES.md).\n\n`;
b += `| Group | Right | Matches | Exact score |\n|---|---|---|---|\n`;
for (const g of Object.keys(groups).sort()) {
  const G = groups[g];
  b += `| ${g} | ${G.hits} | ${G.n} | ${G.exact} |\n`;
}
b += `| **Total** | **${gHits}** | **${gN}** | **${gExact}** |\n\n`;

// Knockout summary by round
b += `### 🟥 Knockouts: accuracy by round (${kHits}/${kN} = ${pc(kHits / kN)})\n\n`;
b += `| Round | Right | Matches |\n|---|---|---|\n`;
for (const r of ["Round of 32", "Round of 16", "Quarter-finals", "Semi-finals"]) {
  if (kByRound[r]) b += `| ${r} | ${kByRound[r].hits} | ${kByRound[r].n} |\n`;
}
b += `| **Total** | **${kHits}** | **${kN}** |\n\n`;

// Knockout full table: prediction vs reality
b += `### 🔁 Knockouts: our prediction vs the real result (match by match)\n\n`;
b += `Our pick = the team the model made favourite. Pred. score = the model's most-likely decisive `;
b += `scoreline. ✓ = we called who advanced, ✗ = miss. \`(a.e.t.)\` extra time, \`(pens)\` penalties.\n\n`;
b += `| Round | Match | Real result | Advanced | Our pick | Pred. score | Hit |\n|---|---|---|---|---|---|---|\n`;
for (const r of koRows) {
  b += `| ${r.round} | ${en(r.home)} vs ${en(r.away)} | **${r.real}** | ${en(r.advancer)} | ${en(r.predWinner)} | ${r.predScore} | ${r.hit ? "✓" : "✗"} |\n`;
}
b += `\n`;

// Misses narrative
const misses = koRows.filter((r) => !r.hit);
if (misses.length) {
  b += `**Where the model missed in the knockouts (${misses.length}):** `;
  b += misses.map((r) => `${en(r.predWinner)} was favoured but ${en(r.advancer)} advanced (${en(r.home)} vs ${en(r.away)})`).join("; ") + ".\n\n";
}

// Pending matches: model prediction
if (pendRows.length) {
  b += `### ⏳ Still to play: the model's prediction\n\n`;
  b += `These two matches had **not been played** when this post-mortem was generated `;
  b += `(third place ${ko.pending[0].date}, final ${ko.pending[1].date}). No real result yet, `;
  b += `here is only the model's forecast, to be checked afterwards. Forecast made the **forward** `;
  b += `way (live eloratings.net Elo, same as the projected bracket), with a **${MC_N.toLocaleString("en")}-run `;
  b += `Monte Carlo** resolving draws by penalties: "1/X/2" is the 90-minute result, "Wins the tie" `;
  b += `includes extra time and shoot-outs.\n\n`;
  b += `| Match | Round | Date | Favourite | Pred. score | p(1/X/2) at 90' | Wins the tie (MC) |\n`;
  b += `|---|---|---|---|---|---|---|\n`;
  for (const r of pendRows) {
    b += `| ${en(r.home)} vs ${en(r.away)} | ${r.round} | ${r.date} | **${en(r.predWinner)}** | ${r.predScore} | ${(r.p1 * 100) | 0}/${(r.pX * 100) | 0}/${(r.p2 * 100) | 0} | ${en(r.mcWinnerIso)} ${pc(r.mcWinnerProb)} |\n`;
  }
  b += `\n`;
}

// Takeaways
b += `### 🧠 What the post-mortem says about the model\n\n`;
b += `1. **Consistent, not clairvoyant.** ~${pc(gHits / gN)} in groups and ${pc(kHits / kN)} in knockouts is `;
b += `roughly "the higher-Elo team wins": solid, but it lives or dies with the favourites. It cannot see `;
b += `an upset coming (Paraguay over Germany, Morocco over the Netherlands, Norway over Brazil), which is exactly `;
b += `where a pure-Elo index hits its ceiling.\n`;
b += `2. **Penalties are a coin-flip the model doesn't model.** Several ties it "lost" were 90-minute draws `;
b += `decided from the spot, and the Elo index has nothing to say about a shootout.\n`;
b += `3. **It nailed the big picture.** The projected bracket's final (Spain vs Argentina) is the real final, `;
b += `and the two finalists were the model's top-2 title favourites. The signal is strongest exactly where `;
b += `there is the most data (elite teams, large Elo gaps) and weakest in the close, one-off games.\n`;
b += `<!-- POSTMORTEM:END -->`;

// ─── 6) Insertar en README.md ──────────────────────────────────────────
const readmePath = join(ROOT, "README.md");
let r = readFileSync(readmePath, "utf8");
if (r.includes("<!-- POSTMORTEM:START -->")) {
  r = r.replace(/<!-- POSTMORTEM:START -->[\s\S]*<!-- POSTMORTEM:END -->/, b);
} else {
  // Insertar despues del bloque de predicciones (o al final si no existe).
  const marker = "<!-- PRED:END -->";
  const section = `\n\n---\n\n## 📉 Post-mortem: how well did we do?\n\n${b}\n`;
  if (r.includes(marker)) r = r.replace(marker, marker + section);
  else r += section;
}
writeFileSync(readmePath, r);
console.log("→ README.md (post-mortem block)");

// ─── 7) Detalle completo a predicciones/POSTMORTEM.md ──────────────────
let md = `# Post-mortem · 2026 FIFA World Cup predictor\n\n`;
md += `> Generated on ${ko.meta.generado}. How the Elo model did against the **real** results, `;
md += `stage by stage. Same methodology as the backtest (pre-tournament Elo + momentum, no leakage).\n\n`;
md += `## Scoreboard\n\n`;
md += `| Stage | Matches | Right | Accuracy |\n|---|---|---|---|\n`;
md += `| Group stage (1X2) | ${gN} | ${gHits} | ${pc(gHits / gN)} |\n`;
md += `| Knockouts (who advances) | ${kN} | ${kHits} | ${pc(kHits / kN)} |\n`;
md += `| Whole tournament so far | ${totN} | ${totHits} | ${pc(totHits / totN)} |\n\n`;
md += `Group-stage exact scorelines: ${gExact}/${gN} (${pc(gExact / gN)}).\n\n`;
md += `## Knockouts: prediction vs reality\n\n`;
md += `| Round | Match | Real result | Advanced | Our pick | Pred. score | p(1/X/2) | Hit |\n`;
md += `|---|---|---|---|---|---|---|---|\n`;
for (const r of koRows) {
  md += `| ${r.round} | ${en(r.home)} vs ${en(r.away)} | ${r.real} | ${en(r.advancer)} | ${en(r.predWinner)} | ${r.predScore} | ${(r.p1 * 100) | 0}/${(r.pX * 100) | 0}/${(r.p2 * 100) | 0} | ${r.hit ? "✓" : "✗"} |\n`;
}
md += `\n## Group stage: accuracy by group\n\n`;
md += `| Group | Right | Matches | Exact score |\n|---|---|---|---|\n`;
for (const g of Object.keys(groups).sort()) md += `| ${g} | ${groups[g].hits} | ${groups[g].n} | ${groups[g].exact} |\n`;
md += `| Total | ${gHits} | ${gN} | ${gExact} |\n\n`;
if (pendRows.length) {
  md += `## Still to play (forward forecast: live Elo + Monte Carlo, no real result yet)\n\n`;
  md += `Live eloratings.net Elo (same method as the projected bracket) + a ${MC_N.toLocaleString("en")}-run `;
  md += `Monte Carlo resolving draws by penalties. "1/X/2" = 90-minute result; "Wins the tie" = incl. extra time / shoot-out.\n\n`;
  md += `| Match | Round | Date | Favourite | Pred. score | p(1/X/2) at 90' | Wins the tie (MC) |\n`;
  md += `|---|---|---|---|---|---|---|\n`;
  for (const r of pendRows) md += `| ${en(r.home)} vs ${en(r.away)} | ${r.round} | ${r.date} | ${en(r.predWinner)} | ${r.predScore} | ${(r.p1 * 100) | 0}/${(r.pX * 100) | 0}/${(r.p2 * 100) | 0} | ${en(r.mcWinnerIso)} ${pc(r.mcWinnerProb)} |\n`;
  md += `\n`;
}
writeFileSync(join(ROOT, "predicciones", "POSTMORTEM.md"), md);
console.log("→ predicciones/POSTMORTEM.md");

// ─── Consola ───────────────────────────────────────────────────────────
console.log(`\nGroups:    ${gHits}/${gN} (${pc(gHits / gN)})`);
console.log(`Knockouts: ${kHits}/${kN} (${pc(kHits / kN)})`);
console.log(`Total:     ${totHits}/${totN} (${pc(totHits / totN)})`);
for (const r of koRows.filter((x) => !x.hit)) console.log(`  miss: ${en(r.home)} vs ${en(r.away)} → real ${en(r.advancer)}, pick ${en(r.predWinner)}`);
