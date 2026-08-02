import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

// Vite + React + TS + Module Federation. Dottie is exposed as the federated remote
// `dottieApp/DottieSurface` so the Vault Origin shell mounts it in-shell, while this same build also runs
// standalone on the Dottie dev SWA. Build output -> `dist`; the federation plugin emits
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
