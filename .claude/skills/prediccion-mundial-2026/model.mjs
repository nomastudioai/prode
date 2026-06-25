/**
 * Modelo de predicción Elo + forma → Poisson (compartido por predict.mjs y backtest.mjs).
 * Mantener acá toda la lógica para que predicción y backtest no diverjan.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));

// ─── Parámetros del modelo (ajustables) ───────────────────────────────
export const PARAMS = {
  HOME_ADV: 70,        // puntos Elo de ventaja para el local / anfitrión
  GOAL_SCALE: 0.0040,  // goles de diferencia esperados por punto Elo (~0,4 gol / 100 pts)
  BASE_TOTAL: 2.65,    // goles totales esperados promedio en un partido internacional
  MIN_LAMBDA: 0.15,    // piso de goles esperados por equipo
  FORM_AUTO_WEIGHT: 0.5, // peso del momentum del índice (delta Elo 2024→2026)
  FORM_AUTO_CAP: 40,     // tope (± pts Elo) del ajuste automático por momentum
  FORM_RESULT_PTS: 12,   // puntos Elo por victoria reciente
  FORM_RESULT_CAP: 60,   // tope (± pts Elo) del ajuste por resultados recientes
  MAX_GOALS: 9,          // tamaño de la grilla de Poisson (0..MAX_GOALS)
};

export function loadData() {
  return JSON.parse(readFileSync(join(__dir, "data", "elo-mundial-2026.json"), "utf8"));
}

export const norm = (s) =>
  s.toString().toLowerCase().trim().normalize("NFD").replace(/[̀-ͯ]/g, "");

export function findTeam(data, q) {
  const n = norm(q);
  let t = data.equipos.find((e) => norm(e.iso3) === n);
  if (t) return t;
  t = data.equipos.find((e) => norm(e.name) === n || (e.en && norm(e.en) === n));
  if (t) return t;
  t = data.equipos.find((e) => norm(e.name).includes(n) || (e.en && norm(e.en).includes(n)));
  return t || null;
}

export function poisson(k, lambda) {
  let f = 1;
  for (let i = 2; i <= k; i++) f *= i;
  return (Math.exp(-lambda) * Math.pow(lambda, k)) / f;
}

// Momentum del índice: cuánto subió/bajó el Elo en los últimos años.
export function autoForm(team, P = PARAMS) {
  const e = team.elo_recent || {};
  const recent = e["2026"] ?? e["2025"];
  const past = e["2024"] ?? e["2023"];
  if (recent == null || past == null) return 0;
  const mom = (recent - past) * P.FORM_AUTO_WEIGHT;
  return Math.max(-P.FORM_AUTO_CAP, Math.min(P.FORM_AUTO_CAP, mom));
}

// Forma por resultados recientes "W,D,L,..." (más reciente primero).
export function resultForm(seq, P = PARAMS) {
  if (!seq) return null;
  const games = seq.split(/[,\s]+/).filter(Boolean);
  let adj = 0, w = 1.0;
  for (const g of games) {
    const r = g[0].toUpperCase();
    const pts = r === "W" ? 1 : r === "L" ? -1 : 0;
    adj += pts * P.FORM_RESULT_PTS * w;
    w *= 0.85;
  }
  return Math.max(-P.FORM_RESULT_CAP, Math.min(P.FORM_RESULT_CAP, adj));
}

/**
 * Predice un partido a partir del Elo efectivo de cada lado.
 * @param {number} effA Elo efectivo equipo A (con forma y localía ya sumadas)
 * @param {number} effB Elo efectivo equipo B
 * @returns {{pWin,pDraw,pLose,lamA,lamB,scores,We}}
 */
export function predictFromEff(effA, effB, P = PARAMS) {
  const dr = effA - effB;
  const expGD = dr * P.GOAL_SCALE;
  const lamA = Math.max(P.MIN_LAMBDA, (P.BASE_TOTAL + expGD) / 2);
  const lamB = Math.max(P.MIN_LAMBDA, (P.BASE_TOTAL - expGD) / 2);

  const N = P.MAX_GOALS;
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
  scores.forEach((s) => (s.p /= tot));
  scores.sort((x, y) => y.p - x.p);
  const We = 1 / (1 + Math.pow(10, -dr / 400));
  return { pWin, pDraw, pLose, lamA, lamB, scores, We };
}

/**
 * Predice un partido entre dos equipos del dataset.
 * opts: { homeAdvA, homeAdvB, formA (num|null), formB (num|null), eloA, eloB }
 */
export function predictMatch(teamA, teamB, opts = {}, P = PARAMS) {
  const eloA = opts.eloA ?? teamA.elo_2026;
  const eloB = opts.eloB ?? teamB.elo_2026;
  if (eloA == null || eloB == null) return null;
  const fA = opts.formA != null ? opts.formA : autoForm(teamA, P);
  const fB = opts.formB != null ? opts.formB : autoForm(teamB, P);
  const effA = eloA + fA + (opts.homeAdvA || 0);
  const effB = eloB + fB + (opts.homeAdvB || 0);
  return { ...predictFromEff(effA, effB, P), eloA, eloB, formA: fA, formB: fB, effA, effB };
}
