import { forbidden, requireSuperAdmin } from "@/lib/server/session";
import { listApplications } from "@/lib/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Every worker application, newest first — the super admin's review queue. */
export async function GET(): Promise<Response> {
  if (!(await requireSuperAdmin())) return forbidden();
  return Response.json({ status: "ok", data: await listApplications() });
}
