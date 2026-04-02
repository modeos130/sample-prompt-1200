"use client";

import React, { useState, useMemo } from "react";
import { useHotel } from "@/lib/store";
import { Room, RoomStatus, RoomType, Guest } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BedDouble,
  Wrench,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
} from "lucide-react";

// ── Status colors & labels ──────────────────────────────────────────
const STATUS_CONFIG: Record<
  RoomStatus,
  { color: string; label: string; bg: string }
> = {
  available: { color: "#34c97a", label: "Available", bg: "rgba(52,201,122,0.15)" },
  occupied: { color: "#3b82f6", label: "Occupied", bg: "rgba(59,130,246,0.15)" },
  dirty: { color: "#f59e0b", label: "Dirty", bg: "rgba(245,158,11,0.15)" },
  clean: { color: "#22d3ee", label: "Clean", bg: "rgba(34,211,238,0.15)" },
  maintenance: { color: "#e05656", label: "Maintenance", bg: "rgba(224,86,86,0.15)" },
  "out-of-order": { color: "#6b7280", label: "Out of Order", bg: "rgba(107,114,128,0.15)" },
};

const ALL_STATUSES: RoomStatus[] = [
  "available",
  "occupied",
  "dirty",
  "clean",
  "maintenance",
  "out-of-order",
];

const ALL_ROOM_TYPES: RoomType[] = ["Standard", "Deluxe", "Suite", "Presidential"];

// ── Priority helpers ────────────────────────────────────────────────
function priorityBadgeVariant(p: string) {
  if (p === "urgent") return "destructive" as const;
  if (p === "normal") return "warning" as const;
  return "secondary" as const;
}

function priorityOrder(p: string) {
  if (p === "urgent") return 0;
  if (p === "normal") return 1;
  return 2;
}

// ── Icon for status ────────────────────────────────────────────────
function StatusIcon({ status }: { status: RoomStatus }) {
  const size = 14;
  switch (status) {
    case "available":
      return <CheckCircle size={size} color={STATUS_CONFIG.available.color} />;
    case "occupied":
      return <User size={size} color={STATUS_CONFIG.occupied.color} />;
    case "dirty":
      return <AlertTriangle size={size} color={STATUS_CONFIG.dirty.color} />;
    case "clean":
      return <Sparkles size={size} color={STATUS_CONFIG.clean.color} />;
    case "maintenance":
      return <Wrench size={size} color={STATUS_CONFIG.maintenance.color} />;
    case "out-of-order":
      return <XCircle size={size} color={STATUS_CONFIG["out-of-order"].color} />;
  }
}

// ═════════════════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═════════════════════════════════════════════════════════════════════
export default function RoomsPage() {
  const {
    rooms,
    guests,
    reservations,
    housekeepingTasks,
    updateRoomStatus,
    assignGuestToRoom,
    checkOutReservation,
    updateHousekeepingTask,
    addMaintenanceNote,
  } = useHotel();

  // ── Filters ──────────────────────────────────────────────────────
  const [filterFloor, setFilterFloor] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  // ── Dialog state ─────────────────────────────────────────────────
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [maintenanceInput, setMaintenanceInput] = useState("");

  // ── Derived data ─────────────────────────────────────────────────
  const floors = useMemo(() => {
    const set = new Set(rooms.map((r) => r.floor));
    return Array.from(set).sort((a, b) => a - b);
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      if (filterFloor !== "all" && r.floor !== Number(filterFloor)) return false;
      if (filterStatus !== "all" && r.status !== filterStatus) return false;
      if (filterType !== "all" && r.type !== filterType) return false;
      return true;
    });
  }, [rooms, filterFloor, filterStatus, filterType]);

  const roomsByFloor = useMemo(() => {
    const map: Record<number, Room[]> = {};
    for (const r of filteredRooms) {
      if (!map[r.floor]) map[r.floor] = [];
      map[r.floor].push(r);
    }
    return map;
  }, [filteredRooms]);

  const statusCounts = useMemo(() => {
    const counts: Record<RoomStatus, number> = {
      available: 0,
      occupied: 0,
      dirty: 0,
      clean: 0,
      maintenance: 0,
      "out-of-order": 0,
    };
    for (const r of rooms) counts[r.status]++;
    return counts;
  }, [rooms]);

  const guestsWithoutRooms = useMemo(() => {
    const assignedGuestIds = new Set(
      rooms.filter((r) => r.guestId).map((r) => r.guestId)
    );
    return guests.filter((g) => !assignedGuestIds.has(g.id));
  }, [rooms, guests]);

  const sortedTasks = useMemo(() => {
    return [...housekeepingTasks]
      .filter((t) => t.status !== "completed")
      .sort((a, b) => priorityOrder(a.priority) - priorityOrder(b.priority))
      .concat(
        [...housekeepingTasks]
          .filter((t) => t.status === "completed")
          .sort((a, b) => priorityOrder(a.priority) - priorityOrder(b.priority))
      );
  }, [housekeepingTasks]);

  // Keep selectedRoom in sync with store after actions
  const currentRoom = useMemo(() => {
    if (!selectedRoom) return null;
    return rooms.find((r) => r.id === selectedRoom.id) ?? null;
  }, [rooms, selectedRoom]);

  // ── Helpers ──────────────────────────────────────────────────────
  function getGuestForRoom(room: Room): Guest | undefined {
    if (!room.guestId) return undefined;
    return guests.find((g) => g.id === room.guestId);
  }

  function openRoomDialog(room: Room) {
    setSelectedRoom(room);
    setMaintenanceInput(room.maintenanceNote || "");
    setDialogOpen(true);
  }

  function handleCheckOut(reservationId: string) {
    checkOutReservation(reservationId);
    setDialogOpen(false);
  }

  // Find the active reservation for a room
  function getActiveReservation(roomId: string) {
    return reservations.find(
      (res) => res.roomId === roomId && res.status === "checked-in"
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════
  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <BedDouble className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Room Management</h1>
      </div>

      {/* ── Status Legend ─────────────────────────────────────────── */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          {ALL_STATUSES.map((s) => (
            <div key={s} className="flex items-center gap-2 text-sm">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: STATUS_CONFIG[s].color }}
              />
              <span className="text-muted-foreground">
                {STATUS_CONFIG[s].label}
              </span>
              <span className="font-semibold text-foreground">
                {statusCounts[s]}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Filters ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <Select value={filterFloor} onValueChange={setFilterFloor}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Floor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Floors</SelectItem>
            {floors.map((f) => (
              <SelectItem key={f} value={String(f)}>
                Floor {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_CONFIG[s].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Room Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {ALL_ROOM_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Room Grid by Floor ────────────────────────────────────── */}
      {rooms.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          No rooms found. Start a simulation to populate rooms.
        </Card>
      ) : filteredRooms.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          No rooms match current filters.
        </Card>
      ) : (
        Object.keys(roomsByFloor)
          .map(Number)
          .sort((a, b) => a - b)
          .map((floor) => (
            <div key={floor} className="space-y-2">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Floor {floor}
              </h2>
              <div className="flex flex-wrap gap-2">
                {roomsByFloor[floor].map((room) => {
                  const cfg = STATUS_CONFIG[room.status];
                  const guest = getGuestForRoom(room);
                  return (
                    <button
                      key={room.id}
                      onClick={() => openRoomDialog(room)}
                      className="w-20 rounded-lg border border-border p-2 text-left transition-all hover:ring-2 hover:ring-primary/50 focus:outline-none focus:ring-2 focus:ring-primary"
                      style={{ backgroundColor: cfg.bg }}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <span
                          className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: cfg.color }}
                        />
                        <span className="text-xs font-bold truncate">
                          {room.number}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {room.type}
                      </div>
                      {guest && (
                        <div
                          className="text-[10px] truncate mt-0.5"
                          style={{ color: cfg.color }}
                        >
                          {guest.lastName}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))
      )}

      {/* ── Room Detail Dialog ────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          {currentRoom && (() => {
            const guest = getGuestForRoom(currentRoom);
            const activeRes = getActiveReservation(currentRoom.id);
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <StatusIcon status={currentRoom.status} />
                    Room {currentRoom.number}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Type</div>
                    <div>{currentRoom.type}</div>
                    <div className="text-muted-foreground">Floor</div>
                    <div>{currentRoom.floor}</div>
                    <div className="text-muted-foreground">Status</div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            STATUS_CONFIG[currentRoom.status].color,
                        }}
                      />
                      {STATUS_CONFIG[currentRoom.status].label}
                    </div>
                    <div className="text-muted-foreground">Nightly Rate</div>
                    <div>${currentRoom.rate}/night</div>
                    {currentRoom.maintenanceNote && (
                      <>
                        <div className="text-muted-foreground">Maint. Note</div>
                        <div className="text-warning">
                          {currentRoom.maintenanceNote}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Guest info if occupied */}
                  {currentRoom.status === "occupied" && guest && (
                    <>
                      <Separator />
                      <div className="space-y-1">
                        <h3 className="text-sm font-semibold flex items-center gap-1.5">
                          <User size={14} /> Current Guest
                        </h3>
                        <div className="grid grid-cols-2 gap-1 text-sm">
                          <div className="text-muted-foreground">Name</div>
                          <div>
                            {guest.firstName} {guest.lastName}
                          </div>
                          <div className="text-muted-foreground">Loyalty</div>
                          <div>
                            {guest.loyaltyTier}
                            {guest.isVip && " (VIP)"}
                          </div>
                          <div className="text-muted-foreground">Email</div>
                          <div className="truncate">{guest.email}</div>
                        </div>
                      </div>
                    </>
                  )}

                  <Separator />

                  {/* Actions */}
                  <div className="space-y-3">
                    {/* Change status */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">
                        Change Status
                      </label>
                      <Select
                        value={currentRoom.status}
                        onValueChange={(val) => {
                          updateRoomStatus(currentRoom.id, val as RoomStatus);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ALL_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {STATUS_CONFIG[s].label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Assign guest */}
                    {currentRoom.status !== "occupied" &&
                      guestsWithoutRooms.length > 0 && (
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">
                            Assign Guest
                          </label>
                          <Select
                            onValueChange={(guestId) => {
                              assignGuestToRoom(currentRoom.id, guestId);
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select guest..." />
                            </SelectTrigger>
                            <SelectContent>
                              {guestsWithoutRooms.map((g) => (
                                <SelectItem key={g.id} value={g.id}>
                                  {g.firstName} {g.lastName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                    {/* Maintenance note */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">
                        Maintenance Note
                      </label>
                      <div className="flex gap-2">
                        <Input
                          value={maintenanceInput}
                          onChange={(e) => setMaintenanceInput(e.target.value)}
                          placeholder="Add a note..."
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            addMaintenanceNote(currentRoom.id, maintenanceInput);
                          }}
                        >
                          Save
                        </Button>
                      </div>
                    </div>

                    {/* Check out */}
                    {currentRoom.status === "occupied" && activeRes && (
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => handleCheckOut(activeRes.id)}
                      >
                        Check Out
                      </Button>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ── Housekeeping Queue ────────────────────────────────────── */}
      <Separator />
      <div className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-cyan-400" />
          Housekeeping Queue
        </h2>

        {sortedTasks.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            No housekeeping tasks.
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-3 font-medium text-muted-foreground">
                      Room
                    </th>
                    <th className="text-left p-3 font-medium text-muted-foreground">
                      Floor
                    </th>
                    <th className="text-left p-3 font-medium text-muted-foreground">
                      Priority
                    </th>
                    <th className="text-left p-3 font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left p-3 font-medium text-muted-foreground">
                      Assigned To
                    </th>
                    <th className="text-right p-3 font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTasks.map((task) => (
                    <tr
                      key={task.id}
                      className="border-b border-border last:border-0 hover:bg-muted/20"
                    >
                      <td className="p-3 font-medium">{task.roomNumber}</td>
                      <td className="p-3">{task.floor}</td>
                      <td className="p-3">
                        <Badge variant={priorityBadgeVariant(task.priority)}>
                          {task.priority}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={
                            task.status === "completed"
                              ? "success"
                              : task.status === "in-progress"
                                ? "info"
                                : "outline"
                          }
                        >
                          {task.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {task.assignedTo || "Unassigned"}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1">
                          {task.status === "pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateHousekeepingTask(
                                  task.id,
                                  "in-progress"
                                )
                              }
                            >
                              In-Progress
                            </Button>
                          )}
                          {(task.status === "pending" ||
                            task.status === "in-progress") && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() =>
                                updateHousekeepingTask(
                                  task.id,
                                  "completed"
                                )
                              }
                            >
                              Complete
                            </Button>
                          )}
                          {task.status === "completed" && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <CheckCircle
                                size={12}
                                className="text-success"
                              />{" "}
                              Done
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
