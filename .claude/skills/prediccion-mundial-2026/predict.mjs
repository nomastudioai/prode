#!/usr/bin/env node
/**
 * Predicción de partidos del Mundial 2026 (CLI).
 * Modelo: rating Elo (eloratings.net, vía El Atlas) + forma reciente → Poisson.
 * Toda la lógica vive en model.mjs (compartida con backtest.mjs).
 *
 * Uso:
 *   node predict.mjs "España" "Argentina" --neutral
 *   node predict.mjs USA "México" --host A
 *   node predict.mjs Japon Croacia --formA W,W,D,L,W --formB L,D,W,L,L --neutral
 *   node predict.mjs ESP ARG --eloA 2155 --eloB 2114
 *   node predict.mjs --list
 */
import { loadData, findTeam, predictMatch, resultForm, autoForm, PARAMS } from "./model.mjs";

const DATA = loadData();
const args = process.argv.slice(2);
const flags = {};
const pos = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a.startsWith("--")) {
    const next = args[i + 1];
    if (next && !next.startsWith("--")) { flags[a.slice(2)] = next; i++; }
    else flags[a.slice(2)] = true;
  } else pos.push(a);
}

if (flags.list) {
  console.log(`Equipos del Mundial 2026 (${DATA.meta.equipos_con_indice}/${DATA.meta.total_equipos} con Elo):\n`);
  for (const t of [...DATA.equipos].sort((a, b) => (b.elo_2026 || 0) - (a.elo_2026 || 0))) {
    const src = t.elo_source ? " *" : "";
    console.log(`  ${t.iso3.padEnd(4)} ${t.name.padEnd(22)} ${t.confed.padEnd(9)} Elo ${String(t.elo_2026).padStart(4)} (rank ${t.rank_2026})${src}`);
  }
  console.log("\n  * Elo de eloratings.net en vivo (no está en el extracto del Atlas).");
  process.exit(0);
}

if (pos.length < 2) {
  console.error('Uso: node predict.mjs "<equipo A>" "<equipo B>" [--neutral|--host A|B|--home A|B] [--formA W,D,L] [--formB ...] [--eloA n] [--eloB n]');
  console.error('     node predict.mjs --list');
  process.exit(1);
}

const tA = findTeam(DATA, pos[0]);
const tB = findTeam(DATA, pos[1]);
if (!tA) { console.error(`No encontré "${pos[0]}". Probá --list.`); process.exit(1); }
if (!tB) { console.error(`No encontré "${pos[1]}". Probá --list.`); process.exit(1); }

// Localía / anfitrión
let homeAdvA = 0, homeAdvB = 0, venueNote = "cancha neutral";
const side = flags.host || flags.home;
if (!flags.neutral && (side === "A" || side === "B")) {
  if (side === "A") { homeAdvA = PARAMS.HOME_ADV; venueNote = `${tA.name} ${flags.host ? "(anfitrión)" : "de local"}`; }
  else { homeAdvB = PARAMS.HOME_ADV; venueNote = `${tB.name} ${flags.host ? "(anfitrión)" : "de local"}`; }
}

// Predicción "actual" → Elo en vivo de eloratings (si está); override manual gana.
const opts = {
  homeAdvA, homeAdvB,
  formA: flags.formA != null ? resultForm(flags.formA) : null,
  formB: flags.formB != null ? resultForm(flags.formB) : null,
  eloA: flags.eloA != null ? Number(flags.eloA) : (tA.elo_live ?? undefined),
  eloB: flags.eloB != null ? Number(flags.eloB) : (tB.elo_live ?? undefined),
};
const r = predictMatch(tA, tB, opts);
if (!r) { console.error("Falta el Elo de algún equipo. Pasá --eloA/--eloB."); process.exit(1); }

const formSrcA = flags.formA != null ? `resultados ${flags.formA}` : "momentum del índice";
const formSrcB = flags.formB != null ? `resultados ${flags.formB}` : "momentum del índice";
const pct = (x) => (x * 100).toFixed(1) + "%";
const bar = (x) => "█".repeat(Math.round(x * 30));

console.log(`\n  ${tA.name}  vs  ${tB.name}`);
console.log(`  Sede: ${venueNote}\n`);
console.log(`  Índice Elo:   ${tA.name} ${r.eloA}  ·  ${tB.name} ${r.eloB}  (Δ ${r.eloA - r.eloB >= 0 ? "+" : ""}${r.eloA - r.eloB})`);
console.log(`  Forma:        ${tA.name} ${r.formA >= 0 ? "+" : ""}${r.formA.toFixed(0)} (${formSrcA})  ·  ${tB.name} ${r.formB >= 0 ? "+" : ""}${r.formB.toFixed(0)} (${formSrcB})`);
console.log(`  Elo efectivo: ${tA.name} ${r.effA.toFixed(0)}  ·  ${tB.name} ${r.effB.toFixed(0)}\n`);
console.log(`  Resultado (1X2):`);
console.log(`    Gana ${tA.name.padEnd(20)} ${pct(r.pWin).padStart(6)}  ${bar(r.pWin)}`);
console.log(`    Empate${"".padEnd(20)} ${pct(r.pDraw).padStart(6)}  ${bar(r.pDraw)}`);
console.log(`    Gana ${tB.name.padEnd(20)} ${pct(r.pLose).padStart(6)}  ${bar(r.pLose)}\n`);
console.log(`  Goles esperados:  ${tA.name} ${r.lamA.toFixed(2)}  -  ${r.lamB.toFixed(2)} ${tB.name}`);
console.log(`  Marcadores más probables:`);
for (const s of r.scores.slice(0, 5)) console.log(`    ${s.a}-${s.b}   ${pct(s.p)}`);
if ((tA.elo_source || tB.elo_source)) console.log(`\n  * Algún Elo viene de eloratings.net en vivo (fuera del extracto del Atlas).`);
console.log(`\n  Modelo: Elo + forma → Poisson. Heurística orientativa, no garantía.\n`);
