import { isStoreDurable } from "@/lib/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * A one-glance answer to "is this deployment keeping arizas?".
 *
 * The application queue is this app's own storage, and on a serverless host that
 * is `/tmp` unless a KV store is connected — an ariza submitted to one instance
 * is then invisible to the next. Opening this URL says which it is, without
 * having to sign in as a super admin to find out.
 */
export function GET(): Response {
  const durable = isStoreDurable();

  return Response.json({
    status: "ok",
    storeDurable: durable,
    message: durable
      ? "Arizalar doimiy saqlanmoqda."
      : "Arizalar vaqtinchalik xotirada — KV ulanmagan (KV_REST_API_URL / KV_REST_API_TOKEN).",
  });
}
