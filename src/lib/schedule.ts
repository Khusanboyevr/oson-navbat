export type ScheduleStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface ScheduleEntry {
  id: string;
  time: string;
  clientName: string;
  clientPhone: string;
  serviceName: string;
  price: number;
  status: ScheduleStatus;
}

export const TODAY_SCHEDULE: ScheduleEntry[] = [
  {
    id: "s1",
    time: "09:00",
    clientName: "Jasur Aliyev",
    clientPhone: "+998 90 *** ** 12",
    serviceName: "Soch olish",
    price: 40000,
    status: "completed",
  },
  {
    id: "s2",
    time: "10:00",
    clientName: "Bobur Karimov",
    clientPhone: "+998 91 *** ** 34",
    serviceName: "Soch va soqol",
    price: 60000,
    status: "completed",
  },
  {
    id: "s3",
    time: "11:30",
    clientName: "Sardor Tashkentov",
    clientPhone: "+998 93 *** ** 56",
    serviceName: "Soqol olish",
    price: 25000,
    status: "completed",
  },
  {
    id: "s4",
    time: "13:00",
    clientName: "Dilnoza Rashidova",
    clientPhone: "+998 94 *** ** 78",
    serviceName: "Soch olish",
    price: 40000,
    status: "confirmed",
  },
  {
    id: "s5",
    time: "14:30",
    clientName: "Malika Yusupova",
    clientPhone: "+998 95 *** ** 90",
    serviceName: "Fade dizayn",
    price: 55000,
    status: "pending",
  },
  {
    id: "s6",
    time: "16:00",
    clientName: "Aziz Nortojiyev",
    clientPhone: "+998 97 *** ** 23",
    serviceName: "Soch va soqol",
    price: 60000,
    status: "pending",
  },
  {
    id: "s7",
    time: "17:30",
    clientName: "Kamron Yoqubov",
    clientPhone: "+998 99 *** ** 45",
    serviceName: "Soch olish",
    price: 40000,
    status: "cancelled",
  },
];
