import { NextResponse } from "next/server";
import { SUBSCRIPTIONS, type PushSubscriptionRecord } from "@/lib/push-server";

/**
 * Stub only — stores the subscription in-memory (see `SUBSCRIPTIONS` in
 * `lib/push-server.ts`). The backend dev replaces the body below with a real
 * upsert into the `push_subscriptions` table (see `lib/database.types.ts`),
 * keyed by the authenticated user's id + `endpoint` so re-subscribing on the
 * same device updates rather than duplicates the row.
 */

export async function POST(request: Request) {
  let subscription: unknown;
  try {
    subscription = await request.json();
  } catch {
    return NextResponse.json({ status: "error", message: "Invalid JSON body" }, { status: 400 });
  }

  if (
    typeof subscription !== "object" ||
    subscription === null ||
    !("endpoint" in subscription) ||
    !("keys" in subscription)
  ) {
    return NextResponse.json({ status: "error", message: "Invalid push subscription" }, { status: 400 });
  }

  const record = subscription as PushSubscriptionRecord;
  const alreadySubscribed = SUBSCRIPTIONS.some((existing) => existing.endpoint === record.endpoint);
  if (!alreadySubscribed) {
    SUBSCRIPTIONS.push(record);
  }

  return NextResponse.json({ status: "success", message: "API is ready" }, { status: 201 });
}
