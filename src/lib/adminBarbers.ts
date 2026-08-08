import { BARBERS } from "@/lib/barbers";

export type BarberStatus = "active" | "blocked";

export interface ManagedBarber {
  id: string;
  name: string;
  specialty: string;
  avatarColor: string;
  status: BarberStatus;
}

const BLOCKED_IDS = new Set(["7", "8"]);

export const MANAGED_BARBERS: ManagedBarber[] = BARBERS.map((barber) => ({
  id: barber.id,
  name: barber.name,
  specialty: barber.specialty,
  avatarColor: barber.avatarColor,
  status: BLOCKED_IDS.has(barber.id) ? "blocked" : "active",
}));

export const AVATAR_PALETTE = [
  "#145ee5",
  "#0d9488",
  "#f97316",
  "#2563eb",
  "#db2777",
  "#7c3aed",
  "#0891b2",
  "#ca8a04",
  "#e11d48",
];
