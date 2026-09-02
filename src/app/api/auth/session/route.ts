import { getCurrentUser, toSessionUser } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Who is signed in right now — the client's `SessionProvider` polls this. */
export async function GET(): Promise<Response> {
  const user = await getCurrentUser();
  if (!user) return Response.json({ status: "ok", data: { user: null } });
  return Response.json({ status: "ok", data: { user: await toSessionUser(user) } });
}
