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
  console.log(`2026 World Cup teams (${DATA.meta.equipos_con_indice}/${DATA.meta.total_equipos} with Elo):\n`);
  for (const t of [...DATA.equipos].sort((a, b) => (b.elo_2026 || 0) - (a.elo_2026 || 0))) {
    const src = t.elo_source ? " *" : "";
    const nm = t.en_name ?? t.name;
    console.log(`  ${t.iso3.padEnd(4)} ${nm.padEnd(22)} ${t.confed.padEnd(9)} Elo ${String(t.elo_2026).padStart(4)} (rank ${t.rank_2026})${src}`);
  }
  console.log("\n  * Live Elo from eloratings.net (not in the Atlas extract).");
  process.exit(0);
}

if (pos.length < 2) {
  console.error('Usage: node predict.mjs "<team A>" "<team B>" [--neutral|--host A|B|--home A|B] [--formA W,D,L] [--formB ...] [--eloA n] [--eloB n]');
  console.error('       node predict.mjs --list');
  process.exit(1);
}

const tA = findTeam(DATA, pos[0]);
const tB = findTeam(DATA, pos[1]);
if (!tA) { console.error(`Could not find "${pos[0]}". Try --list.`); process.exit(1); }
if (!tB) { console.error(`Could not find "${pos[1]}". Try --list.`); process.exit(1); }
const nmA = tA.en_name ?? tA.name, nmB = tB.en_name ?? tB.name;

// Home / host advantage
let homeAdvA = 0, homeAdvB = 0, venueNote = "neutral venue";
const side = flags.host || flags.home;
if (!flags.neutral && (side === "A" || side === "B")) {
  if (side === "A") { homeAdvA = PARAMS.HOME_ADV; venueNote = `${nmA} ${flags.host ? "(host)" : "at home"}`; }
  else { homeAdvB = PARAMS.HOME_ADV; venueNote = `${nmB} ${flags.host ? "(host)" : "at home"}`; }
}

// "Current" prediction → live eloratings Elo (if any); manual override wins.
const opts = {
  homeAdvA, homeAdvB,
  formA: flags.formA != null ? resultForm(flags.formA) : null,
  formB: flags.formB != null ? resultForm(flags.formB) : null,
  eloA: flags.eloA != null ? Number(flags.eloA) : (tA.elo_live ?? undefined),
  eloB: flags.eloB != null ? Number(flags.eloB) : (tB.elo_live ?? undefined),
};
const r = predictMatch(tA, tB, opts);
if (!r) { console.error("Missing Elo for a team. Pass --eloA/--eloB."); process.exit(1); }

const formSrcA = flags.formA != null ? `results ${flags.formA}` : "index momentum";
const formSrcB = flags.formB != null ? `results ${flags.formB}` : "index momentum";
const pct = (x) => (x * 100).toFixed(1) + "%";
const bar = (x) => "█".repeat(Math.round(x * 30));

console.log(`\n  ${nmA}  vs  ${nmB}`);
console.log(`  Venue: ${venueNote}\n`);
console.log(`  Elo index:    ${nmA} ${r.eloA}  ·  ${nmB} ${r.eloB}  (Δ ${r.eloA - r.eloB >= 0 ? "+" : ""}${r.eloA - r.eloB})`);
console.log(`  Form:         ${nmA} ${r.formA >= 0 ? "+" : ""}${r.formA.toFixed(0)} (${formSrcA})  ·  ${nmB} ${r.formB >= 0 ? "+" : ""}${r.formB.toFixed(0)} (${formSrcB})`);
console.log(`  Effective Elo: ${nmA} ${r.effA.toFixed(0)}  ·  ${nmB} ${r.effB.toFixed(0)}\n`);
console.log(`  Result (1X2):`);
console.log(`    ${nmA} win`.padEnd(27) + ` ${pct(r.pWin).padStart(6)}  ${bar(r.pWin)}`);
console.log(`    Draw`.padEnd(27) + ` ${pct(r.pDraw).padStart(6)}  ${bar(r.pDraw)}`);
console.log(`    ${nmB} win`.padEnd(27) + ` ${pct(r.pLose).padStart(6)}  ${bar(r.pLose)}\n`);
console.log(`  Expected goals:  ${nmA} ${r.lamA.toFixed(2)}  -  ${r.lamB.toFixed(2)} ${nmB}`);
console.log(`  Most likely scorelines:`);
for (const s of r.scores.slice(0, 5)) console.log(`    ${s.a}-${s.b}   ${pct(s.p)}`);
if ((tA.elo_source || tB.elo_source)) console.log(`\n  * Some Elo comes from live eloratings.net (outside the Atlas extract).`);
console.log(`\n  Model: Elo + form → Poisson. Indicative heuristic, not a guarantee.\n`);
