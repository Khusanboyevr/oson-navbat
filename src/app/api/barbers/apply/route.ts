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
 * Worker (usta) registration \u2014 the form behind `/register/barber`.
 *
 * The application is stored as `pending` and lands in the super admin's panel.
 * It is deliberately NOT pushed to the backend here: creating barbers there
 * requires super admin rights (`POST /super-admin/barbers/`), and letting anyone
 * self-register as an usta is exactly what the open catalog is protected from.
 * The backend record is created when the super admin approves.
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

  // Link the application to the Google account when there is one \u2014 either the
  // signed-in session, or an account already registered with the same email.
  const sessionUser = await getCurrentUser();
  const linkedUser = sessionUser ?? (await findUserByEmail(data.email));

  const application = await createApplication(data, {
    userId: linkedUser?.id ?? null,
    syncedWithBackend: false,
  });

  if (linkedUser && linkedUser.role === "client") {
    await updateUser(linkedUser.id, { role: "barber" });
  }

  return Response.json(
    {
      status: "ok",
      message: "Arizangiz qabul qilindi. Super admin tasdiqlagach profilingiz faollashadi.",
      data: { id: application.id, status: application.status },
    },
    { status: 201 }
  );
}
