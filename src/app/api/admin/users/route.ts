import { fetchAdminUsers } from "@/lib/server/backend";
import { forbidden, getBackendCookie, requireSuperAdmin } from "@/lib/server/session";
import { listUsers } from "@/lib/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Everyone who has signed in with Google, read from `GET /super-admin/users/`.
 * Accounts this app knows about but the backend doesn't (created while it was
 * unreachable) are appended, so nobody silently disappears from the panel.
 */
export async function GET(request: Request): Promise<Response> {
  if (!(await requireSuperAdmin())) return forbidden();

  const search = new URL(request.url).searchParams.get("search") ?? undefined;
  const [remote, local] = await Promise.all([
    fetchAdminUsers(await getBackendCookie(), search),
    listUsers(),
  ]);

  const backendUsers = remote.data ?? [];
  const knownEmails = new Set(backendUsers.map((user) => user.email.toLowerCase()));
  const localOnly = local.filter((user) => !knownEmails.has(user.email.toLowerCase()));

  return Response.json({
    status: "ok",
    data: [...backendUsers, ...localOnly],
    meta: { backendOk: remote.ok, backendError: remote.error },
  });
}
