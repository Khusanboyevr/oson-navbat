export interface Service {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Barber {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  location: string;
  coordinates: Coordinates;
  avatarColor: string;
  bio: string;
  services: Service[];
}

export const BARBERS: Barber[] = [
  {
    id: "1",
    name: "Aziz Barbershop",
    specialty: "Fade • Soqol olish",
    rating: 4.9,
    location: "Chilonzor, Toshkent",
    coordinates: { lat: 41.2755, lng: 69.2034 },
    avatarColor: "#0d9488",
    bio: "5 yildan ortiq tajribaga ega usta. Zamonaviy fade va soqol dizaynida ixtisoslashgan.",
    services: [
      { id: "1-1", name: "Soch olish", price: 40000, durationMinutes: 30 },
      { id: "1-2", name: "Soqol olish", price: 25000, durationMinutes: 20 },
      { id: "1-3", name: "Soch va soqol", price: 60000, durationMinutes: 45 },
    ],
  },
  {
    id: "2",
    name: "Kingdom Cuts",
    specialty: "Klassik • Bolalar",
    rating: 4.8,
    location: "Yunusobod, Toshkent",
    coordinates: { lat: 41.3608, lng: 69.2887 },
    avatarColor: "#f97316",
    bio: "Oilaviy salon — katta va kichiklar uchun qulay muhit va tajribali ustalar.",
    services: [
      { id: "2-1", name: "Klassik soch olish", price: 35000, durationMinutes: 30 },
      { id: "2-2", name: "Bolalar soch olish", price: 30000, durationMinutes: 25 },
      { id: "2-3", name: "Ota-bola combo", price: 55000, durationMinutes: 50 },
    ],
  },
  {
    id: "3",
    name: "Blade Studio",
    specialty: "Fade • Dizayn",
    rating: 4.7,
    location: "Mirzo Ulug'bek, Toshkent",
    coordinates: { lat: 41.3300, lng: 69.3222 },
    avatarColor: "#2563eb",
    bio: "Ijodiy fade va soch dizaynida professional jamoa. Zamonaviy uslublar bo'yicha doimiy yangilanish.",
    services: [
      { id: "3-1", name: "Fade dizayn", price: 55000, durationMinutes: 40 },
      { id: "3-2", name: "Soch olish", price: 40000, durationMinutes: 30 },
      { id: "3-3", name: "Soch chizish (dizayn)", price: 20000, durationMinutes: 15 },
    ],
  },
  {
    id: "4",
    name: "Glamour Beauty",
    specialty: "Soch turmagi • Manikyur",
    rating: 4.9,
    location: "Shayxontohur, Toshkent",
    coordinates: { lat: 41.3218, lng: 69.2274 },
    avatarColor: "#db2777",
    bio: "Ayollar uchun to'liq go'zallik xizmatlari: soch turmagi, manikyur va boshqa parvarish xizmatlari.",
    services: [
      { id: "4-1", name: "Soch turmagi", price: 80000, durationMinutes: 60 },
      { id: "4-2", name: "Manikyur", price: 60000, durationMinutes: 45 },
      { id: "4-3", name: "Pedikyur", price: 70000, durationMinutes: 50 },
    ],
  },
  {
    id: "5",
    name: "Elite Barber Lounge",
    specialty: "Premium • Soqol parvarishi",
    rating: 4.6,
    location: "Yashnobod, Toshkent",
    coordinates: { lat: 41.2856, lng: 69.3196 },
    avatarColor: "#7c3aed",
    bio: "Premium darajadagi xizmat, issiq sochiq bilan soqol parvarishi va VIP muhit.",
    services: [
      { id: "5-1", name: "Premium soch olish", price: 70000, durationMinutes: 40 },
      { id: "5-2", name: "Soqol parvarishi", price: 45000, durationMinutes: 30 },
      { id: "5-3", name: "To'liq parvarish paketi", price: 100000, durationMinutes: 70 },
    ],
  },
  {
    id: "6",
    name: "Kids Style",
    specialty: "Bolalar • Ota-bola",
    rating: 4.8,
    location: "Sergeli, Toshkent",
    coordinates: { lat: 41.2075, lng: 69.2154 },
    avatarColor: "#0891b2",
    bio: "Bolalar uchun maxsus jihozlangan, qulay va xavfsiz soch olish tajribasi.",
    services: [
      { id: "6-1", name: "Bolalar soch olish (0-6 yosh)", price: 25000, durationMinutes: 20 },
      { id: "6-2", name: "Bolalar soch olish (7-14 yosh)", price: 30000, durationMinutes: 25 },
      { id: "6-3", name: "Ota-bola combo", price: 50000, durationMinutes: 45 },
    ],
  },
  {
    id: "7",
    name: "Modern Cuts",
    specialty: "Fade • Ranglash",
    rating: 4.5,
    location: "Olmazor, Toshkent",
    coordinates: { lat: 41.3550, lng: 69.1950 },
    avatarColor: "#ca8a04",
    bio: "Zamonaviy fade va soch ranglash bo'yicha mutaxassislar jamoasi.",
    services: [
      { id: "7-1", name: "Fade soch olish", price: 45000, durationMinutes: 35 },
      { id: "7-2", name: "Soch ranglash", price: 90000, durationMinutes: 60 },
      { id: "7-3", name: "Soch olish + ranglash", price: 120000, durationMinutes: 90 },
    ],
  },
  {
    id: "8",
    name: "Beauty House",
    specialty: "Kosmetologiya • Kirpik",
    rating: 4.9,
    location: "Bektemir, Toshkent",
    coordinates: { lat: 41.2333, lng: 69.3480 },
    avatarColor: "#e11d48",
    bio: "Kosmetologiya va kirpik xizmatlari bo'yicha professional go'zallik markazi.",
    services: [
      { id: "8-1", name: "Kirpik uzaytirish", price: 150000, durationMinutes: 90 },
      { id: "8-2", name: "Yuz tozalash", price: 100000, durationMinutes: 60 },
      { id: "8-3", name: "Qosh dizayni", price: 40000, durationMinutes: 30 },
    ],
  },
];

export function getBarberById(id: string): Barber | undefined {
  return BARBERS.find((barber) => barber.id === id);
}
