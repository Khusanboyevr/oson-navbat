import { AVATAR_PALETTE } from "@/lib/adminBarbers";

export type CustomerStatus = "active" | "blocked";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  totalBookings: number;
  status: CustomerStatus;
  avatarColor: string;
}

export const CUSTOMERS: Customer[] = [
  {
    id: "c1",
    name: "Javlon Mirzayev",
    phone: "+998 90 *** ** 11",
    totalBookings: 12,
    status: "active",
    avatarColor: AVATAR_PALETTE[0],
  },
  {
    id: "c2",
    name: "Nilufar Xolova",
    phone: "+998 91 *** ** 22",
    totalBookings: 8,
    status: "active",
    avatarColor: AVATAR_PALETTE[1],
  },
  {
    id: "c3",
    name: "Otabek Yusupov",
    phone: "+998 93 *** ** 33",
    totalBookings: 3,
    status: "active",
    avatarColor: AVATAR_PALETTE[2],
  },
  {
    id: "c4",
    name: "Zarina Qodirova",
    phone: "+998 94 *** ** 44",
    totalBookings: 15,
    status: "active",
    avatarColor: AVATAR_PALETTE[3],
  },
  {
    id: "c5",
    name: "Sanjar Toshpo'latov",
    phone: "+998 95 *** ** 55",
    totalBookings: 1,
    status: "active",
    avatarColor: AVATAR_PALETTE[4],
  },
  {
    id: "c6",
    name: "Gulnoza Saidova",
    phone: "+998 97 *** ** 66",
    totalBookings: 6,
    status: "active",
    avatarColor: AVATAR_PALETTE[5],
  },
  {
    id: "c7",
    name: "Farrux Islomov",
    phone: "+998 99 *** ** 77",
    totalBookings: 0,
    status: "blocked",
    avatarColor: AVATAR_PALETTE[6],
  },
  {
    id: "c8",
    name: "Madina Ergasheva",
    phone: "+998 90 *** ** 88",
    totalBookings: 20,
    status: "active",
    avatarColor: AVATAR_PALETTE[7],
  },
  {
    id: "c9",
    name: "Bekzod Nurmatov",
    phone: "+998 91 *** ** 99",
    totalBookings: 4,
    status: "blocked",
    avatarColor: AVATAR_PALETTE[8],
  },
];
