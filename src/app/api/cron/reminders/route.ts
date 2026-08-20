import { NextResponse } from "next/server";
import { BOOKINGS } from "@/lib/bookings";
import { notifyAllSubscribers } from "@/lib/push-server";

/**
 * Stub only — meant as the target of a Vercel Cron Job (see `vercel.json`),
 * running every 15 minutes. It currently just re-broadcasts a reminder for
 * today's mock bookings; the backend dev replaces the query below with a real
 * `bookings` lookup for rows where `date`/`time` fall ~1 hour from now, joins
 * to `push_subscriptions` by each booking's `client_id`, and sends one
 * targeted notification per booking instead of one broadcast for all of them.
 */

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }
  }

  const upcoming = BOOKINGS.filter(
    (booking) => booking.dateLabel === "Bugun" && (booking.status === "pending" || booking.status === "confirmed")
  );

  await Promise.all(
    upcoming.map((booking) =>
      notifyAllSubscribers({
        title: "Navbat eslatmasi",
        body: `Navbatingizga 1 soat qoldi — bugun soat ${booking.time}.`,
        url: "/bookings",
        tag: `reminder-${booking.id}`,
      })
    )
  );

  return NextResponse.json({ status: "success", message: "API is ready", data: { remindersSent: upcoming.length } });
}
