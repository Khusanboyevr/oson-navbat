import { cookies } from "next/headers";
import { logoutFromBackend } from "@/lib/server/backend";
import { BACKEND_COOKIE, SESSION_COOKIE } from "@/lib/server/session";

export const runtime = "nodejs";

export async function POST(): Promise<Response> {
  const cookieStore = await cookies();
  await logoutFromBackend(cookieStore.get(BACKEND_COOKIE)?.value ?? null);

  // The session is a signed cookie, so clearing it is the whole logout.
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(BACKEND_COOKIE);

  return Response.json({ status: "ok" });
}
