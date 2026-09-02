import { forbidden, requireSuperAdmin } from "@/lib/server/session";
import { deleteBarber, updateBarber } from "@/lib/server/store";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** Rows whose id starts with `backend-` are owned by Django, not by this store. */
function isBackendOwned(id: string): boolean {
  return id.startsWith("backend-");
}

const BACKEND_OWNED_MESSAGE =
  "Bu usta backend (api.qulaynavbat.uz) tomonidan boshqariladi — u yerdan o'zgartiring.";

export async function PATCH(request: Request, context: RouteContext): Promise<Response> {
  if (!(await requireSuperAdmin())) return forbidden();

  const { id } = await context.params;
  if (isBackendOwned(id)) {
    return Response.json({ status: "error", message: BACKEND_OWNED_MESSAGE }, { status: 409 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    status?: string;
    name?: string;
    specialty?: string;
  };

  const patch: Record<string, unknown> = {};
  if (body.status === "active" || body.status === "blocked") patch.status = body.status;
  if (typeof body.name === "string" && body.name.trim()) patch.name = body.name.trim();
  if (typeof body.specialty === "string" && body.specialty.trim()) patch.specialty = body.specialty.trim();

  if (Object.keys(patch).length === 0) {
    return Response.json({ status: "error", message: "O'zgartirish uchun maydon yo'q" }, { status: 400 });
  }

  const barber = await updateBarber(id, patch);
  if (!barber) return Response.json({ status: "error", message: "Usta topilmadi" }, { status: 404 });

  return Response.json({ status: "ok", data: barber });
}

export async function DELETE(_request: Request, context: RouteContext): Promise<Response> {
  if (!(await requireSuperAdmin())) return forbidden();

  const { id } = await context.params;
  if (isBackendOwned(id)) {
    return Response.json({ status: "error", message: BACKEND_OWNED_MESSAGE }, { status: 409 });
  }

  const removed = await deleteBarber(id);
  if (!removed) return Response.json({ status: "error", message: "Usta topilmadi" }, { status: 404 });

  return Response.json({ status: "ok" });
}
