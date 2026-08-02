import type { ConversationSummary, ConversationDetail, Person } from '../types';

// Theo Snapshot Storage Exception (Governor item 3, Walter-authorized 2026-07-29): a per-principal
// localStorage instant-paint seed for the three cold-launch round-trips — recents, the last-opened
// conversation's first page, and the self-identity row. Always revalidated by the governed loaders
// (theo_list_conversations / theo_get_conversation / listPeople), so it is a seed, never an
// authoritative read (Exception §3b — not a snapshot lane). NEVER tokens/secrets/deep history.
//
// SECURITY BOUNDARY (Exception §2, binding): the cache is read/written ONLY under the CONFIRMED
// current principal's namespace vault-theo:v1:<oid>:*. The principal is confirmed by decoding the
// Entra `oid` claim of the live, server-issued access token; bindPrincipal() then purges every OTHER
// principal's namespace. Until bindPrincipal has run, ALL reads/writes are DISABLED (return null /
// no-op) — so no prior-principal state can ever be read or rendered before the current principal is
// confirmed. There is deliberately NO un-namespaced pointer that could seed a namespace before
// confirmation (a prior "last-oid" design was a cross-principal leak; removed). All access try/guarded.

const PREFIX = 'vault-theo:v1:';

let principal: string | null = null; // set ONLY by bindPrincipal, after the token oid is confirmed

function nsKey(oid: string, k: string): string { return `${PREFIX}${oid}:${k}`; }
function get<T>(k: string): T | null {
  if (!principal) return null; // disabled until the current principal is confirmed
  try {
    const raw = localStorage.getItem(nsKey(principal, k));
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function set(k: string, v: unknown): void {
  if (!principal) return; // disabled until the current principal is confirmed
  try {
    localStorage.setItem(nsKey(principal, k), JSON.stringify(v));
  } catch {
    /* quota / privacy mode — the in-memory behavior of today remains */
  }
}

// Decode the Entra OID from a JWT payload without verifying (namespace key only; auth is server-side).
function oidFromJwt(token: string): string | null {
  try {
    const p = token.split('.');
    if (p.length !== 3) return null;
    const json = JSON.parse(decodeURIComponent(escape(atob(p[1].replace(/-/g, '+').replace(/_/g, '/')))));
    return (json.oid as string) || (json['http://schemas.microsoft.com/identity/claims/objectidentifier'] as string) || null;
  } catch {
    return null;
  }
}

// Bind the CONFIRMED principal and purge every OTHER principal's namespace (the active foreign-purge,
// Exception §2). Idempotent. After this, get/set operate under this principal only.
export function bindPrincipal(oid: string): void {
  if (!oid) return;
  principal = oid;
  try {
    const keep = `${PREFIX}${oid}:`;
    const drop: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(PREFIX) && !key.startsWith(keep)) drop.push(key);
    }
    for (const key of drop) localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function isPrincipalBound(): boolean {
  return principal !== null;
}

// Resolve + CONFIRM the principal from the live access token, then bind (+ purge). MUST resolve before
// any cache read (callers await it before seeding). Returns the confirmed oid, or null (⇒ cache stays
// disabled → today's cold load, safe). No un-namespaced state is ever consulted.
export async function resolvePrincipal(getAccessToken?: (() => Promise<string | null>) | null): Promise<string | null> {
  if (!getAccessToken) return null;
  try {
    const tok = await getAccessToken();
    const oid = tok ? oidFromJwt(tok) : null;
    if (oid) {
      bindPrincipal(oid);
      return oid;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function getCachedRecents(): ConversationSummary[] | null {
  return get<ConversationSummary[]>('recents');
}
export function setCachedRecents(list: ConversationSummary[]): void {
  set('recents', list);
}
export function getCachedConversation(id: string): ConversationDetail | null {
  return get<ConversationDetail>(`conv:${id}`);
}
export function setCachedConversation(id: string, detail: ConversationDetail): void {
  set(`conv:${id}`, detail);
}
export function getCachedSelf(): Person | null {
  return get<Person>('self');
}
export function setCachedSelf(self: Person): void {
  set('self', self);
}
