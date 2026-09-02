import { forbidden, requireSuperAdmin } from "@/lib/server/session";
import { deleteUser, updateUser } from "@/lib/server/store";
import type { UserRole } from "@/lib/types";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const ROLES: UserRole[] = ["client", "barber", "superadmin"];

/** Block/unblock an account, or change its role. */
export async function PATCH(request: Request, context: RouteContext): Promise<Response> {
  const admin = await requireSuperAdmin();
  if (!admin) return forbidden();

  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as { status?: string; role?: string };

  if (admin.id === id && (body.status === "blocked" || (body.role && body.role !== "superadmin"))) {
    return Response.json(
      { status: "error", message: "O'z hisobingizni bloklab yoki huquqini pasaytirib bo'lmaydi" },
      { status: 400 }
    );
  }

  const patch: { status?: "active" | "blocked"; role?: UserRole } = {};
  if (body.status === "active" || body.status === "blocked") patch.status = body.status;
  if (body.role && ROLES.includes(body.role as UserRole)) patch.role = body.role as UserRole;

  if (Object.keys(patch).length === 0) {
    return Response.json({ status: "error", message: "O'zgartirish uchun maydon yo'q" }, { status: 400 });
  }

  const user = await updateUser(id, patch);
  if (!user) return Response.json({ status: "error", message: "Foydalanuvchi topilmadi" }, { status: 404 });

  return Response.json({ status: "ok", data: user });
}

export async function DELETE(_request: Request, context: RouteContext): Promise<Response> {
  const admin = await requireSuperAdmin();
  if (!admin) return forbidden();

  const { id } = await context.params;
  if (admin.id === id) {
    return Response.json({ status: "error", message: "O'z hisobingizni o'chirib bo'lmaydi" }, { status: 400 });
  }

  const removed = await deleteUser(id);
  if (!removed) {
    return Response.json({ status: "error", message: "Foydalanuvchi topilmadi" }, { status: 404 });
  }
  return Response.json({ status: "ok" });
}
