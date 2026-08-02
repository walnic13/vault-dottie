import { PublicClientApplication, type Configuration } from '@azure/msal-browser';

class EntraAuthService {
  private msalInstance: PublicClientApplication | null = null;
  private isConfigured: boolean = false;
  private initPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._initialize();
    return this.initPromise;
  }

  private async _initialize(): Promise<void> {
    const clientId = import.meta.env.VITE_ENTRA_CLIENT_ID;
    const tenantId = import.meta.env.VITE_ENTRA_TENANT_ID;
    const authority = import.meta.env.VITE_ENTRA_AUTHORITY;

    if (!clientId || !tenantId) {
      console.log('[EntraAuth] Entra ID not configured - authentication disabled (development mode)');
      this.isConfigured = false;
      return;
    }

    try {
      const msalConfig: Configuration = {
        auth: {
          clientId,
          authority: authority || `https://login.microsoftonline.com/${tenantId}`,
          redirectUri: window.location.origin,
        },
        cache: {
          // Persist the MSAL account + refresh token on the device so sign-in survives tab
          // closes, refreshes, and browser/app restarts (Teams/Outlook-style "stay signed in").
          // sessionStorage was per-tab and wiped on close, forcing a re-login every visit.
          cacheLocation: 'localStorage',
          // Mirror auth state to a cookie — resilience on mobile Safari / iOS, which clears
          // web storage more aggressively, and steadies the redirect round-trip.
          storeAuthStateInCookie: true,
        },
      };

      this.msalInstance = new PublicClientApplication(msalConfig);
      await this.msalInstance.initialize();

      await this.msalInstance.handleRedirectPromise();

      this.isConfigured = true;

      console.log('[EntraAuth] Entra ID configured and initialized');
    } catch (error) {
      console.error('[EntraAuth] Failed to initialize MSAL:', error);
      this.isConfigured = false;
    }
  }

  async acquireTokenInteractive(): Promise<string | null> {
    if (!this.isConfigured || !this.msalInstance) {
      return null;
    }

    const apiScope = import.meta.env.VITE_ENTRA_API_SCOPE || 'api://4e1a1e31-5c20-4480-99e4-098901707d9e/access_as_user';

    try {
      if (import.meta.env.PROD) {
        console.log('[EntraAuth] Triggering interactive login redirect (production)...');
        await this.msalInstance.acquireTokenRedirect({
          scopes: [apiScope],
        });
        return null;
      } else {
        console.log('[EntraAuth] Triggering interactive login popup (development)...');
        const response = await this.msalInstance.acquireTokenPopup({
          scopes: [apiScope],
        });
        console.log('[EntraAuth] Interactive login successful');

        // DEV-ONLY: Log token info after popup
        if (import.meta.env.DEV || import.meta.env.VITE_DEBUG_AUTH === 'true') {
          try {
            const tokenParts = response.accessToken.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              console.log('[EntraAuth] Popup token info:', {
                aud: payload.aud,
                scp: payload.scp,
                roles: payload.roles,
                exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'unknown'
              });
            }
          } catch {
            console.warn('[EntraAuth] Could not decode popup token');
          }
        }

        return response.accessToken;
      }
    } catch (error) {
      console.error('[EntraAuth] Interactive login failed:', error);
      return null;
    }
  }

  // Silent SSO against the user's live Microsoft session (hidden iframe, NO prompt). Used when the
  // local cache has no account yet (fresh browser, or the refresh token finally expired) so a valid
  // work session re-auths seamlessly before we ever show the login screen. Best-effort: returns null
  // if there's no active session (or silent SSO isn't possible); the caller then defers to login.
  async acquireTokenSsoSilent(): Promise<string | null> {
    if (!this.isConfigured || !this.msalInstance) {
      return null;
    }
    const apiScope = import.meta.env.VITE_ENTRA_API_SCOPE || 'api://4e1a1e31-5c20-4480-99e4-098901707d9e/access_as_user';
    try {
      const response = await this.msalInstance.ssoSilent({ scopes: [apiScope] });
      console.log('[EntraAuth] Silent SSO succeeded');
      return response.accessToken;
    } catch (error) {
      console.log('[EntraAuth] Silent SSO unavailable (no active session) - deferring to login', error);
      return null;
    }
  }

  async getAccessToken(allowInteractive: boolean = false): Promise<string | null> {
    if (!this.isConfigured || !this.msalInstance) {
      return null;
    }

    const apiScope = import.meta.env.VITE_ENTRA_API_SCOPE || 'api://4e1a1e31-5c20-4480-99e4-098901707d9e/access_as_user';

    try {
      const accounts = this.msalInstance.getAllAccounts();
      console.log('[EntraAuth] getAccessToken called', {
        allowInteractive,
        mode: import.meta.env.MODE,
        prod: import.meta.env.PROD,
        accounts: accounts.length,
        isConfigured: this.isConfigured
      });

      if (accounts.length === 0) {
        if (allowInteractive && import.meta.env.PROD) {
          console.log('[EntraAuth] No accounts found in production - triggering interactive login');
          return await this.acquireTokenInteractive();
        }
        // No cached account — try silent SSO against a live Microsoft session before giving up (no
        // prompt). On success the account is cached, so subsequent calls resolve silently.
        const ssoToken = await this.acquireTokenSsoSilent();
        if (ssoToken) return ssoToken;
        console.log('[EntraAuth] No accounts found and silent SSO unavailable - skipping token acquisition');
        return null;
      }

      const account = accounts[0];
      const silentRequest = {
        scopes: [apiScope],
        account: account,
      };

      const response = await this.msalInstance.acquireTokenSilent(silentRequest);
      console.log('[EntraAuth] Successfully acquired token silently');

      // DEV-ONLY: Defensive logging to verify token contents
      if (import.meta.env.DEV || import.meta.env.VITE_DEBUG_AUTH === 'true') {
        try {
          const tokenParts = response.accessToken.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log('[EntraAuth] Token info:', {
              aud: payload.aud,
              scp: payload.scp,
              roles: payload.roles,
              exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'unknown',
              tokenType: response.idToken ? 'access+id' : 'access-only'
            });
          }
        } catch {
          console.warn('[EntraAuth] Could not decode token for debugging');
        }
      }

      return response.accessToken;
    } catch (error) {
      if (allowInteractive && import.meta.env.PROD) {
        console.log('[EntraAuth] Silent token acquisition failed - trying interactive login', error);
        return await this.acquireTokenInteractive();
      }
      console.log('[EntraAuth] Silent token acquisition failed - proceeding without auth', error);
      return null;
    }
  }

  isEnabled(): boolean {
    return this.isConfigured;
  }

  async getCurrentUserId(): Promise<{ userId: string; username: string } | null> {
    if (!this.isConfigured || !this.msalInstance) {
      return null;
    }

    try {
      const accounts = this.msalInstance.getAllAccounts();
      if (accounts.length === 0) {
        console.log('[EntraAuth] getCurrentUserId: no accounts found');
        return null;
      }

      const account = accounts[0];

      // Try to get OID from idTokenClaims
      let oid = account.idTokenClaims?.oid as string | undefined;
      if (!oid) {
        oid = account.idTokenClaims?.["http://schemas.microsoft.com/identity/claims/objectidentifier"] as string | undefined;
      }

      // If OID not in idTokenClaims, acquire token silently and read from access token
      if (!oid) {
        console.log('[EntraAuth] OID not in idTokenClaims, acquiring token silently...');
        const apiScope = import.meta.env.VITE_ENTRA_API_SCOPE || 'api://4e1a1e31-5c20-4480-99e4-098901707d9e/access_as_user';
        const response = await this.msalInstance.acquireTokenSilent({
          scopes: [apiScope],
          account: account,
        });

        const tokenParts = response.accessToken.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          oid = payload.oid || payload["http://schemas.microsoft.com/identity/claims/objectidentifier"];
        }
      }

      if (!oid) {
        console.error('[EntraAuth] Could not resolve OID from account or token');
        return null;
      }

      const username = account.username || account.name || 'User';

      console.log('[EntraAuth] resolved oid=' + oid + ' username=' + username);

      return { userId: oid, username };
    } catch (error) {
      console.error('[EntraAuth] getCurrentUserId failed:', error);
      return null;
    }
  }

  // Synchronous best-effort OID from the MSAL-cached account (no network). Used ONLY as a client-side
  // cache-namespace key (e.g. the Orbit localStorage snapshot) — it never grants access; auth is still
  // enforced server-side. Null when unconfigured / no account / OID absent (caller disables its cache).
  getCachedUserIdSync(): string | null {
    if (!this.isConfigured || !this.msalInstance) return null;
    try {
      const account = this.msalInstance.getAllAccounts()[0];
      const claims = account?.idTokenClaims as Record<string, unknown> | undefined;
      const oid = (claims?.oid as string | undefined)
        ?? (claims?.['http://schemas.microsoft.com/identity/claims/objectidentifier'] as string | undefined);
      return oid ?? null;
    } catch {
      return null;
    }
  }

  async login(): Promise<void> {
    console.log('[EntraAuth] login() called');
    await this.initialize();
    await this.acquireTokenInteractive();
  }
}

export const entraAuth = new EntraAuthService();
