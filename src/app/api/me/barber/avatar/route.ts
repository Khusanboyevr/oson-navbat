import { proxyAsUser, uploadBarberAvatar } from "@/lib/server/backend";
import { getBackendCookie, getCurrentUser, unauthorized } from "@/lib/server/session";
import { findBarberByEmail, updateBarber } from "@/lib/server/store";

export const runtime = "nodejs";

/** The backend's own limits: 5 MB, and these types only. */
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * Profile photo upload, relayed to `PATCH /barber/me/` as `multipart/form-data`
 * under the field name `avatar` — the backend takes an image only on PATCH, never
 * on create, and answers with the stored file's full URL.
 */
export async function POST(request: Request): Promise<Response> {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role === "client") {
    return Response.json({ status: "error", message: "Bu amal faqat ustalar uchun" }, { status: 403 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("avatar");

  if (!(file instanceof File)) {
    return Response.json({ status: "error", message: "Rasm yuborilmadi" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ status: "error", message: "Rasm hajmi 5 MB dan oshmasin" }, { status: 400 });
  }
  if (file.type && !ALLOWED_TYPES.includes(file.type)) {
    return Response.json(
      { status: "error", message: "Faqat jpg, png, webp yoki gif qabul qilinadi" },
      { status: 400 }
    );
  }

  const result = await uploadBarberAvatar(
    "/barber/me/",
    file,
    file.name || "avatar.jpg",
    await getBackendCookie()
  );

  if (!result.ok) {
    return Response.json(
      { status: "error", message: result.error ?? "Rasmni yuklab bo'lmadi" },
      { status: result.status || 502 }
    );
  }

  // Keep the local mirror pointing at the URL the backend just stored.
  const photo = result.data?.avatar ?? result.data?.photo ?? null;
  const local = await findBarberByEmail(user.email);
  if (local && photo) await updateBarber(local.id, { photo });

  return Response.json({ status: "ok", data: { photo } });
}

/**
 * Removing the photo. `API.md` documents uploading but not clearing, so this tries
 * a null field PATCH and reports what the backend says rather than pretending the
 * photo is gone while it still serves one.
 */
export async function DELETE(): Promise<Response> {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const remote = await proxyAsUser(
    "/barber/me/",
    { method: "PATCH", body: JSON.stringify({ avatar: null }) },
    await getBackendCookie()
  );

  const local = await findBarberByEmail(user.email);
  if (local) await updateBarber(local.id, { photo: null });

  if (!remote.ok) {
    return Response.json(
      {
        status: "error",
        message: `Rasm backenddan o'chirilmadi: ${remote.error ?? "noma'lum xato"}`,
      },
      { status: remote.status || 502 }
    );
  }

  return Response.json({ status: "ok", data: { photo: null } });
}
