import { proxyAsUser, type ProxyResult } from "@/lib/server/backend";
import type { AppBooking, BookingStatusKey } from "@/lib/types";

/**
 * Bookings, on the real backend.
 *
 * The exact field names aren't pinned down here (they live in the backend repo's
 * `API.md`, which this repo doesn't have), so every read is mapped defensively:
 * a renamed field degrades to an empty string rather than breaking the page.
 * Writes are deliberately thin — a create failure surfaces the backend's own
 * validation message instead of being papered over with a fake success.
 */

interface RawBooking {
  id: number | string;
  status?: string;
  date?: string;
  booking_date?: string;
  start_date?: string;
  time?: string;
  start_time?: string;
  price?: number | string;
  total_price?: number | string;
  duration_minutes?: number;
  service?: { id?: number | string; name?: string; price?: number | string; duration_minutes?: number } | string;
  service_name?: string;
  barber?: { id?: number | string; full_name?: string; name?: string } | string;
  barber_name?: string;
  client?: { full_name?: string; name?: string; phone?: string | null };
  client_name?: string;
  client_phone?: string | null;
}

interface Paginated<T> {
  count: number;
  results: T[];
}

const STATUSES: BookingStatusKey[] = ["pending", "confirmed", "completed", "cancelled"];

function toNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === "string" ? Number.parseFloat(value) : typeof value === "number" ? value : NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeStatus(raw?: string): BookingStatusKey {
  const value = raw?.toLowerCase() ?? "";
  if (value.startsWith("confirm") || value === "accepted") return "confirmed";
  if (value.startsWith("complet") || value === "done" || value === "finished") return "completed";
  if (value.startsWith("cancel") || value === "rejected") return "cancelled";
  return (STATUSES as string[]).includes(value) ? (value as BookingStatusKey) : "pending";
}

/** `2026-09-05T14:30:00Z` and `14:30:00` both reduce to `14:30`. */
function normalizeTime(raw?: string): string {
  if (!raw) return "";
  const match = /(\d{1,2}):(\d{2})/.exec(raw);
  return match ? `${match[1].padStart(2, "0")}:${match[2]}` : "";
}

function normalizeDate(raw?: string): string {
  if (!raw) return "";
  const match = /(\d{4}-\d{2}-\d{2})/.exec(raw);
  return match ? match[1] : "";
}

export function mapBooking(raw: RawBooking): AppBooking {
  const service = typeof raw.service === "object" && raw.service !== null ? raw.service : null;
  const barber = typeof raw.barber === "object" && raw.barber !== null ? raw.barber : null;
  const rawDate = raw.date ?? raw.booking_date ?? raw.start_date;

  return {
    id: String(raw.id),
    status: normalizeStatus(raw.status),
    date: normalizeDate(rawDate),
    time: normalizeTime(raw.time ?? raw.start_time ?? rawDate),
    serviceName: service?.name ?? raw.service_name ?? "Xizmat",
    price: toNumber(raw.price ?? raw.total_price ?? service?.price),
    durationMinutes: raw.duration_minutes ?? service?.duration_minutes ?? 30,
    barberId: barber?.id !== undefined ? String(barber.id) : typeof raw.barber === "string" ? raw.barber : null,
    barberName: barber?.full_name ?? barber?.name ?? raw.barber_name ?? "",
    // Reviews and bookings abbreviate the client's name on purpose — not a bug.
    clientName: raw.client?.full_name ?? raw.client?.name ?? raw.client_name ?? "",
    clientPhone: raw.client?.phone ?? raw.client_phone ?? "",
  };
}

/** `GET /bookings/` — the caller's own bookings, or an usta's day with `scope=today`. */
export async function fetchBookings(
  cookie: string | null,
  params: { scope?: "today"; date?: string } = {}
): Promise<ProxyResult<AppBooking[]>> {
  const query = new URLSearchParams({ page_size: "100" });
  if (params.scope) query.set("scope", params.scope);
  if (params.date) query.set("date", params.date);

  const result = await proxyAsUser<Paginated<RawBooking> | RawBooking[]>(
    `/bookings/?${query.toString()}`,
    {},
    cookie
  );

  const rows = Array.isArray(result.data) ? result.data : (result.data?.results ?? []);
  return { ...result, data: result.ok ? rows.map(mapBooking) : null };
}

export interface CreateBookingInput {
  barberId: string;
  serviceId: string;
  date: string;
  time: string;
}

/** `POST /bookings/`. A rejection is returned as-is so the customer sees the real reason. */
export async function createBooking(
  cookie: string | null,
  input: CreateBookingInput
): Promise<ProxyResult<RawBooking>> {
  return proxyAsUser<RawBooking>(
    "/bookings/",
    {
      method: "POST",
      body: JSON.stringify({
        barber: input.barberId,
        service: input.serviceId,
        date: input.date,
        time: input.time,
      }),
    },
    cookie
  );
}

const STATUS_ACTION: Record<Exclude<BookingStatusKey, "pending">, string> = {
  confirmed: "confirm",
  completed: "complete",
  cancelled: "cancel",
};

/** `POST /bookings/<id>/confirm|complete|cancel/`. */
export async function setBookingStatus(
  cookie: string | null,
  id: string,
  status: Exclude<BookingStatusKey, "pending">
): Promise<ProxyResult<unknown>> {
  return proxyAsUser(`/bookings/${id}/${STATUS_ACTION[status]}/`, { method: "POST", body: "{}" }, cookie);
}

/**
 * `GET /bookings/available-slots/` — the times an usta still has free.
 *
 * When it can't be read (signed out, or the query shape differs from what the
 * backend expects) the caller shows every slot as open rather than inventing
 * which ones are taken.
 */
export async function fetchAvailableSlots(
  cookie: string | null,
  params: { barberId: string; date: string; serviceId?: string }
): Promise<ProxyResult<string[]>> {
  const query = new URLSearchParams({ barber: params.barberId, date: params.date });
  if (params.serviceId) query.set("service", params.serviceId);

  const result = await proxyAsUser<
    { slots?: string[]; available_slots?: string[]; times?: string[] } | string[]
  >(`/bookings/available-slots/?${query.toString()}`, {}, cookie);

  const raw = Array.isArray(result.data)
    ? result.data
    : (result.data?.slots ?? result.data?.available_slots ?? result.data?.times ?? []);

  return { ...result, data: result.ok ? raw.map((slot) => normalizeTime(String(slot))) : null };
}
