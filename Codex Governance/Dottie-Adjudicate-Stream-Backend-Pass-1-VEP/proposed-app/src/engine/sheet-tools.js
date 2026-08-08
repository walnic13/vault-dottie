'use strict';
/**
 * K-1 Review Agent — deterministic SheetJS tool set.
 * Every tool returns the value AND the cells it read (audit trail).
 * Theo orchestrates + judges; these tools do ALL arithmetic. Anchor by LABEL, never a fixed address.
 */
const XLSX = require('xlsx');

const TOL = 1;                 // global $1 tolerance
const round2 = n => Math.round((n + Number.EPSILON) * 100) / 100;
const norm = s => String(s).trim().toLowerCase().replace(/\s+/g, ' ');
const A1 = (r, c) => XLSX.utils.encode_cell({ r, c });

// ---- workbook set loading ---------------------------------------------------
function openWorkbookSet(paths) {
  const set = {};
  for (const [role, p] of Object.entries(paths)) {
    set[role] = XLSX.readFile(p, { cellFormula: true, cellNF: false, cellHTML: false });
  }
  return set;
}

// ---- label anchoring --------------------------------------------------------
/** Find cells whose text equals `text` (normalized). Returns first match, or all with {all:true}. */
function findLabel(wb, sheetName, text, opts = {}) {
  const ws = wb.Sheets[sheetName];
  if (!ws || !ws['!ref']) return opts.all ? [] : null;
  const rng = XLSX.utils.decode_range(ws['!ref']);
  const needle = norm(text);
  const hits = [];
  for (let R = rng.s.r; R <= rng.e.r; R++) {
    for (let C = rng.s.c; C <= rng.e.c; C++) {
      const cell = ws[A1(R, C)];
      if (cell && typeof cell.v === 'string') {
        const v = norm(cell.v);
        if (opts.contains ? v.includes(needle) : v === needle) hits.push({ row: R, col: C, addr: A1(R, C), text: cell.v });
      }
    }
  }
  return opts.all ? hits : (hits[0] || null);
}

// ---- cell / range reads -----------------------------------------------------
function getCell(wb, sheetName, addr) {
  const ws = wb.Sheets[sheetName];
  const cell = ws && ws[addr];
  if (!cell) return { addr, value: null, formula: null, type: null, isError: false };
  return { addr, value: cell.v ?? null, formula: cell.f ?? null, type: cell.t ?? null, isError: cell.t === 'e' };
}
const getRC = (wb, s, r, c) => getCell(wb, s, A1(r, c));

/** First numeric value in a row (optionally from a starting column) — robust to value-column drift. */
function firstNumberInRow(wb, sheetName, row, fromCol = 0) {
  const ws = wb.Sheets[sheetName];
  const rng = XLSX.utils.decode_range(ws['!ref']);
  for (let C = Math.max(fromCol, rng.s.c); C <= rng.e.c; C++) {
    const cell = ws[A1(row, C)];
    if (cell && cell.t === 'n') return { value: cell.v, addr: A1(row, C) };
  }
  return { value: null, addr: null };
}

function columnValues(wb, sheetName, col, rowStart, rowEnd) {
  const out = [];
  for (let R = rowStart; R <= rowEnd; R++) {
    const c = getRC(wb, sheetName, R, col);
    out.push({ row: R, addr: c.addr, value: typeof c.value === 'number' ? c.value : null, isError: c.isError });
  }
  return out;
}
const sumValues = vals => round2(vals.reduce((s, v) => {
  const n = typeof v === 'number' ? v : (v && typeof v.value === 'number' ? v.value : 0);
  return s + n;
}, 0));

// ---- deterministic checks ---------------------------------------------------
function tieOut(a, b, tol = TOL) {
  const delta = round2((a || 0) - (b || 0));
  return { a: a ?? null, b: b ?? null, delta, tol, pass: Math.abs(delta) <= tol };
}
function ratioSum(vals, target, tol = 1e-6) {
  const sum = sumValues(vals);
  return { sum, target, delta: round2(sum - target), tol, pass: Math.abs(sum - target) <= tol };
}
/** Rollforward: per-key PY-ending vs CY-beginning. Exact (zero-tolerance) by default. */
function rollforwardMatch(pyMap, cyMap, { exact = true, tol = 0 } = {}) {
  const keys = new Set([...Object.keys(pyMap), ...Object.keys(cyMap)]);
  const rows = []; let allPass = true;
  for (const k of keys) {
    const py = pyMap[k], cy = cyMap[k];
    const delta = round2((cy || 0) - (py || 0));
    const pass = exact ? delta === 0 : Math.abs(delta) <= tol;
    if (!pass) allPass = false;
    rows.push({ key: k, py: py ?? null, cy: cy ?? null, delta, pass });
  }
  return { allPass, exact, rows };
}
/** K-1 box tie: per row, Σ across partner columns == the Schedule-K column. */
function k1BoxTie(wb, sheetName, boxRows, schedKCol, partnerCols, tol = TOL) {
  return boxRows.map(R => {
    const sk = getRC(wb, sheetName, R, schedKCol).value;
    const skNum = typeof sk === 'number' ? sk : 0;
    const partnerVals = partnerCols.map(C => getRC(wb, sheetName, R, C).value).filter(v => typeof v === 'number');
    const sum = round2(partnerVals.reduce((a, b) => a + b, 0));
    return { row: R, schedK: skNum, partnersSum: sum, n: partnerVals.length, delta: round2(sum - skNum), pass: Math.abs(sum - skNum) <= tol };
  });
}

// ---- integrity scans --------------------------------------------------------
const EXT_RE = /\[\d+\]|\[[^\]]*\.xls[mxb]?\]/i;
const MASTER_FX_RE = /LP\s*MASTER|FX\s*RATE|FX\s*RATES|CODES/i;
function scanExternalLinks(wb, { allowMasterFX = true } = {}) {
  const hits = [];
  for (const sn of wb.SheetNames) {
    const ws = wb.Sheets[sn]; if (!ws || !ws['!ref']) continue;
    const rng = XLSX.utils.decode_range(ws['!ref']);
    for (let R = rng.s.r; R <= rng.e.r; R++)
      for (let C = rng.s.c; C <= rng.e.c; C++) {
        const cell = ws[A1(R, C)];
        if (cell && cell.f && EXT_RE.test(cell.f)) {
          if (allowMasterFX && MASTER_FX_RE.test(cell.f)) continue;
          hits.push({ sheet: sn, addr: A1(R, C), formula: cell.f.slice(0, 90) });
        }
      }
  }
  return hits;
}
function scanErrors(wb) {
  const hits = [];
  for (const sn of wb.SheetNames) {
    const ws = wb.Sheets[sn]; if (!ws || !ws['!ref']) continue;
    const rng = XLSX.utils.decode_range(ws['!ref']);
    for (let R = rng.s.r; R <= rng.e.r; R++)
      for (let C = rng.s.c; C <= rng.e.c; C++) {
        const cell = ws[A1(R, C)];
        if (cell && cell.t === 'e') hits.push({ sheet: sn, addr: A1(R, C), error: cell.w || String(cell.v) });
      }
  }
  return hits;
}

// detect partner columns by a header row carrying names, from a starting column
function detectPartnerCols(wb, sheetName, headerRow, fromCol = 9) {
  const ws = wb.Sheets[sheetName]; const rng = XLSX.utils.decode_range(ws['!ref']); const cols = [];
  for (let C = fromCol; C <= rng.e.c; C++) { const c = ws[A1(headerRow, C)]; if (c && c.v != null && String(c.v).trim()) cols.push(C); }
  return cols;
}
// sum ratio columns over partner rows (rows where labelCol matches AND codeCol has a value)
function ratioColumnSums(wb, sheetName, ratioCols, { labelCol = 0, labelMatch = /schedule k-1/i, codeCol = 1 } = {}) {
  const ws = wb.Sheets[sheetName]; const rng = XLSX.utils.decode_range(ws['!ref']);
  const sums = {}; let n = 0;
  for (let R = rng.s.r; R <= rng.e.r; R++) {
    const lab = ws[A1(R, labelCol)]; if (!(lab && labelMatch.test(String(lab.v)))) continue;
    const code = ws[A1(R, codeCol)]; if (!code || code.v === '' || code.v == null) continue; n++;
    for (const [name, C] of Object.entries(ratioCols)) { const cc = ws[A1(R, C)]; if (cc && cc.t === 'n') sums[name] = (sums[name] || 0) + cc.v; } // raw accumulate; round once below
  }
  for (const k of Object.keys(sums)) sums[k] = Math.round(sums[k] * 1e6) / 1e6; // round to 6 dp once
  return { partnerRows: n, sums };
}
// per-partner K-1 capital rollforward foots (rows = 0-indexed row numbers by label)
function k1CapitalRollforward(wb, sheetName, partnerCols, rows, tol = TOL) {
  const ws = wb.Sheets[sheetName];
  const num = (C, R) => { const c = ws[A1(R, C)]; return c && c.t === 'n' ? c.v : 0; };
  const out = [];
  for (const C of partnerCols) {
    const begBook = num(C, rows.begCapBook), pyAdj = num(C, rows.pyTaxAdj), adjBeg = num(C, rows.adjBeg),
      cont = num(C, rows.cont), cyInc = num(C, rows.cyTaxInc), oid = num(C, rows.otherIncDec), dist = num(C, rows.dist), endTax = num(C, rows.endTax);
    const adjBegCalc = round2(begBook + pyAdj), endCalc = round2(adjBeg + cont + cyInc + oid - dist);
    const p1 = Math.abs(adjBegCalc - adjBeg) <= tol, p2 = Math.abs(endCalc - endTax) <= tol;
    out.push({ col: C, adjBegDelta: round2(adjBegCalc - adjBeg), endDelta: round2(endCalc - endTax), pass: p1 && p2 });
  }
  return out;
}

module.exports = {
  TOL, round2, norm, A1, detectPartnerCols, ratioColumnSums, k1CapitalRollforward,
  openWorkbookSet, findLabel, getCell, getRC, firstNumberInRow, columnValues, sumValues,
  tieOut, ratioSum, rollforwardMatch, k1BoxTie, scanExternalLinks, scanErrors,
};
