import type {
  Room,
  RoomType,
  RoomStatus,
  Guest,
  Reservation,
  BookingSource,
  HousekeepingTask,
  RevenueData,
  CompetitorRate,
  Alert,
  DemandLevel,
} from "./types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function dayOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function isoNow(): string {
  return new Date().toISOString();
}

let _uid = 0;
function uid(prefix: string): string {
  _uid += 1;
  return `${prefix}-${String(_uid).padStart(4, "0")}`;
}

// ---------------------------------------------------------------------------
// Rooms (60 total across 5 floors)
// ---------------------------------------------------------------------------

function buildRooms(): Room[] {
  const rooms: Room[] = [];

  const floorConfig: { floor: number; count: number }[] = [
    { floor: 1, count: 14 },
    { floor: 2, count: 14 },
    { floor: 3, count: 12 },
    { floor: 4, count: 12 },
    { floor: 5, count: 8 },
  ];

  // Type distribution by floor (lower floors mostly standard, upper floors have suites/presidential)
  const typeByFloor: Record<number, RoomType[]> = {
    1: ["Standard", "Standard", "Standard", "Standard", "Standard", "Standard", "Standard", "Standard", "Standard", "Standard", "Deluxe", "Deluxe", "Deluxe", "Deluxe"],
    2: ["Standard", "Standard", "Standard", "Standard", "Standard", "Standard", "Standard", "Deluxe", "Deluxe", "Deluxe", "Deluxe", "Deluxe", "Suite", "Suite"],
    3: ["Standard", "Standard", "Standard", "Standard", "Deluxe", "Deluxe", "Deluxe", "Suite", "Suite", "Suite", "Suite", "Presidential"],
    4: ["Standard", "Standard", "Standard", "Deluxe", "Deluxe", "Suite", "Suite", "Suite", "Suite", "Presidential", "Presidential", "Presidential"],
    5: ["Deluxe", "Deluxe", "Suite", "Suite", "Suite", "Presidential", "Presidential", "Presidential"],
  };

  const baseRate: Record<RoomType, number> = {
    Standard: 149,
    Deluxe: 229,
    Suite: 349,
    Presidential: 599,
  };

  for (const { floor, count } of floorConfig) {
    const types = typeByFloor[floor];
    for (let i = 0; i < count; i++) {
      const roomNum = `${floor}${String(i + 1).padStart(2, "0")}`;
      const type = types[i];
      rooms.push({
        id: uid("room"),
        number: roomNum,
        floor,
        type,
        status: "available" as RoomStatus, // will be assigned below
        rate: baseRate[type],
      });
    }
  }

  return rooms;
}

// ---------------------------------------------------------------------------
// Guests (25 profiles)
// ---------------------------------------------------------------------------

const guestData: Omit<Guest, "id">[] = [
  { firstName: "James", lastName: "Anderson", email: "j.anderson@email.com", phone: "+1-555-0101", loyaltyTier: "Platinum", isVip: true, totalStays: 42, totalSpent: 67800, preferences: ["High floor", "King bed", "Late checkout"], dietaryNotes: "Gluten-free", specialRequests: "Extra pillows", satisfactionScore: 9.2, lastStay: dayOffset(-14) },
  { firstName: "Maria", lastName: "Garcia", email: "m.garcia@email.com", phone: "+1-555-0102", loyaltyTier: "Gold", isVip: true, totalStays: 28, totalSpent: 38500, preferences: ["Quiet room", "Non-smoking"], dietaryNotes: "Vegetarian", specialRequests: "Feather-free bedding", satisfactionScore: 8.8, lastStay: dayOffset(-7) },
  { firstName: "Robert", lastName: "Chen", email: "r.chen@email.com", phone: "+1-555-0103", loyaltyTier: "Silver", isVip: false, totalStays: 12, totalSpent: 14200, preferences: ["Corner room"], dietaryNotes: "", specialRequests: "", satisfactionScore: 7.5, lastStay: dayOffset(-30) },
  { firstName: "Sarah", lastName: "Williams", email: "s.williams@email.com", phone: "+1-555-0104", loyaltyTier: "Gold", isVip: true, totalStays: 31, totalSpent: 52100, preferences: ["Suite", "Ocean view"], dietaryNotes: "Nut allergy", specialRequests: "Champagne on arrival", satisfactionScore: 9.5, lastStay: dayOffset(-3) },
  { firstName: "Michael", lastName: "Johnson", email: "m.johnson@email.com", phone: "+1-555-0105", loyaltyTier: "Bronze", isVip: false, totalStays: 3, totalSpent: 2100, preferences: [], dietaryNotes: "", specialRequests: "", satisfactionScore: 6.8, lastStay: dayOffset(-60) },
  { firstName: "Emily", lastName: "Brown", email: "e.brown@email.com", phone: "+1-555-0106", loyaltyTier: "Silver", isVip: false, totalStays: 8, totalSpent: 9600, preferences: ["Low floor", "Near elevator"], dietaryNotes: "Dairy-free", specialRequests: "", satisfactionScore: 7.9, lastStay: dayOffset(-21) },
  { firstName: "David", lastName: "Kim", email: "d.kim@email.com", phone: "+1-555-0107", loyaltyTier: "Platinum", isVip: true, totalStays: 55, totalSpent: 98000, preferences: ["Presidential suite", "Butler service"], dietaryNotes: "Kosher", specialRequests: "Fresh flowers daily", satisfactionScore: 9.8, lastStay: dayOffset(-2) },
  { firstName: "Jennifer", lastName: "Martinez", email: "j.martinez@email.com", phone: "+1-555-0108", loyaltyTier: "Gold", isVip: false, totalStays: 19, totalSpent: 24300, preferences: ["Twin beds"], dietaryNotes: "", specialRequests: "Extra towels", satisfactionScore: 8.1, lastStay: dayOffset(-10) },
  { firstName: "Christopher", lastName: "Lee", email: "c.lee@email.com", phone: "+1-555-0109", loyaltyTier: "Bronze", isVip: false, totalStays: 2, totalSpent: 890, preferences: [], dietaryNotes: "", specialRequests: "", satisfactionScore: 7.0, lastStay: dayOffset(-90) },
  { firstName: "Amanda", lastName: "Taylor", email: "a.taylor@email.com", phone: "+1-555-0110", loyaltyTier: "Silver", isVip: false, totalStays: 10, totalSpent: 13400, preferences: ["Bathtub", "Quiet room"], dietaryNotes: "Vegan", specialRequests: "Yoga mat in room", satisfactionScore: 8.4, lastStay: dayOffset(-5) },
  { firstName: "Daniel", lastName: "Wilson", email: "d.wilson@email.com", phone: "+1-555-0111", loyaltyTier: "Gold", isVip: true, totalStays: 25, totalSpent: 41200, preferences: ["High floor", "City view"], dietaryNotes: "", specialRequests: "Newspaper delivery", satisfactionScore: 8.9, lastStay: dayOffset(-1) },
  { firstName: "Jessica", lastName: "Moore", email: "j.moore@email.com", phone: "+1-555-0112", loyaltyTier: "Bronze", isVip: false, totalStays: 4, totalSpent: 3200, preferences: [], dietaryNotes: "Pescatarian", specialRequests: "", satisfactionScore: 7.2, lastStay: dayOffset(-45) },
  { firstName: "Matthew", lastName: "Thomas", email: "m.thomas@email.com", phone: "+1-555-0113", loyaltyTier: "Silver", isVip: false, totalStays: 15, totalSpent: 18700, preferences: ["King bed", "Work desk"], dietaryNotes: "", specialRequests: "Iron and ironing board", satisfactionScore: 7.7, lastStay: dayOffset(-8) },
  { firstName: "Ashley", lastName: "Jackson", email: "a.jackson@email.com", phone: "+1-555-0114", loyaltyTier: "Platinum", isVip: true, totalStays: 38, totalSpent: 72500, preferences: ["Suite", "Late checkout", "Minibar stocked"], dietaryNotes: "Halal", specialRequests: "Airport transfer", satisfactionScore: 9.4, lastStay: dayOffset(-4) },
  { firstName: "Andrew", lastName: "White", email: "a.white@email.com", phone: "+1-555-0115", loyaltyTier: "Bronze", isVip: false, totalStays: 1, totalSpent: 450, preferences: [], dietaryNotes: "", specialRequests: "", lastStay: dayOffset(-120) },
  { firstName: "Sophia", lastName: "Harris", email: "s.harris@email.com", phone: "+1-555-0116", loyaltyTier: "Gold", isVip: false, totalStays: 22, totalSpent: 29800, preferences: ["Non-smoking", "Extra blankets"], dietaryNotes: "Lactose intolerant", specialRequests: "", satisfactionScore: 8.6, lastStay: dayOffset(-12) },
  { firstName: "Ryan", lastName: "Clark", email: "r.clark@email.com", phone: "+1-555-0117", loyaltyTier: "Silver", isVip: false, totalStays: 9, totalSpent: 10300, preferences: ["Ground floor"], dietaryNotes: "", specialRequests: "Wheelchair accessible", satisfactionScore: 7.3, lastStay: dayOffset(-25) },
  { firstName: "Olivia", lastName: "Lewis", email: "o.lewis@email.com", phone: "+1-555-0118", loyaltyTier: "Gold", isVip: true, totalStays: 20, totalSpent: 35600, preferences: ["Balcony", "Quiet floor"], dietaryNotes: "", specialRequests: "Crib for infant", satisfactionScore: 8.7, lastStay: dayOffset(-6) },
  { firstName: "Brandon", lastName: "Walker", email: "b.walker@email.com", phone: "+1-555-0119", loyaltyTier: "Bronze", isVip: false, totalStays: 5, totalSpent: 4100, preferences: [], dietaryNotes: "", specialRequests: "", satisfactionScore: 6.5, lastStay: dayOffset(-50) },
  { firstName: "Rachel", lastName: "Hall", email: "r.hall@email.com", phone: "+1-555-0120", loyaltyTier: "Silver", isVip: false, totalStays: 11, totalSpent: 15200, preferences: ["King bed"], dietaryNotes: "No shellfish", specialRequests: "", satisfactionScore: 7.8, lastStay: dayOffset(-15) },
  { firstName: "Kevin", lastName: "Allen", email: "k.allen@email.com", phone: "+1-555-0121", loyaltyTier: "Platinum", isVip: true, totalStays: 47, totalSpent: 85300, preferences: ["Presidential suite", "Airport pickup"], dietaryNotes: "", specialRequests: "Personal concierge", satisfactionScore: 9.6, lastStay: dayOffset(-1) },
  { firstName: "Lauren", lastName: "Young", email: "l.young@email.com", phone: "+1-555-0122", loyaltyTier: "Gold", isVip: false, totalStays: 16, totalSpent: 21400, preferences: ["Non-smoking", "High floor"], dietaryNotes: "Vegetarian", specialRequests: "", satisfactionScore: 8.3, lastStay: dayOffset(-18) },
  { firstName: "Thomas", lastName: "King", email: "t.king@email.com", phone: "+1-555-0123", loyaltyTier: "Bronze", isVip: false, totalStays: 6, totalSpent: 5700, preferences: [], dietaryNotes: "", specialRequests: "", satisfactionScore: 7.1, lastStay: dayOffset(-35) },
  { firstName: "Natalie", lastName: "Wright", email: "n.wright@email.com", phone: "+1-555-0124", loyaltyTier: "Silver", isVip: false, totalStays: 13, totalSpent: 16800, preferences: ["Bathtub", "Extra pillows"], dietaryNotes: "", specialRequests: "Late check-in (after 10pm)", satisfactionScore: 8.0, lastStay: dayOffset(-9) },
  { firstName: "Patrick", lastName: "Scott", email: "p.scott@email.com", phone: "+1-555-0125", loyaltyTier: "Gold", isVip: true, totalStays: 24, totalSpent: 44600, preferences: ["Suite", "Club lounge access"], dietaryNotes: "Paleo", specialRequests: "Birthday cake on arrival", satisfactionScore: 9.1, lastStay: dayOffset(-2) },
];

// ---------------------------------------------------------------------------
// Build all data
// ---------------------------------------------------------------------------

const allRooms: Room[] = buildRooms();

export const guests: Guest[] = guestData.map((g) => ({
  id: uid("guest"),
  ...g,
}));

// Assign ~40 rooms as occupied, some dirty, maintenance, etc.
const occupiedCount = 40;
const dirtyCount = 6;
const maintenanceCount = 3;
const cleanCount = 4;

// Shuffle room indices for random assignment
const shuffledIndices = allRooms.map((_, i) => i);
for (let i = shuffledIndices.length - 1; i > 0; i--) {
  const j = Math.floor((i * 7 + 3) % (i + 1)); // deterministic shuffle
  [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
}

// Assign statuses
for (let i = 0; i < shuffledIndices.length; i++) {
  const room = allRooms[shuffledIndices[i]];
  if (i < occupiedCount) {
    room.status = "occupied";
    room.guestId = guests[i % guests.length].id;
  } else if (i < occupiedCount + dirtyCount) {
    room.status = "dirty";
    room.lastCleaned = dayOffset(-1);
  } else if (i < occupiedCount + dirtyCount + maintenanceCount) {
    room.status = "maintenance";
    room.maintenanceNote = ["HVAC repair needed", "Plumbing leak in bathroom", "Window seal replacement"][i - occupiedCount - dirtyCount];
  } else if (i < occupiedCount + dirtyCount + maintenanceCount + cleanCount) {
    room.status = "clean";
    room.lastCleaned = isoNow();
  } else {
    room.status = "available";
    room.lastCleaned = dayOffset(-1);
  }
}

export const rooms: Room[] = allRooms;

// ---------------------------------------------------------------------------
// Reservations (50 total)
// ---------------------------------------------------------------------------

const sources: BookingSource[] = ["OTA-Expedia", "OTA-Booking", "Direct", "Walk-in", "Corporate"];
const roomTypes: RoomType[] = ["Standard", "Deluxe", "Suite", "Presidential"];

function buildReservations(): Reservation[] {
  const reservations: Reservation[] = [];

  const occupiedRooms = rooms.filter((r) => r.status === "occupied");

  // Current checked-in reservations (match occupied rooms)
  for (let i = 0; i < occupiedRooms.length && i < 25; i++) {
    const room = occupiedRooms[i];
    const guest = guests[i % guests.length];
    const stayLen = (i % 4) + 1;
    const checkInOffset = -(i % 3) - 1;
    reservations.push({
      id: uid("res"),
      guestId: guest.id,
      guestName: `${guest.firstName} ${guest.lastName}`,
      roomId: room.id,
      roomNumber: room.number,
      roomType: room.type,
      checkIn: dayOffset(checkInOffset),
      checkOut: dayOffset(checkInOffset + stayLen + 1),
      nightlyRate: room.rate,
      totalAmount: room.rate * (stayLen + 1),
      source: sources[i % sources.length],
      status: "checked-in",
      specialRequests: guest.specialRequests || undefined,
      createdAt: dayOffset(checkInOffset - 14),
    });
  }

  // Past checked-out reservations (10)
  for (let i = 0; i < 10; i++) {
    const guest = guests[(i + 5) % guests.length];
    const rt = roomTypes[i % roomTypes.length];
    const rate = { Standard: 149, Deluxe: 229, Suite: 349, Presidential: 599 }[rt];
    const coOffset = -(i + 1);
    const nights = (i % 3) + 2;
    reservations.push({
      id: uid("res"),
      guestId: guest.id,
      guestName: `${guest.firstName} ${guest.lastName}`,
      roomType: rt,
      checkIn: dayOffset(coOffset - nights),
      checkOut: dayOffset(coOffset),
      nightlyRate: rate,
      totalAmount: rate * nights,
      source: sources[(i + 2) % sources.length],
      status: "checked-out",
      createdAt: dayOffset(coOffset - nights - 7),
    });
  }

  // Future confirmed reservations (10)
  for (let i = 0; i < 10; i++) {
    const guest = guests[(i + 10) % guests.length];
    const rt = roomTypes[i % roomTypes.length];
    const rate = { Standard: 149, Deluxe: 229, Suite: 349, Presidential: 599 }[rt];
    const ciOffset = i + 1;
    const nights = (i % 4) + 1;
    reservations.push({
      id: uid("res"),
      guestId: guest.id,
      guestName: `${guest.firstName} ${guest.lastName}`,
      roomType: rt,
      checkIn: dayOffset(ciOffset),
      checkOut: dayOffset(ciOffset + nights),
      nightlyRate: rate,
      totalAmount: rate * nights,
      source: sources[(i + 1) % sources.length],
      status: "confirmed",
      specialRequests: i % 3 === 0 ? "Early check-in requested" : undefined,
      createdAt: dayOffset(ciOffset - 21),
      isLateArrival: i % 4 === 0,
    });
  }

  // Cancelled reservations (3)
  for (let i = 0; i < 3; i++) {
    const guest = guests[(i + 20) % guests.length];
    reservations.push({
      id: uid("res"),
      guestId: guest.id,
      guestName: `${guest.firstName} ${guest.lastName}`,
      roomType: "Standard",
      checkIn: dayOffset(i + 3),
      checkOut: dayOffset(i + 5),
      nightlyRate: 149,
      totalAmount: 298,
      source: "OTA-Expedia",
      status: "cancelled",
      createdAt: dayOffset(-10),
    });
  }

  // No-shows (2)
  for (let i = 0; i < 2; i++) {
    const guest = guests[(i + 23) % guests.length];
    reservations.push({
      id: uid("res"),
      guestId: guest.id,
      guestName: `${guest.firstName} ${guest.lastName}`,
      roomType: "Deluxe",
      checkIn: dayOffset(-1),
      checkOut: dayOffset(1),
      nightlyRate: 229,
      totalAmount: 458,
      source: "Direct",
      status: "no-show",
      createdAt: dayOffset(-15),
    });
  }

  return reservations;
}

export const reservations: Reservation[] = buildReservations();

// ---------------------------------------------------------------------------
// Housekeeping tasks (auto-generated from dirty rooms + some extras)
// ---------------------------------------------------------------------------

function buildHousekeepingTasks(): HousekeepingTask[] {
  const tasks: HousekeepingTask[] = [];
  const housekeepers = ["Maria S.", "Carlos R.", "Priya K.", "Ahmed B.", "Lisa T."];

  const dirtyRooms = rooms.filter((r) => r.status === "dirty");
  for (const room of dirtyRooms) {
    tasks.push({
      id: uid("hk"),
      roomId: room.id,
      roomNumber: room.number,
      floor: room.floor,
      priority: "urgent",
      status: "pending",
      createdAt: isoNow(),
    });
  }

  // Some in-progress tasks for occupied rooms needing turndown
  const occupiedRooms = rooms.filter((r) => r.status === "occupied");
  for (let i = 0; i < 4 && i < occupiedRooms.length; i++) {
    tasks.push({
      id: uid("hk"),
      roomId: occupiedRooms[i].id,
      roomNumber: occupiedRooms[i].number,
      floor: occupiedRooms[i].floor,
      priority: "normal",
      status: "in-progress",
      assignedTo: housekeepers[i % housekeepers.length],
      createdAt: isoNow(),
    });
  }

  // Some completed tasks
  for (let i = 4; i < 7 && i < occupiedRooms.length; i++) {
    const completedTime = new Date();
    completedTime.setHours(completedTime.getHours() - (i - 3));
    tasks.push({
      id: uid("hk"),
      roomId: occupiedRooms[i].id,
      roomNumber: occupiedRooms[i].number,
      floor: occupiedRooms[i].floor,
      priority: "low",
      status: "completed",
      assignedTo: housekeepers[i % housekeepers.length],
      createdAt: dayOffset(0),
      completedAt: completedTime.toISOString(),
    });
  }

  return tasks;
}

export const housekeepingTasks: HousekeepingTask[] = buildHousekeepingTasks();

// ---------------------------------------------------------------------------
// Revenue data (last 7 days)
// ---------------------------------------------------------------------------

export const revenueData: RevenueData[] = Array.from({ length: 7 }, (_, i) => {
  const offset = -(6 - i);
  const occupancy = 60 + Math.floor(((i * 17 + 3) % 20)); // 60-79%
  const adr = 180 + Math.floor(((i * 23 + 7) % 60)); // $180-$239
  const revenue = Math.floor(adr * 60 * (occupancy / 100));
  const revpar = Math.floor(adr * (occupancy / 100));
  return {
    date: dayOffset(offset),
    revenue,
    occupancy,
    adr,
    revpar,
  };
});

// ---------------------------------------------------------------------------
// Competitor rates
// ---------------------------------------------------------------------------

export const competitorRates: CompetitorRate[] = [
  { name: "Grand Plaza Hotel", standard: 159, deluxe: 245, suite: 375, presidential: 649, occupancy: 72 },
  { name: "Riverside Inn & Suites", standard: 129, deluxe: 199, suite: 299, presidential: 519, occupancy: 68 },
  { name: "The Metropolitan", standard: 169, deluxe: 259, suite: 389, presidential: 679, occupancy: 75 },
];

// ---------------------------------------------------------------------------
// Alerts (9 total)
// ---------------------------------------------------------------------------

export const alerts: Alert[] = [
  { id: uid("alert"), type: "vip-arrival", message: "VIP guest David Kim arriving today - Presidential Suite requested", severity: "info", timestamp: isoNow(), resolved: false },
  { id: uid("alert"), type: "overdue-checkout", message: "Room 203 checkout overdue by 2 hours - guest not responding", severity: "warning", timestamp: isoNow(), resolved: false },
  { id: uid("alert"), type: "maintenance", message: "Room 312 - HVAC system malfunction reported by guest", severity: "critical", timestamp: isoNow(), resolved: false },
  { id: uid("alert"), type: "no-show", message: "Reservation RES-0048 marked as no-show - Natalie Wright", severity: "warning", timestamp: isoNow(), resolved: false },
  { id: uid("alert"), type: "low-inventory", message: "Only 3 Standard rooms available for tonight", severity: "warning", timestamp: isoNow(), resolved: false },
  { id: uid("alert"), type: "vip-arrival", message: "VIP guest Ashley Jackson checking in - Suite with airport transfer", severity: "info", timestamp: isoNow(), resolved: false },
  { id: uid("alert"), type: "maintenance", message: "Room 415 - Plumbing issue reported, maintenance dispatched", severity: "warning", timestamp: isoNow(), resolved: false },
  { id: uid("alert"), type: "overdue-checkout", message: "Room 108 late checkout not pre-approved - occupancy needed", severity: "critical", timestamp: isoNow(), resolved: false },
  { id: uid("alert"), type: "low-inventory", message: "No Presidential suites available for weekend block", severity: "info", timestamp: isoNow(), resolved: true },
];

// ---------------------------------------------------------------------------
// Dynamic pricing by demand level
// ---------------------------------------------------------------------------

export const dynamicPricing: Record<DemandLevel, Record<RoomType, number>> = {
  Low: { Standard: 119, Deluxe: 189, Suite: 289, Presidential: 499 },
  Medium: { Standard: 149, Deluxe: 229, Suite: 349, Presidential: 599 },
  High: { Standard: 189, Deluxe: 279, Suite: 419, Presidential: 749 },
  Peak: { Standard: 229, Deluxe: 339, Suite: 499, Presidential: 899 },
};

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

export function getOccupancyRate(): number {
  const occupied = rooms.filter((r) => r.status === "occupied").length;
  return Math.round((occupied / rooms.length) * 100);
}

export function getADR(): number {
  const occupiedRooms = rooms.filter((r) => r.status === "occupied");
  if (occupiedRooms.length === 0) return 0;
  const totalRate = occupiedRooms.reduce((sum, r) => sum + r.rate, 0);
  return Math.round(totalRate / occupiedRooms.length);
}

export function getRevPAR(): number {
  const totalRevenue = rooms
    .filter((r) => r.status === "occupied")
    .reduce((sum, r) => sum + r.rate, 0);
  return Math.round(totalRevenue / rooms.length);
}

export function getTodayArrivals(): Reservation[] {
  const today = dayOffset(0);
  return reservations.filter((r) => r.checkIn === today && (r.status === "confirmed" || r.status === "checked-in"));
}

export function getTodayDepartures(): Reservation[] {
  const today = dayOffset(0);
  return reservations.filter((r) => r.checkOut === today && (r.status === "checked-in" || r.status === "checked-out"));
}

export function getInHouseGuests(): number {
  return reservations.filter((r) => r.status === "checked-in").length;
}
