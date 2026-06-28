#!/usr/bin/env node
/**
 * Backtest del predictor contra los resultados REALES ya jugados del Mundial 2026.
 *
 *   node backtest.mjs            # reporte completo en consola
 *   node backtest.mjs --md       # además escribe analisis-backtest.md
 *
 * Predice cada partido jugado con el mismo modelo que predict.mjs (model.mjs),
 * usando el Elo PRE-torneo (snapshot del Atlas) y forma = momentum del índice.
 * Localía: solo para selecciones anfitrionas (MEX/CAN/USA) que juegan en su país.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { loadData, predictMatch, pick1x2, PARAMS } from "./model.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const elo = loadData();
const fix = JSON.parse(readFileSync(join(__dir, "data", "grupos-resultados-2026.json"), "utf8"));
const byIso = Object.fromEntries(elo.equipos.map((t) => [t.iso3, t]));
const HOSTS = new Set(["MEX", "CAN", "USA"]);
const en = (iso) => byIso[iso].en_name ?? byIso[iso].name;

const outcome = (hg, ag) => (hg > ag ? "1" : hg === ag ? "X" : "2");

// ─── Predicción de un partido (home, away) ────────────────────────────
function predict(homeIso, awayIso) {
  const A = byIso[homeIso], B = byIso[awayIso];
  const opts = { homeAdvA: HOSTS.has(homeIso) ? PARAMS.HOME_ADV : 0,
                 homeAdvB: HOSTS.has(awayIso) ? PARAMS.HOME_ADV : 0 };
  const r = predictMatch(A, B, opts);
  // outcome más probable entre 1/X/2
  const probs = { "1": r.pWin, "X": r.pDraw, "2": r.pLose };
  const pred = pick1x2(probs);
  return { ...r, probs, pred, top: r.scores[0] };
}

// ─── Backtest sobre partidos jugados ──────────────────────────────────
const rows = [];
for (const m of fix.played_matches) {
  const p = predict(m.home, m.away);
  const act = outcome(m.home_goals, m.away_goals);
  const pActual = p.probs[act];                 // prob que el modelo le dio al resultado real
  const brier = ["1", "X", "2"].reduce((s, k) => s + (p.probs[k] - (k === act ? 1 : 0)) ** 2, 0);
  const predGD = p.lamA - p.lamB;               // dif. de goles esperada
  const actGD = m.home_goals - m.away_goals;
  rows.push({
    ...m, pred: p.pred, act, hit: p.pred === act, pActual, brier,
    p1: p.probs["1"], pX: p.probs["X"], p2: p.probs["2"],
    predScore: `${p.top.a}-${p.top.b}`, exact: p.top.a === m.home_goals && p.top.b === m.away_goals,
    predGD, actGD, gdErr: Math.abs(predGD - actGD),
  });
}

// ─── Métricas ─────────────────────────────────────────────────────────
const n = rows.length;
const acc = rows.filter((r) => r.hit).length / n;
const exact = rows.filter((r) => r.exact).length / n;
const meanBrier = rows.reduce((s, r) => s + r.brier, 0) / n;
const logloss = -rows.reduce((s, r) => s + Math.log(Math.max(r.pActual, 1e-9)), 0) / n;
const meanGdErr = rows.reduce((s, r) => s + r.gdErr, 0) / n;

// Baselines de contraste
const baseFav = rows.filter((r) => {            // "gana el de mayor Elo" (sin empate)
  const favHome = byIso[r.home].elo_2026 >= byIso[r.away].elo_2026;
  return (favHome && r.act === "1") || (!favHome && r.act === "2");
}).length / n;
const baseHome = rows.filter((r) => r.act === "1").length / n; // "siempre gana el local"
const drawRate = rows.filter((r) => r.act === "X").length / n;

// Calibración por bucket de probabilidad del favorito
function calib() {
  const buckets = [[0.33, 0.45], [0.45, 0.55], [0.55, 0.65], [0.65, 0.80], [0.80, 1.01]];
  return buckets.map(([lo, hi]) => {
    const sel = rows.filter((r) => { const m = Math.max(r.p1, r.pX, r.p2); return m >= lo && m < hi; });
    if (!sel.length) return null;
    const predMean = sel.reduce((s, r) => s + Math.max(r.p1, r.pX, r.p2), 0) / sel.length;
    const realMean = sel.filter((r) => r.hit).length / sel.length;
    return { rango: `${(lo * 100) | 0}-${(hi * 100) | 0}%`, n: sel.length, predicho: predMean, real: realMean };
  }).filter(Boolean);
}

// ─── Salida ───────────────────────────────────────────────────────────
const pc = (x) => (x * 100).toFixed(1).padStart(5) + "%";
let out = "";
const w = (s = "") => { out += s + "\n"; console.log(s); };

w(`\n══════ BACKTEST · 2026 World Cup (Elo+form predictor vs reality) ══════`);
w(`Played matches evaluated: ${n}\n`);
w(`  1X2 accuracy (sign):        ${pc(acc)}   ${(acc * n).toFixed(0)}/${n}`);
w(`  Exact-score accuracy:       ${pc(exact)}   ${(exact * n).toFixed(0)}/${n}`);
w(`  Brier score (↓ better):     ${meanBrier.toFixed(3)}      [0=perfect, 0.667=random]`);
w(`  Log-loss (↓ better):        ${logloss.toFixed(3)}`);
w(`  Mean goal-diff error:       ${meanGdErr.toFixed(2)} goals`);
w(`\n  Baselines:`);
w(`    "higher-Elo team wins":   ${pc(baseFav)}  (favorite by index)`);
w(`    real draw rate:           ${pc(drawRate)}`);
w(`    real home-win rate:       ${pc(baseHome)}`);

w(`\n  Calibration (when the model says X%, how often is it right?):`);
w(`    range      n   predicted  real`);
for (const c of calib())
  w(`    ${c.rango.padEnd(8)} ${String(c.n).padStart(2)}   ${pc(c.predicho)}   ${pc(c.real)}`);

// Biggest misses (real result given low probability by the model)
const worst = [...rows].sort((a, b) => a.pActual - b.pActual).slice(0, 8);
w(`\n  Biggest surprises (model gave the real result low prob.):`);
w(`    match                                real  pred  model→real`);
for (const r of worst) {
  const label = `${en(r.home)} ${r.home_goals}-${r.away_goals} ${en(r.away)}`;
  w(`    ${label.padEnd(36)} ${r.act.padEnd(5)} ${r.pred.padEnd(5)} ${pc(r.pActual)}`);
}

// Full per-match table
w(`\n  Per-match detail:`);
w(`    G  match                                 1X2    p(1/X/2)            pred  ok  pred.score`);
for (const r of rows.sort((a, b) => a.group.localeCompare(b.group) || a.matchday - b.matchday)) {
  const label = `${en(r.home)} ${r.home_goals}-${r.away_goals} ${en(r.away)}`;
  const probs = `${(r.p1 * 100) | 0}/${(r.pX * 100) | 0}/${(r.p2 * 100) | 0}`;
  w(`    ${r.group}  ${label.padEnd(37)} ${r.act}    ${probs.padEnd(12)} ${r.pred}    ${r.hit ? "✓" : "·"}   ${r.predScore}`);
}
w(`\n  Model: Elo (Atlas, pre-tournament) + momentum, host advantage only. Indicative.\n`);

// ─── Dry-run completo: los 72 partidos de fase de grupos ──────────────
// Enumera el round-robin de cada grupo; si el partido se jugó, adjunta resultado.
const playedKey = new Map();
for (const m of fix.played_matches) playedKey.set([m.home, m.away].sort().join("|"), m);

const fullRows = [];
for (const [g, teams] of Object.entries(fix.groups)) {
  for (let i = 0; i < teams.length; i++) for (let j = i + 1; j < teams.length; j++) {
    const t1 = teams[i], t2 = teams[j];
    const played = playedKey.get([t1.iso3, t2.iso3].sort().join("|"));
    let homeIso, awayIso, result = null;
    if (played) {
      homeIso = played.home; awayIso = played.away;
      result = `${played.home_goals}-${played.away_goals}`;
    } else { // not played: host at home, otherwise group order
      const hostFirst = t2.host && !t1.host;
      const h = hostFirst ? t2 : t1, a = hostFirst ? t1 : t2;
      homeIso = h.iso3; awayIso = a.iso3;
    }
    const p = predict(homeIso, awayIso);
    fullRows.push({ group: g, homeName: en(homeIso), awayName: en(awayIso), result,
      p1: p.probs["1"], pX: p.probs["X"], p2: p.probs["2"], pred: p.pred, predScore: `${p.top.a}-${p.top.b}`,
      act: result ? outcome(played.home_goals, played.away_goals) : null,
      hit: result ? p.pred === outcome(played.home_goals, played.away_goals) : null });
  }
}
w(`\n  Full dry-run (72 group matches; ● = already played):`);
w(`    G  match                                 pred  p(1/X/2)        pred.score real`);
for (const r of fullRows) {
  const label = `${r.homeName} vs ${r.awayName}`;
  const probs = `${(r.p1 * 100) | 0}/${(r.pX * 100) | 0}/${(r.p2 * 100) | 0}`;
  const real = r.result ? `● ${r.result} (${r.hit ? "✓" : "·"})` : "—";
  w(`    ${r.group}  ${label.padEnd(37)} ${r.pred}    ${probs.padEnd(12)} ${r.predScore.padEnd(5)}   ${real}`);
}

// ─── Métricas a JSON (para el generador de predicciones) ──────────────
writeFileSync(join(__dir, "data", "backtest-stats.json"), JSON.stringify({
  generado: fix.meta.generado, n, acc, exact, brier: meanBrier, logloss, meanGdErr, baseFav, drawRate,
}, null, 2));

// ─── Detalle por partido a JSON (para la tabla "predicción vs resultado") ─
writeFileSync(join(__dir, "data", "backtest-matches.json"), JSON.stringify(
  rows
    .slice()
    .sort((a, b) => a.group.localeCompare(b.group) || a.matchday - b.matchday)
    .map((r) => ({
      group: r.group, matchday: r.matchday, date: r.date,
      home: r.home, away: r.away, homeName: en(r.home), awayName: en(r.away),
      home_goals: r.home_goals, away_goals: r.away_goals,
      pred: r.pred, act: r.act, hit: r.hit, exact: r.exact, predScore: r.predScore,
      p1: r.p1, pX: r.pX, p2: r.p2,
    })),
  null, 2));

// ─── Markdown opcional ────────────────────────────────────────────────
if (process.argv.includes("--md")) {
  let md = `# Predictor backtest · 2026 World Cup\n\n`;
  md += `The predictor (Atlas Elo + form) compared against the **${n} group-stage matches**`;
  md += ` already played as of ${fix.meta.generado}.\n\n`;
  md += `## Overall metrics\n\n`;
  md += `| Metric | Value | Reference |\n|---|---|---|\n`;
  md += `| 1X2 accuracy (sign) | **${(acc * 100).toFixed(1)}%** (${(acc * n).toFixed(0)}/${n}) | random ≈ 33% |\n`;
  md += `| Exact-score accuracy | ${(exact * 100).toFixed(1)}% (${(exact * n).toFixed(0)}/${n}) | hard >12% |\n`;
  md += `| Brier score | ${meanBrier.toFixed(3)} | 0 perfect, 0.667 random |\n`;
  md += `| Log-loss | ${logloss.toFixed(3)} | lower is better |\n`;
  md += `| Mean goal-diff error | ${meanGdErr.toFixed(2)} goals | |\n`;
  md += `| Baseline "higher-Elo wins" | ${(baseFav * 100).toFixed(1)}% | |\n`;
  md += `| Real draw rate | ${(drawRate * 100).toFixed(1)}% | |\n\n`;
  md += `> **Note on draws (model v2, Dixon-Coles):** the Dixon-Coles correction leaves the model's `;
  md += `average draw probability (~24.5%) almost equal to the real rate (25%), and improves the `;
  md += `exact score and log-loss. But **forcing draw predictions does not improve accuracy**: `;
  md += `the draws in this sample didn't happen in even games but in favorites slipping up `;
  md += `(Spain 0-0 Cape Verde, England 0-0 Ghana, Switzerland 1-1 Qatar), which Elo can't anticipate. `;
  md += `So the predictor keeps picking the favorite and reports the already-calibrated draw probability.\n\n`;
  md += `## Calibration\n\n| Assigned prob. | n | Predicted | Real |\n|---|---|---|---|\n`;
  for (const c of calib()) md += `| ${c.rango} | ${c.n} | ${(c.predicho * 100).toFixed(1)}% | ${(c.real * 100).toFixed(1)}% |\n`;
  md += `\n## Biggest surprises\n\n| Match | Real | Pred | p(model→real) |\n|---|---|---|---|\n`;
  for (const r of worst) md += `| ${en(r.home)} ${r.home_goals}-${r.away_goals} ${en(r.away)} | ${r.act} | ${r.pred} | ${(r.pActual * 100).toFixed(1)}% |\n`;
  md += `\n## Per-match detail\n\n| G | Match | Real | p(1/X/2) | Pred | OK | Pred. score |\n|---|---|---|---|---|---|---|\n`;
  for (const r of rows) {
    md += `| ${r.group} | ${en(r.home)} ${r.home_goals}-${r.away_goals} ${en(r.away)} | ${r.act} | ${(r.p1 * 100) | 0}/${(r.pX * 100) | 0}/${(r.p2 * 100) | 0} | ${r.pred} | ${r.hit ? "✓" : "·"} | ${r.predScore} |\n`;
  }
  md += `\n## Full dry-run: all 72 group-stage matches\n\n`;
  md += `● = already played (with the real result and whether the model got the sign right).\n\n`;
  md += `| G | Match | Pred | p(1/X/2) | Pred. score | Real |\n|---|---|---|---|---|---|\n`;
  for (const r of fullRows) {
    const real = r.result ? `● ${r.result} (${r.hit ? "✓" : "·"})` : "—";
    md += `| ${r.group} | ${r.homeName} vs ${r.awayName} | ${r.pred} | ${(r.p1 * 100) | 0}/${(r.pX * 100) | 0}/${(r.p2 * 100) | 0} | ${r.predScore} | ${real} |\n`;
  }
  writeFileSync(join(__dir, "analisis-backtest.md"), md);
  console.log("→ wrote analisis-backtest.md");
}
