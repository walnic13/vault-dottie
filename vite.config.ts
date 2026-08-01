import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

// Vite + React + TS + Module Federation (Pass B). Theo is exposed as the federated remote
// `theoApp/TheoSurface` so the Vault Origin shell mounts it in-shell (no iframe; App Host §1A/§6A),
// while this same build still runs standalone as the vault-theo-dev harness. Build output → `dist`
// (the SWA workflow deploys `output_location: "dist"`), and the federation plugin also emits
// `assets/remoteEntry.js` for Origin to consume.
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'dottieApp',
      filename: 'remoteEntry.js',
      exposes: {
        './DottieSurface': './src/theo/TheoSurface.tsx',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  // Module Federation requires a modern target so top-level await in the generated entry works.
  build: { target: 'esnext' },
});
