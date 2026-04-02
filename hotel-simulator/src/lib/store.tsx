"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  Room,
  Guest,
  Reservation,
  HousekeepingTask,
  RevenueData,
  Alert,
} from "./types";

interface HotelState {
  rooms: Room[];
  guests: Guest[];
  reservations: Reservation[];
  housekeepingTasks: HousekeepingTask[];
  revenueData: RevenueData[];
  alerts: Alert[];
  currentDate: string;
  setRooms: (rooms: Room[]) => void;
  setGuests: (guests: Guest[]) => void;
  setReservations: (reservations: Reservation[]) => void;
  setHousekeepingTasks: (tasks: HousekeepingTask[]) => void;
  setRevenueData: (data: RevenueData[]) => void;
  setAlerts: (alerts: Alert[]) => void;
  setCurrentDate: (date: string) => void;
}

const HotelContext = createContext<HotelState | undefined>(undefined);

export function HotelProvider({ children }: { children: ReactNode }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [housekeepingTasks, setHousekeepingTasks] = useState<HousekeepingTask[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [currentDate, setCurrentDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  return (
    <HotelContext.Provider
      value={{
        rooms,
        guests,
        reservations,
        housekeepingTasks,
        revenueData,
        alerts,
        currentDate,
        setRooms,
        setGuests,
        setReservations,
        setHousekeepingTasks,
        setRevenueData,
        setAlerts,
        setCurrentDate,
      }}
    >
      {children}
    </HotelContext.Provider>
  );
}

export function useHotel() {
  const context = useContext(HotelContext);
  if (context === undefined) {
    throw new Error("useHotel must be used within a HotelProvider");
  }
  return context;
}
