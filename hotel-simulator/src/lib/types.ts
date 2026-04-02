export type RoomStatus = "available" | "occupied" | "dirty" | "clean" | "maintenance" | "out-of-order";
export type RoomType = "Standard" | "Deluxe" | "Suite" | "Presidential";
export type BookingSource = "OTA-Expedia" | "OTA-Booking" | "Direct" | "Walk-in" | "Corporate";
export type LoyaltyTier = "Bronze" | "Silver" | "Gold" | "Platinum";
export type DemandLevel = "Low" | "Medium" | "High" | "Peak";
export type ReservationStatus = "confirmed" | "checked-in" | "checked-out" | "cancelled" | "no-show";

export interface Room {
  id: string;
  number: string;
  floor: number;
  type: RoomType;
  status: RoomStatus;
  guestId?: string;
  rate: number;
  maintenanceNote?: string;
  lastCleaned?: string;
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  loyaltyTier: LoyaltyTier;
  isVip: boolean;
  totalStays: number;
  totalSpent: number;
  preferences: string[];
  dietaryNotes: string;
  specialRequests: string;
  satisfactionScore?: number;
  lastStay?: string;
}

export interface Reservation {
  id: string;
  guestId: string;
  guestName: string;
  roomId?: string;
  roomNumber?: string;
  roomType: RoomType;
  checkIn: string;
  checkOut: string;
  nightlyRate: number;
  totalAmount: number;
  source: BookingSource;
  status: ReservationStatus;
  specialRequests?: string;
  createdAt: string;
  isLateArrival?: boolean;
}

export interface HousekeepingTask {
  id: string;
  roomId: string;
  roomNumber: string;
  floor: number;
  priority: "urgent" | "normal" | "low";
  status: "pending" | "in-progress" | "completed";
  assignedTo?: string;
  createdAt: string;
  completedAt?: string;
}

export interface RevenueData {
  date: string;
  revenue: number;
  occupancy: number;
  adr: number;
  revpar: number;
}

export interface CompetitorRate {
  name: string;
  standard: number;
  deluxe: number;
  suite: number;
  presidential: number;
  occupancy: number;
}

export interface Alert {
  id: string;
  type: "overdue-checkout" | "maintenance" | "vip-arrival" | "no-show" | "low-inventory";
  message: string;
  severity: "info" | "warning" | "critical";
  timestamp: string;
  resolved: boolean;
}
