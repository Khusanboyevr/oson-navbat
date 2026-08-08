import BookingsView from "@/components/bookings/BookingsView";
import { BOOKINGS } from "@/lib/bookings";

export default function BookingsPage() {
  return <BookingsView bookings={BOOKINGS} />;
}
