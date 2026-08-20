import { NextResponse } from "next/server";
import { notifyAllSubscribers, type PushPayload } from "@/lib/push-server";

/**
 * Stub only — broadcasts to every subscribed device via `notifyAllSubscribers`.
 * The backend dev replaces the body below with a real lookup of the specific
 * client's `push_subscriptions` rows (by the booking's `client_id`) instead of
 * broadcasting to everyone. Called by the barber's "Bekor qilish" action and by
 * the `/api/cron/reminders` job.
 */

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ status: "error", message: "Invalid JSON body" }, { status: 400 });
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("title" in payload) ||
    !("body" in payload)
  ) {
    return NextResponse.json({ status: "error", message: "Payload requires title and body" }, { status: 400 });
  }

  await notifyAllSubscribers(payload as PushPayload);

  return NextResponse.json({ status: "success", message: "API is ready" });
}
