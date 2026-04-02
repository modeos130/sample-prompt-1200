"use client";

import React, { useState, useMemo } from "react";
import { useHotel } from "@/lib/store";
import type { Guest, LoyaltyTier } from "@/lib/types";
import { formatCurrency, generateId } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Users,
  Search,
  Star,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  Plus,
  History,
} from "lucide-react";

// ── Loyalty tier colors ──────────────────────────────────────────────
const TIER_CONFIG: Record<LoyaltyTier, { bg: string; text: string }> = {
  Bronze: { bg: "#cd7f32", text: "#fff" },
  Silver: { bg: "#c0c0c0", text: "#1a1a1a" },
  Gold: { bg: "#c9a84c", text: "#1a1a1a" },
  Platinum: { bg: "#e5e4e2", text: "#1a1a1a" },
};

const ALL_TIERS: LoyaltyTier[] = ["Bronze", "Silver", "Gold", "Platinum"];

// ── Satisfaction helpers ─────────────────────────────────────────────
function satisfactionColor(score: number): string {
  if (score > 8) return "#34c97a";
  if (score >= 5) return "#f59e0b";
  return "#e05656";
}

function SatisfactionBar({ score }: { score: number }) {
  const color = satisfactionColor(score);
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-20 rounded-full bg-[#1e2530] overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${(score / 10) * 100}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-medium" style={{ color }}>
        {score}/10
      </span>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────
export default function GuestsPage() {
  const { guests, reservations, updateGuestSatisfaction } = useHotel();

  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<"All" | LoyaltyTier>("All");
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [localGuests, setLocalGuests] = useState<Guest[]>([]);

  // Satisfaction update state (inside detail dialog)
  const [satInput, setSatInput] = useState("");

  // Merge store guests with locally-added guests
  const allGuests = useMemo(() => [...guests, ...localGuests], [guests, localGuests]);

  // Filtered guests
  const filteredGuests = useMemo(() => {
    return allGuests.filter((g) => {
      const matchesSearch =
        search === "" ||
        `${g.firstName} ${g.lastName}`.toLowerCase().includes(search.toLowerCase());
      const matchesTier = tierFilter === "All" || g.loyaltyTier === tierFilter;
      return matchesSearch && matchesTier;
    });
  }, [allGuests, search, tierFilter]);

  // Guest reservations (for detail dialog)
  const guestReservations = useMemo(() => {
    if (!selectedGuest) return [];
    return reservations.filter((r) => r.guestId === selectedGuest.id);
  }, [reservations, selectedGuest]);

  // ── Add Guest form state ────────────────────────────────────────────
  const [newGuest, setNewGuest] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    loyaltyTier: "Bronze" as LoyaltyTier,
    isVip: false,
    preferences: "",
    dietaryNotes: "",
    specialRequests: "",
  });

  function resetNewGuest() {
    setNewGuest({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      loyaltyTier: "Bronze",
      isVip: false,
      preferences: "",
      dietaryNotes: "",
      specialRequests: "",
    });
  }

  function handleAddGuest() {
    if (!newGuest.firstName.trim() || !newGuest.lastName.trim()) return;
    const guest: Guest = {
      id: generateId(),
      firstName: newGuest.firstName.trim(),
      lastName: newGuest.lastName.trim(),
      email: newGuest.email.trim(),
      phone: newGuest.phone.trim(),
      loyaltyTier: newGuest.loyaltyTier,
      isVip: newGuest.isVip,
      totalStays: 0,
      totalSpent: 0,
      preferences: newGuest.preferences
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean),
      dietaryNotes: newGuest.dietaryNotes.trim(),
      specialRequests: newGuest.specialRequests.trim(),
    };
    setLocalGuests((prev) => [...prev, guest]);
    resetNewGuest();
    setAddDialogOpen(false);
  }

  function handleUpdateSatisfaction() {
    if (!selectedGuest) return;
    const score = parseInt(satInput, 10);
    if (isNaN(score) || score < 1 || score > 10) return;
    updateGuestSatisfaction(selectedGuest.id, score);
    // Also update local guests if applicable
    setLocalGuests((prev) =>
      prev.map((g) => (g.id === selectedGuest.id ? { ...g, satisfactionScore: score } : g))
    );
    setSelectedGuest((prev) => (prev ? { ...prev, satisfactionScore: score } : null));
    setSatInput("");
  }

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Users size={28} style={{ color: "#c9a84c" }} />
          <div>
            <h1 className="text-2xl font-bold text-white">Guest Profiles &amp; CRM</h1>
            <p className="text-sm" style={{ color: "#707070" }}>
              {filteredGuests.length} guest{filteredGuests.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Button
          onClick={() => setAddDialogOpen(true)}
          className="gap-2"
          style={{ backgroundColor: "#c9a84c", color: "#1a1a1a" }}
        >
          <Plus size={16} /> Add Guest
        </Button>
      </div>

      {/* ── Search & Tier Filter ────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "#707070" }}
          />
          <Input
            placeholder="Search guests by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border text-white placeholder:text-[#707070]"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["All", ...ALL_TIERS] as const).map((tier) => (
            <Button
              key={tier}
              variant={tierFilter === tier ? "default" : "outline"}
              size="sm"
              onClick={() => setTierFilter(tier)}
              style={
                tierFilter === tier
                  ? tier === "All"
                    ? { backgroundColor: "#c9a84c", color: "#1a1a1a" }
                    : { backgroundColor: TIER_CONFIG[tier].bg, color: TIER_CONFIG[tier].text }
                  : {}
              }
              className={tierFilter !== tier ? "border-border text-[#707070] hover:text-white" : ""}
            >
              {tier}
            </Button>
          ))}
        </div>
      </div>

      {/* ── Guest Grid ──────────────────────────────────────────────── */}
      {filteredGuests.length === 0 ? (
        <div className="text-center py-16" style={{ color: "#707070" }}>
          No guests match the current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGuests.map((guest) => (
            <Card
              key={guest.id}
              className="bg-card border-border cursor-pointer hover:border-[#c9a84c]/40 transition-colors"
              onClick={() => {
                setSelectedGuest(guest);
                setSatInput("");
              }}
            >
              <CardContent className="p-5 space-y-3">
                {/* Name row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg font-bold text-white truncate">
                      {guest.firstName} {guest.lastName}
                    </span>
                    {guest.isVip && <Star size={16} fill="#c9a84c" color="#c9a84c" />}
                  </div>
                  <Badge
                    className="shrink-0 text-xs font-semibold"
                    style={{
                      backgroundColor: TIER_CONFIG[guest.loyaltyTier].bg,
                      color: TIER_CONFIG[guest.loyaltyTier].text,
                    }}
                  >
                    {guest.loyaltyTier}
                  </Badge>
                </div>

                {/* Contact */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs" style={{ color: "#707070" }}>
                    <Mail size={12} /> {guest.email || "—"}
                  </div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: "#707070" }}>
                    <Phone size={12} /> {guest.phone || "—"}
                  </div>
                </div>

                <Separator className="bg-border" />

                {/* Stats */}
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                  <div className="flex items-center gap-2" style={{ color: "#707070" }}>
                    <History size={13} />
                    <span>
                      <span className="text-white font-medium">{guest.totalStays}</span> stays
                    </span>
                  </div>
                  <div className="flex items-center gap-2" style={{ color: "#707070" }}>
                    <CreditCard size={13} />
                    <span className="text-white font-medium">
                      {formatCurrency(guest.totalSpent)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2" style={{ color: "#707070" }}>
                    <Calendar size={13} />
                    <span className="text-white text-xs">
                      {guest.lastStay
                        ? new Date(guest.lastStay).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>
                  {guest.satisfactionScore !== undefined && (
                    <div className="col-span-2">
                      <SatisfactionBar score={guest.satisfactionScore} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Guest Detail Dialog ─────────────────────────────────────── */}
      <Dialog open={!!selectedGuest} onOpenChange={(open) => !open && setSelectedGuest(null)}>
        <DialogContent className="bg-card border-border text-white max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedGuest && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-xl">
                  {selectedGuest.firstName} {selectedGuest.lastName}
                  {selectedGuest.isVip && <Star size={18} fill="#c9a84c" color="#c9a84c" />}
                  <Badge
                    className="text-xs font-semibold"
                    style={{
                      backgroundColor: TIER_CONFIG[selectedGuest.loyaltyTier].bg,
                      color: TIER_CONFIG[selectedGuest.loyaltyTier].text,
                    }}
                  >
                    {selectedGuest.loyaltyTier}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-5 mt-2">
                {/* Contact Info */}
                <section>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: "#c9a84c" }}>
                    Contact Info
                  </h3>
                  <div className="space-y-1 text-sm" style={{ color: "#707070" }}>
                    <div className="flex items-center gap-2">
                      <Mail size={14} /> {selectedGuest.email || "—"}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={14} /> {selectedGuest.phone || "—"}
                    </div>
                  </div>
                </section>

                <Separator className="bg-border" />

                {/* Loyalty Info */}
                <section>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: "#c9a84c" }}>
                    Loyalty Info
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span style={{ color: "#707070" }}>Tier:</span>{" "}
                      <span className="text-white">{selectedGuest.loyaltyTier}</span>
                    </div>
                    <div>
                      <span style={{ color: "#707070" }}>VIP:</span>{" "}
                      <span className="text-white">{selectedGuest.isVip ? "Yes" : "No"}</span>
                    </div>
                    <div>
                      <span style={{ color: "#707070" }}>Total Stays:</span>{" "}
                      <span className="text-white">{selectedGuest.totalStays}</span>
                    </div>
                    <div>
                      <span style={{ color: "#707070" }}>Total Spent:</span>{" "}
                      <span className="text-white">{formatCurrency(selectedGuest.totalSpent)}</span>
                    </div>
                  </div>
                </section>

                <Separator className="bg-border" />

                {/* Preferences */}
                <section>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: "#c9a84c" }}>
                    Preferences
                  </h3>
                  {selectedGuest.preferences.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedGuest.preferences.map((pref, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {pref}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm" style={{ color: "#707070" }}>
                      None specified
                    </p>
                  )}
                </section>

                {/* Dietary Notes */}
                <section>
                  <h3 className="text-sm font-semibold mb-1" style={{ color: "#c9a84c" }}>
                    Dietary Notes
                  </h3>
                  <p className="text-sm" style={{ color: "#707070" }}>
                    {selectedGuest.dietaryNotes || "None"}
                  </p>
                </section>

                {/* Special Requests */}
                <section>
                  <h3 className="text-sm font-semibold mb-1" style={{ color: "#c9a84c" }}>
                    Special Requests
                  </h3>
                  <p className="text-sm" style={{ color: "#707070" }}>
                    {selectedGuest.specialRequests || "None"}
                  </p>
                </section>

                <Separator className="bg-border" />

                {/* Stay History */}
                <section>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: "#c9a84c" }}>
                    <History size={14} /> Stay History
                  </h3>
                  {guestReservations.length === 0 ? (
                    <p className="text-sm" style={{ color: "#707070" }}>
                      No reservations found.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {guestReservations.map((res) => (
                        <div
                          key={res.id}
                          className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
                        >
                          <div className="space-y-0.5">
                            <div className="text-white font-medium">
                              {new Date(res.checkIn).toLocaleDateString()} &ndash;{" "}
                              {new Date(res.checkOut).toLocaleDateString()}
                            </div>
                            <div style={{ color: "#707070" }}>{res.roomType}</div>
                          </div>
                          <div className="text-right space-y-0.5">
                            <div className="text-white font-medium">
                              {formatCurrency(res.totalAmount)}
                            </div>
                            <Badge
                              variant="outline"
                              className="text-xs capitalize"
                              style={{
                                borderColor:
                                  res.status === "checked-out"
                                    ? "#34c97a"
                                    : res.status === "cancelled"
                                    ? "#e05656"
                                    : "#c9a84c",
                                color:
                                  res.status === "checked-out"
                                    ? "#34c97a"
                                    : res.status === "cancelled"
                                    ? "#e05656"
                                    : "#c9a84c",
                              }}
                            >
                              {res.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <Separator className="bg-border" />

                {/* Satisfaction */}
                <section>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: "#c9a84c" }}>
                    Satisfaction Score
                  </h3>
                  {selectedGuest.satisfactionScore !== undefined ? (
                    <SatisfactionBar score={selectedGuest.satisfactionScore} />
                  ) : (
                    <p className="text-sm" style={{ color: "#707070" }}>Not rated yet</p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      placeholder="1-10"
                      value={satInput}
                      onChange={(e) => setSatInput(e.target.value)}
                      className="w-20 bg-background border-border text-white"
                    />
                    <Button
                      size="sm"
                      onClick={handleUpdateSatisfaction}
                      style={{ backgroundColor: "#c9a84c", color: "#1a1a1a" }}
                    >
                      Update
                    </Button>
                  </div>
                </section>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Add Guest Dialog ────────────────────────────────────────── */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="bg-card border-border text-white max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus size={18} style={{ color: "#c9a84c" }} /> Add Guest
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs" style={{ color: "#707070" }}>
                  First Name *
                </Label>
                <Input
                  value={newGuest.firstName}
                  onChange={(e) => setNewGuest((p) => ({ ...p, firstName: e.target.value }))}
                  className="bg-background border-border text-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs" style={{ color: "#707070" }}>
                  Last Name *
                </Label>
                <Input
                  value={newGuest.lastName}
                  onChange={(e) => setNewGuest((p) => ({ ...p, lastName: e.target.value }))}
                  className="bg-background border-border text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "#707070" }}>
                Email
              </Label>
              <Input
                type="email"
                value={newGuest.email}
                onChange={(e) => setNewGuest((p) => ({ ...p, email: e.target.value }))}
                className="bg-background border-border text-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "#707070" }}>
                Phone
              </Label>
              <Input
                value={newGuest.phone}
                onChange={(e) => setNewGuest((p) => ({ ...p, phone: e.target.value }))}
                className="bg-background border-border text-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "#707070" }}>
                Loyalty Tier
              </Label>
              <Select
                value={newGuest.loyaltyTier}
                onValueChange={(v) => setNewGuest((p) => ({ ...p, loyaltyTier: v as LoyaltyTier }))}
              >
                <SelectTrigger className="bg-background border-border text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {ALL_TIERS.map((tier) => (
                    <SelectItem key={tier} value={tier}>
                      {tier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="vip-check"
                checked={newGuest.isVip}
                onChange={(e) => setNewGuest((p) => ({ ...p, isVip: e.target.checked }))}
                className="accent-[#c9a84c]"
              />
              <Label htmlFor="vip-check" className="text-sm text-white cursor-pointer">
                VIP Guest
              </Label>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "#707070" }}>
                Preferences (comma-separated)
              </Label>
              <Input
                placeholder="e.g. High floor, Extra pillows, Quiet room"
                value={newGuest.preferences}
                onChange={(e) => setNewGuest((p) => ({ ...p, preferences: e.target.value }))}
                className="bg-background border-border text-white placeholder:text-[#707070]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "#707070" }}>
                Dietary Notes
              </Label>
              <Input
                value={newGuest.dietaryNotes}
                onChange={(e) => setNewGuest((p) => ({ ...p, dietaryNotes: e.target.value }))}
                className="bg-background border-border text-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "#707070" }}>
                Special Requests
              </Label>
              <Input
                value={newGuest.specialRequests}
                onChange={(e) => setNewGuest((p) => ({ ...p, specialRequests: e.target.value }))}
                className="bg-background border-border text-white"
              />
            </div>

            <Button
              onClick={handleAddGuest}
              className="w-full gap-2"
              style={{ backgroundColor: "#c9a84c", color: "#1a1a1a" }}
              disabled={!newGuest.firstName.trim() || !newGuest.lastName.trim()}
            >
              Save Guest
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
