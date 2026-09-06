import { forbidden, requireSuperAdmin } from "@/lib/server/session";
import { isStoreDurable, listApplications } from "@/lib/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Every worker application, newest first — the super admin's review queue. */
export async function GET(): Promise<Response> {
  if (!(await requireSuperAdmin())) return forbidden();
  return Response.json({
    status: "ok",
    data: await listApplications(),
    // The queue is this app's own storage; when that storage doesn't outlive a
    // single serverless instance, the panel has to say so rather than quietly
    // losing arizas between one request and the next.
    durable: isStoreDurable(),
  });
}
