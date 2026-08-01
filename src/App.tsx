import { useEffect } from "react";
import TheoSurface from "./theo/TheoSurface";
import { entraAuth } from "./services/entraAuth";

// Dottie — STANDALONE root. Copies Theo's exact contract: the token flows INTO TheoSurface via the
// `getAccessToken` prop, and TheoSurface configures its OWN gateway from it (see TheoSurface useEffect).
// Configuring the gateway from here instead would target a different module-federation instance and be
// overwritten by TheoSurface's own configureGateway({getAccessToken: null}) — the cause of the 401s.
// The base URLs (func-dottie / func-dottie-stream) are baked from VITE_FUNCTIONS_URL /
// VITE_STREAM_FUNCTIONS_URL; with neither set (bare local dev) the gateway stays on the mock.
//
// When Dottie is MOUNTED in Vault Origin, the host renders the federated DottieSurface and passes ITS
// shell token as this same prop — so this standalone wrapper's self-auth only runs standalone.
const getAccessToken = async (): Promise<string | null> => {
  await entraAuth.initialize();
  return entraAuth.getAccessToken(true);
};

export default function App() {
  useEffect(() => {
    // Prime sign-in early (redirect/popup) so a fresh visit authenticates before the first data load.
    void (async () => {
      await entraAuth.initialize();
      await entraAuth.getAccessToken(true);
    })();
  }, []);
  return <TheoSurface getAccessToken={getAccessToken} />;
}
