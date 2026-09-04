import { fetchAuthMethods } from "@/lib/server/backend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Which sign-in methods are live, straight from the backend's `/auth/methods/`.
 *
 * The browser reads the Google client ID from here rather than from a build-time
 * env var, so rotating it on the backend is enough — no redeploy, nothing
 * hardcoded. (The browser can't call the backend directly: its CORS allowlist
 * only covers qulaynavbat.uz.)
 */
export async function GET(): Promise<Response> {
  const methods = await fetchAuthMethods();
  return Response.json(
    { status: "ok", data: methods },
    { headers: { "Cache-Control": "no-store" } }
  );
}
