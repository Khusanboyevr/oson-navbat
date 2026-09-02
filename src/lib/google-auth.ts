import type { SessionUser } from "@/lib/types";

/**
 * Google Identity Services (GIS) on the client.
 *
 * The browser gets a signed ID token from Google and hands it to
 * `POST /api/auth/google`; that route verifies it and forwards it to the Django
 * backend. No token is ever trusted on the client side.
 */

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
export const isGoogleConfigured = GOOGLE_CLIENT_ID.length > 0;

const SCRIPT_ID = "google-identity-services";
const SCRIPT_SRC = "https://accounts.google.com/gsi/client";

interface GoogleCredentialResponse {
  credential?: string;
}

interface GoogleAccountsId {
  initialize(config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    ux_mode?: "popup" | "redirect";
  }): void;
  renderButton(parent: HTMLElement, options: Record<string, unknown>): void;
  prompt(): void;
  disableAutoSelect(): void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } };
  }
}

let scriptPromise: Promise<GoogleAccountsId> | null = null;

/** Loads the GIS script once and resolves with `google.accounts.id`. */
export function loadGoogleIdentity(): Promise<GoogleAccountsId> {
  if (typeof window === "undefined") return Promise.reject(new Error("Faqat brauzerda ishlaydi"));
  if (window.google?.accounts?.id) return Promise.resolve(window.google.accounts.id);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    const script = existing ?? document.createElement("script");

    const handleLoad = () => {
      if (window.google?.accounts?.id) resolve(window.google.accounts.id);
      else reject(new Error("Google Identity yuklanmadi"));
    };

    script.addEventListener("load", handleLoad);
    script.addEventListener("error", () => reject(new Error("Google skriptini yuklab bo'lmadi")));

    if (!existing) {
      script.id = SCRIPT_ID;
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  });

  return scriptPromise;
}

export interface GoogleLoginResult {
  user: SessionUser;
  backendSynced: boolean;
  backendError: string | null;
}

/** Exchanges the Google credential for an app session. */
export async function completeGoogleLogin(credential: string): Promise<GoogleLoginResult> {
  const response = await fetch("/api/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential }),
  });

  const payload = (await response.json().catch(() => ({}))) as {
    message?: string;
    data?: GoogleLoginResult;
  };

  if (!response.ok || !payload.data) {
    throw new Error(payload.message ?? "Kirishda xatolik yuz berdi");
  }

  return payload.data;
}

/** Where a freshly signed-in account should land. */
export function homeRouteForRole(role: SessionUser["role"]): string {
  if (role === "superadmin") return "/super-admin";
  if (role === "barber") return "/admin";
  return "/";
}
