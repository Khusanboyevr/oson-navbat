import { fetchAdminUsers, setBackendUserRole } from "@/lib/server/backend";
import { forbidden, getBackendCookie, requireSuperAdmin } from "@/lib/server/session";
import {
  addSuperAdminInvite,
  findUserByEmail,
  listSuperAdminInvites,
  listUsers,
  removeSuperAdminInvite,
  updateUser,
} from "@/lib/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Who can run the platform.
 *
 * Two cases, because the backend can only change the role of an account it
 * already has, and an account only exists there once its owner has signed in with
 * Google:
 *
 * - the person has signed in → `POST /super-admin/users/<id>/set-role/`;
 * - they haven't yet → their email is remembered and the role is granted the
 *   moment they first sign in.
 */

export interface SuperAdminEntry {
  email: string;
  name: string | null;
  picture: string | null;
  /** "active" once the account exists, "invited" while it's only a promise. */
  state: "active" | "invited";
  id: string | null;
}

export async function GET(): Promise<Response> {
  const admin = await requireSuperAdmin();
  if (!admin) return forbidden();

  const [remote, local, invites] = await Promise.all([
    fetchAdminUsers(await getBackendCookie()),
    listUsers(),
    listSuperAdminInvites(),
  ]);

  const accounts = [...(remote.data ?? []), ...local];
  const seen = new Set<string>();

  const active: SuperAdminEntry[] = [];
  for (const user of accounts) {
    const email = user.email.toLowerCase();
    if (user.role !== "superadmin" || seen.has(email)) continue;
    seen.add(email);
    active.push({
      email: user.email,
      name: user.name,
      picture: user.picture,
      state: "active",
      id: user.id,
    });
  }

  const invited: SuperAdminEntry[] = invites
    .filter((email) => !seen.has(email))
    .map((email) => ({ email, name: null, picture: null, state: "invited" as const, id: null }));

  return Response.json({
    status: "ok",
    data: [...active, ...invited],
    meta: { backendOk: remote.ok, backendError: remote.error },
  });
}

export async function POST(request: Request): Promise<Response> {
  const admin = await requireSuperAdmin();
  if (!admin) return forbidden();

  const body = (await request.json().catch(() => ({}))) as { email?: string };
  const email = body.email?.trim().toLowerCase() ?? "";

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return Response.json({ status: "error", message: "Email manzilni to'g'ri kiriting" }, { status: 400 });
  }

  const cookie = await getBackendCookie();
  const remote = await fetchAdminUsers(cookie, email);
  const backendAccount = (remote.data ?? []).find(
    (user) => user.email.toLowerCase() === email
  );

  // Remember the promise either way: it is what grants the role if the backend
  // call can't be made now, and what covers a first sign-in later.
  await addSuperAdminInvite(email);

  const localAccount = await findUserByEmail(email);
  if (localAccount) await updateUser(localAccount.id, { role: "superadmin" });

  if (!backendAccount) {
    return Response.json({
      status: "ok",
      data: { state: "invited" },
      message:
        "Bu email hali tizimga kirmagan. U Google orqali birinchi marta kirganda super admin bo'ladi.",
    });
  }

  const result = await setBackendUserRole(backendAccount.id, "superadmin", cookie);
  if (!result.ok) {
    return Response.json(
      { status: "error", message: result.error ?? "Backend rolni o'zgartirmadi" },
      { status: result.status || 502 }
    );
  }

  return Response.json({ status: "ok", data: { state: "active" } });
}

export async function DELETE(request: Request): Promise<Response> {
  const admin = await requireSuperAdmin();
  if (!admin) return forbidden();

  const email = (new URL(request.url).searchParams.get("email") ?? "").trim().toLowerCase();
  if (!email) {
    return Response.json({ status: "error", message: "Email yuborilmadi" }, { status: 400 });
  }
  if (email === admin.email.toLowerCase()) {
    return Response.json(
      { status: "error", message: "O'zingizni super adminlikdan chiqarib bo'lmaydi" },
      { status: 400 }
    );
  }

  await removeSuperAdminInvite(email);

  const localAccount = await findUserByEmail(email);
  if (localAccount) await updateUser(localAccount.id, { role: "client" });

  const cookie = await getBackendCookie();
  const remote = await fetchAdminUsers(cookie, email);
  const backendAccount = (remote.data ?? []).find((user) => user.email.toLowerCase() === email);

  if (backendAccount) {
    const result = await setBackendUserRole(backendAccount.id, "client", cookie);
    if (!result.ok) {
      return Response.json(
        { status: "error", message: result.error ?? "Backend rolni o'zgartirmadi" },
        { status: result.status || 502 }
      );
    }
  }

  return Response.json({ status: "ok" });
}
