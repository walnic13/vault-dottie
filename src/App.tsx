import { useEffect } from "react";
import TheoSurface from "./theo/TheoSurface";
import { theoClient } from "./theo/services/theoClient";
import { entraAuth } from "./services/entraAuth";

// Dottie — STANDALONE root. Wires the live gateway to its OWN Entra/MSAL session so Dottie works as a
// standalone SWA (not just mocked): the token provider signs the user in (redirect in prod, popup in dev)
// and every gateway call carries the api://4e1a1e31…/access_as_user bearer. The base URLs (func-dottie /
// func-dottie-stream) are baked from VITE_FUNCTIONS_URL / VITE_STREAM_FUNCTIONS_URL at build; when neither
// is set (bare local dev) the gateway stays on the mock.
//
// When Dottie is MOUNTED in Vault Origin, the host imports the federated `dottieApp/DottieSurface`
// (= TheoSurface) directly and configures the gateway with the SHELL's token — so this App wrapper (and its
// self-auth) runs only in the standalone build. TheoSurface itself stays auth-agnostic.
theoClient.configureGateway({
  getAccessToken: async () => {
    await entraAuth.initialize();
    return entraAuth.getAccessToken(true);
  },
});

export default function App() {
  useEffect(() => {
    // Kick sign-in early (redirect/popup) so a fresh visit authenticates before the first data load.
    void (async () => {
      await entraAuth.initialize();
      await entraAuth.getAccessToken(true);
    })();
  }, []);
  return <TheoSurface />;
}
