// Vault Theo — root. Renders the federated Theo surface (Phase 1A, Pass B). Standalone here
// (vault-theo-dev harness); in Origin, `theoApp/TheoSurface` is consumed via Module Federation
// and handed the shell AppHostContext + mount slots.
import TheoSurface from "./theo/TheoSurface";

export default function App() {
  return <TheoSurface />;
}
