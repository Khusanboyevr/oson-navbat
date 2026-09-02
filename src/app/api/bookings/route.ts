import { NextResponse } from "next/server";
import { BOOKINGS } from "@/lib/bookings";

/**
 * Stub only — returns the same mock data the frontend already renders from
 * `lib/bookings.ts`. Bookings are the last flow still on mock data: once the
 * Django backend documents `/bookings/`, these handlers proxy to it the way
 * `src/lib/server/backend.ts` does for auth and barbers. The response envelope
 * below is the contract the frontend expects to keep working against.
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
