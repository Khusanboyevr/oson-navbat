const WEEKDAYS_SHORT = ["Yak", "Dush", "Sesh", "Chor", "Pay", "Juma", "Shan"];
const MONTHS_SHORT = [
  "Yan",
  "Fev",
  "Mar",
  "Apr",
  "May",
  "Iyun",
  "Iyul",
  "Avg",
  "Sen",
  "Okt",
  "Noy",
  "Dek",
];

const TASHKENT_OFFSET_MS = 5 * 60 * 60 * 1000; // UTC+5, no DST

/**
 * "Now" in Asia/Tashkent, expressed via UTC getters.
 *
 * Deliberately avoids the local-timezone Date methods (getDate/getDay/getMonth): those
 * read whatever timezone the *runtime* happens to be in, which differs between the Vercel
 * server (likely UTC) and a user's browser (Asia/Tashkent) — causing both React hydration
 * mismatches and outright wrong "today" values. Shifting the UTC timestamp by a fixed
 * +5h offset and reading it back with UTC getters gives a deterministic Tashkent wall-clock
 * date regardless of where the code runs.
 */
function getTashkentNow(): Date {
  return new Date(Date.now() + TASHKENT_OFFSET_MS);
}

export function getTashkentTodayIso(): string {
  return getTashkentNow().toISOString().slice(0, 10);
}

export interface DateOption {
  iso: string;
  shortLabel: string;
  dayNumber: number;
  monthLabel: string;
}

export function getUpcomingDates(count: number): DateOption[] {
  const today = getTashkentNow();
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() + index);
    const shortLabel = index === 0 ? "Bugun" : index === 1 ? "Ertaga" : WEEKDAYS_SHORT[date.getUTCDay()];
    return {
      iso: date.toISOString().slice(0, 10),
      shortLabel,
      dayNumber: date.getUTCDate(),
      monthLabel: MONTHS_SHORT[date.getUTCMonth()],
    };
  });
}

export function formatDateLabel(iso: string): string {
  const [today, tomorrow] = getUpcomingDates(2);
  if (iso === today.iso) return "Bugun";
  if (iso === tomorrow.iso) return "Ertaga";
  const date = new Date(iso);
  return `${date.getUTCDate()}-${MONTHS_SHORT[date.getUTCMonth()]}`;
}

export const TIME_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
];

export function isSlotBooked(dateIndex: number, slotIndex: number): boolean {
  return (dateIndex * 5 + slotIndex * 3) % 7 === 0;
}
