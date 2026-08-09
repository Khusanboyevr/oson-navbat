import { NextResponse } from "next/server";

/**
 * Stub only — this is where the Telegram Bot API webhook
 * (https://core.telegram.org/bots/api#setwebhook) should point once a real
 * bot token is issued. Telegram delivers each update as a POST with an
 * `Update` object body; the backend dev replaces the body below with real
 * verification + Supabase logic (e.g. linking `message.from.id` to a
 * `profiles` row for the deep-link flow in ProfileView).
 */

export async function POST(request: Request) {
  const update = await request.json().catch(() => null);
  console.log("Telegram webhook stub received update:", update);

  return NextResponse.json({ status: "success", message: "API is ready" });
}

export async function GET() {
  return NextResponse.json({ status: "success", message: "API is ready" });
}
