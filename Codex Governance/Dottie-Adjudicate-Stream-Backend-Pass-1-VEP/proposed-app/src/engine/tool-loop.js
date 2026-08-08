'use strict';
/**
 * Custom NON-STREAMING tool-use loop — the reusable spine (Theo's future file/email tools use the same shape).
 * Theo emits tool_use → we run the deterministic tool → return tool_result → loop until Theo stops calling tools.
 * Model access reuses Theo's Foundry/Claude gateway; the anti-fabrication ruleset is prepended as the leading system block.
 * Theo ORCHESTRATES + JUDGES; the tools do ALL arithmetic.
 *
 * Extensible tool registry: add a tool = one entry in TOOL_SCHEMAS + one case in dispatch(). All tools are pure
 * functions of ctx (the parsed workbook set), so every call is deterministic + repeatable within a loaded ctx.
 */
const T = require('./sheet-tools');
const { CONTROLS, runControl } = require('./registry');

// Anthropic tool schemas exposed to Claude (deterministic tools only — no web tools; every figure is engine-computed).
const TOOL_SCHEMAS = [
  { name: 'find_label', description: 'Locate a cell by its label text on a sheet (anchor by meaning, not a fixed address).',
    input_schema: { type: 'object', properties: { workbook: { type: 'string' }, sheet: { type: 'string' }, text: { type: 'string' } }, required: ['workbook', 'sheet', 'text'] } },
  { name: 'get_range', description: 'Read column values (+ formulas) for a sheet region.',
    input_schema: { type: 'object', properties: { workbook: { type: 'string' }, sheet: { type: 'string' }, col: { type: 'number' }, rowStart: { type: 'number' }, rowEnd: { type: 'number' } }, required: ['workbook', 'sheet', 'col', 'rowStart', 'rowEnd'] } },
  { name: 'tie_out', description: 'Compare two amounts within tolerance ($1 default). Returns {delta, pass}.',
    input_schema: { type: 'object', properties: { a: { type: 'number' }, b: { type: 'number' }, tol: { type: 'number' } }, required: ['a', 'b'] } },
  { name: 'k1_box_tie', description: 'Σ each K-1 box across partners vs the Schedule K total.',
    input_schema: { type: 'object', properties: {} } },
  { name: 'scan_external_links', description: 'List external-workbook links (integrity).',
    input_schema: { type: 'object', properties: { workbook: { type: 'string' } } } },
  { name: 'scan_errors', description: 'List #REF!/#N/A/error cells.',
    input_schema: { type: 'object', properties: { workbook: { type: 'string' } } } },
  // ---- review-agent additions (Sigma Backend-2): drill + re-verify -------------------------------
  { name: 'list_sheets', description: 'List the sheet/tab names in a workbook (input | output | tables | dataConn).',
    input_schema: { type: 'object', properties: { workbook: { type: 'string' } }, required: ['workbook'] } },
  { name: 'read_cell', description: 'Read one cell by exact A1 address on a sheet — returns {value, formula, type, isError}.',
    input_schema: { type: 'object', properties: { workbook: { type: 'string' }, sheet: { type: 'string' }, addr: { type: 'string' } }, required: ['workbook', 'sheet', 'addr'] } },
  { name: 'recompute_control', description: 'Re-run ONE deterministic control by id against the current workbooks and return its fresh result (status, computed, cells) — use to re-verify after the preparer says they fixed something.',
    input_schema: { type: 'object', properties: { control_id: { type: 'string' } }, required: ['control_id'] } },
];

// Route a tool_use block to its deterministic implementation. Every tool is a pure function of ctx.
function dispatch(name, input, ctx) {
  const wb = ctx.wb[input.workbook || 'output'];
  switch (name) {
    case 'find_label': return T.findLabel(wb, input.sheet, input.text);
    case 'get_range': return T.columnValues(wb, input.sheet, input.col, input.rowStart, input.rowEnd);
    case 'tie_out': return T.tieOut(input.a, input.b, input.tol);
    case 'k1_box_tie': { const { sheet, schedKCol, partnerCols, boxRows } = ctx.k1Layout; return T.k1BoxTie(ctx.wb.output, sheet, boxRows, schedKCol, partnerCols); }
    case 'scan_external_links': return T.scanExternalLinks(wb);
    case 'scan_errors': return T.scanErrors(wb);
    case 'list_sheets': return { workbook: input.workbook, sheets: wb && Array.isArray(wb.SheetNames) ? wb.SheetNames : [] };
    case 'read_cell': return T.getCell(wb, input.sheet, input.addr);
    case 'recompute_control': {
      const control = CONTROLS.find((c) => c.id === input.control_id);
      if (!control) return { error: `unknown control ${input.control_id}` };
      return runControl(control, ctx);
    }
    default: throw new Error(`unknown tool ${name}`);
  }
}

/**
 * Run the loop for one review task.
 * @param callModel injected Foundry/Claude client: async ({system, tools, messages}) => {content:[...]}
 * Returns { final: <last model response>, convo, toolTrace: [{name, input}] }.
 */
async function runReviewLoop({ system, messages, ctx, callModel, maxTurns = 40 }) {
  const convo = [...messages];
  const toolTrace = [];
  for (let turn = 0; turn < maxTurns; turn++) {
    const resp = await callModel({ system, tools: TOOL_SCHEMAS, messages: convo });
    convo.push({ role: 'assistant', content: resp.content });
    const toolUses = (resp.content || []).filter((b) => b.type === 'tool_use');
    if (!toolUses.length) return { final: resp, convo, toolTrace };     // Theo finished judging
    const results = toolUses.map((tu) => {
      toolTrace.push({ name: tu.name, input: tu.input });
      let out; try { out = dispatch(tu.name, tu.input, ctx); } catch (e) { out = { error: String(e.message) }; }
      return { type: 'tool_result', tool_use_id: tu.id, content: JSON.stringify(out) };
    });
    convo.push({ role: 'user', content: results });
  }
  throw new Error('tool loop exceeded maxTurns');
}

module.exports = { TOOL_SCHEMAS, dispatch, runReviewLoop };
