#!/usr/bin/env node
/**
 * Refresca el Elo EN VIVO de eloratings.net dentro de elo-mundial-2026.json.
 *
 * - elo_2026  : snapshot PRE-torneo (Atlas). NO se toca → backtest reproducible.
 * - elo_live  : Elo actual de eloratings.net → se usa para predicciones a futuro.
 *
 * Uso:  node actualizar-elo.mjs data/2026.tsv
 * (el .tsv se baja con scripts/actualizar.sh, que corre curl antes)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));

// Código eloratings.net → ISO3 del dataset (48 equipos del Mundial 2026).
const ELO_CODE_TO_ISO = {
  MX:"MEX",ZA:"ZAF",KR:"KOR",CZ:"CZE",CA:"CAN",BA:"BIH",QA:"QAT",CH:"CHE",BR:"BRA",MA:"MAR",
  HT:"HTI",SQ:"SCO",US:"USA",PY:"PRY",AU:"AUS",TR:"TUR",DE:"DEU",CW:"CUW",CI:"CIV",EC:"ECU",
  NL:"NLD",JP:"JPN",SE:"SWE",TN:"TUN",BE:"BEL",EG:"EGY",IR:"IRN",NZ:"NZL",ES:"ESP",CV:"CPV",
  SA:"SAU",UY:"URY",FR:"FRA",SN:"SEN",IQ:"IRQ",NO:"NOR",AR:"ARG",DZ:"DZA",AT:"AUT",JO:"JOR",
  PT:"PRT",CD:"COD",UZ:"UZB",CO:"COL",EN:"GBR",HR:"HRV",GH:"GHA",PA:"PAN",
};

const tsvPath = process.argv[2] || join(__dir, "data", "2026.tsv");
const tsv = readFileSync(tsvPath, "utf8").split("\n").map((l) => l.split("\t")).filter((x) => x[2]);
// Columnas eloratings: [mov, rank, code, elo, ...]
const live = {};
for (const r of tsv) {
  const iso = ELO_CODE_TO_ISO[r[2]];
  if (iso) live[iso] = { elo: Math.round(+r[3]), rank: +r[1] };
}

const P = join(__dir, "data", "elo-mundial-2026.json");
const data = JSON.parse(readFileSync(P, "utf8"));
let updated = 0, missing = [];
for (const t of data.equipos) {
  const l = live[t.iso3];
  if (l) { t.elo_live = l.elo; t.rank_live = l.rank; updated++; }
  else missing.push(t.iso3);
}
data.meta.elo_live_actualizado = new Date().toISOString().slice(0, 10);
data.meta.nota_elo_live = "elo_live = eloratings.net en vivo (predicciones a futuro). elo_2026 = snapshot pre-torneo del Atlas (backtest).";
writeFileSync(P, JSON.stringify(data, null, 2));
console.log(`Elo en vivo actualizado: ${updated}/48` + (missing.length ? ` · sin dato: ${missing.join(",")}` : ""));
