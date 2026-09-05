import { promoteApplicationToBarber } from "@/lib/server/barbers-service";
import { createBackendBarberFromApplication } from "@/lib/server/backend";
import { forbidden, getBackendCookie, requireSuperAdmin } from "@/lib/server/session";
import {
  deleteApplication,
  findApplicationById,
  findUserByEmail,
  setApplicationStatus,
  updateApplication,
  updateUser,
} from "@/lib/server/store";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Approve or reject one application.
 *
 * Approving is what puts the worker live. It creates them on the backend
 * (`POST /super-admin/salons/` for the map pin, then `POST /super-admin/barbers/`
 * with the Google email that will be their login) and keeps a local copy as a
 * fallback, so an approval is never lost if the backend call fails.
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

  if (status !== "approved") {
    return Response.json({ status: "ok", data: { application: updated, barber: null } });
  }

  // Approving an already-approved application simply retries the backend write,
  // which is how a failed sync is recovered without re-entering anything.
  const backend = updated.syncedWithBackend
    ? { ok: true, error: null }
    : await createBackendBarberFromApplication(updated, await getBackendCookie());

  if (backend.ok) await updateApplication(id, { syncedWithBackend: true });

  const barber = await promoteApplicationToBarber(updated);
  const user = await findUserByEmail(updated.email);
  if (user && user.role !== "superadmin") await updateUser(user.id, { role: "barber" });

  return Response.json({
    status: "ok",
    data: {
      application: { ...updated, syncedWithBackend: backend.ok },
      barber,
      backendSynced: backend.ok,
      backendError: backend.ok ? null : backend.error,
    },
  });
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
