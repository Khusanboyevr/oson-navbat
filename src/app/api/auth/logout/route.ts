import { cookies } from "next/headers";
import { logoutFromBackend } from "@/lib/server/backend";
import { BACKEND_COOKIE, SESSION_COOKIE } from "@/lib/server/session";
import { destroySession } from "@/lib/server/store";

export const runtime = "nodejs";

export async function POST(): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const backendCookie = cookieStore.get(BACKEND_COOKIE)?.value ?? null;

  if (token) await destroySession(token);
  await logoutFromBackend(backendCookie);

  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(BACKEND_COOKIE);

  return Response.json({ status: "ok" });
}
