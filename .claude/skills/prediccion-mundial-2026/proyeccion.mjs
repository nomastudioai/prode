/**
 * Deterministic tournament projection (single most-likely path).
 * Uses real group results + the most-likely predicted scoreline for unplayed
 * matches to project the group tables, then walks the official bracket
 * predicting every knockout tie (scoreline + who advances) up to the final.
 *
 * This is the "predicted bracket" (one concrete path). For probabilities
 * (who is LIKELY to reach the final), see simular.mjs (Monte Carlo).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { loadData, predictFromEff, PARAMS } from "./model.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));

export function proyectar() {
  const elo = loadData();
  const fix = JSON.parse(readFileSync(join(__dir, "data", "grupos-resultados-2026.json"), "utf8"));
  const bracket = JSON.parse(readFileSync(join(__dir, "data", "knockout-2026.json"), "utf8"));
  const ko = JSON.parse(readFileSync(join(__dir, "data", "knockout-resultados-2026.json"), "utf8"));
  const koReal = Object.fromEntries(ko.matches.map((m) => [m.id, m]));
  const byIso = Object.fromEntries(elo.equipos.map((t) => [t.iso3, t]));
  const HOSTS = new Set(["MEX", "CAN", "USA"]);
  const ha = (iso) => (HOSTS.has(iso) ? PARAMS.HOME_ADV : 0);
  const eloOf = (iso) => byIso[iso].elo_live ?? byIso[iso].elo_2026;
  const name = (iso) => byIso[iso].en_name ?? byIso[iso].name;

  // Grupos: marcador más probable (puede ser empate, resultado válido de grupo).
  function predGroup(homeIso, awayIso) {
    const r = predictFromEff(eloOf(homeIso) + ha(homeIso), eloOf(awayIso) + ha(awayIso));
    const top = r.scores[0];
    return { a: top.a, b: top.b };
  }
  // Eliminatorias: gana el de mayor probabilidad, con su marcador DECISIVO más
  // probable (no puede haber empate; en la realidad muchos van a penales).
  function predKO(homeIso, awayIso) {
    const r = predictFromEff(eloOf(homeIso) + ha(homeIso), eloOf(awayIso) + ha(awayIso));
    const winner = r.pWin >= r.pLose ? homeIso : awayIso;
    const homeWins = winner === homeIso;
    const dec = r.scores.find((s) => (homeWins ? s.a > s.b : s.b > s.a)) || r.scores[0];
    const tight = Math.abs(r.pWin - r.pLose) < 0.06; // casi un volado
    return { a: dec.a, b: dec.b, winner, tight, pWin: r.pWin, pDraw: r.pDraw, pLose: r.pLose };
  }

  // 1) Group tables: played results + projected scorelines for the rest.
  const playedKey = new Map();
  for (const m of fix.played_matches) playedKey.set([m.home, m.away].sort().join("|"), m);
  const tables = {};
  const projectedGroupMatches = [];
  for (const [g, teams] of Object.entries(fix.groups)) {
    const st = {};
    for (const t of teams) st[t.iso3] = { iso: t.iso3, name: t.name, pts: 0, gd: 0, gf: 0 };
    for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) {
      const t1 = teams[i].iso3, t2 = teams[j].iso3;
      const p = playedKey.get([t1, t2].sort().join("|"));
      let h, a, hg, ag, real;
      if (p) { h = p.home; a = p.away; hg = p.home_goals; ag = p.away_goals; real = true; }
      else {
        const hostFirst = teams[j].host && !teams[i].host;
        h = hostFirst ? t2 : t1; a = hostFirst ? t1 : t2;
        const r = predGroup(h, a); hg = r.a; ag = r.b; real = false;
        projectedGroupMatches.push({ group: g, home: name(h), away: name(a), score: `${hg}-${ag}` });
      }
      st[h].gf += hg; st[a].gf += ag; st[h].gd += hg - ag; st[a].gd += ag - hg;
      if (hg > ag) st[h].pts += 3; else if (ag > hg) st[a].pts += 3; else { st[h].pts++; st[a].pts++; }
    }
    // Desempate determinista: pts, dg, gf, y por Elo (estable) como último recurso.
    tables[g] = Object.values(st).sort((x, y) =>
      y.pts - x.pts || y.gd - x.gd || y.gf - x.gf || eloOf(y.iso) - eloOf(x.iso));
  }

  // 2) Best 8 third-placed teams.
  const GROUPS = Object.keys(fix.groups);
  const thirds = GROUPS.map((g) => ({ g, ...tables[g][2] }))
    .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || eloOf(b.iso) - eloOf(a.iso));
  const qualifyingThirds = new Set(thirds.slice(0, 8).map((t) => t.g));

  // 3) Assign third slots. Prefer the OFFICIAL FIFA allocation table when the set
  //    of groups with a qualifying third matches it; otherwise fall back to a
  //    bijection over the eligible group sets (approximation).
  const slots = bracket.meta.third_slots;
  const alloc = bracket.meta.third_allocation;
  const curKey = [...qualifyingThirds].sort().join("");
  const officialKey = alloc ? [...alloc.qualifying_groups].sort().join("") : null;
  let thirdAssign;
  if (alloc && curKey === officialKey) {
    thirdAssign = { ...alloc.map };
  } else {
    thirdAssign = {};
    const eligible = slots.map((s) => s.slice(1).split("").filter((g) => qualifyingThirds.has(g)));
    (function matchSlots(i, used) {
      if (i === slots.length) return true;
      for (const g of eligible[i].filter((g) => !used.has(g))) {
        thirdAssign[slots[i]] = g; used.add(g);
        if (matchSlots(i + 1, used)) return true;
        used.delete(g); delete thirdAssign[slots[i]];
      }
      return false;
    })(0, new Set());
  }

  const resolveSlot = (def) => {
    if (def.startsWith("W")) return tables[def[1]][0].iso;
    if (def.startsWith("R")) return tables[def[1]][1].iso;
    if (def.startsWith("3")) { const g = thirdAssign[def]; return g ? tables[g][2].iso : null; }
    return null;
  };

  // 4) Walk the bracket, predicting every tie.
  const winners = {};
  const roundNames = ["Round of 32", "Round of 16", "Quarter-finals", "Semi-finals", "Final"];
  const ties = [];
  bracket.rounds.forEach((round, ri) => {
    for (const m of round) {
      const real = koReal[m.id]; // resultado real: la llave ya se jugó
      if (real) {
        winners[m.id] = real.winner;
        const extras = [];
        if (real.aet) extras.push("a.e.t.");
        if (real.pens) extras.push(`${real.pens} pens`);
        ties.push({
          round: roundNames[ri], id: m.id,
          home: name(real.home), away: name(real.away),
          score: `${real.home_goals}-${real.away_goals}${extras.length ? ` (${extras.join(", ")})` : ""}`,
          tight: false, winner: name(real.winner), real: true,
        });
        continue;
      }
      const home = /^M\d+$/.test(m.home) ? winners[m.home] : resolveSlot(m.home);
      const away = /^M\d+$/.test(m.away) ? winners[m.away] : resolveSlot(m.away);
      if (home == null || away == null) { winners[m.id] = home || away; continue; }
      const r = predKO(home, away);
      winners[m.id] = r.winner;
      ties.push({
        round: roundNames[ri], id: m.id,
        home: name(home), away: name(away),
        score: `${r.a}-${r.b}`, tight: r.tight,
        winner: name(r.winner),
      });
    }
  });

  const finalTie = ties.find((t) => t.id === bracket.final_id);
  const champion = name(winners[bracket.final_id]);
  const standings = {};
  for (const g of GROUPS) standings[g] = {
    completo: fix.meta.grupos_completos.includes(g),
    equipos: tables[g].map((t, i) => ({ pos: i + 1, name: t.name, pts: t.pts, gd: t.gd })),
  };

  return { standings, projectedGroupMatches, ties, roundNames, final: finalTie, champion };
}
