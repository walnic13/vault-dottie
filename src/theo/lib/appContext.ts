// App-context label helper (Pass B; GREENFIELD — Plan §3 Pass B; VA-T3 §2.4 label example).
// Maps an inbound {app_key, app_context} to the header-chip label, e.g. "Corporate Reporting · Workpaper".
// Presentational only — never fetches app data (1A handover §2.4).
import type { AppContext } from "../types";

// app_key → display name. app_key is an opaque string from Origin; unknown keys fall back to the raw key.
const APP_NAMES: Record<string, string> = {
  reporting: "Corporate Reporting",
  axis: "Vault Axis",
  pfic: "PFIC",
  "structure-charts": "Structure Charts",
  advisory: "Advisory",
  sigma: "Review assistant",
};

export function appContextLabel(ctx: AppContext): string | null {
  if (!ctx || ctx.app_key === null) return null; // Origin-level general chat ⇒ no chip
  const name = APP_NAMES[ctx.app_key] ?? ctx.app_key;
  const c = ctx.app_context;
  let anchor = "";
  if (c && typeof c === "object") {
    if ("workpaper_id" in c) anchor = "Workpaper";
    else if ("sigma_review_id" in c) anchor = typeof c.fund_name === "string" ? String(c.fund_name) : "Review";
    else if (Object.keys(c).length > 0) anchor = "Context";
  }
  return anchor ? `${name} · ${anchor}` : name;
}
