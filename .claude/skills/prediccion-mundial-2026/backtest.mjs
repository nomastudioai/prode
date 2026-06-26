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

w(`\n══════ BACKTEST · Mundial 2026 (predictor Elo+forma vs realidad) ══════`);
w(`Partidos jugados evaluados: ${n}\n`);
w(`  Acierto 1X2 (signo):        ${pc(acc)}   ${(acc * n).toFixed(0)}/${n}`);
w(`  Acierto marcador exacto:    ${pc(exact)}   ${(exact * n).toFixed(0)}/${n}`);
w(`  Brier score (↓ mejor):      ${meanBrier.toFixed(3)}      [0=perfecto, 0.667=azar]`);
w(`  Log-loss (↓ mejor):         ${logloss.toFixed(3)}`);
w(`  Error medio dif. goles:     ${meanGdErr.toFixed(2)} goles`);
w(`\n  Baselines de contraste:`);
w(`    "gana el de mayor Elo":   ${pc(baseFav)}  (acierto del favorito por índice)`);
w(`    tasa real de empates:     ${pc(drawRate)}`);
w(`    tasa real victoria local: ${pc(baseHome)}`);

w(`\n  Calibración (cuando el modelo dice X%, ¿cuántas acierta?):`);
w(`    rango      n   predicho   real`);
for (const c of calib())
  w(`    ${c.rango.padEnd(8)} ${String(c.n).padStart(2)}   ${pc(c.predicho)}   ${pc(c.real)}`);

// Peores fallos (resultado real con baja probabilidad asignada)
const worst = [...rows].sort((a, b) => a.pActual - b.pActual).slice(0, 8);
w(`\n  Mayores sorpresas (modelo le dio baja prob. al resultado real):`);
w(`    partido                              real  pred  modelo→real`);
for (const r of worst) {
  const label = `${r.home_name} ${r.home_goals}-${r.away_goals} ${r.away_name}`;
  w(`    ${label.padEnd(36)} ${r.act.padEnd(5)} ${r.pred.padEnd(5)} ${pc(r.pActual)}`);
}

// Tabla completa por grupo
w(`\n  Detalle por partido:`);
w(`    G  partido                               1X2    p(1/X/2)            pred  ok  marc.pred`);
for (const r of rows.sort((a, b) => a.group.localeCompare(b.group) || a.matchday - b.matchday)) {
  const label = `${r.home_name} ${r.home_goals}-${r.away_goals} ${r.away_name}`;
  const probs = `${(r.p1 * 100) | 0}/${(r.pX * 100) | 0}/${(r.p2 * 100) | 0}`;
  w(`    ${r.group}  ${label.padEnd(37)} ${r.act}    ${probs.padEnd(12)} ${r.pred}    ${r.hit ? "✓" : "·"}   ${r.predScore}`);
}
w(`\n  Modelo: Elo (Atlas, pre-torneo) + momentum, localía solo anfitriones. Orientativo.\n`);

// ─── Dry-run completo: los 72 partidos de fase de grupos ──────────────
// Enumera el round-robin de cada grupo; si el partido se jugó, adjunta resultado.
const playedKey = new Map();
for (const m of fix.played_matches) playedKey.set([m.home, m.away].sort().join("|"), m);

const fullRows = [];
for (const [g, teams] of Object.entries(fix.groups)) {
  for (let i = 0; i < teams.length; i++) for (let j = i + 1; j < teams.length; j++) {
    const t1 = teams[i], t2 = teams[j];
    const played = playedKey.get([t1.iso3, t2.iso3].sort().join("|"));
    let homeIso, awayIso, homeName, awayName, result = null;
    if (played) {
      homeIso = played.home; awayIso = played.away; homeName = played.home_name; awayName = played.away_name;
      result = `${played.home_goals}-${played.away_goals}`;
    } else { // no jugado: anfitrión de local, si no, orden del grupo
      const hostFirst = t2.host && !t1.host;
      const h = hostFirst ? t2 : t1, a = hostFirst ? t1 : t2;
      homeIso = h.iso3; awayIso = a.iso3; homeName = h.name; awayName = a.name;
    }
    const p = predict(homeIso, awayIso);
    fullRows.push({ group: g, homeName, awayName, result,
      p1: p.probs["1"], pX: p.probs["X"], p2: p.probs["2"], pred: p.pred, predScore: `${p.top.a}-${p.top.b}`,
      act: result ? outcome(played.home_goals, played.away_goals) : null,
      hit: result ? p.pred === outcome(played.home_goals, played.away_goals) : null });
  }
}
w(`\n  Dry-run completo (72 partidos de grupos; ● = ya jugado):`);
w(`    G  partido                               pred  p(1/X/2)        marc.pred  real`);
for (const r of fullRows) {
  const label = `${r.homeName} vs ${r.awayName}`;
  const probs = `${(r.p1 * 100) | 0}/${(r.pX * 100) | 0}/${(r.p2 * 100) | 0}`;
  const real = r.result ? `● ${r.result} (${r.hit ? "✓" : "·"})` : "—";
  w(`    ${r.group}  ${label.padEnd(37)} ${r.pred}    ${probs.padEnd(12)} ${r.predScore.padEnd(5)}   ${real}`);
}

// ─── Markdown opcional ────────────────────────────────────────────────
if (process.argv.includes("--md")) {
  let md = `# Backtest del predictor · Mundial 2026\n\n`;
  md += `Comparación del predictor (Elo del Atlas + forma) contra los **${n} partidos**`;
  md += ` de fase de grupos ya jugados al 25/06/2026.\n\n`;
  md += `## Métricas globales\n\n`;
  md += `| Métrica | Valor | Referencia |\n|---|---|---|\n`;
  md += `| Acierto 1X2 (signo) | **${(acc * 100).toFixed(1)}%** (${(acc * n).toFixed(0)}/${n}) | azar ≈ 33% |\n`;
  md += `| Acierto marcador exacto | ${(exact * 100).toFixed(1)}% (${(exact * n).toFixed(0)}/${n}) | difícil >12% |\n`;
  md += `| Brier score | ${meanBrier.toFixed(3)} | 0 perfecto, 0.667 azar |\n`;
  md += `| Log-loss | ${logloss.toFixed(3)} | menor es mejor |\n`;
  md += `| Error medio dif. de goles | ${meanGdErr.toFixed(2)} goles | |\n`;
  md += `| Baseline "gana mayor Elo" | ${(baseFav * 100).toFixed(1)}% | |\n`;
  md += `| Tasa real de empates | ${(drawRate * 100).toFixed(1)}% | |\n\n`;
  md += `> **Nota sobre el empate (modelo v2, Dixon-Coles):** la corrección Dixon-Coles deja la `;
  md += `probabilidad media de empate del modelo (~24,5%) casi igual a la tasa real (25%), y mejora `;
  md += `el marcador exacto y el log-loss. Pero **forzar la predicción de empates no mejora el acierto**: `;
  md += `los empates de esta muestra no se dieron en partidos parejos sino en favoritos que pincharon `;
  md += `(España 0-0 Cabo Verde, Inglaterra 0-0 Ghana, Suiza 1-1 Catar), que el Elo no anticipa. Por eso `;
  md += `el predictor sigue eligiendo al favorito y reporta la probabilidad de empate ya calibrada.\n\n`;
  md += `## Calibración\n\n| Prob. asignada | n | Predicho | Real |\n|---|---|---|---|\n`;
  for (const c of calib()) md += `| ${c.rango} | ${c.n} | ${(c.predicho * 100).toFixed(1)}% | ${(c.real * 100).toFixed(1)}% |\n`;
  md += `\n## Mayores sorpresas\n\n| Partido | Real | Pred | p(modelo→real) |\n|---|---|---|---|\n`;
  for (const r of worst) md += `| ${r.home_name} ${r.home_goals}-${r.away_goals} ${r.away_name} | ${r.act} | ${r.pred} | ${(r.pActual * 100).toFixed(1)}% |\n`;
  md += `\n## Detalle por partido\n\n| G | Partido | Real | p(1/X/2) | Pred | OK | Marcador pred. |\n|---|---|---|---|---|---|---|\n`;
  for (const r of rows) {
    md += `| ${r.group} | ${r.home_name} ${r.home_goals}-${r.away_goals} ${r.away_name} | ${r.act} | ${(r.p1 * 100) | 0}/${(r.pX * 100) | 0}/${(r.p2 * 100) | 0} | ${r.pred} | ${r.hit ? "✓" : "·"} | ${r.predScore} |\n`;
  }
  md += `\n## Dry-run completo: los 72 partidos de fase de grupos\n\n`;
  md += `● = ya jugado (con resultado real y si el modelo acertó el signo).\n\n`;
  md += `| G | Partido | Pred | p(1/X/2) | Marcador pred. | Real |\n|---|---|---|---|---|---|\n`;
  for (const r of fullRows) {
    const real = r.result ? `● ${r.result} (${r.hit ? "✓" : "·"})` : "—";
    md += `| ${r.group} | ${r.homeName} vs ${r.awayName} | ${r.pred} | ${(r.p1 * 100) | 0}/${(r.pX * 100) | 0}/${(r.p2 * 100) | 0} | ${r.predScore} | ${real} |\n`;
  }
  writeFileSync(join(__dir, "analisis-backtest.md"), md);
  console.log("→ escrito analisis-backtest.md");
}
