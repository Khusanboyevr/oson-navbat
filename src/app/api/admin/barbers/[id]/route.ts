import { deleteBackendBarber, setBackendBarberStatus } from "@/lib/server/backend";
import { forbidden, getBackendCookie, requireSuperAdmin } from "@/lib/server/session";
import { deleteBarber, updateBarber } from "@/lib/server/store";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** Backend rows are prefixed when mapped, so the id says where the write goes. */
function backendId(id: string): string | null {
  return id.startsWith("backend-") ? id.slice("backend-".length) : null;
}

export async function PATCH(request: Request, context: RouteContext): Promise<Response> {
  if (!(await requireSuperAdmin())) return forbidden();

  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as { status?: string };
  const status = body.status === "active" || body.status === "blocked" ? body.status : null;

  if (!status) {
    return Response.json({ status: "error", message: "status noto'g'ri" }, { status: 400 });
  }

  const remoteId = backendId(id);
  if (remoteId) {
    // POST /super-admin/barbers/<id>/block/ or /activate/
    const result = await setBackendBarberStatus(remoteId, status, await getBackendCookie());
    if (!result.ok) {
      return Response.json(
        { status: "error", message: result.error ?? "Backend amalni rad etdi" },
        { status: result.status || 502 }
      );
    }
    return Response.json({ status: "ok" });
  }

  const barber = await updateBarber(id, { status });
  if (!barber) return Response.json({ status: "error", message: "Usta topilmadi" }, { status: 404 });
  return Response.json({ status: "ok", data: barber });
}

export async function DELETE(_request: Request, context: RouteContext): Promise<Response> {
  if (!(await requireSuperAdmin())) return forbidden();

  const { id } = await context.params;
  const remoteId = backendId(id);

  if (remoteId) {
    const result = await deleteBackendBarber(remoteId, await getBackendCookie());
    if (!result.ok) {
      return Response.json(
        { status: "error", message: result.error ?? "Backend amalni rad etdi" },
        { status: result.status || 502 }
      );
    }
    return Response.json({ status: "ok" });
  }

  const removed = await deleteBarber(id);
  if (!removed) return Response.json({ status: "error", message: "Usta topilmadi" }, { status: 404 });
  return Response.json({ status: "ok" });
}
