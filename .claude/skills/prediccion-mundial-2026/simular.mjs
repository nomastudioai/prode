#!/usr/bin/env node
/**
 * Simulación Monte Carlo del Mundial 2026.
 * Combina los resultados REALES ya jugados con simulaciones de los partidos
 * restantes (modelo Elo+Poisson, Elo EN VIVO de eloratings) para estimar:
 *   - probabilidad de cada selección de avanzar y su posición en el grupo,
 *   - clasificación proyectada de cada grupo,
 *   - probabilidad de llegar a la final y finalistas más probables.
 *
 *   node simular.mjs [N]        # N = nº de simulaciones (default 50000)
 *   node simular.mjs --json     # vuelca resultados a predicciones/simulacion.json
 *
 * Usa elo_live (eloratings.net) para los partidos futuros. Heurística orientativa.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { loadData, predictFromEff, autoForm, PARAMS } from "./model.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, "..", "..", "..");
const elo = loadData();
const fix = JSON.parse(readFileSync(join(__dir, "data", "grupos-resultados-2026.json"), "utf8"));
const bracket = JSON.parse(readFileSync(join(__dir, "data", "knockout-2026.json"), "utf8"));
const byIso = Object.fromEntries(elo.equipos.map((t) => [t.iso3, t]));
const HOSTS = new Set(["MEX", "CAN", "USA"]);
const ha = (iso) => (HOSTS.has(iso) ? PARAMS.HOME_ADV : 0);
const eloOf = (iso) => byIso[iso].elo_live ?? byIso[iso].elo_2026; // en vivo para el futuro
const name = (iso) => byIso[iso].en_name ?? byIso[iso].name;

const N = (() => { const a = process.argv.find((x) => /^\d+$/.test(x)); return a ? +a : 50000; })();

// ─── Distribución de marcadores de un partido (cacheada) ──────────────
const distCache = new Map();
function scoreDist(homeIso, awayIso) {
  const key = homeIso + "|" + awayIso;
  if (distCache.has(key)) return distCache.get(key);
  const effA = eloOf(homeIso) + ha(homeIso);
  const effB = eloOf(awayIso) + ha(awayIso);
  const r = predictFromEff(effA, effB);
  // CDF acumulada para muestreo
  let acc = 0;
  const cdf = r.scores.map((s) => { acc += s.p; return { a: s.a, b: s.b, c: acc }; });
  const out = { cdf, total: acc };
  distCache.set(key, out);
  return out;
}
function sampleScore(homeIso, awayIso, rnd) {
  const { cdf, total } = scoreDist(homeIso, awayIso);
  const x = rnd() * total;
  for (const s of cdf) if (x <= s.c) return [s.a, s.b];
  return [cdf[cdf.length - 1].a, cdf[cdf.length - 1].b];
}
// Ganador de un mano a mano (con desempate por penales ~ leve ventaja Elo)
function knockoutWinner(iso1, iso2, rnd) {
  const [g1, g2] = sampleScore(iso1, iso2, rnd);
  if (g1 > g2) return iso1;
  if (g2 > g1) return iso2;
  const pe = 1 / (1 + Math.pow(10, -((eloOf(iso1)) - (eloOf(iso2))) / 400)); // prob iso1 en penales
  return rnd() < pe ? iso1 : iso2;
}

// PRNG determinista (mulberry32) para reproducibilidad sin Math.random global.
function makeRng(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Estructura de grupos: jugados + pendientes ───────────────────────
const playedKey = new Map();
for (const m of fix.played_matches) playedKey.set([m.home, m.away].sort().join("|"), m);
const groupFixtures = {}; // grupo -> [{home,away,played?}]
for (const [g, teams] of Object.entries(fix.groups)) {
  groupFixtures[g] = [];
  for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) {
    const p = playedKey.get([teams[i].iso3, teams[j].iso3].sort().join("|"));
    if (p) groupFixtures[g].push({ home: p.home, away: p.away, hg: p.home_goals, ag: p.away_goals, played: true });
    else {
      const hostFirst = teams[j].host && !teams[i].host;
      const h = hostFirst ? teams[j] : teams[i], a = hostFirst ? teams[i] : teams[j];
      groupFixtures[g].push({ home: h.iso3, away: a.iso3, played: false });
    }
  }
}

// ─── Una simulación del torneo completo ───────────────────────────────
const GROUPS = Object.keys(fix.groups);
function simulate(rnd) {
  // 1) tablas de grupo
  const tables = {}; // grupo -> [{iso,pts,gd,gf}]
  for (const g of GROUPS) {
    const st = {};
    for (const t of fix.groups[g]) st[t.iso3] = { iso: t.iso3, pts: 0, gd: 0, gf: 0 };
    for (const m of groupFixtures[g]) {
      const [hg, ag] = m.played ? [m.hg, m.ag] : sampleScore(m.home, m.away, rnd);
      st[m.home].gf += hg; st[m.away].gf += ag; st[m.home].gd += hg - ag; st[m.away].gd += ag - hg;
      if (hg > ag) st[m.home].pts += 3; else if (ag > hg) st[m.away].pts += 3; else { st[m.home].pts++; st[m.away].pts++; }
    }
    const arr = Object.values(st).sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || (rnd() - 0.5));
    tables[g] = arr;
  }
  // 2) mejores terceros (8 de 12)
  const thirds = GROUPS.map((g) => ({ g, ...tables[g][2] }))
    .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || (rnd() - 0.5));
  const qualifyingThirds = thirds.slice(0, 8).map((t) => t.g);
  const bestThirdGroups = new Set(qualifyingThirds);

  // 2b) asignar cada slot de "tercero" a un grupo clasificado (bijección por sets elegibles).
  // Aproxima la tabla combinatoria oficial: ningún grupo se repite y no hay revancha de grupo.
  const slots = bracket.meta.third_slots;             // p.ej. "3ABCDF"
  const eligible = slots.map((s) => s.slice(1).split("").filter((g) => bestThirdGroups.has(g)));
  const thirdAssign = {}; // token -> grupo
  (function match(i, used) {
    if (i === slots.length) return true;
    // ordenar por menos opciones primero ayuda a la convergencia
    const opts = eligible[i].filter((g) => !used.has(g));
    for (const g of opts) {
      thirdAssign[slots[i]] = g; used.add(g);
      if (match(i + 1, used)) return true;
      used.delete(g); delete thirdAssign[slots[i]];
    }
    return false;
  })(0, new Set());

  // 3) llaves: resolver slots
  const slot = (def) => {
    if (def.startsWith("W")) return tables[def[1]][0].iso;        // W<G> = ganador grupo
    if (def.startsWith("R")) return tables[def[1]][1].iso;        // R<G> = segundo (runner-up)
    if (def.startsWith("3")) {                                    // 3<grupos> = tercero asignado
      const g = thirdAssign[def];
      return g ? tables[g][2].iso : null;
    }
    return null;
  };

  // 4) avanzar por rondas usando bracket.rounds (lista de [slotHome, slotAway] por match id)
  let alive = {}; // matchId -> iso ganador
  const winnerOf = (token, rnd) => {
    // token: "Mnn" (ganador de match nn) o definición de slot
    if (/^M\d+$/.test(token)) return alive[token];
    return slot(token);
  };
  let finalists = null;
  for (const round of bracket.rounds) {
    for (const m of round) {
      const a = winnerOf(m.home, rnd), b = winnerOf(m.away, rnd);
      if (a == null || b == null) { alive[m.id] = a || b; continue; }
      alive[m.id] = knockoutWinner(a, b, rnd);
      if (m.id === bracket.final_id) finalists = [a, b];
    }
  }
  return { tables, thirds, bestThirdGroups, finalists, champion: alive[bracket.final_id] };
}

// ─── Agregación ───────────────────────────────────────────────────────
const adv = {}; // iso -> {p1,p2,p3,advance,third_qualify, final, champ}
for (const t of elo.equipos) adv[t.iso3] = { p1: 0, p2: 0, p3: 0, p4: 0, advance: 0, final: 0, champ: 0 };
const finalPairCount = {};

for (let s = 0; s < N; s++) {
  const rnd = makeRng(s + 1);
  const sim = simulate(rnd);
  for (const g of GROUPS) {
    const tb = sim.tables[g];
    adv[tb[0].iso].p1++; adv[tb[1].iso].p2++; adv[tb[2].iso].p3++; adv[tb[3].iso].p4++;
    adv[tb[0].iso].advance++; adv[tb[1].iso].advance++;
    if (sim.bestThirdGroups.has(g)) adv[tb[2].iso].advance++;
  }
  if (sim.finalists) {
    for (const iso of sim.finalists) adv[iso].final++;
    const key = sim.finalists.map(name).sort().join(" vs ");
    finalPairCount[key] = (finalPairCount[key] || 0) + 1;
  }
  if (sim.champion) adv[sim.champion].champ++;
}

const pct = (x) => (100 * x / N);
const rows = elo.equipos.map((t) => ({
  iso: t.iso3, name: t.en_name ?? t.name, confed: t.confed,
  advance: pct(adv[t.iso3].advance), p1: pct(adv[t.iso3].p1), p2: pct(adv[t.iso3].p2),
  p3: pct(adv[t.iso3].p3), final: pct(adv[t.iso3].final), champ: pct(adv[t.iso3].champ),
})).filter((r) => r.advance > 0 || r.final > 0);

// ─── Salida consola ───────────────────────────────────────────────────
const fp = (x) => x.toFixed(1).padStart(5) + "%";
console.log(`\n══════ Monte Carlo simulation · ${N.toLocaleString("en")} runs ══════`);
console.log(`Elo: live from eloratings.net · real results through ${fix.meta.generado}\n`);

console.log("PROBABILITY OF REACHING THE ROUND OF 32 (top teams):");
console.log("  team                   advance  1st    2nd");
for (const r of [...rows].sort((a, b) => b.advance - a.advance).slice(0, 24))
  console.log(`  ${r.name.padEnd(22)} ${fp(r.advance)} ${fp(r.p1)} ${fp(r.p2)}`);

console.log("\nMOST LIKELY FINALISTS (prob. of reaching the final):");
for (const r of [...rows].sort((a, b) => b.final - a.final).slice(0, 12))
  console.log(`  ${r.name.padEnd(22)} ${fp(r.final)}   (champion ${fp(r.champ)})`);

console.log("\nMOST LIKELY FINAL (pair of finalists):");
const pairs = Object.entries(finalPairCount).sort((a, b) => b[1] - a[1]).slice(0, 6);
for (const [k, c] of pairs) console.log(`  ${k.padEnd(34)} ${fp(pct(c))}`);

const topPair = pairs[0][0]; // most likely finalist pair (mode of the joint distribution)
console.log(`\n→ PREDICTED FINALISTS: ${topPair}  (${fp(pct(pairs[0][1]))} of simulations)`);
console.log(`   (without the result of the final match)\n`);

if (process.argv.includes("--json")) {
  mkdirSync(join(ROOT, "predicciones"), { recursive: true });
  // Tabla actual de cada grupo (solo partidos jugados) + probs de avance.
  const gruposDetalle = {};
  for (const [g, teams] of Object.entries(fix.groups)) {
    const st = {};
    for (const t of teams) st[t.iso3] = { iso: t.iso3, name: byIso[t.iso3].en_name ?? t.name, pts: 0, gd: 0, gf: 0, pj: 0 };
    for (const m of fix.played_matches.filter((x) => x.group === g)) {
      st[m.home].pj++; st[m.away].pj++;
      st[m.home].gf += m.home_goals; st[m.away].gf += m.away_goals;
      st[m.home].gd += m.home_goals - m.away_goals; st[m.away].gd += m.away_goals - m.home_goals;
      if (m.home_goals > m.away_goals) st[m.home].pts += 3;
      else if (m.away_goals > m.home_goals) st[m.away].pts += 3;
      else { st[m.home].pts++; st[m.away].pts++; }
    }
    const teamsOut = teams.map((t) => ({
      name: byIso[t.iso3].en_name ?? t.name, ...st[t.iso3],
      advance: pct(adv[t.iso3].advance), p1: pct(adv[t.iso3].p1), p2: pct(adv[t.iso3].p2), p3: pct(adv[t.iso3].p3),
    })).sort((a, b) => b.advance - a.advance || b.pts - a.pts || b.gd - a.gd);
    gruposDetalle[g] = { completo: fix.meta.grupos_completos.includes(g), equipos: teamsOut };
  }
  const out = {
    meta: { simulaciones: N, generado: fix.meta.generado, elo: "eloratings.net en vivo",
      modelo: "Elo + Poisson (Dixon-Coles)", acierto_1x2_backtest: 0.614 },
    grupos: gruposDetalle, avance: rows.sort((a, b) => b.advance - a.advance),
    finalistas: [...rows].sort((a, b) => b.final - a.final).slice(0, 12),
    final_mas_probable: pairs.map(([k, c]) => ({ final: k, prob: pct(c) })),
    prediccion_finalistas: topPair,
  };
  writeFileSync(join(ROOT, "predicciones", "simulacion.json"), JSON.stringify(out, null, 2));
  console.log("→ escrito predicciones/simulacion.json");
}
