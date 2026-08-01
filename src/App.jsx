import React from "react";

// Dottie frame (scaffold). A standalone placeholder that proves the SWA CI/CD + a landing surface.
// The real governance console (query Dottie; drift / review-chain / tag-integrity views) is built in
// the FE VEP, backed by vaultgpt-func-dottie → in-tenant Azure OpenAI (keyless via MI).
export default function App() {
  return (
    <div className="dottie-shell">
      <header className="dottie-header">
        <div className="dottie-mark" aria-hidden="true">D</div>
        <div>
          <h1>Dottie</h1>
          <p className="dottie-sub">Vault governance observer · L4</p>
        </div>
        <span className="dottie-badge">frame · scaffold</span>
      </header>

      <main className="dottie-main">
        <section className="dottie-card">
          <h2>What Dottie is</h2>
          <p>
            The observational governance layer of the Vault memory architecture. Dottie watches the
            shared record for <strong>tag drift</strong>, <strong>review-chain integrity</strong>,
            <strong> appropriate-access anomalies</strong>, and <strong>systemic patterns</strong> —
            reading L1.5 / L2 / L3, <strong>never L1</strong> (personal memory is inviolable).
            Dottie observes; it does not gate. The write-time security control (the Tag Guard) already
            runs inside the access-policy engine.
          </p>
        </section>

        <section className="dottie-card">
          <h2>How it's wired</h2>
          <ul>
            <li><strong>Model:</strong> in-tenant Azure OpenAI — a deliberately different model from Theo's Claude (governance-observer independence).</li>
            <li><strong>Keyless:</strong> reached via managed identity; no keys, data stays in-tenant.</li>
            <li><strong>Surface:</strong> a Theo-derived console, mounted in the Vault Origin shell.</li>
          </ul>
        </section>

        <section className="dottie-card dottie-status">
          <h2>Status</h2>
          <p>Scaffold live. The API connection + governance console are framed out next; the
          observational ruleset is tuned as L1.5 / L2 / L3 populate. (Vault Memory Architecture §A
          Amendment 8 — priority pulled forward, frame-first.)</p>
        </section>
      </main>

      <footer className="dottie-footer">Vault · Dottie scaffold</footer>
    </div>
  );
}
