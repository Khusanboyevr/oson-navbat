import { setBackendUserRole, setBackendUserStatus } from "@/lib/server/backend";
import { forbidden, getBackendCookie, requireSuperAdmin } from "@/lib/server/session";
import { findUserById, updateUser } from "@/lib/server/store";
import type { UserRole } from "@/lib/types";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const ROLES: UserRole[] = ["client", "barber", "superadmin"];

/**
 * Block/unblock an account or change its role.
 *
 * The backend owns accounts, so this maps onto its dedicated actions
 * (`/block/`, `/unblock/`, `/set-role/`). A row that only exists locally \u2014 created
 * while the backend was unreachable \u2014 is updated in the local store instead.
 *
 * There is no user delete: the backend doesn't offer one (accounts are created by
 * Google sign-in and blocked, never removed).
 */
export async function PATCH(request: Request, context: RouteContext): Promise<Response> {
  const admin = await requireSuperAdmin();
  if (!admin) return forbidden();

  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as { status?: string; role?: string };

  const status = body.status === "active" || body.status === "blocked" ? body.status : null;
  const role = body.role && (ROLES as string[]).includes(body.role) ? (body.role as UserRole) : null;

  if (!status && !role) {
    return Response.json({ status: "error", message: "O'zgartirish uchun maydon yo'q" }, { status: 400 });
  }

  if (admin.id === id && (status === "blocked" || (role && role !== "superadmin"))) {
    return Response.json(
      { status: "error", message: "O'z hisobingizni bloklab yoki huquqini pasaytirib bo'lmaydi" },
      { status: 400 }
    );
  }

  // Local-only rows never reached the backend, so they stay local.
  const localUser = await findUserById(id);
  if (localUser && !localUser.syncedWithBackend) {
    const updatedLocal = await updateUser(id, {
      ...(status ? { status } : {}),
      ...(role ? { role } : {}),
    });
    return Response.json({ status: "ok", data: updatedLocal });
  }

  const cookie = await getBackendCookie();

  if (status) {
    const result = await setBackendUserStatus(id, status, cookie);
    if (!result.ok) {
      return Response.json(
        { status: "error", message: result.error ?? "Backend amalni rad etdi" },
        { status: result.status || 502 }
      );
    }
  }

  if (role) {
    const result = await setBackendUserRole(id, role, cookie);
    if (!result.ok) {
      return Response.json(
        { status: "error", message: result.error ?? "Backend amalni rad etdi" },
        { status: result.status || 502 }
      );
    }
  }

  // Keep the local mirror in step so the session role stays correct.
  if (localUser) {
    await updateUser(id, { ...(status ? { status } : {}), ...(role ? { role } : {}) });
  }

  return Response.json({ status: "ok" });
}
