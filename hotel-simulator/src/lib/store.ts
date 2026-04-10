"use client";

import React, { createContext, useContext, useReducer, type ReactNode } from "react";
import type {
  Room,
  RoomStatus,
  Guest,
  Reservation,
  ReservationStatus,
  HousekeepingTask,
  RevenueData,
  CompetitorRate,
  Alert,
} from "./types";
import {
  rooms as initialRooms,
  guests as initialGuests,
  reservations as initialReservations,
  housekeepingTasks as initialHousekeepingTasks,
  revenueData as initialRevenueData,
  competitorRates as initialCompetitorRates,
  alerts as initialAlerts,
} from "./mock-data";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface HotelState {
  rooms: Room[];
  guests: Guest[];
  reservations: Reservation[];
  housekeepingTasks: HousekeepingTask[];
  revenueData: RevenueData[];
  competitorRates: CompetitorRate[];
  alerts: Alert[];
}

const initialState: HotelState = {
  rooms: initialRooms,
  guests: initialGuests,
  reservations: initialReservations,
  housekeepingTasks: initialHousekeepingTasks,
  revenueData: initialRevenueData,
  competitorRates: initialCompetitorRates,
  alerts: initialAlerts,
};

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

type HotelAction =
  | { type: "UPDATE_ROOM_STATUS"; roomId: string; status: RoomStatus }
  | { type: "ASSIGN_GUEST_TO_ROOM"; roomId: string; guestId: string }
  | { type: "CHECK_IN_RESERVATION"; reservationId: string }
  | { type: "CHECK_OUT_RESERVATION"; reservationId: string }
  | { type: "CREATE_RESERVATION"; reservation: Reservation }
  | { type: "CANCEL_RESERVATION"; reservationId: string }
  | { type: "MARK_NO_SHOW"; reservationId: string }
  | { type: "UPDATE_HOUSEKEEPING_TASK"; taskId: string; status: HousekeepingTask["status"] }
  | { type: "RESOLVE_ALERT"; alertId: string }
  | { type: "UPDATE_GUEST_SATISFACTION"; guestId: string; score: number }
  | { type: "ADD_MAINTENANCE_NOTE"; roomId: string; note: string };

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function hotelReducer(state: HotelState, action: HotelAction): HotelState {
  switch (action.type) {
    case "UPDATE_ROOM_STATUS":
      return {
        ...state,
        rooms: state.rooms.map((r) =>
          r.id === action.roomId ? { ...r, status: action.status } : r
        ),
      };

    case "ASSIGN_GUEST_TO_ROOM":
      return {
        ...state,
        rooms: state.rooms.map((r) =>
          r.id === action.roomId
            ? { ...r, guestId: action.guestId, status: "occupied" as RoomStatus }
            : r
        ),
      };

    case "CHECK_IN_RESERVATION": {
      const reservation = state.reservations.find((r) => r.id === action.reservationId);
      if (!reservation) return state;

      // Find an available room of the right type if not already assigned
      let roomId = reservation.roomId;
      let roomNumber = reservation.roomNumber;
      if (!roomId) {
        const availableRoom = state.rooms.find(
          (r) => r.type === reservation.roomType && (r.status === "available" || r.status === "clean")
        );
        if (availableRoom) {
          roomId = availableRoom.id;
          roomNumber = availableRoom.number;
        }
      }

      return {
        ...state,
        reservations: state.reservations.map((r) =>
          r.id === action.reservationId
            ? { ...r, status: "checked-in" as ReservationStatus, roomId, roomNumber }
            : r
        ),
        rooms: roomId
          ? state.rooms.map((r) =>
              r.id === roomId
                ? { ...r, status: "occupied" as RoomStatus, guestId: reservation.guestId }
                : r
            )
          : state.rooms,
      };
    }

    case "CHECK_OUT_RESERVATION": {
      const reservation = state.reservations.find((r) => r.id === action.reservationId);
      if (!reservation) return state;

      return {
        ...state,
        reservations: state.reservations.map((r) =>
          r.id === action.reservationId
            ? { ...r, status: "checked-out" as ReservationStatus }
            : r
        ),
        rooms: reservation.roomId
          ? state.rooms.map((r) =>
              r.id === reservation.roomId
                ? { ...r, status: "dirty" as RoomStatus, guestId: undefined }
                : r
            )
          : state.rooms,
      };
    }

    case "CREATE_RESERVATION":
      return {
        ...state,
        reservations: [...state.reservations, action.reservation],
      };

    case "CANCEL_RESERVATION":
      return {
        ...state,
        reservations: state.reservations.map((r) =>
          r.id === action.reservationId
            ? { ...r, status: "cancelled" as ReservationStatus }
            : r
        ),
      };

    case "MARK_NO_SHOW":
      return {
        ...state,
        reservations: state.reservations.map((r) =>
          r.id === action.reservationId
            ? { ...r, status: "no-show" as ReservationStatus }
            : r
        ),
      };

    case "UPDATE_HOUSEKEEPING_TASK": {
      const now = new Date().toISOString();
      return {
        ...state,
        housekeepingTasks: state.housekeepingTasks.map((t) =>
          t.id === action.taskId
            ? {
                ...t,
                status: action.status,
                completedAt: action.status === "completed" ? now : t.completedAt,
              }
            : t
        ),
        // If completed, mark the room as clean
        rooms:
          action.status === "completed"
            ? (() => {
                const task = state.housekeepingTasks.find((t) => t.id === action.taskId);
                if (!task) return state.rooms;
                return state.rooms.map((r) =>
                  r.id === task.roomId && r.status === "dirty"
                    ? { ...r, status: "clean" as RoomStatus, lastCleaned: now }
                    : r
                );
              })()
            : state.rooms,
      };
    }

    case "RESOLVE_ALERT":
      return {
        ...state,
        alerts: state.alerts.map((a) =>
          a.id === action.alertId ? { ...a, resolved: true } : a
        ),
      };

    case "UPDATE_GUEST_SATISFACTION":
      return {
        ...state,
        guests: state.guests.map((g) =>
          g.id === action.guestId ? { ...g, satisfactionScore: action.score } : g
        ),
      };

    case "ADD_MAINTENANCE_NOTE":
      return {
        ...state,
        rooms: state.rooms.map((r) =>
          r.id === action.roomId
            ? { ...r, status: "maintenance" as RoomStatus, maintenanceNote: action.note }
            : r
        ),
      };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface HotelContextValue extends HotelState {
  updateRoomStatus: (roomId: string, status: RoomStatus) => void;
  assignGuestToRoom: (roomId: string, guestId: string) => void;
  checkInReservation: (reservationId: string) => void;
  checkOutReservation: (reservationId: string) => void;
  createReservation: (reservation: Reservation) => void;
  cancelReservation: (reservationId: string) => void;
  markNoShow: (reservationId: string) => void;
  updateHousekeepingTask: (taskId: string, status: HousekeepingTask["status"]) => void;
  resolveAlert: (alertId: string) => void;
  updateGuestSatisfaction: (guestId: string, score: number) => void;
  addMaintenanceNote: (roomId: string, note: string) => void;
}

const HotelContext = createContext<HotelContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function HotelProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(hotelReducer, initialState);

  const actions: Omit<HotelContextValue, keyof HotelState> = {
    updateRoomStatus: (roomId, status) =>
      dispatch({ type: "UPDATE_ROOM_STATUS", roomId, status }),
    assignGuestToRoom: (roomId, guestId) =>
      dispatch({ type: "ASSIGN_GUEST_TO_ROOM", roomId, guestId }),
    checkInReservation: (reservationId) =>
      dispatch({ type: "CHECK_IN_RESERVATION", reservationId }),
    checkOutReservation: (reservationId) =>
      dispatch({ type: "CHECK_OUT_RESERVATION", reservationId }),
    createReservation: (reservation) =>
      dispatch({ type: "CREATE_RESERVATION", reservation }),
    cancelReservation: (reservationId) =>
      dispatch({ type: "CANCEL_RESERVATION", reservationId }),
    markNoShow: (reservationId) =>
      dispatch({ type: "MARK_NO_SHOW", reservationId }),
    updateHousekeepingTask: (taskId, status) =>
      dispatch({ type: "UPDATE_HOUSEKEEPING_TASK", taskId, status }),
    resolveAlert: (alertId) =>
      dispatch({ type: "RESOLVE_ALERT", alertId }),
    updateGuestSatisfaction: (guestId, score) =>
      dispatch({ type: "UPDATE_GUEST_SATISFACTION", guestId, score }),
    addMaintenanceNote: (roomId, note) =>
      dispatch({ type: "ADD_MAINTENANCE_NOTE", roomId, note }),
  };

  const value: HotelContextValue = { ...state, ...actions };

  return React.createElement(HotelContext.Provider, { value }, children);
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useHotel(): HotelContextValue {
  const context = useContext(HotelContext);
  if (!context) {
    throw new Error("useHotel must be used within a HotelProvider");
  }
  return context;
}
