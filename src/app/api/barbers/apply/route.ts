import { pushBarberToBackend } from "@/lib/server/backend";
import { getCurrentUser } from "@/lib/server/session";
import {
  createApplication,
  findApplicationByEmail,
  findUserByEmail,
  updateUser,
} from "@/lib/server/store";
import { validateApplication } from "@/lib/server/validation";

export const runtime = "nodejs";

/**
 * Worker (usta) registration — the form behind `/register/barber`.
 *
 * The application is stored as `pending` and lands in the super admin's panel for
 * approval; approving it builds the public profile and the map marker. It also
 * tries to register the worker upstream right away — that call is a no-op while
 * `/barbers/` is read-only, and the pending row keeps everything until it isn't.
 */
export async function POST(request: Request): Promise<Response> {
  const body = await request.json().catch(() => null);
  const { data, errors } = validateApplication(body);

  if (!data) {
    return Response.json(
      { status: "error", message: "Ma'lumotlarni tekshiring", errors },
      { status: 400 }
    );
  }

  const existing = await findApplicationByEmail(data.email);
  if (existing && existing.status !== "rejected") {
    return Response.json(
      {
        status: "error",
        message:
          existing.status === "pending"
            ? "Bu email bilan ariza allaqachon yuborilgan, super admin ko'rib chiqmoqda."
            : "Bu email bilan usta allaqachon ro'yxatdan o'tgan.",
      },
      { status: 409 }
    );
  }

  // Link the application to the Google account when there is one — either the
  // signed-in session, or an account already registered with the same email.
  const sessionUser = await getCurrentUser();
  const linkedUser = sessionUser ?? (await findUserByEmail(data.email));

  const application = await createApplication(data, {
    userId: linkedUser?.id ?? null,
    syncedWithBackend: false,
  });

  const synced = await pushBarberToBackend(application);

  if (linkedUser && linkedUser.role === "client") {
    await updateUser(linkedUser.id, { role: "barber" });
  }

  return Response.json(
    {
      status: "ok",
      message: "Arizangiz qabul qilindi. Super admin tasdiqlagach profilingiz faollashadi.",
      data: { id: application.id, status: application.status, backendSynced: synced },
    },
    { status: 201 }
  );
}
