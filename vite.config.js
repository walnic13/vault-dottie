import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dottie FE — a Vite/React app that (a) deploys standalone to the dev/prod SWAs and (b) will be
// promoted to a Theo-derived module-federation REMOTE mounted in the Vault Origin shell (like
// DMS/Sigma). Federation wiring is added in the FE VEP; this scaffold builds a standalone frame.
export default defineConfig({
  plugins: [react()],
  build: { outDir: "dist" },
});
