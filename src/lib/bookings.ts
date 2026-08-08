export type BookingStatus = "pending" | "confirmed" | "completed";

export interface Booking {
  id: string;
  barberId: string;
  serviceName: string;
  price: number;
  dateLabel: string;
  time: string;
  status: BookingStatus;
}

export const BOOKINGS: Booking[] = [
  {
    id: "b1",
    barberId: "1",
    serviceName: "Soch va soqol",
    price: 60000,
    dateLabel: "Bugun",
    time: "15:30",
    status: "pending",
  },
  {
    id: "b2",
    barberId: "3",
    serviceName: "Fade dizayn",
    price: 55000,
    dateLabel: "Ertaga",
    time: "11:00",
    status: "confirmed",
  },
  {
    id: "b3",
    barberId: "2",
    serviceName: "Bolalar soch olish",
    price: 30000,
    dateLabel: "3-avgust",
    time: "10:00",
    status: "completed",
  },
  {
    id: "b4",
    barberId: "5",
    serviceName: "Premium soch olish",
    price: 70000,
    dateLabel: "28-iyul",
    time: "16:00",
    status: "completed",
  },
  {
    id: "b5",
    barberId: "7",
    serviceName: "Fade soch olish",
    price: 45000,
    dateLabel: "20-iyul",
    time: "09:30",
    status: "completed",
  },
];
