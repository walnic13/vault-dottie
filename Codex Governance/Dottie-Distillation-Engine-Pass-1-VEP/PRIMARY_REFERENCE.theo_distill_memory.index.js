const https = require("https");
const { Pool } = require("pg");

const FOUNDRY_BASE = process.env.THEO_FOUNDRY_BASE;
const FOUNDRY_DEPLOYMENT = process.env.THEO_FOUNDRY_DEPLOYMENT;
const ANTHROPIC_VERSION = "2023-06-01";
const CONTENT_MAX_LEN = 4000;
const KIND_MAX_LEN = 64;
const TRANSCRIPT_MAX_CHARS = 24000;

function parsePositiveInt(value, fallback) {
  const n = parseInt(value, 10);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}

// Tunable via app settings; safe defaults per D-7 (distill on idle/close; cheap extraction; durable facts only).
const IDLE_MINUTES = parsePositiveInt(process.env.THEO_DISTILL_IDLE_MINUTES, 30);
const BATCH = parsePositiveInt(process.env.THEO_DISTILL_BATCH, 20);
const MAX_FACTS = parsePositiveInt(process.env.THEO_DISTILL_MAX_FACTS, 8);
const DISTILL_MAX_TOKENS = parsePositiveInt(process.env.THEO_DISTILL_MAX_TOKENS, 1024);

// Persistence pool (shared `vaultgpt` instance). The timer is a server-side batch process with no user
// identity; it reads across owners (the connection role bypasses RLS) and writes each memory row with
// created_by = the conversation's owner explicitly (never RLS-derived).
const pool = new Pool({
  connectionString: process.env.POSTGRES_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false },
});

function parseJsonSafe(raw) {
  if (typeof raw !== "string" || raw.trim() === "") return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function requestUrl(urlStr, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const req = https.request(
      {
        method: options.method || "GET",
        hostname: url.hostname,
        port: url.port ? Number(url.port) : 443,
        path: url.pathname + url.search,
        headers: options.headers || {},
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          resolve({ statusCode: res.statusCode || 0, headers: res.headers || {}, body: data });
        });
      }
    );
    req.on("error", reject);
    if (body) {
      req.write(body);
    }
    req.end();
  });
}

async function getFoundryToken() {
  const tenantId = process.env.AAD_TENANT_ID;
  const clientId = process.env.AAD_CLIENT_ID;
  const clientSecret = process.env.AAD_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error("Missing required model gateway configuration.");
  }

  const form = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
    scope: "https://ai.azure.com/.default",
  }).toString();

  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const r = await requestUrl(
    tokenUrl,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(form),
      },
    },
    form
  );

  const payload = parseJsonSafe(r.body);
  if (r.statusCode < 200 || r.statusCode >= 300 || !payload || !payload.access_token) {
    throw new Error("Model gateway token request failed.");
  }
  return payload.access_token;
}

const EXTRACTION_SYSTEM =
  "You extract durable, long-term memory about the USER from a chat transcript with a tax assistant. " +
  "Return ONLY a JSON array (no prose, no code fences) of at most %MAX% objects, each " +
  '{"content": string, "kind": "fact"|"preference"|"profile", "salience": integer 0-10}. ' +
  "Include ONLY stable facts/preferences about the user that would help in future, unrelated chats " +
  "(e.g. their name, role, firm, working/style preferences, recurring entities or matters they own). " +
  "EXCLUDE one-off question content, transient task details, anything already present in EXISTING MEMORY, " +
  "and any third party's confidential data. If nothing qualifies, return [].";

module.exports = async function (context, distillTimer) {
  if (!FOUNDRY_BASE || !FOUNDRY_DEPLOYMENT) {
    context.log.error("theo_distill_memory: missing model gateway configuration");
    return;
  }

  let token;
  try {
    token = await getFoundryToken();
  } catch (err) {
    context.log.error("theo_distill_memory: token acquisition failed", err);
    return;
  }

  const client = await pool.connect();
  try {
    // Cross-owner due-scan via a SECURITY DEFINER helper (runs as the owner → bypasses RLS). The timer
    // has no signed-in user, so a direct RLS-scoped scan would match nothing; the helper returns only
    // ids + owners for scheduling. All actual reads/writes below run under each owner's set_config context.
    const due = await client.query(
      `SELECT id, created_by FROM public.theo_due_conversations($1, $2)`,
      [IDLE_MINUTES, BATCH]
    );

    context.log(`theo_distill_memory: ${due.rowCount} conversation(s) due`);

    for (const conv of due.rows) {
      try {
        // Establish this conversation's owner context so RLS permits the per-owner reads/writes below
        // (insert WITH CHECK created_by = auth.uid(); select/update USING created_by = auth.uid()).
        await client.query(
          `
          SELECT
            set_config('app.current_user_id', $1, false),
            set_config('request.jwt.claim.sub', $1, false),
            set_config('request.jwt.claim.oid', $1, false)
          `,
          [conv.created_by]
        );

        const msgs = await client.query(
          `
          SELECT role, content
          FROM public.theo_messages
          WHERE conversation_id = $1 AND created_by = $2
          ORDER BY seq ASC, created_at ASC
          `,
          [conv.id, conv.created_by]
        );

        if (msgs.rowCount === 0) {
          await client.query(
            `UPDATE public.theo_conversations SET last_distilled_at = now() WHERE id = $1 AND created_by = $2`,
            [conv.id, conv.created_by]
          );
          continue;
        }

        const existing = await client.query(
          `
          SELECT content
          FROM public.theo_user_memory
          WHERE created_by = $1 AND scope = 'user'
          ORDER BY salience DESC, updated_at DESC
          LIMIT 100
          `,
          [conv.created_by]
        );

        const transcript = msgs.rows
          .map((m) => `${m.role}: ${typeof m.content === "string" ? m.content : ""}`)
          .join("\n")
          .slice(0, TRANSCRIPT_MAX_CHARS);
        const existingList = existing.rows.map((r) => `- ${r.content}`).join("\n") || "(none)";

        const systemPrompt = EXTRACTION_SYSTEM.replace("%MAX%", String(MAX_FACTS));
        const userContent = `EXISTING MEMORY:\n${existingList}\n\nTRANSCRIPT:\n${transcript}`;
        const payload = JSON.stringify({
          model: FOUNDRY_DEPLOYMENT,
          max_tokens: DISTILL_MAX_TOKENS,
          system: systemPrompt,
          messages: [{ role: "user", content: userContent }],
          stream: false,
        });

        const upstream = await requestUrl(
          `${FOUNDRY_BASE}/anthropic/v1/messages`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              "anthropic-version": ANTHROPIC_VERSION,
              "Content-Length": Buffer.byteLength(payload),
            },
          },
          payload
        );

        let facts = [];
        const parsed = parseJsonSafe(upstream.body);
        if (upstream.statusCode >= 200 && upstream.statusCode < 300 && parsed && Array.isArray(parsed.content)) {
          const text = parsed.content
            .filter((b) => b && b.type === "text")
            .map((b) => (typeof b.text === "string" ? b.text : ""))
            .join("")
            .trim();
          const arr = parseJsonSafe(text);
          if (Array.isArray(arr)) {
            facts = arr;
          }
        } else {
          context.log.error(`theo_distill_memory: extraction non-2xx for ${conv.id}`, upstream.statusCode);
        }

        await client.query("BEGIN");
        let inserted = 0;
        for (const f of facts.slice(0, MAX_FACTS)) {
          const content =
            f && typeof f.content === "string" ? f.content.trim().slice(0, CONTENT_MAX_LEN) : "";
          if (content === "") continue;
          const kind =
            f && typeof f.kind === "string" && f.kind.trim() !== "" ? f.kind.trim().slice(0, KIND_MAX_LEN) : "fact";
          const salience =
            f && Number.isInteger(f.salience) ? Math.max(0, Math.min(10, f.salience)) : 0;
          await client.query(
            `
            INSERT INTO public.theo_user_memory
              (created_by, scope, project_id, kind, content, source_conversation_id, salience)
            VALUES ($1, 'user', NULL, $2, $3, $4, $5)
            `,
            [conv.created_by, kind, content, conv.id, salience]
          );
          inserted++;
        }
        await client.query(
          `UPDATE public.theo_conversations SET last_distilled_at = now() WHERE id = $1 AND created_by = $2`,
          [conv.id, conv.created_by]
        );
        await client.query("COMMIT");

        context.log(`theo_distill_memory: conversation ${conv.id} -> ${inserted} memory item(s)`);
      } catch (convErr) {
        try { await client.query("ROLLBACK"); } catch {}
        context.log.error(`theo_distill_memory: conversation ${conv.id} failed`, convErr);
        // Mark distilled so a persistently-failing conversation does not hot-loop the batch each tick;
        // it re-distills only if it gains new activity (updated_at advances).
        try {
          await client.query(
            `UPDATE public.theo_conversations SET last_distilled_at = now() WHERE id = $1 AND created_by = $2`,
            [conv.id, conv.created_by]
          );
        } catch (markErr) {
          context.log.error(`theo_distill_memory: watermark update failed for ${conv.id}`, markErr);
        }
      }
    }
  } catch (err) {
    context.log.error("theo_distill_memory: batch failed", err);
  } finally {
    client.release();
  }
};
