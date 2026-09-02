import { promoteApplicationToBarber } from "@/lib/server/barbers-service";
import { forbidden, requireSuperAdmin } from "@/lib/server/session";
import {
  deleteApplication,
  findApplicationById,
  findUserByEmail,
  setApplicationStatus,
  updateUser,
} from "@/lib/server/store";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Approve or reject one application.
 *
 * Approving is what puts the worker live: their profile is built from the data
 * they submitted and their marker joins the map, and the matching Google account
 * (if any) is switched to the `barber` role so `/admin` opens for them.
 */
export async function PATCH(request: Request, context: RouteContext): Promise<Response> {
  if (!(await requireSuperAdmin())) return forbidden();

  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as { status?: string };
  const status = body.status;

  if (status !== "approved" && status !== "rejected") {
    return Response.json(
      { status: "error", message: "status 'approved' yoki 'rejected' bo'lishi kerak" },
      { status: 400 }
    );
  }

  const application = await findApplicationById(id);
  if (!application) {
    return Response.json({ status: "error", message: "Ariza topilmadi" }, { status: 404 });
  }

  const updated = await setApplicationStatus(id, status);
  if (!updated) {
    return Response.json({ status: "error", message: "Ariza topilmadi" }, { status: 404 });
  }

  if (status === "approved") {
    const barber = await promoteApplicationToBarber(updated);
    const user = await findUserByEmail(updated.email);
    if (user && user.role !== "superadmin") await updateUser(user.id, { role: "barber" });
    return Response.json({ status: "ok", data: { application: updated, barber } });
  }

  return Response.json({ status: "ok", data: { application: updated, barber: null } });
}

export async function DELETE(_request: Request, context: RouteContext): Promise<Response> {
  if (!(await requireSuperAdmin())) return forbidden();

  const { id } = await context.params;
  const removed = await deleteApplication(id);
  if (!removed) {
    return Response.json({ status: "error", message: "Ariza topilmadi" }, { status: 404 });
  }
  return Response.json({ status: "ok" });
}
