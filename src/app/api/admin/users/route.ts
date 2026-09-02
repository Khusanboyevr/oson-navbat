import { forbidden, requireSuperAdmin } from "@/lib/server/session";
import { listUsers } from "@/lib/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Everyone who has signed in with Google — name, email and role, newest first.
 * This is the "ro'yxatdan o'tganlar super adminga keladi" list.
 */
export async function GET(): Promise<Response> {
  if (!(await requireSuperAdmin())) return forbidden();
  return Response.json({ status: "ok", data: await listUsers() });
}
