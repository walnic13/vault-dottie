import React from "react";
import Console from "./components/Console.jsx";

// Dottie — the governance-and-second-opinion console. Heavily Theo-derived, distinct identity:
// a committed dark "ink" surface, the Vault Spiral-of-Theodorus mark rendered as Dottie's DECONSTRUCTING
// logo, and real-time gpt-5 streaming via dottie_message_stream. Standalone-deployable to the SWA;
// federation-ready for the Vault Origin shell (host injects window.__DOTTIE_CONFIG__).
export default function App() {
  return <Console />;
}
