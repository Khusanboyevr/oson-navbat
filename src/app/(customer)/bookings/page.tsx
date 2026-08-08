import type { Metadata } from "next";
import BookingsView from "@/components/bookings/BookingsView";
import { BOOKINGS } from "@/lib/bookings";

export const metadata: Metadata = {
  title: "Mening bronlarim",
};

export default function BookingsPage() {
  return <BookingsView bookings={BOOKINGS} />;
}
