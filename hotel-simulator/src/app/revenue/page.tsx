"use client";

import React, { useMemo, useState } from "react";
import { useHotel } from "@/lib/store";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  Lightbulb,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import type { RoomType, DemandLevel, CompetitorRate } from "@/lib/types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEMAND_LEVELS: DemandLevel[] = ["Low", "Medium", "High", "Peak"];
const ROOM_TYPES: RoomType[] = ["Standard", "Deluxe", "Suite", "Presidential"];

const PRICING_GRID: Record<DemandLevel, Record<RoomType, number>> = {
  Low: { Standard: 120, Deluxe: 180, Suite: 300, Presidential: 500 },
  Medium: { Standard: 150, Deluxe: 220, Suite: 380, Presidential: 650 },
  High: { Standard: 200, Deluxe: 300, Suite: 480, Presidential: 800 },
  Peak: { Standard: 280, Deluxe: 400, Suite: 600, Presidential: 1100 },
};

const SOURCE_COLORS: Record<string, string> = {
  "OTA-Expedia": "#f97316",
  "OTA-Booking": "#3b82f6",
  Direct: "#34c97a",
  "Walk-in": "#a855f7",
  Corporate: "#c9a84c",
};

const MOCK_COMPETITORS: CompetitorRate[] = [
  { name: "The Metropolitan", standard: 165, deluxe: 240, suite: 400, presidential: 680, occupancy: 74 },
  { name: "Harbor View Inn", standard: 135, deluxe: 195, suite: 340, presidential: 560, occupancy: 62 },
  { name: "Crown Plaza Downtown", standard: 155, deluxe: 225, suite: 385, presidential: 640, occupancy: 70 },
];

// ---------------------------------------------------------------------------
// Helper: day offset string
// ---------------------------------------------------------------------------

function dayOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDateWeekday(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RevenuePage() {
  const { rooms, reservations, revenueData } = useHotel();

  // Local state
  const [selectedDemand, setSelectedDemand] = useState<DemandLevel>("Medium");
  const [appliedRates, setAppliedRates] = useState<Record<RoomType, number>>(
    PRICING_GRID["Medium"]
  );

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------

  const occupancyRate = useMemo(() => {
    if (rooms.length === 0) return 66.7; // fallback for empty store
    const occupied = rooms.filter((r) => r.status === "occupied").length;
    return (occupied / rooms.length) * 100;
  }, [rooms]);

  // Our hotel row for competitor comparison
  const ourHotelRates: CompetitorRate = useMemo(
    () => ({
      name: "Grand Horizon",
      standard: appliedRates.Standard,
      deluxe: appliedRates.Deluxe,
      suite: appliedRates.Suite,
      presidential: appliedRates.Presidential,
      occupancy: Math.round(occupancyRate),
    }),
    [appliedRates, occupancyRate]
  );

  const competitorAvg = useMemo(() => {
    const comps = MOCK_COMPETITORS;
    return {
      standard: Math.round(comps.reduce((s, c) => s + c.standard, 0) / comps.length),
      deluxe: Math.round(comps.reduce((s, c) => s + c.deluxe, 0) / comps.length),
      suite: Math.round(comps.reduce((s, c) => s + c.suite, 0) / comps.length),
      presidential: Math.round(comps.reduce((s, c) => s + c.presidential, 0) / comps.length),
    };
  }, []);

  // Revenue trend (last 7 days from store, or generate if empty)
  const revenueTrend = useMemo(() => {
    if (revenueData.length > 0) return revenueData.slice(-7);
    // Fallback mock data
    return Array.from({ length: 7 }, (_, i) => {
      const occ = 60 + Math.floor(((i * 17 + 3) % 20));
      const adr = 180 + Math.floor(((i * 23 + 7) % 60));
      const rev = Math.floor(adr * 60 * (occ / 100));
      return {
        date: dayOffset(-(6 - i)),
        revenue: rev,
        occupancy: occ,
        adr,
        revpar: Math.floor(adr * (occ / 100)),
      };
    });
  }, [revenueData]);

  // Booking source distribution from reservations
  const sourceDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    const activeRes = reservations.filter(
      (r) => r.status === "checked-in" || r.status === "confirmed"
    );

    if (activeRes.length === 0) {
      // Fallback
      return [
        { name: "OTA-Expedia", value: 28 },
        { name: "OTA-Booking", value: 22 },
        { name: "Direct", value: 30 },
        { name: "Walk-in", value: 10 },
        { name: "Corporate", value: 10 },
      ];
    }

    for (const r of activeRes) {
      counts[r.source] = (counts[r.source] || 0) + 1;
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [reservations]);

  // Yield management suggestions
  const suggestions = useMemo(() => {
    const occ = occupancyRate;
    const items: { icon: React.ElementType; text: string; severity: "success" | "info" | "warning" | "destructive" }[] = [];

    if (occ > 85) {
      items.push({
        icon: ArrowUpRight,
        text: "Consider raising rates 10-15%. High demand detected.",
        severity: "success",
      });
      items.push({
        icon: Target,
        text: "Restrict discount codes and OTA promotions to maximize RevPAR.",
        severity: "info",
      });
    } else if (occ >= 70) {
      items.push({
        icon: TrendingUp,
        text: "Occupancy is healthy. Maintain current rates.",
        severity: "success",
      });
      items.push({
        icon: Lightbulb,
        text: "Consider upselling room upgrades at check-in to boost ADR.",
        severity: "info",
      });
    } else if (occ >= 50) {
      items.push({
        icon: TrendingDown,
        text: "Consider promotional rates to boost occupancy.",
        severity: "warning",
      });
      items.push({
        icon: BarChart3,
        text: "Run flash sales on Direct booking channel to avoid OTA commissions.",
        severity: "info",
      });
    } else {
      items.push({
        icon: ArrowDownRight,
        text: "Low occupancy alert. Recommend OTA promotions and rate reductions.",
        severity: "destructive",
      });
      items.push({
        icon: Lightbulb,
        text: "Activate last-minute deal packages across all distribution channels.",
        severity: "warning",
      });
      items.push({
        icon: DollarSign,
        text: "Consider bundled offers (room + dining) to attract bookings.",
        severity: "info",
      });
    }

    return items;
  }, [occupancyRate]);

  // 7-Day revenue forecast from future confirmed reservations
  const forecast = useMemo(() => {
    const totalRooms = rooms.length || 60;
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = dayOffset(i + 1);
      const dayReservations = reservations.filter(
        (r) =>
          r.status === "confirmed" &&
          r.checkIn <= date &&
          r.checkOut > date
      );
      const expectedBookings = dayReservations.length;
      const projectedRevenue = dayReservations.reduce((sum, r) => sum + r.nightlyRate, 0);
      // Add estimated walk-in / existing checked-in guests revenue
      const checkedInOnDate = reservations.filter(
        (r) =>
          r.status === "checked-in" &&
          r.checkIn <= date &&
          r.checkOut > date
      );
      const totalBookings = expectedBookings + checkedInOnDate.length;
      const totalRevenue = projectedRevenue + checkedInOnDate.reduce((sum, r) => sum + r.nightlyRate, 0);
      const projectedOccupancy = (totalBookings / totalRooms) * 100;

      return {
        date,
        expectedBookings: totalBookings,
        projectedRevenue: totalRevenue,
        projectedOccupancy: Math.min(projectedOccupancy, 100),
      };
    });

    // If no reservation data, provide fallback
    if (days.every((d) => d.expectedBookings === 0)) {
      return Array.from({ length: 7 }, (_, i) => {
        const bookings = 30 + Math.floor(((i * 13 + 5) % 15));
        const rate = 200 + Math.floor(((i * 19 + 3) % 40));
        return {
          date: dayOffset(i + 1),
          expectedBookings: bookings,
          projectedRevenue: bookings * rate,
          projectedOccupancy: Math.round((bookings / 60) * 100),
        };
      });
    }

    return days;
  }, [rooms.length, reservations]);

  const forecastTotals = useMemo(() => {
    return {
      totalBookings: forecast.reduce((s, d) => s + d.expectedBookings, 0),
      totalRevenue: forecast.reduce((s, d) => s + d.projectedRevenue, 0),
      avgOccupancy: forecast.reduce((s, d) => s + d.projectedOccupancy, 0) / forecast.length,
    };
  }, [forecast]);

  // ---------------------------------------------------------------------------
  // Helpers for coloring
  // ---------------------------------------------------------------------------

  function rateCompareColor(ours: number, avg: number): string {
    if (ours < avg) return "text-green-400";
    if (ours > avg) return "text-red-400";
    return "text-foreground";
  }

  function revenueRowColor(revenue: number): string {
    const max = Math.max(...forecast.map((d) => d.projectedRevenue));
    const ratio = max > 0 ? revenue / max : 0;
    if (ratio >= 0.7) return "text-green-400";
    if (ratio >= 0.4) return "text-amber-400";
    return "text-red-400";
  }

  // ---------------------------------------------------------------------------
  // Custom Recharts tooltip
  // ---------------------------------------------------------------------------

  function CustomTooltipContent({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ value: number; name: string }>;
    label?: string;
  }) {
    if (!active || !payload || payload.length === 0) return null;
    return (
      <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-lg">
        <p className="font-medium text-foreground mb-1">
          {label ? formatDateShort(label) : ""}
        </p>
        {payload.map((entry, i) => (
          <p key={i} className="text-[#d8e2ec]">
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <DollarSign className="h-6 w-6 text-[#c9a84c]" />
        Revenue Management
      </h1>

      {/* ------------------------------------------------------------------ */}
      {/* 1. Dynamic Pricing Simulator */}
      {/* ------------------------------------------------------------------ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-[#c9a84c]" />
            Dynamic Pricing Simulator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Demand level selector */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Current Demand Level</p>
            <div className="flex flex-wrap gap-2">
              {DEMAND_LEVELS.map((level) => (
                <Button
                  key={level}
                  variant={selectedDemand === level ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDemand(level)}
                  className={
                    selectedDemand === level
                      ? "bg-[#c9a84c] text-black hover:bg-[#b8963f]"
                      : ""
                  }
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>

          {/* Pricing grid */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Room Type</th>
                  {DEMAND_LEVELS.map((level) => (
                    <th
                      key={level}
                      className={`text-center py-2 px-3 font-medium ${
                        selectedDemand === level
                          ? "bg-[#c9a84c]/20 text-[#c9a84c] rounded-t-md"
                          : "text-muted-foreground"
                      }`}
                    >
                      {level}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROOM_TYPES.map((type) => (
                  <tr key={type} className="border-b border-border/50">
                    <td className="py-2.5 pr-4 font-medium">{type}</td>
                    {DEMAND_LEVELS.map((level) => (
                      <td
                        key={level}
                        className={`text-center py-2.5 px-3 ${
                          selectedDemand === level
                            ? "bg-[#c9a84c]/20 text-[#c9a84c] font-semibold"
                            : "text-muted-foreground"
                        }`}
                      >
                        {formatCurrency(PRICING_GRID[level][type])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => setAppliedRates(PRICING_GRID[selectedDemand])}
              className="bg-[#c9a84c] text-black hover:bg-[#b8963f]"
            >
              Apply Rates
            </Button>
          </div>

          {appliedRates && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline" className="border-[#c9a84c] text-[#c9a84c]">
                Active
              </Badge>
              <span>
                Applied: Standard {formatCurrency(appliedRates.Standard)} / Deluxe{" "}
                {formatCurrency(appliedRates.Deluxe)} / Suite{" "}
                {formatCurrency(appliedRates.Suite)} / Presidential{" "}
                {formatCurrency(appliedRates.Presidential)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* 2. Competitor Rate Comparison */}
      {/* ------------------------------------------------------------------ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#c9a84c]" />
            Competitor Rate Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Hotel Name</th>
                  <th className="text-center py-2 px-3 text-muted-foreground font-medium">Standard</th>
                  <th className="text-center py-2 px-3 text-muted-foreground font-medium">Deluxe</th>
                  <th className="text-center py-2 px-3 text-muted-foreground font-medium">Suite</th>
                  <th className="text-center py-2 px-3 text-muted-foreground font-medium">Presidential</th>
                  <th className="text-center py-2 px-3 text-muted-foreground font-medium">Occupancy %</th>
                </tr>
              </thead>
              <tbody>
                {/* Our hotel - highlighted */}
                <tr className="border-b border-[#c9a84c]/30 bg-[#c9a84c]/10">
                  <td className="py-2.5 pr-4 font-semibold text-[#c9a84c]">
                    {ourHotelRates.name}
                    <Badge variant="outline" className="ml-2 border-[#c9a84c] text-[#c9a84c] text-[10px]">
                      You
                    </Badge>
                  </td>
                  <td className={`text-center py-2.5 px-3 font-medium ${rateCompareColor(ourHotelRates.standard, competitorAvg.standard)}`}>
                    {formatCurrency(ourHotelRates.standard)}
                  </td>
                  <td className={`text-center py-2.5 px-3 font-medium ${rateCompareColor(ourHotelRates.deluxe, competitorAvg.deluxe)}`}>
                    {formatCurrency(ourHotelRates.deluxe)}
                  </td>
                  <td className={`text-center py-2.5 px-3 font-medium ${rateCompareColor(ourHotelRates.suite, competitorAvg.suite)}`}>
                    {formatCurrency(ourHotelRates.suite)}
                  </td>
                  <td className={`text-center py-2.5 px-3 font-medium ${rateCompareColor(ourHotelRates.presidential, competitorAvg.presidential)}`}>
                    {formatCurrency(ourHotelRates.presidential)}
                  </td>
                  <td className="text-center py-2.5 px-3 font-medium">
                    {formatPercent(ourHotelRates.occupancy)}
                  </td>
                </tr>

                {/* Competitors */}
                {MOCK_COMPETITORS.map((comp) => (
                  <tr key={comp.name} className="border-b border-border/50">
                    <td className="py-2.5 pr-4 font-medium">{comp.name}</td>
                    <td className="text-center py-2.5 px-3 text-muted-foreground">
                      {formatCurrency(comp.standard)}
                    </td>
                    <td className="text-center py-2.5 px-3 text-muted-foreground">
                      {formatCurrency(comp.deluxe)}
                    </td>
                    <td className="text-center py-2.5 px-3 text-muted-foreground">
                      {formatCurrency(comp.suite)}
                    </td>
                    <td className="text-center py-2.5 px-3 text-muted-foreground">
                      {formatCurrency(comp.presidential)}
                    </td>
                    <td className="text-center py-2.5 px-3 text-muted-foreground">
                      {formatPercent(comp.occupancy)}
                    </td>
                  </tr>
                ))}

                {/* Competitor average row */}
                <tr className="border-t border-border">
                  <td className="py-2.5 pr-4 text-muted-foreground italic">Competitor Avg</td>
                  <td className="text-center py-2.5 px-3 text-muted-foreground italic">
                    {formatCurrency(competitorAvg.standard)}
                  </td>
                  <td className="text-center py-2.5 px-3 text-muted-foreground italic">
                    {formatCurrency(competitorAvg.deluxe)}
                  </td>
                  <td className="text-center py-2.5 px-3 text-muted-foreground italic">
                    {formatCurrency(competitorAvg.suite)}
                  </td>
                  <td className="text-center py-2.5 px-3 text-muted-foreground italic">
                    {formatCurrency(competitorAvg.presidential)}
                  </td>
                  <td className="text-center py-2.5 px-3 text-muted-foreground italic">--</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* 3. Revenue Charts (side by side) */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#c9a84c]" />
              Revenue Trend (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2530" />
                  <XAxis
                    dataKey="date"
                    stroke="#707070"
                    tick={{ fill: "#707070", fontSize: 12 }}
                    tickFormatter={formatDateShort}
                  />
                  <YAxis
                    stroke="#707070"
                    tick={{ fill: "#707070", fontSize: 12 }}
                    tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <RechartsTooltip content={<CustomTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#c9a84c"
                    strokeWidth={2}
                    dot={{ fill: "#c9a84c", r: 4 }}
                    activeDot={{ r: 6, fill: "#c9a84c" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* OTA vs Direct Split - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#c9a84c]" />
              Booking Source Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }: { name?: string; percent?: number }) =>
                      `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    labelLine={{ stroke: "#707070" }}
                  >
                    {sourceDistribution.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={SOURCE_COLORS[entry.name] || "#707070"}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || payload.length === 0) return null;
                      const data = payload[0];
                      return (
                        <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-lg">
                          <p className="font-medium text-foreground">{data.name}</p>
                          <p className="text-muted-foreground">{data.value} bookings</p>
                        </div>
                      );
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value: string) => (
                      <span className="text-xs text-muted-foreground">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 4. Yield Management Suggestions */}
      {/* ------------------------------------------------------------------ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-[#c9a84c]" />
            Yield Management Suggestions
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Based on current occupancy of {formatPercent(occupancyRate)}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {suggestions.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg border border-border p-4"
                >
                  <div
                    className={`mt-0.5 shrink-0 rounded-full p-2 ${
                      item.severity === "success"
                        ? "bg-green-500/15 text-green-400"
                        : item.severity === "warning"
                        ? "bg-amber-500/15 text-amber-400"
                        : item.severity === "destructive"
                        ? "bg-red-500/15 text-red-400"
                        : "bg-blue-500/15 text-blue-400"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-sm leading-relaxed">{item.text}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* 5. 7-Day Revenue Forecast */}
      {/* ------------------------------------------------------------------ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#c9a84c]" />
            7-Day Revenue Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Date</th>
                  <th className="text-center py-2 px-3 text-muted-foreground font-medium">Expected Bookings</th>
                  <th className="text-center py-2 px-3 text-muted-foreground font-medium">Projected Revenue</th>
                  <th className="text-center py-2 px-3 text-muted-foreground font-medium">Projected Occupancy</th>
                </tr>
              </thead>
              <tbody>
                {forecast.map((day) => (
                  <tr key={day.date} className="border-b border-border/50">
                    <td className="py-2.5 pr-4 font-medium">{formatDateWeekday(day.date)}</td>
                    <td className="text-center py-2.5 px-3">{day.expectedBookings}</td>
                    <td className={`text-center py-2.5 px-3 font-medium ${revenueRowColor(day.projectedRevenue)}`}>
                      {formatCurrency(day.projectedRevenue)}
                    </td>
                    <td className="text-center py-2.5 px-3">
                      <span
                        className={
                          day.projectedOccupancy >= 75
                            ? "text-green-400"
                            : day.projectedOccupancy >= 50
                            ? "text-amber-400"
                            : "text-red-400"
                        }
                      >
                        {formatPercent(day.projectedOccupancy)}
                      </span>
                    </td>
                  </tr>
                ))}

                {/* Totals row */}
                <tr className="border-t-2 border-border font-semibold">
                  <td className="py-2.5 pr-4 text-[#c9a84c]">Total / Average</td>
                  <td className="text-center py-2.5 px-3">{forecastTotals.totalBookings}</td>
                  <td className="text-center py-2.5 px-3 text-[#c9a84c]">
                    {formatCurrency(forecastTotals.totalRevenue)}
                  </td>
                  <td className="text-center py-2.5 px-3">
                    {formatPercent(forecastTotals.avgOccupancy)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
