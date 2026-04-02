"use client";

import React, { useMemo } from "react";
import { useHotel } from "@/lib/store";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  BedDouble,
  DollarSign,
  CalendarCheck,
  AlertTriangle,
  Clock,
  Star,
  UserX,
  Package,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const ALERT_ICONS: Record<string, React.ElementType> = {
  "overdue-checkout": Clock,
  maintenance: AlertTriangle,
  "vip-arrival": Star,
  "no-show": UserX,
  "low-inventory": Package,
};

const SEVERITY_VARIANT: Record<string, "destructive" | "warning" | "info"> = {
  critical: "destructive",
  warning: "warning",
  info: "info",
};

export default function DashboardPage() {
  const {
    rooms,
    reservations,
    alerts,
    revenueData,
    resolveAlert: resolveAlertAction,
  } = useHotel();

  const currentDate = new Date().toISOString().split("T")[0];

  const occupancyRate = useMemo(() => {
    if (rooms.length === 0) return 0;
    const occupied = rooms.filter((r) => r.status === "occupied").length;
    return (occupied / rooms.length) * 100;
  }, [rooms]);

  const adr = useMemo(() => {
    const checkedIn = reservations.filter((r) => r.status === "checked-in");
    if (checkedIn.length === 0) return 0;
    const totalRevenue = checkedIn.reduce((sum, r) => sum + r.nightlyRate, 0);
    return totalRevenue / checkedIn.length;
  }, [reservations]);

  const revpar = useMemo(() => {
    if (rooms.length === 0) return 0;
    return (occupancyRate / 100) * adr;
  }, [occupancyRate, adr, rooms.length]);

  const todayArrivals = useMemo(
    () => reservations.filter((r) => r.checkIn === currentDate && r.status === "confirmed"),
    [reservations, currentDate]
  );

  const todayDepartures = useMemo(
    () => reservations.filter((r) => r.checkOut === currentDate && r.status === "checked-in"),
    [reservations, currentDate]
  );

  const inHouseCount = useMemo(
    () => reservations.filter((r) => r.status === "checked-in").length,
    [reservations]
  );

  const unresolvedAlerts = useMemo(
    () => alerts.filter((a) => !a.resolved),
    [alerts]
  );

  const previousAdr = useMemo(() => {
    if (revenueData.length < 2) return 0;
    return revenueData[revenueData.length - 2].adr;
  }, [revenueData]);

  const adrTrend = adr >= previousAdr ? "up" : "down";

  function resolveAlert(alertId: string) {
    resolveAlertAction(alertId);
  }

  function getOccupancyColor(rate: number): string {
    if (rate > 70) return "#22c55e";
    if (rate >= 50) return "#eab308";
    return "#ef4444";
  }

  const occupancyColor = getOccupancyColor(occupancyRate);

  // SVG progress ring values
  const ringRadius = 36;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (occupancyRate / 100) * ringCircumference;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Property Overview</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Occupancy Rate */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#707070] flex items-center gap-2">
              <BedDouble className="h-4 w-4" />
              Occupancy Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold" style={{ color: occupancyColor }}>
                {formatPercent(occupancyRate)}
              </span>
              <svg width="88" height="88" className="-rotate-90">
                <circle
                  cx="44"
                  cy="44"
                  r={ringRadius}
                  fill="none"
                  stroke="#1e1e1e"
                  strokeWidth="6"
                />
                <circle
                  cx="44"
                  cy="44"
                  r={ringRadius}
                  fill="none"
                  stroke={occupancyColor}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  className="transition-all duration-700"
                />
              </svg>
            </div>
            <p className="text-xs text-[#707070] mt-1">
              {rooms.filter((r) => r.status === "occupied").length} of {rooms.length} rooms occupied
            </p>
          </CardContent>
        </Card>

        {/* ADR */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#707070] flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              ADR (Avg Daily Rate)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">{formatCurrency(adr)}</span>
              {adrTrend === "up" ? (
                <span className="flex items-center text-green-500 text-sm">
                  <ArrowUpRight className="h-4 w-4" />
                  <TrendingUp className="h-4 w-4" />
                </span>
              ) : (
                <span className="flex items-center text-red-500 text-sm">
                  <ArrowDownRight className="h-4 w-4" />
                  <TrendingDown className="h-4 w-4" />
                </span>
              )}
            </div>
            <p className="text-xs text-[#707070] mt-1">
              vs previous {formatCurrency(previousAdr)}
            </p>
          </CardContent>
        </Card>

        {/* RevPAR */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#707070] flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              RevPAR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{formatCurrency(revpar)}</span>
            <p className="text-xs text-[#707070] mt-1">Revenue per available room</p>
          </CardContent>
        </Card>

        {/* Today's Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#707070] flex items-center gap-2">
              <CalendarCheck className="h-4 w-4" />
              Today&apos;s Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#707070]">Arrivals</span>
                <Badge variant="info">{todayArrivals.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#707070]">Departures</span>
                <Badge variant="warning">{todayDepartures.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#707070]">In-House</span>
                <Badge variant="success">{inHouseCount}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#c9a84c]" />
            Weekly Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData.slice(-7)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                <XAxis
                  dataKey="date"
                  stroke="#707070"
                  tick={{ fill: "#707070", fontSize: 12 }}
                  tickFormatter={(value: string) => {
                    const d = new Date(value + "T00:00:00");
                    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  }}
                />
                <YAxis
                  stroke="#707070"
                  tick={{ fill: "#707070", fontSize: 12 }}
                  tickFormatter={(value: number) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const data = payload[0].payload as { revenue: number; occupancy: number; adr: number };
                    const d = new Date(label + "T00:00:00");
                    return (
                      <div
                        className="rounded-lg border p-3 text-sm"
                        style={{
                          backgroundColor: "#141820",
                          border: "1px solid #1e2530",
                          color: "#d8e2ec",
                        }}
                      >
                        <p className="font-medium mb-1">
                          {d.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <p>Revenue: {formatCurrency(data.revenue)}</p>
                        <p>Occupancy: {formatPercent(data.occupancy)}</p>
                        <p>ADR: {formatCurrency(data.adr)}</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="revenue" fill="#c9a84c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#c9a84c]" />
              Today&apos;s Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Arrivals */}
            <div>
              <h3 className="text-sm font-semibold text-[#707070] mb-2 uppercase tracking-wide">
                Arrivals ({todayArrivals.length})
              </h3>
              {todayArrivals.length === 0 ? (
                <p className="text-sm text-[#707070]">No arrivals today</p>
              ) : (
                <ul className="space-y-2">
                  {todayArrivals.map((res) => (
                    <li
                      key={res.id}
                      className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium">{res.guestName}</p>
                        <p className="text-xs text-[#707070]">{res.roomType}</p>
                      </div>
                      <span className="text-xs text-[#707070]">
                        {res.isLateArrival ? "Late arrival" : "Expected"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Departures */}
            <div>
              <h3 className="text-sm font-semibold text-[#707070] mb-2 uppercase tracking-wide">
                Departures ({todayDepartures.length})
              </h3>
              {todayDepartures.length === 0 ? (
                <p className="text-sm text-[#707070]">No departures today</p>
              ) : (
                <ul className="space-y-2">
                  {todayDepartures.map((res) => (
                    <li
                      key={res.id}
                      className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium">{res.guestName}</p>
                        <p className="text-xs text-[#707070]">
                          Room {res.roomNumber ?? "Unassigned"}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alerts Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[#c9a84c]" />
              Alerts
              {unresolvedAlerts.length > 0 && (
                <Badge variant="destructive">{unresolvedAlerts.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {unresolvedAlerts.length === 0 ? (
              <p className="text-sm text-[#707070]">No unresolved alerts</p>
            ) : (
              <ul className="space-y-3">
                {unresolvedAlerts.map((alert) => {
                  const Icon = ALERT_ICONS[alert.type] ?? AlertTriangle;
                  return (
                    <li
                      key={alert.id}
                      className="flex items-start gap-3 rounded-md border border-border px-3 py-3"
                    >
                      <Icon className="h-5 w-5 mt-0.5 shrink-0 text-[#707070]" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={SEVERITY_VARIANT[alert.severity] ?? "info"}>
                            {alert.severity}
                          </Badge>
                          <span className="text-xs text-[#707070]">
                            {new Date(alert.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-sm">{alert.message}</p>
                      </div>
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="shrink-0 rounded-md border border-border px-3 py-1 text-xs text-[#707070] hover:text-[#c9a84c] hover:border-[#c9a84c] transition-colors"
                      >
                        Resolve
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
