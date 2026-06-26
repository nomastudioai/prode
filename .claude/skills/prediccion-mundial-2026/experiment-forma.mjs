#!/usr/bin/env node
/**
 * Experimento: ¿la FORMA INTRA-TORNEO mejora al Elo estático?
 *
 * Backtest walk-forward (sin fuga): cada partido se predice usando SOLO los
 * resultados de fechas anteriores. Compara 3 variantes:
 *   A) Baseline  : Elo estático del Atlas + momentum anual del índice.
 *   B) Forma W/D/L: Elo estático + nudge por resultados previos del torneo.
 *   C) Elo fresco: Elo actualizado partido a partido (fórmula eloratings).
 *
 *   node experiment-forma.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { loadData, predictFromEff, resultForm, autoForm, pick1x2, PARAMS } from "./model.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const elo = loadData();
const fix = JSON.parse(readFileSync(join(__dir, "data", "grupos-resultados-2026.json"), "utf8"));
const byIso = Object.fromEntries(elo.equipos.map((t) => [t.iso3, t]));
const HOSTS = new Set(["MEX", "CAN", "USA"]);
const oc = (h, a) => (h > a ? "1" : h === a ? "X" : "2");
const ha = (iso) => (HOSTS.has(iso) ? PARAMS.HOME_ADV : 0);

// Orden cronológico estable (fecha, luego grupo) — no usamos un partido para predecirse a sí mismo.
const matches = [...fix.played_matches].sort((a, b) =>
  a.date.localeCompare(b.date) || a.group.localeCompare(b.group) || a.home.localeCompare(b.home));

// ─── Actualización de Elo estilo eloratings.net ───────────────────────
const ELO_K = 60; // peso Mundial
function gFactor(margin) {
  if (margin <= 1) return 1;
  if (margin === 2) return 1.5;
  return (11 + margin) / 8;
}
function eloUpdate(state, m) {
  const eA = state[m.home], eB = state[m.away];
  const dr = (eA + ha(m.home)) - (eB + ha(m.away));
  const We = 1 / (1 + Math.pow(10, -dr / 400));
  const W = m.home_goals > m.away_goals ? 1 : m.home_goals === m.away_goals ? 0.5 : 0;
  const g = gFactor(Math.abs(m.home_goals - m.away_goals));
  const delta = ELO_K * g * (W - We);
  state[m.home] = eA + delta;
  state[m.away] = eB - delta;
}

// ─── Evaluación de una variante ───────────────────────────────────────
function evalMode(getEff) {
  // getEff(m) -> { effA, effB } usando solo info previa
  const state = Object.fromEntries(elo.equipos.map((t) => [t.iso3, t.elo_2026])); // Elo vigente (modo C)
  const priorResults = {}; // iso -> array de "W"/"D"/"L" (más reciente primero) para modo B
  const rec = [];
  for (const m of matches) {
    const { effA, effB } = getEff(m, state, priorResults);
    const r = predictFromEff(effA, effB);
    const probs = { "1": r.pWin, "X": r.pDraw, "2": r.pLose };
    const pred = pick1x2(probs);
    const act = oc(m.home_goals, m.away_goals);
    const brier = ["1", "X", "2"].reduce((s, k) => s + (probs[k] - (k === act ? 1 : 0)) ** 2, 0);
    rec.push({ matchday: m.matchday, hit: pred === act, brier, pActual: probs[act], pred, act });
    // actualizar estado DESPUÉS de predecir (walk-forward)
    eloUpdate(state, m);
    const rH = m.home_goals > m.away_goals ? "W" : m.home_goals === m.away_goals ? "D" : "L";
    const rA = rH === "W" ? "L" : rH === "L" ? "W" : "D";
    (priorResults[m.home] ||= []).unshift(rH);
    (priorResults[m.away] ||= []).unshift(rA);
  }
  return rec;
}

function metrics(rec, filter = () => true) {
  const r = rec.filter(filter);
  const n = r.length;
  return {
    n,
    acc: r.filter((x) => x.hit).length / n,
    brier: r.reduce((s, x) => s + x.brier, 0) / n,
    logloss: -r.reduce((s, x) => s + Math.log(Math.max(x.pActual, 1e-9)), 0) / n,
  };
}

// ─── Variantes ────────────────────────────────────────────────────────
// A) Baseline: Elo estático + momentum anual.
const A = evalMode((m) => ({
  effA: byIso[m.home].elo_2026 + autoForm(byIso[m.home]) + ha(m.home),
  effB: byIso[m.away].elo_2026 + autoForm(byIso[m.away]) + ha(m.away),
}));
// B) Elo estático + forma por resultados previos del torneo.
const B = evalMode((m, _state, prior) => ({
  effA: byIso[m.home].elo_2026 + (resultForm((prior[m.home] || []).join(",")) || 0) + ha(m.home),
  effB: byIso[m.away].elo_2026 + (resultForm((prior[m.away] || []).join(",")) || 0) + ha(m.away),
}));
// C) Elo fresco (actualizado partido a partido).
const C = evalMode((m, state) => ({
  effA: state[m.home] + ha(m.home),
  effB: state[m.away] + ha(m.away),
}));

// ─── Reporte ──────────────────────────────────────────────────────────
const pc = (x) => (x * 100).toFixed(1).padStart(5) + "%";
const md2 = (x) => x.matchday >= 2; // where in-tournament form can have an effect

console.log(`\n══════ EXPERIMENT · in-tournament form vs static Elo ══════\n`);
function row(name, rec) {
  const all = metrics(rec), sub = metrics(rec, md2);
  console.log(`  ${name}`);
  console.log(`     ALL (${all.n}):           acc ${pc(all.acc)}   Brier ${all.brier.toFixed(3)}   logloss ${all.logloss.toFixed(3)}`);
  console.log(`     MATCHDAYS≥2 (${sub.n}):   acc ${pc(sub.acc)}   Brier ${sub.brier.toFixed(3)}   logloss ${sub.logloss.toFixed(3)}\n`);
}
row("A) Baseline (static Elo + yearly momentum)", A);
row("B) Static Elo + tournament W/D/L form", B);
row("C) Fresh Elo (updated match by match)", C);

// Direct comparison on matchdays >= 2 (where they actually differ)
const a = metrics(A, md2), b = metrics(B, md2), c = metrics(C, md2);
const d = (x, base) => { const v = (x - base) * 100; return (v >= 0 ? "+" : "") + v.toFixed(1) + " pp"; };
console.log(`  Δ on matchdays ≥2 (1X2 accuracy vs baseline):`);
console.log(`     B W/D/L form : ${d(b.acc, a.acc)}   ·   C fresh Elo : ${d(c.acc, a.acc)}`);
console.log(`  Δ on matchdays ≥2 (Brier vs baseline, ↓ better):`);
console.log(`     B W/D/L form : ${(b.brier - a.brier).toFixed(3)}   ·   C fresh Elo : ${(c.brier - a.brier).toFixed(3)}\n`);
console.log(`  Note: matchday 1 is identical except for momentum; the real effect shows on matchdays ≥2.`);
console.log(`  Small sample (${c.n} matches on matchdays ≥2): treat the differences as indicative.\n`);
