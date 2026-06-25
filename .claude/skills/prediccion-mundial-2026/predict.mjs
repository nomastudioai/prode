#!/usr/bin/env node
/**
 * Predicción de partidos del Mundial 2026
 * Modelo: rating Elo (eloratings.net, vía El Atlas) + ajuste por forma reciente.
 *
 * Uso:
 *   node predict.mjs "España" "Argentina"
 *   node predict.mjs ESP ARG --home A            # A juega de local (ventaja de localía)
 *   node predict.mjs USA Mexico --host A          # A es anfitrión (USA/CAN/MEX)
 *   node predict.mjs Brasil Francia --neutral     # sin localía (default en fase de grupos)
 *   node predict.mjs Japon Croacia --formA W,W,D,L,W --formB L,D,W,L,L
 *   node predict.mjs ESP ARG --eloA 2155 --eloB 2114   # override manual de Elo
 *   node predict.mjs --list                       # lista equipos disponibles
 *
 * El modelo es una heurística transparente y ajustable (ver PARAMS). NO es un
 * pronóstico garantizado: el índice es un valor anual y la forma es un ajuste acotado.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const DATA = JSON.parse(readFileSync(join(__dir, "data", "elo-mundial-2026.json"), "utf8"));

// ─── Parámetros del modelo (ajustables) ───────────────────────────────
const PARAMS = {
  HOME_ADV: 70,        // puntos Elo de ventaja para el local / anfitrión
  GOAL_SCALE: 0.0040,  // goles esperados de diferencia por punto Elo (~0.4 gol / 100 pts)
  BASE_TOTAL: 2.65,    // goles totales esperados promedio en un partido internacional
  MIN_LAMBDA: 0.15,    // piso de goles esperados por equipo
  // Forma reciente:
  FORM_AUTO_WEIGHT: 0.5, // peso del "momentum" del índice (delta Elo 2024→2026)
  FORM_AUTO_CAP: 40,     // tope (± puntos Elo) del ajuste automático por momentum
  FORM_RESULT_PTS: 12,   // puntos Elo por victoria reciente (empate = 0, derrota = -12)
  FORM_RESULT_CAP: 60,   // tope (± puntos Elo) del ajuste por resultados recientes
  MAX_GOALS: 9,          // tamaño de la grilla de Poisson (0..MAX_GOALS)
};

// ─── Utilidades ───────────────────────────────────────────────────────
const norm = (s) =>
  s.toString().toLowerCase().trim()
   .normalize("NFD").replace(/[̀-ͯ]/g, "");

function findTeam(q) {
  const n = norm(q);
  let t = DATA.equipos.find((e) => norm(e.iso3) === n);
  if (t) return t;
  t = DATA.equipos.find((e) => norm(e.name) === n || (e.en && norm(e.en) === n));
  if (t) return t;
  t = DATA.equipos.find((e) => norm(e.name).includes(n) || (e.en && norm(e.en).includes(n)));
  return t || null;
}

function poisson(k, lambda) {
  let f = 1;
  for (let i = 2; i <= k; i++) f *= i;
  return (Math.exp(-lambda) * Math.pow(lambda, k)) / f;
}

// Ajuste de forma automático: momentum del índice (cuánto subió/bajó el Elo).
function autoForm(team) {
  const e = team.elo_recent || {};
  const recent = e["2026"] ?? e["2025"];
  const past = e["2024"] ?? e["2023"];
  if (recent == null || past == null) return 0;
  const mom = (recent - past) * PARAMS.FORM_AUTO_WEIGHT;
  return Math.max(-PARAMS.FORM_AUTO_CAP, Math.min(PARAMS.FORM_AUTO_CAP, mom));
}

// Ajuste de forma por resultados recientes pasados como "W,D,L,..." (más recientes primero).
function resultForm(seq) {
  if (!seq) return null;
  const games = seq.split(/[,\s]+/).filter(Boolean);
  let adj = 0, w = 1.0;
  for (const g of games) {
    const r = g[0].toUpperCase();
    const pts = r === "W" ? 1 : r === "L" ? -1 : 0;
    adj += pts * PARAMS.FORM_RESULT_PTS * w;
    w *= 0.85; // los más recientes pesan más
  }
  return Math.max(-PARAMS.FORM_RESULT_CAP, Math.min(PARAMS.FORM_RESULT_CAP, adj));
}

// ─── Parseo de argumentos ─────────────────────────────────────────────
const args = process.argv.slice(2);
const flags = {};
const pos = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a.startsWith("--")) {
    const key = a.slice(2);
    const next = args[i + 1];
    if (next && !next.startsWith("--")) { flags[key] = next; i++; }
    else flags[key] = true;
  } else pos.push(a);
}

if (flags.list) {
  console.log(`Equipos del Mundial 2026 (${DATA.meta.equipos_con_indice}/${DATA.meta.total_equipos} con índice Elo):\n`);
  for (const t of DATA.equipos) {
    const elo = t.in_index ? `Elo ${t.elo_2026} (rank ${t.rank_2026})` : "SIN ÍNDICE — pasá --eloX manual";
    console.log(`  ${t.iso3.padEnd(4)} ${t.name.padEnd(22)} ${t.confed.padEnd(9)} ${elo}`);
  }
  process.exit(0);
}

if (pos.length < 2) {
  console.error('Uso: node predict.mjs "<equipo A>" "<equipo B>" [--home A|B|none] [--host A|B] [--neutral] [--formA W,D,L] [--formB ...] [--eloA n] [--eloB n]');
  console.error('     node predict.mjs --list');
  process.exit(1);
}

const tA = findTeam(pos[0]);
const tB = findTeam(pos[1]);
if (!tA) { console.error(`No encontré el equipo "${pos[0]}". Probá --list.`); process.exit(1); }
if (!tB) { console.error(`No encontré el equipo "${pos[1]}". Probá --list.`); process.exit(1); }

// Elo base (con override manual; obligatorio para equipos sin índice)
let eloA = flags.eloA != null ? Number(flags.eloA) : tA.elo_2026;
let eloB = flags.eloB != null ? Number(flags.eloB) : tB.elo_2026;
const warns = [];
if (eloA == null) { console.error(`"${tA.name}" no tiene Elo en el índice. Pasá --eloA <valor>.`); process.exit(1); }
if (eloB == null) { console.error(`"${tB.name}" no tiene Elo en el índice. Pasá --eloB <valor>.`); process.exit(1); }
if (!tA.in_index && flags.eloA != null) warns.push(`${tA.name}: Elo manual (no está en el índice del Atlas).`);
if (!tB.in_index && flags.eloB != null) warns.push(`${tB.name}: Elo manual (no está en el índice del Atlas).`);

// Forma reciente
const formA = flags.formA != null ? resultForm(flags.formA) : autoForm(tA);
const formB = flags.formB != null ? resultForm(flags.formB) : autoForm(tB);
const formSrcA = flags.formA != null ? `resultados ${flags.formA}` : "momentum del índice";
const formSrcB = flags.formB != null ? `resultados ${flags.formB}` : "momentum del índice";

// Localía / anfitrión
let homeAdvA = 0, homeAdvB = 0, venueNote = "cancha neutral";
const host = flags.host;            // A o B es anfitrión
const home = flags.home;            // A o B juega de local
if (!flags.neutral) {
  if (host === "A" || home === "A") { homeAdvA = PARAMS.HOME_ADV; venueNote = `${tA.name} ${host==="A"?"(anfitrión)":"de local"}`; }
  else if (host === "B" || home === "B") { homeAdvB = PARAMS.HOME_ADV; venueNote = `${tB.name} ${host==="B"?"(anfitrión)":"de local"}`; }
}

// ─── Cálculo ──────────────────────────────────────────────────────────
const effA = eloA + formA + homeAdvA;
const effB = eloB + formB + homeAdvB;
const dr = effA - effB;
const expGD = dr * PARAMS.GOAL_SCALE;
let lamA = Math.max(PARAMS.MIN_LAMBDA, (PARAMS.BASE_TOTAL + expGD) / 2);
let lamB = Math.max(PARAMS.MIN_LAMBDA, (PARAMS.BASE_TOTAL - expGD) / 2);

const N = PARAMS.MAX_GOALS;
let pWin = 0, pDraw = 0, pLose = 0;
const scores = [];
for (let a = 0; a <= N; a++) {
  for (let b = 0; b <= N; b++) {
    const p = poisson(a, lamA) * poisson(b, lamB);
    scores.push({ a, b, p });
    if (a > b) pWin += p; else if (a === b) pDraw += p; else pLose += p;
  }
}
const tot = pWin + pDraw + pLose;
pWin /= tot; pDraw /= tot; pLose /= tot;
scores.sort((x, y) => y.p - x.p);

// Probabilidad implícita de Elo (sin goles) para contraste
const We = 1 / (1 + Math.pow(10, -dr / 400));

// ─── Salida ───────────────────────────────────────────────────────────
const pct = (x) => (x * 100).toFixed(1) + "%";
const bar = (x) => "█".repeat(Math.round(x * 30));

console.log(`\n  ${tA.name}  vs  ${tB.name}`);
console.log(`  Sede: ${venueNote}\n`);
console.log(`  Índice Elo:   ${tA.name} ${eloA}  ·  ${tB.name} ${eloB}  (Δ ${eloA - eloB >= 0 ? "+" : ""}${eloA - eloB})`);
console.log(`  Forma:        ${tA.name} ${formA >= 0 ? "+" : ""}${formA.toFixed(0)} (${formSrcA})  ·  ${tB.name} ${formB >= 0 ? "+" : ""}${formB.toFixed(0)} (${formSrcB})`);
console.log(`  Elo efectivo: ${tA.name} ${effA.toFixed(0)}  ·  ${tB.name} ${effB.toFixed(0)}\n`);
console.log(`  Resultado (1X2):`);
console.log(`    Gana ${tA.name.padEnd(20)} ${pct(pWin).padStart(6)}  ${bar(pWin)}`);
console.log(`    Empate${"".padEnd(20)} ${pct(pDraw).padStart(6)}  ${bar(pDraw)}`);
console.log(`    Gana ${tB.name.padEnd(20)} ${pct(pLose).padStart(6)}  ${bar(pLose)}\n`);
console.log(`  Goles esperados:  ${tA.name} ${lamA.toFixed(2)}  -  ${lamB.toFixed(2)} ${tB.name}`);
console.log(`  Marcadores más probables:`);
for (const s of scores.slice(0, 5)) {
  console.log(`    ${s.a}-${s.b}   ${pct(s.p / tot)}`);
}
if (warns.length) console.log("\n  ⚠ " + warns.join("\n  ⚠ "));
console.log(`\n  Modelo: Elo + forma → Poisson. Heurística orientativa, no garantía.\n`);
