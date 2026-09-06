import { fetchAdminUsers, inviteBackendUser, setBackendUserRole } from "@/lib/server/backend";
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
 * `POST /super-admin/users/invite/` handles both cases on the backend: it updates
 * an existing account or creates a password-less one, which Google sign-in links
 * by email later. So the promise lives where it survives a redeploy.
 *
 * The local list is only a fallback for when that call can't be made (the backend
 * is down, or this operator isn't a super admin there yet) — it grants the role at
 * first sign-in so the panel still works.
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
  const invited = await inviteBackendUser(email, "superadmin", cookie);

  // Keep the local mirror in step either way, so the role also applies to this
  // app's own session the moment they sign in.
  const localAccount = await findUserByEmail(email);
  if (localAccount) await updateUser(localAccount.id, { role: "superadmin" });

  if (!invited.ok) {
    // The backend refused: remember it here so the panel still grants the role,
    // and say what happened rather than pretending it worked.
    await addSuperAdminInvite(email);
    return Response.json(
      {
        status: "error",
        message: `Backend qabul qilmadi: ${invited.error ?? "noma'lum xato"}. Bu email shu ilovada eslab qolindi — kirganda super admin bo'ladi.`,
      },
      { status: invited.status || 502 }
    );
  }

  await removeSuperAdminInvite(email);

  return Response.json({
    status: "ok",
    data: { state: invited.status === 201 ? "invited" : "active" },
    message:
      invited.status === 201
        ? "Hisob yaratildi. Bu email bilan Google orqali kirgan zahoti super admin bo'ladi."
        : "Super admin huquqi berildi.",
  });
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
