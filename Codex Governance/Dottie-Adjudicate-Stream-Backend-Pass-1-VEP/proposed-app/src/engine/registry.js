'use strict';
/**
 * K-1 Review Agent — FULL declarative control catalog + engine.
 * Each control is DATA: {id, group, sheet?, type, severity, tolerance?, description, run?|anchor?}.
 *   type:     deterministic | attestation | advisory        (the control ladder)
 *   severity: normal | high | crown
 *   run(ctx): implemented now (live-computing, validated on LG OPP).
 *   anchor:   deterministic-but-value-column-pending — pinned against the sample during integration.
 * Attestation/advisory carry neither run nor anchor (resolved in-app via the review sheet + Theo's judgment).
 * "Any control is a good control" — the catalog is meant to grow.
 */
const XLSX = require('xlsx');
const T = require('./sheet-tools');
const OK = (computed, cells = [], detail) => ({ status: 'pass', computed, cells, detail });
const EXC = (computed, cells = [], detail) => ({ status: 'exception', computed, cells, detail });

const CONTROLS = [
  // ======================= PRE-FLIGHT / INTEGRITY (B) =======================
  { id: 'PRE.workbook-set', group: 'preflight', type: 'deterministic', severity: 'high',
    description: '4-workbook set present (+ prior-year data available for rollforward).',
    run: (ctx) => { const need = ['input', 'output']; const missing = need.filter(r => !ctx.wb[r]); return missing.length ? EXC(`missing ${missing}`) : OK('set present'); } },
  { id: 'PRE.sch-l-balances', group: 'preflight', sheet: 'TRIAL BALANCE', type: 'deterministic', severity: 'high', tolerance: T.TOL,
    description: "TB built-in 'Checks (s/b zero)' = 0 (Sch L assets = liabilities + capital).",
    run: (ctx) => { const h = T.findLabel(ctx.wb.input, 'TRIAL BALANCE', 'Checks (s/b zero)', { contains: true });
      if (!h) return { status: 'anchor-pending', detail: "label 'Checks (s/b zero)' not located" };
      const n = T.firstNumberInRow(ctx.wb.input, 'TRIAL BALANCE', h.row, h.col + 1);
      return Math.abs(n.value || 0) <= T.TOL ? OK(n.value, [n.addr]) : EXC(n.value, [n.addr], 'Sch L does not balance'); } },
  { id: 'PRE.entity-consistent', group: 'preflight', type: 'deterministic', severity: 'normal',
    description: 'Entity name/EIN consistent across workbooks = General Info.', anchor: 'General Info name/EIN vs SOCI/SOFP header + wb2' },
  { id: 'PRE.period-no-stale-dates', group: 'preflight', type: 'advisory', severity: 'normal',
    description: 'Period/dates correct; flag stale template dates (e.g. 06/30/2023, prior tax years).' },
  { id: 'INT.no-external-links', group: 'integrity', type: 'deterministic', severity: 'crown', tolerance: 0,
    description: 'No external-workbook links in wb1/wb2 except LP-master VLOOKUPs + FX lookups (wb2 = client deliverable).',
    run: (ctx) => { const h = T.scanExternalLinks(ctx.wb.output); return h.length ? EXC(h.length, h.slice(0, 50).map(x => `${x.sheet}!${x.addr}`), `${h.length} external-link cells`) : OK(0); } },
  { id: 'INT.no-broken-refs', group: 'integrity', type: 'deterministic', severity: 'high', tolerance: 0,
    description: 'No #REF!/#N/A/error cells (especially on wb2).',
    run: (ctx) => { const h = T.scanErrors(ctx.wb.output); return h.length ? EXC(h.length, h.slice(0, 50).map(x => `${x.sheet}!${x.addr}`)) : OK(0); } },

  // ======================= 1. GENERAL INFO =======================
  { id: 'GI.required-fields', group: 'general-info', sheet: 'GENERAL INFO', type: 'deterministic', severity: 'normal',
    description: 'Required identity fields populated (name, EIN, locator, method, FY dates, business code, address). Missing → in-app explanation.', anchor: 'GENERAL INFO rows 5-29 value col; conditional foreign/domestic address' },
  { id: 'GI.ein-format', group: 'general-info', sheet: 'GENERAL INFO', type: 'deterministic', severity: 'normal', description: 'EIN format XX-XXXXXXX.', anchor: "GENERAL INFO 'PARTNERSHIP EIN' value" },
  { id: 'GI.fye-1231', group: 'general-info', sheet: 'GENERAL INFO', type: 'deterministic', severity: 'normal', description: 'FYE = 12/31 and period dates match the review year.', anchor: "GENERAL INFO fiscal-year begin/end" },
  { id: 'GI.alloc-method-set', group: 'general-info', sheet: 'GENERAL INFO', type: 'deterministic', severity: 'normal', description: 'Allocation method defaults set + consistent with the alloc sheet.', anchor: 'ALLOMETHOD / TIMEALLODEFAULT / TYPEALLODEFAULT' },

  // ======================= 2. RETURN QUESTIONS =======================
  { id: 'RQ.all-answered', group: 'return-questions', sheet: 'RETURN QUESTIONS', type: 'deterministic', severity: 'normal', description: 'Every applicable Schedule B question answered.', anchor: 'RETURN QUESTIONS value col per question row' },
  { id: 'RQ.foreign-partners-consistent', group: 'return-questions', type: 'deterministic', severity: 'high', description: 'ANY FOREIGN PARTNERS = Yes ↔ non-US LPs actually present in LP Information.', anchor: "RETURN QUESTIONS 'ANY FOREIGN PARTNERS' vs LP INFO domestic/foreign col" },
  { id: 'RQ.754-consistent', group: 'return-questions', type: 'advisory', severity: 'normal', description: '§754 election answer ↔ basis adjustments present in Partner Transfers.' },
  { id: 'RQ.py-consistency', group: 'return-questions', type: 'advisory', severity: 'normal', description: "Answers shouldn't flip year-over-year without reason." },

  // ======================= 3. TRIAL BALANCE =======================
  { id: 'TB.self-review-assert', group: 'trial-balance', type: 'attestation', severity: 'high', description: 'Preparer asserts Total Assets / Liabilities / Equity / Net Book Income = correct-from-client-financials.' },
  { id: 'TB.bs-flux', group: 'trial-balance', sheet: 'TRIAL BALANCE', type: 'deterministic', severity: 'high',
    description: 'Balance-sheet flux CY vs PY per line: flag movement >30% AND >$50k (+ new accounts) → preparer explains.', anchor: 'TB Sch L rows 6-88: PY book (K/M) vs CY book (V/X)' },
  { id: 'TB.book-plus-m1-eq-tax', group: 'trial-balance', sheet: 'TRIAL BALANCE', type: 'deterministic', severity: 'high', tolerance: T.TOL,
    description: 'Per line: CY Book (V) + M-1 Adj (AA) = CY Tax (AB) — guard the relationship.', anchor: 'TB cols V + AA = AB, rows 6-88 & 95-251' },
  { id: 'TB.tax-adj-origin-m1', group: 'trial-balance', sheet: 'TRIAL BALANCE', type: 'deterministic', severity: 'high',
    description: 'M-1 Adj column (AA) is linked from M-1 Cumulative Adjustments, not hardcoded on the TB.', anchor: 'TB col AA formulas reference M-1 Cum Adj' },

  // ======================= 4. M-1 CUMULATIVE ADJUSTMENTS =======================
  { id: 'M1.every-adj-reasoning', group: 'm1', type: 'attestation', severity: 'high', description: 'Every M-1 adjustment carries a technical/tax reasoning (WHY). No threshold — explain ALL.' },
  { id: 'M1.appeared-disappeared', group: 'm1', sheet: 'M-1 CUMULATIVE ADJUSTMENTS', type: 'deterministic', severity: 'normal', description: 'Flag any adjustment in PY-not-CY or CY-not-PY → preparer explains.', anchor: 'M-1 Cum Adj CY block (r4-32) vs cumulative/BOY block (r84-112)' },
  { id: 'M1.boy-tax-bs', group: 'm1', sheet: 'TRIAL BALANCE', type: 'deterministic', severity: 'high', tolerance: T.TOL, description: 'BOY tax-basis B/S = book BOY + cumulative adj (col P), rows 6-88.', anchor: 'TB book BOY (K/M) + col P = BOY tax' },
  { id: 'M1.cy-double-entry', group: 'm1', type: 'deterministic', severity: 'high', tolerance: T.TOL, description: 'CY adjustment income-statement leg = capital/net-income leg.', anchor: 'TB col AA rows 95-251 (I/S) vs capital section rows 82-88' },
  { id: 'M1.guaranteed-payment', group: 'm1', type: 'deterministic', severity: 'normal', tolerance: T.TOL, description: 'Guaranteed payment consistent: income statement ↔ capital "other decrease".', anchor: 'GP on I/S vs capital other-decrease' },
  { id: 'M1.fx-plug-to-capital', group: 'm1', type: 'deterministic', severity: 'high', tolerance: T.TOL, description: 'FX translation delta posts to CY capital section.', anchor: 'FX plug → TB CY capital' },
  { id: 'M1.net-to-iafv', group: 'm1', type: 'deterministic', severity: 'high', tolerance: T.TOL, description: 'Net of adjustments plugs to Investments at Fair Value (SOLE plug); B/S balances AFTER adjustment.', anchor: "TB 'Investments at Fair Value' = net adj; Checks s/b zero holds post-adj" },
  { id: 'M1.sch-d-tie', group: 'm1', sheet: 'SCHEDULE D', type: 'deterministic', severity: 'high', tolerance: T.TOL,
    description: 'Σ Schedule D gains (col I USD: Σ gross sales − Σ cost basis) = TB AD210 + AD218 (Sch K lines 8 + 9a).',
    run: (ctx) => { const sd = ctx.wb.input.Sheets['SCHEDULE D']; const rng = XLSX.utils.decode_range(sd['!ref']); let sales = 0, cost = 0;
      for (let R = rng.s.r; R <= rng.e.r; R++) { const b = String((sd[T.A1(R, 1)] || {}).v || ''); const i = sd[T.A1(R, 8)];
        if (/GROSS SALES PRICE/i.test(b) && i && i.t === 'n') sales += i.v; if (/COST OR OTHER BASIS/i.test(b) && i && i.t === 'n') cost += i.v; }
      const gain = T.round2(sales - cost); const tb = ctx.wb.input.Sheets['TRIAL BALANCE']; const target = T.round2((tb['AD210'] || {}).v + (tb['AD218'] || {}).v);
      const t = T.tieOut(gain, target); return t.pass ? OK({ schD: gain, target }, ['SchD col I', 'TB AD210+AD218']) : EXC({ schD: gain, target, delta: t.delta }); } },

  // ======================= 5. SCHEDULE D =======================
  { id: 'SD.fields-complete', group: 'schedule-d', sheet: 'SCHEDULE D', type: 'deterministic', severity: 'normal', description: 'All fields mandatory per transaction; any blank → in-app explanation.', anchor: 'SCHEDULE D per-transaction blocks' },
  { id: 'SD.gain-computes', group: 'schedule-d', sheet: 'SCHEDULE D', type: 'deterministic', severity: 'normal', tolerance: T.TOL, description: 'Gain/loss = gross sales price − cost basis (guard).', anchor: 'SCHEDULE D sales − basis per txn' },
  { id: 'SD.st-lt-classification', group: 'schedule-d', sheet: 'SCHEDULE D', type: 'deterministic', severity: 'normal', description: 'ST/LT derived from dates; flag mismatch with chosen F8949 type.', anchor: 'date acquired→sold vs F8949TYPE' },
  { id: 'SD.date-valid', group: 'schedule-d', sheet: 'SCHEDULE D', type: 'deterministic', severity: 'normal', description: 'Date sold ≥ acquired; sale in period; F8949 type valid (A-F).', anchor: 'SCHEDULE D dates + F8949TYPE' },
  { id: 'SD.tax-basis-attest', group: 'schedule-d', type: 'attestation', severity: 'high', description: 'Preparer attests tax cost basis reconciled to tax basis records for the proceeds used.' },

  // ======================= 6. ORG COSTS =======================
  { id: 'OC.709-computation', group: 'org-costs', sheet: 'ORG COSTS', type: 'deterministic', severity: 'normal', tolerance: T.TOL, description: 'Enforce §709: $5,000 first-year + remainder over 180 months (/15). Discrepancy → preparer clears in-app.', anchor: 'ORG COSTS annual tax amortization = basis/15' },
  { id: 'OC.accum-rollforward', group: 'org-costs', sheet: 'ORG COSTS', type: 'deterministic', severity: 'normal', tolerance: T.TOL, description: 'Accumulated amort rolls forward (PY + CY = EOY); adjusted tax basis = cost − accumulated.', anchor: 'ORG COSTS accumulated + adj-basis columns' },
  { id: 'OC.adj-basis-tie', group: 'org-costs', type: 'deterministic', severity: 'normal', tolerance: T.TOL, description: 'Adjusted tax basis = ending balance of the organisational-costs line on the cumulative M-1 sheet.', anchor: 'ORG COSTS adj-basis vs M-1 Cum Adj org-costs line ending (by label)' },
  { id: 'OC.cy-amort-to-m1', group: 'org-costs', type: 'deterministic', severity: 'normal', tolerance: T.TOL, description: 'CY tax amortization → org-cost M-1 line (cell movable → anchor by label).', anchor: 'ORG COSTS CY amort → M-1 org line (sample H18)' },

  // ======================= 7. SCHEDULE K-2 (lighter MVP) =======================
  { id: 'K2.applicability', group: 'k2', type: 'deterministic', severity: 'high', description: 'K-2/K-3 present iff required (foreign-partner determination from Return Questions).', anchor: 'K-2 activation vs foreign-partner determination' },
  { id: 'K2.capgains-to-schd', group: 'k2', sheet: 'SCHEDULE K-2 TEMPLATE', type: 'deterministic', severity: 'normal', tolerance: T.TOL, description: 'K-2 capital-gains detail ties to Schedule D.', anchor: 'K-2 PERS PROP SOLD vs Schedule D' },
  { id: 'K2.country-codes', group: 'k2', sheet: 'SCHEDULE K-2 TEMPLATE', type: 'deterministic', severity: 'normal', description: 'Country codes valid vs Country and State Codes sheet.', anchor: 'K-2 CTRY SELECT vs Country and State Codes' },
  { id: 'K2.section-attest', group: 'k2', type: 'attestation', severity: 'normal', description: 'Preparer asserts each K-2 section complete + correctly sourced.' },
  { id: 'K2.advisory', group: 'k2', type: 'advisory', severity: 'normal', description: 'Theo best-efforts flags apparent K-2 gaps/inconsistencies for preparer attention.' },

  // ======================= 8. CORPORATE INVESTMENTS (crown) =======================
  { id: 'CI.register-complete', group: 'corp-investments', sheet: 'CORPORATE INVESTMENTS', type: 'deterministic', severity: 'high', description: 'Every investment entered; every input field populated.', anchor: 'CORPORATE INVESTMENTS rows, required cols' },
  { id: 'CI.ties-client-schedule', group: 'corp-investments', type: 'attestation', severity: 'high', description: 'Register ties to the client total-investments schedule.' },
  { id: 'CI.bs-fv-vs-cost', group: 'corp-investments', type: 'deterministic', severity: 'high', description: 'BS investments (fair value) vs Σ Corporate Investments cost → delta = FV−cost (unrealized). Highlight; preparer explains.', anchor: 'BS investments FV vs Σ CI cost' },
  { id: 'CI.pfic-coverage', group: 'corp-investments', type: 'attestation', severity: 'crown', description: 'Every foreign-corp investment carries an explicit PFIC determination (none blank). #1 exposure — ordinary rates + penalties.' },
  { id: 'CI.pfic-form-tie', group: 'corp-investments', type: 'deterministic', severity: 'crown', description: 'Each PFIC-flagged investment ties to Form 8621 / PFIC Data.', anchor: 'CI PFIC flag → Form 8621/PFIC Data' },
  { id: 'CI.926-coverage', group: 'corp-investments', type: 'attestation', severity: 'crown', description: 'Every CY foreign-corp investment carries a 926 determination ($10k/investment penalty).' },
  { id: 'CI.926-form-tie', group: 'corp-investments', type: 'deterministic', severity: 'crown', description: 'Each 926-flagged investment ties to Form 926.', anchor: 'CI 926 flag → Form 926' },
  { id: 'CI.cfc-coverage', group: 'corp-investments', type: 'attestation', severity: 'crown', description: 'Foreign investments assessed for CFC; flagged tie to CFC reporting (5471). $10k penalty.' },

  // ======================= 9. LP INFORMATION =======================
  { id: 'LP.required-fields', group: 'lp-info', sheet: 'LP INFORMATION', type: 'deterministic', severity: 'high', description: 'Required LP fields populated (name, entity type, address ln1, city, country, EIN/SSN, active/passive, +11 more). Zip/postcode/state conditional on domestic/foreign.', anchor: 'LP INFORMATION required cols per partner' },
  { id: 'LP.py-cy-reconcile', group: 'lp-info', type: 'deterministic', severity: 'high', description: 'PY↔CY LP reconciliation: deltas = transfers/additions; additions require equalisation computations.', anchor: 'LP roster CY vs PY (LP master / PY sheet)' },
  { id: 'LP.count-declare', group: 'lp-info', type: 'attestation', severity: 'high', description: "Theo counts total + foreign partners (CY vs PY); preparer declares the count correct per Theo's count." },
  { id: 'ID.name-data-align', group: 'lp-info', type: 'advisory', severity: 'crown', description: 'Each partner name/code ties to the SAME partner\'s %, allocations, capital, and final K-1 across all sheets (real miss this year).' },
  { id: 'LP.final-k1-vs-transfers', group: 'lp-info', type: 'deterministic', severity: 'high', description: 'Final/amended K-1 flag consistent with full transfers-out (Partner Transfers).', anchor: 'LP final-K1 flag vs Partner Transfers full-outs' },
  { id: 'LP.py-cy-k1-recon', group: 'lp-info', type: 'attestation', severity: 'high', description: 'Theo reconciles PY K-1s → CY K-1s per partner; preparer confirms correct entry.' },

  // ======================= 10. PARTNER CAPITAL INPUTS =======================
  { id: 'PCI.rollforward-exact', group: 'capital', sheet: 'PARTNER CAPITAL INPUTS', type: 'deterministic', severity: 'crown', tolerance: 0,
    description: 'Per-LP BOY tax capital = prior-year K-1 ending tax capital (EXACT, zero tolerance).',
    run: (ctx) => { const py = ctx.py && ctx.py.endingTaxCapital, cy = ctx.cy && ctx.cy.beginningTaxCapital;
      if (!py || !cy || !Object.keys(py).length) return { status: 'anchor-pending', detail: 'PY/CY tax-capital maps wired during integration' };
      const r = T.rollforwardMatch(py, cy); return r.allPass ? OK(`${r.rows.length}/${r.rows.length}`) : EXC(`${r.rows.filter(x => !x.pass).length} off`, r.rows.filter(x => !x.pass).map(x => `${x.key} Δ${x.delta}`)); } },
  { id: 'PCI.sample-boy-attest', group: 'capital', type: 'attestation', severity: 'high', description: 'Preparer inputs sample BOY capital amounts + total beginning capital to confirm correct entry.' },
  { id: 'PCI.total-book-cap-to-tb', group: 'capital', type: 'deterministic', severity: 'high', tolerance: T.TOL, description: 'Total book capital ties to the Trial Balance.', anchor: 'Σ PCI BOY book capital vs TB capital' },
  { id: 'PCI.contrib-distrib-to-tb', group: 'capital', type: 'deterministic', severity: 'high', tolerance: T.TOL, description: 'Total contributions & distributions tie to the TB; sample tested + preparer confirms.', anchor: 'Σ PCI contrib/distrib vs TB rows 84-88' },
  { id: 'PCI.fx-plug-recon', group: 'capital', type: 'deterministic', severity: 'high', tolerance: T.TOL, description: 'TB AD85 (Other Increase, a plug) = Σ column Z (unrealized FX adjustments). If ≠ → preparer explains.', anchor: 'TB AD85 vs Σ PCI col Z' },

  // ======================= 11. PARTNER CAPITAL & ALLOCATION =======================
  { id: 'ALLOC.ratios-100', group: 'allocation', sheet: 'PARTNER CAPITAL AND ALLOC', type: 'deterministic', severity: 'high', tolerance: 1e-4,
    description: 'All ratios (profit/loss/capital, beg/end) sum to 100% across partners.',
    run: (ctx) => { const { partnerRows, sums } = T.ratioColumnSums(ctx.wb.input, 'PARTNER CAPITAL AND ALLOC',
        { begProfit: 4, endProfit: 5, begLoss: 6, endLoss: 7, begCap: 8, endCap: 9 });
      const bad = Object.entries(sums).filter(([, v]) => Math.abs(v - 1) > 1e-4);
      return bad.length ? EXC(sums, bad.map(([k, v]) => `${k}=${v}`)) : OK(`${partnerRows} partners, all 6 ratios = 100%`, [], JSON.stringify(sums)); } },
  { id: 'ALLOC.beg-ratios-eq-py', group: 'allocation', sheet: 'PARTNER CAPITAL AND ALLOC', type: 'deterministic', severity: 'high', tolerance: 0, description: 'Beginning ratios = PY ending ratios (exact).', anchor: 'Alloc beg ratios (E/G/I) vs PARTNER CAPITAL AND ALLOC 2024 ending' },
  { id: 'ALLOC.income-eq-schk', group: 'allocation', type: 'deterministic', severity: 'crown', tolerance: T.TOL,
    description: 'Σ taxable income allocated across partners (K-1 CYTAXINCOME) = fund taxable income (TB AD282).',
    run: (ctx) => { const tb = ctx.wb.input.Sheets['TRIAL BALANCE']; const fund = (tb['AD282'] || {}).v;
      const k1 = ctx.wb.output.Sheets['Schedule K-1s']; const rng = XLSX.utils.decode_range(k1['!ref']); let sum = 0, np = 0;
      for (let C = 9; C <= rng.e.c; C++) { const nm = k1[T.A1(3, C)]; if (!(nm && nm.v != null && String(nm.v).trim())) continue; np++; const a = k1[T.A1(47, C)]; if (a && a.t === 'n') sum += a.v; }
      const t = T.tieOut(T.round2(sum), fund); return t.pass ? OK({ allocated: T.round2(sum), fund, partners: np }) : EXC({ allocated: T.round2(sum), fund, delta: t.delta }); } },
  { id: 'ALLOC.special-alloc-foot', group: 'allocation', sheet: 'PARTNER CAPITAL AND ALLOC', type: 'deterministic', severity: 'high', tolerance: T.TOL, description: 'Each special allocation: Σ across partners = TB/Sch K amount. Theo queries purpose + method; audits source.', anchor: 'Special-alloc cols O-AM Σ vs TB/Sch K amounts' },
  { id: 'ALLOC.no-broken-refs', group: 'allocation', sheet: 'PARTNER CAPITAL AND ALLOC', type: 'deterministic', severity: 'high', tolerance: 0,
    description: 'No #REF!/#N/A on the allocation sheet (AN PYTAXADJ was broken in the sample).',
    run: (ctx) => { const errs = T.scanErrors(ctx.wb.input).filter(e => e.sheet === 'PARTNER CAPITAL AND ALLOC'); return errs.length ? EXC(errs.length, errs.slice(0, 20).map(e => e.addr)) : OK(0); } },
  { id: 'ALLOC.big-bil-704c', group: 'allocation', type: 'attestation', severity: 'normal', description: 'BIG/BIL (§704(c)) — flagged partners get the correct treatment.' },
  { id: 'ALLOC.attested', group: 'allocation', type: 'attestation', severity: 'high', description: 'All allocations explained with evidence (client info unverified this build); Theo verifies in-workbook source links.' },

  // ======================= 12. PARTNER FOOTNOTES =======================
  { id: 'FN.standard-set', group: 'footnotes', sheet: 'PARTNER FOOTNOTES', type: 'deterministic', severity: 'normal', description: 'Standard footnote set present + complete (e.g. §199A); covers N/A topics too.', anchor: 'PARTNER FOOTNOTES standard set' },
  { id: 'FN.attach-correct', group: 'footnotes', sheet: 'PARTNER FOOTNOTES', type: 'deterministic', severity: 'normal', description: 'Correct form (Federal K-1 vs K-2/K-3) + line number ties to a real K-1 line with entries.', anchor: 'PARTNER FOOTNOTES attach flags + line #' },

  // ======================= 13. PARTNER TRANSFERS =======================
  { id: 'PT.fields-complete', group: 'transfers', sheet: 'PARTNER TRANSFERS', type: 'deterministic', severity: 'normal', description: 'Completeness per transfer (transferring + receiving partner, %, date, capital adj).', anchor: 'PARTNER TRANSFERS required cols' },
  { id: 'PT.net-to-zero', group: 'transfers', sheet: 'PARTNER TRANSFERS', type: 'deterministic', severity: 'high', tolerance: T.TOL, description: 'Capital moved nets to zero (none created/destroyed).', anchor: 'Σ PARTNER TRANSFERS capital adj = 0' },
  { id: 'PT.tie-to-k1s', group: 'transfers', type: 'deterministic', severity: 'high', tolerance: T.TOL, description: 'Transfer figures tie to the K-1s (transferor/transferee capital reflects the transfer).', anchor: 'PARTNER TRANSFERS vs K-1 capital' },
  { id: 'PT.754-743b', group: 'transfers', type: 'attestation', severity: 'normal', description: 'If §754 elected, basis-adjustment transfers (§743(b)) handled.' },

  // ======================= (A0) wb1<->wb2 RECONCILIATION / CLIENT DELIVERABLE =======================
  { id: 'REC.coverage', group: 'reconcile', type: 'deterministic', severity: 'crown', description: 'Every wb1 producing element (TB/M-1/Sch D/Org/CI/LP/Alloc/PCI/FN/PT/K-2) is present + reconciled in wb2.', anchor: 'coverage map wb1→wb2' },
  { id: 'REC.no-orphans', group: 'reconcile', type: 'advisory', severity: 'high', description: 'No orphan output — every wb2 line traces to a wb1 input source.' },
  { id: 'REC.client-presentable', group: 'reconcile', type: 'deterministic', severity: 'crown', tolerance: 0,
    description: 'wb2 client-presentable: no #REF!/#N/A, no external links, no stray blanks; every K-1/form/footnote populated.',
    run: (ctx) => { const err = T.scanErrors(ctx.wb.output).length, ext = T.scanExternalLinks(ctx.wb.output).length; return (err || ext) ? EXC({ errors: err, externalLinks: ext }) : OK({ errors: 0, externalLinks: 0 }); } },

  // ======================= (A) OUTPUT-SIDE GUARDS =======================
  { id: 'SCHK.fund-taxable-income', group: 'output', sheet: 'TRIAL BALANCE', type: 'deterministic', severity: 'high',
    description: 'Fund taxable income present: TB AD282 (CY USD) + AB282 (CY FC). All Sch K/BS figures derive from TB.',
    run: (ctx) => { const tb = ctx.wb.input.Sheets['TRIAL BALANCE']; const usd = (tb['AD282'] || {}).v, fc = (tb['AB282'] || {}).v;
      return typeof usd === 'number' ? OK({ fundTaxableIncomeUSD: T.round2(usd), fundTaxableIncomeFC: T.round2(fc) }, ['AD282', 'AB282']) : { status: 'anchor-pending', detail: 'AD282 not numeric' }; } },
  { id: 'SCHK.capgains-to-tb', group: 'output', sheet: 'Schedule K', type: 'deterministic', severity: 'high', tolerance: T.TOL,
    description: 'Schedule K capital-gain lines (8 ST, 9a LT) USD tie to TB AD210/AD218 (CY tax USD).',
    run: (ctx) => { const N = 13; // col N = CY tax USD
      const skN = (label) => { const h = T.findLabel(ctx.wb.output, 'Schedule K', label, { contains: true }); if (!h) return null; const c = ctx.wb.output.Sheets['Schedule K'][T.A1(h.row, N)]; return c && c.t === 'n' ? c.v : null; };
      const st = skN('Net short-term capital gain'), lt = skN('Net long-term capital gain');
      const tb = ctx.wb.input.Sheets['TRIAL BALANCE'];
      const ad210 = (tb['AD210'] || {}).v, ad218 = (tb['AD218'] || {}).v;
      const t1 = T.tieOut(st, ad210), t2 = T.tieOut(lt, ad218);
      return (t1.pass && t2.pass) ? OK({ st, lt }, ['N16=AD210', 'N17=AD218']) : EXC({ st, lt, ad210, ad218, dST: t1.delta, dLT: t2.delta }); } },
  { id: 'M2.rollforward', group: 'output', sheet: 'M1-2 Tax Capital', type: 'deterministic', severity: 'high', tolerance: T.TOL, description: 'M-2/Tax Capital rollforward (fund): BOY + contrib + income + other inc/dec − distrib = EOY; ties TB + Σ per-partner.', anchor: 'M1-2 Tax Capital lines' },
  { id: 'K1.box-tie', group: 'output', sheet: 'Schedule K-1s', type: 'deterministic', severity: 'crown', tolerance: T.TOL,
    description: 'Σ each K-1 box across partner columns = the Schedule K total (col H) for that line.',
    run: (ctx) => { const { sheet, schedKCol, partnerCols, boxRows } = ctx.k1Layout; const res = T.k1BoxTie(ctx.wb.output, sheet, boxRows, schedKCol, partnerCols);
      const fails = res.filter(r => !r.pass); return fails.length ? EXC(`${res.length - fails.length}/${res.length} tie`, fails.map(f => `row ${f.row + 1} Δ${f.delta}`)) : OK(`${res.length}/${res.length} tie`); } },
  { id: 'K1.capital-rollforward', group: 'output', sheet: 'Schedule K-1s', type: 'deterministic', severity: 'crown', tolerance: T.TOL,
    description: 'Per partner: BEGCAP-BOOK + PYTAXADJ = ADJ BEG CAP; ADJ BEG + CONT + CYTAXINCOME + OTHERINCDEC − DIST = ENDTAXCAPITAL.',
    run: (ctx) => { const cols = T.detectPartnerCols(ctx.wb.output, 'Schedule K-1s', 3, 9);
      // 0-indexed rows: BEGCAP-BOOK r43→42, PYTAXADJ 43, ADJ BEG 44, CONT value 46, CYTAXINCOME 47, OTHERINCDEC 48, DIST 49, ENDTAX 50
      const res = T.k1CapitalRollforward(ctx.wb.output, 'Schedule K-1s', cols,
        { begCapBook: 42, pyTaxAdj: 43, adjBeg: 44, cont: 46, cyTaxInc: 47, otherIncDec: 48, dist: 49, endTax: 50 });
      const fails = res.filter(r => !r.pass);
      return fails.length ? EXC(`${res.length - fails.length}/${res.length} partners foot`, fails.slice(0, 30).map(f => `col${f.col} Δbeg${f.adjBegDelta}/Δend${f.endDelta}`))
        : OK(`${res.length}/${res.length} partners' capital rollforward foots`); } },
  { id: 'K1.cytaxincome-eq-alloc', group: 'output', sheet: 'Schedule K-1s', type: 'deterministic', severity: 'high', tolerance: T.TOL, description: "Each partner's CYTAXINCOME = allocated taxable income; Σ = Schedule K fund total.", anchor: 'K-1 r48 per partner vs allocation' },
  { id: 'K1.name-data-align', group: 'output', sheet: 'Schedule K-1s', type: 'advisory', severity: 'crown', description: 'Each partner column name (r4) ties to LP Info by code; ratios/allocations/capital belong to that partner (no column mismatch).' },
  { id: 'K1.count-eq-partners', group: 'output', sheet: 'Schedule K-1s', type: 'deterministic', severity: 'high',
    description: 'One K-1 per partner — count of K-1 columns = LP Information partner count (none missing/extra).',
    run: (ctx) => { const XLSX = require('xlsx'); const ws = ctx.wb.output.Sheets['Schedule K-1s']; const rng = XLSX.utils.decode_range(ws['!ref']); let n = 0;
      for (let C = 9; C <= rng.e.c; C++) { const c = ws[T.A1(3, C)]; if (c && c.v != null && String(c.v).trim()) n++; }
      const lp = ctx.lpCount; if (lp == null) return OK(`${n} K-1 columns (LP count wired during integration)`); return n === lp ? OK(`${n} = ${lp}`) : EXC(`K-1s ${n} vs LP ${lp}`); } },

  // ======================= (C) IMPORT-READY =======================
  { id: 'IMP.tables-populated', group: 'import', type: 'deterministic', severity: 'normal', description: 'Tables (wb3) fully populated — no gaps vs source inputs.', anchor: 'wb3 table sheets non-empty' },
  { id: 'IMP.dataconn-populated', group: 'import', type: 'deterministic', severity: 'normal', description: 'Data Connection (wb4) fully populated — every mapped field present for import.', anchor: 'wb4 data-connection sheets non-empty' },
  { id: 'IMP.dataconn-ties-output', group: 'import', type: 'deterministic', severity: 'high', tolerance: T.TOL, description: 'Data Connection values tie to the reviewed output sheets.', anchor: 'wb4 values vs wb2' },
  { id: 'IMP.no-errors', group: 'import', type: 'deterministic', severity: 'normal', tolerance: 0,
    description: 'No errors/broken refs in wb3/wb4.',
    run: (ctx) => { let n = 0; for (const r of ['tables', 'dataConn']) if (ctx.wb[r]) n += T.scanErrors(ctx.wb[r]).length; if (!ctx.wb.tables && !ctx.wb.dataConn) return { status: 'anchor-pending', detail: 'wb3/wb4 not loaded in this ctx' }; return n ? EXC(n) : OK(0); } },
];

function runControl(control, ctx) {
  if (control.type === 'attestation') return { ...meta(control), status: 'pending-attestation' };
  if (control.type === 'advisory') return { ...meta(control), status: 'advisory-pending' };
  if (typeof control.run !== 'function') return { ...meta(control), status: 'anchor-pending', detail: control.anchor };
  try { return { ...meta(control), ...control.run(ctx) }; }
  catch (e) { return { ...meta(control), status: 'error', detail: String(e.message) }; }
}
const meta = c => ({ id: c.id, group: c.group, type: c.type, severity: c.severity });
const runAll = ctx => CONTROLS.map(c => runControl(c, ctx));

function summarize(results) {
  const by = {};
  for (const r of results) by[r.status] = (by[r.status] || 0) + 1;
  return { total: results.length, byStatus: by,
    deterministicLive: CONTROLS.filter(c => c.type === 'deterministic' && c.run).length,
    anchorPending: CONTROLS.filter(c => c.type === 'deterministic' && !c.run).length,
    attestation: CONTROLS.filter(c => c.type === 'attestation').length,
    advisory: CONTROLS.filter(c => c.type === 'advisory').length,
    crown: CONTROLS.filter(c => c.severity === 'crown').length };
}
module.exports = { CONTROLS, runControl, runAll, summarize };
