"use client";

import React, { useState, useMemo } from "react";
import { useHotel } from "@/lib/store";
import type {
  Reservation,
  ReservationStatus,
  BookingSource,
  RoomType,
} from "@/lib/types";
import { formatCurrency, generateId } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  CalendarCheck,
  CalendarX,
  Plus,
  Search,
  User,
  BedDouble,
  CreditCard,
  Clock,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_COLORS: Record<ReservationStatus, { variant: string; label: string }> = {
  confirmed: { variant: "info", label: "Confirmed" },
  "checked-in": { variant: "success", label: "Checked In" },
  "checked-out": { variant: "secondary", label: "Checked Out" },
  cancelled: { variant: "destructive", label: "Cancelled" },
  "no-show": { variant: "warning", label: "No Show" },
};

const SOURCE_COLORS: Record<BookingSource, { bg: string; text: string }> = {
  "OTA-Expedia": { bg: "bg-yellow-500/20", text: "text-yellow-400" },
  "OTA-Booking": { bg: "bg-blue-500/20", text: "text-blue-400" },
  Direct: { bg: "bg-emerald-500/20", text: "text-emerald-400" },
  "Walk-in": { bg: "bg-purple-500/20", text: "text-purple-400" },
  Corporate: { bg: "bg-cyan-500/20", text: "text-cyan-400" },
};

const ALL_STATUSES: ReservationStatus[] = [
  "confirmed",
  "checked-in",
  "checked-out",
  "cancelled",
  "no-show",
];

const ALL_SOURCES: BookingSource[] = [
  "OTA-Expedia",
  "OTA-Booking",
  "Direct",
  "Walk-in",
  "Corporate",
];

const ALL_ROOM_TYPES: RoomType[] = ["Standard", "Deluxe", "Suite", "Presidential"];

function today(): string {
  return new Date().toISOString().split("T")[0];
}

function diffDays(a: string, b: string): number {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(Math.round(ms / 86400000), 0);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ReservationsPage() {
  const {
    reservations,
    rooms,
    guests,
    checkInReservation,
    checkOutReservation,
    createReservation,
    cancelReservation,
    markNoShow,
  } = useHotel();

  // --- State ---
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [detailRes, setDetailRes] = useState<Reservation | null>(null);
  const [checkInTarget, setCheckInTarget] = useState<Reservation | null>(null);
  const [checkOutTarget, setCheckOutTarget] = useState<Reservation | null>(null);
  const [newResOpen, setNewResOpen] = useState(false);

  // New reservation form
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestId, setNewGuestId] = useState("");
  const [newRoomType, setNewRoomType] = useState<RoomType>("Standard");
  const [newCheckIn, setNewCheckIn] = useState(today());
  const [newCheckOut, setNewCheckOut] = useState("");
  const [newRate, setNewRate] = useState(150);
  const [newSource, setNewSource] = useState<BookingSource>("Direct");
  const [newRequests, setNewRequests] = useState("");

  // --- Derived ---
  const todayStr = today();

  const filteredReservations = useMemo(() => {
    let list = [...reservations];
    if (statusFilter !== "all") list = list.filter((r) => r.status === statusFilter);
    if (sourceFilter !== "all") list = list.filter((r) => r.source === sourceFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.guestName.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          (r.roomNumber && r.roomNumber.toLowerCase().includes(q))
      );
    }
    list.sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime());
    return list;
  }, [reservations, statusFilter, sourceFilter, searchQuery]);

  const checkInQueue = useMemo(
    () =>
      reservations
        .filter((r) => r.status === "confirmed" && r.checkIn <= todayStr)
        .sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime()),
    [reservations, todayStr]
  );

  const checkOutQueue = useMemo(
    () =>
      reservations
        .filter((r) => r.status === "checked-in" && r.checkOut <= todayStr)
        .sort((a, b) => new Date(a.checkOut).getTime() - new Date(b.checkOut).getTime()),
    [reservations, todayStr]
  );

  // --- Handlers ---
  function handleCheckIn(res: Reservation) {
    checkInReservation(res.id);
    setCheckInTarget(null);
  }

  function handleCheckOut(res: Reservation) {
    checkOutReservation(res.id);
    setCheckOutTarget(null);
  }

  function handleNoShow(resId: string) {
    markNoShow(resId);
  }

  function handleCreateReservation() {
    const nights = diffDays(newCheckIn, newCheckOut);
    if (nights <= 0) return;

    const guestName =
      newGuestId && newGuestId !== "__new__"
        ? (() => {
            const g = guests.find((g) => g.id === newGuestId);
            return g ? `${g.firstName} ${g.lastName}` : newGuestName;
          })()
        : newGuestName;

    const guestId = newGuestId && newGuestId !== "__new__" ? newGuestId : generateId();

    const reservation: Reservation = {
      id: `RES-${generateId().toUpperCase()}`,
      guestId,
      guestName,
      roomType: newRoomType,
      checkIn: newCheckIn,
      checkOut: newCheckOut,
      nightlyRate: newRate,
      totalAmount: nights * newRate,
      source: newSource,
      status: "confirmed",
      specialRequests: newRequests || undefined,
      createdAt: new Date().toISOString(),
    };

    createReservation(reservation);
    setNewResOpen(false);
    resetNewResForm();
  }

  function resetNewResForm() {
    setNewGuestName("");
    setNewGuestId("");
    setNewRoomType("Standard");
    setNewCheckIn(today());
    setNewCheckOut("");
    setNewRate(150);
    setNewSource("Direct");
    setNewRequests("");
  }

  const newResNights = newCheckIn && newCheckOut ? diffDays(newCheckIn, newCheckOut) : 0;
  const newResValid = newResNights > 0 && (newGuestId ? newGuestId !== "__new__" || newGuestName.trim() : newGuestName.trim());

  // --- Render helpers ---
  function statusBadge(status: ReservationStatus) {
    const cfg = STATUS_COLORS[status];
    return (
      <Badge variant={cfg.variant as "info" | "success" | "secondary" | "destructive" | "warning"}>
        {cfg.label}
      </Badge>
    );
  }

  function sourceBadge(source: BookingSource) {
    const cfg = SOURCE_COLORS[source];
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.text}`}
      >
        {source}
      </span>
    );
  }

  function isLateArrival(res: Reservation): boolean {
    return res.checkIn < todayStr;
  }

  // --- Available rooms for check-in ---
  function availableRoomsForType(type: RoomType) {
    return rooms.filter(
      (r) => r.type === type && (r.status === "available" || r.status === "clean")
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Reservations & Front Desk
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage reservations, check-ins, and check-outs
          </p>
        </div>
        <Button onClick={() => setNewResOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Reservation
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Calendar className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Reservations</p>
              <p className="text-xl font-bold text-foreground">{reservations.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <CalendarCheck className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Check-In Queue</p>
              <p className="text-xl font-bold text-foreground">{checkInQueue.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <CalendarX className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Check-Out Queue</p>
              <p className="text-xl font-bold text-foreground">{checkOutQueue.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Checked In</p>
              <p className="text-xl font-bold text-foreground">
                {reservations.filter((r) => r.status === "checked-in").length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" className="gap-2">
            <Calendar className="h-4 w-4" />
            All Reservations
          </TabsTrigger>
          <TabsTrigger value="checkin" className="gap-2">
            <CalendarCheck className="h-4 w-4" />
            Check-In
            {checkInQueue.length > 0 && (
              <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-xs text-emerald-400">
                {checkInQueue.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="checkout" className="gap-2">
            <CalendarX className="h-4 w-4" />
            Check-Out
            {checkOutQueue.length > 0 && (
              <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-xs text-amber-400">
                {checkOutQueue.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: All Reservations ──────────────────────────────────── */}
        <TabsContent value="all">
          {/* Filters */}
          <Card className="p-4 bg-card border-border mb-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px]">
                <Label className="text-xs text-muted-foreground mb-1.5 block">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Guest name, ID, or room..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="w-[180px]">
                <Label className="text-xs text-muted-foreground mb-1.5 block">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {ALL_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_COLORS[s].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[180px]">
                <Label className="text-xs text-muted-foreground mb-1.5 block">Source</Label>
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    {ALL_SOURCES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Table */}
          <Card className="bg-card border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Reservation ID
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Guest Name
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Room Type
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Room #
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Check-in
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Check-out
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Rate
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Source
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-muted-foreground">
                        No reservations found.
                      </td>
                    </tr>
                  ) : (
                    filteredReservations.map((res) => (
                      <tr
                        key={res.id}
                        className="border-b border-border/50 hover:bg-secondary/30 cursor-pointer transition-colors"
                        onClick={() => setDetailRes(res)}
                      >
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          {res.id}
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">
                          {res.guestName}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{res.roomType}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {res.roomNumber || "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{res.checkIn}</td>
                        <td className="px-4 py-3 text-muted-foreground">{res.checkOut}</td>
                        <td className="px-4 py-3 text-right text-foreground">
                          {formatCurrency(res.nightlyRate)}/n
                        </td>
                        <td className="px-4 py-3">{sourceBadge(res.source)}</td>
                        <td className="px-4 py-3">{statusBadge(res.status)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ── Tab 2: Check-In Queue ────────────────────────────────────── */}
        <TabsContent value="checkin">
          {checkInQueue.length === 0 ? (
            <Card className="p-12 bg-card border-border text-center">
              <CalendarCheck className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No guests waiting to check in.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {checkInQueue.map((res) => {
                const late = isLateArrival(res);
                const available = availableRoomsForType(res.roomType);
                return (
                  <Card
                    key={res.id}
                    className="p-4 bg-card border-border flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">{res.guestName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {late && (
                          <Badge variant="warning" className="gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Late
                          </Badge>
                        )}
                        {sourceBadge(res.source)}
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Room Type</p>
                        <p className="text-foreground flex items-center gap-1">
                          <BedDouble className="h-3.5 w-3.5" />
                          {res.roomType}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Available Rooms</p>
                        <p className="text-foreground">{available.length} rooms</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Check-in</p>
                        <p className="text-foreground flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {res.checkIn}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Check-out</p>
                        <p className="text-foreground flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {res.checkOut}
                        </p>
                      </div>
                    </div>
                    {res.specialRequests && (
                      <div className="text-xs">
                        <p className="text-muted-foreground">Special Requests</p>
                        <p className="text-foreground mt-0.5">{res.specialRequests}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-auto pt-2">
                      <Button
                        className="flex-1 gap-2"
                        onClick={() => setCheckInTarget(res)}
                        disabled={available.length === 0}
                      >
                        <CheckCircle className="h-4 w-4" />
                        Check In
                      </Button>
                      {late && (
                        <Button
                          variant="outline"
                          className="gap-2 text-amber-400 border-amber-400/30 hover:bg-amber-400/10"
                          onClick={() => handleNoShow(res.id)}
                        >
                          <Clock className="h-4 w-4" />
                          No Show
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── Tab 3: Check-Out Queue ───────────────────────────────────── */}
        <TabsContent value="checkout">
          {checkOutQueue.length === 0 ? (
            <Card className="p-12 bg-card border-border text-center">
              <CalendarX className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No guests waiting to check out.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {checkOutQueue.map((res) => {
                const nights = diffDays(res.checkIn, res.checkOut);
                const overdue = res.checkOut < todayStr;
                return (
                  <Card
                    key={res.id}
                    className="p-4 bg-card border-border flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">{res.guestName}</span>
                      </div>
                      {overdue && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Overdue
                        </Badge>
                      )}
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Room</p>
                        <p className="text-foreground flex items-center gap-1">
                          <BedDouble className="h-3.5 w-3.5" />
                          {res.roomNumber || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Nights</p>
                        <p className="text-foreground">{nights}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Nightly Rate</p>
                        <p className="text-foreground flex items-center gap-1">
                          <CreditCard className="h-3.5 w-3.5" />
                          {formatCurrency(res.nightlyRate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total Amount</p>
                        <p className="text-foreground font-semibold">
                          {formatCurrency(res.totalAmount)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-auto pt-2">
                      <Button
                        className="flex-1 gap-2"
                        onClick={() => setCheckOutTarget(res)}
                      >
                        <CalendarX className="h-4 w-4" />
                        Check Out
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Reservation Detail Dialog ──────────────────────────────────── */}
      <Dialog open={!!detailRes} onOpenChange={(open) => !open && setDetailRes(null)}>
        <DialogContent className="max-w-md">
          {detailRes && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Reservation Details
                </DialogTitle>
                <DialogDescription>
                  {detailRes.id}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Guest</p>
                    <p className="text-foreground font-medium">{detailRes.guestName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <div className="mt-0.5">{statusBadge(detailRes.status)}</div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Room Type</p>
                    <p className="text-foreground">{detailRes.roomType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Room #</p>
                    <p className="text-foreground">{detailRes.roomNumber || "Unassigned"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Check-in</p>
                    <p className="text-foreground">{detailRes.checkIn}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Check-out</p>
                    <p className="text-foreground">{detailRes.checkOut}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Nightly Rate</p>
                    <p className="text-foreground">{formatCurrency(detailRes.nightlyRate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Amount</p>
                    <p className="text-foreground font-semibold">
                      {formatCurrency(detailRes.totalAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Source</p>
                    <div className="mt-0.5">{sourceBadge(detailRes.source)}</div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="text-foreground text-xs">
                      {new Date(detailRes.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {detailRes.specialRequests && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Special Requests</p>
                    <p className="text-sm text-foreground bg-secondary/50 rounded-md p-2">
                      {detailRes.specialRequests}
                    </p>
                  </div>
                )}
                <Separator />
                <DialogFooter>
                  {detailRes.status === "confirmed" && (
                    <Button
                      variant="outline"
                      className="text-red-400 border-red-400/30 hover:bg-red-400/10"
                      onClick={() => {
                        cancelReservation(detailRes.id);
                        setDetailRes(null);
                      }}
                    >
                      Cancel Reservation
                    </Button>
                  )}
                </DialogFooter>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Check-In Confirmation Dialog ───────────────────────────────── */}
      <Dialog
        open={!!checkInTarget}
        onOpenChange={(open) => !open && setCheckInTarget(null)}
      >
        <DialogContent className="max-w-md">
          {checkInTarget && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CalendarCheck className="h-5 w-5 text-emerald-400" />
                  Confirm Check-In
                </DialogTitle>
                <DialogDescription>
                  Check in {checkInTarget.guestName} for {checkInTarget.roomType}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Guest</p>
                    <p className="text-foreground font-medium">{checkInTarget.guestName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Room Type</p>
                    <p className="text-foreground">{checkInTarget.roomType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Check-in</p>
                    <p className="text-foreground">{checkInTarget.checkIn}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Check-out</p>
                    <p className="text-foreground">{checkInTarget.checkOut}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Available Rooms</p>
                  <div className="flex flex-wrap gap-2">
                    {availableRoomsForType(checkInTarget.roomType).map((room) => (
                      <Badge key={room.id} variant="outline" className="text-foreground">
                        Room {room.number} (Floor {room.floor})
                      </Badge>
                    ))}
                  </div>
                  {availableRoomsForType(checkInTarget.roomType).length === 0 && (
                    <p className="text-sm text-destructive">
                      No rooms available for this type.
                    </p>
                  )}
                </div>
                <Separator />
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setCheckInTarget(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="gap-2"
                    onClick={() => handleCheckIn(checkInTarget)}
                    disabled={availableRoomsForType(checkInTarget.roomType).length === 0}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Confirm Check-In
                  </Button>
                </DialogFooter>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Check-Out Confirmation Dialog ──────────────────────────────── */}
      <Dialog
        open={!!checkOutTarget}
        onOpenChange={(open) => !open && setCheckOutTarget(null)}
      >
        <DialogContent className="max-w-md">
          {checkOutTarget && (() => {
            const nights = diffDays(checkOutTarget.checkIn, checkOutTarget.checkOut);
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <CalendarX className="h-5 w-5 text-amber-400" />
                    Confirm Check-Out
                  </DialogTitle>
                  <DialogDescription>
                    Check out {checkOutTarget.guestName} from Room {checkOutTarget.roomNumber}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Card className="p-4 bg-secondary/30 border-border">
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Bill Summary
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Room ({checkOutTarget.roomType})</span>
                        <span className="text-foreground">
                          {nights} nights x {formatCurrency(checkOutTarget.nightlyRate)}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold">
                        <span className="text-foreground">Total</span>
                        <span className="text-foreground">{formatCurrency(checkOutTarget.totalAmount)}</span>
                      </div>
                    </div>
                  </Card>
                  <p className="text-xs text-muted-foreground">
                    Room {checkOutTarget.roomNumber} will be marked as dirty and a housekeeping task will be created.
                  </p>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setCheckOutTarget(null)}>
                      Cancel
                    </Button>
                    <Button
                      className="gap-2"
                      onClick={() => handleCheckOut(checkOutTarget)}
                    >
                      <CalendarX className="h-4 w-4" />
                      Confirm Check-Out
                    </Button>
                  </DialogFooter>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ── New Reservation Dialog ─────────────────────────────────────── */}
      <Dialog open={newResOpen} onOpenChange={(open) => { if (!open) { setNewResOpen(false); resetNewResForm(); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              New Reservation
            </DialogTitle>
            <DialogDescription>
              Create a new reservation for a guest.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Guest */}
            <div className="space-y-2">
              <Label className="text-sm">Guest</Label>
              <Select value={newGuestId} onValueChange={(v) => { setNewGuestId(v); if (v !== "__new__") setNewGuestName(""); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select guest..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__new__">+ New Guest</SelectItem>
                  {guests.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.firstName} {g.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {newGuestId === "__new__" && (
                <Input
                  placeholder="Guest full name"
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                />
              )}
            </div>

            {/* Room Type */}
            <div className="space-y-2">
              <Label className="text-sm">Room Type</Label>
              <Select value={newRoomType} onValueChange={(v) => setNewRoomType(v as RoomType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_ROOM_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Check-in Date</Label>
                <Input
                  type="date"
                  value={newCheckIn}
                  onChange={(e) => setNewCheckIn(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Check-out Date</Label>
                <Input
                  type="date"
                  value={newCheckOut}
                  min={newCheckIn}
                  onChange={(e) => setNewCheckOut(e.target.value)}
                />
              </div>
            </div>

            {/* Rate */}
            <div className="space-y-2">
              <Label className="text-sm">Nightly Rate ($)</Label>
              <Input
                type="number"
                min={0}
                value={newRate}
                onChange={(e) => setNewRate(Number(e.target.value))}
              />
            </div>

            {/* Source */}
            <div className="space-y-2">
              <Label className="text-sm">Source</Label>
              <Select value={newSource} onValueChange={(v) => setNewSource(v as BookingSource)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_SOURCES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Special Requests */}
            <div className="space-y-2">
              <Label className="text-sm">Special Requests</Label>
              <textarea
                className="flex w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-h-[80px] resize-none"
                placeholder="Any special requests..."
                value={newRequests}
                onChange={(e) => setNewRequests(e.target.value)}
              />
            </div>

            {/* Total Calculation */}
            {newResNights > 0 && (
              <Card className="p-3 bg-secondary/30 border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {newResNights} night{newResNights !== 1 ? "s" : ""} x {formatCurrency(newRate)}
                  </span>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(newResNights * newRate)}
                  </span>
                </div>
              </Card>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => { setNewResOpen(false); resetNewResForm(); }}>
                Cancel
              </Button>
              <Button
                className="gap-2"
                disabled={!newResValid}
                onClick={handleCreateReservation}
              >
                <Plus className="h-4 w-4" />
                Create Reservation
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
