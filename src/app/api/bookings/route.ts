import { NextResponse } from "next/server";
import { BOOKINGS } from "@/lib/bookings";

/**
 * Stub only — returns the same mock data the frontend already renders from
 * `lib/bookings.ts`. The backend dev replaces the body of each handler with
 * a real Supabase query against the `bookings` table (see `lib/database.types.ts`
 * for the expected row shape); the response envelope below is the contract
 * the frontend expects to keep working against.
 */

export async function GET() {
  return NextResponse.json({ status: "success", message: "API is ready", data: BOOKINGS });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ status: "error", message: "Invalid JSON body" }, { status: 400 });
  }

  const newBooking = {
    id: `mock-${Date.now()}`,
    status: "pending",
    ...(typeof body === "object" && body !== null ? body : {}),
  };

  return NextResponse.json(
    { status: "success", message: "API is ready", data: newBooking },
    { status: 201 }
  );
}
