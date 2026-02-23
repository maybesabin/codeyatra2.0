"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getDaysInMonth(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const days: Date[] = [];
  for (let d = 1; d <= last.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

function getPaddingDays(year: number, month: number): number[] {
  const first = new Date(year, month, 1);
  const dayOfWeek = first.getDay();
  return Array.from({ length: dayOfWeek }, (_, i) => i);
}

export default function Calendar() {
  const router = useRouter();
  const [appointmentsByDate, setAppointmentsByDate] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [viewDate, setViewDate] = useState(() => new Date());

  const fetchAppointments = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.replace("/doctor/login");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.get<{
        success: boolean;
        appointments: { date: string }[];
      }>("/api/doctor/appointments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success && data.appointments) {
        const byDate: Record<string, number> = {};
        for (const a of data.appointments) {
          const d = new Date(a.date);
          const key = getDateKey(d);
          byDate[key] = (byDate[key] ?? 0) + 1;
        }
        setAppointmentsByDate(byDate);
      } else {
        setAppointmentsByDate({});
      }
    } catch {
      setAppointmentsByDate({});
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const days = getDaysInMonth(year, month);
  const padding = getPaddingDays(year, month);
  const totalCells = padding.length + days.length;
  const trailingEmpty = (7 - (totalCells % 7)) % 7;

  const prevMonth = () => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1));
  };

  const nextMonth = () => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1));
  };

  const today = getDateKey(new Date());

  return (
    <div className="p-6 w-full">
      <header className="my-6 flex items-center justify-between">
        <h2 className="text-4xl text-primary font-semibold">Schedule</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-stone-100 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="min-w-[160px] text-center font-medium">
            {viewDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-stone-100 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-stone-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading…</span>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="grid grid-cols-7 text-xs font-medium text-stone-500 uppercase tracking-wide border-b border-stone-50">
            {DAYS.map((d) => (
              <div key={d} className="p-2 text-center">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {padding.map((i) => (
              <div key={`pad-${i}`} className="min-h-[72px] border-b border-r border-stone-50 bg-stone-50/50" />
            ))}
            {days.map((d) => {
              const key = getDateKey(d);
              const count = appointmentsByDate[key] ?? 0;
              const isToday = key === today;
              return (
                <div
                  key={key}
                  className={`min-h-[72px] border-b border-r border-stone-50 p-2 flex flex-col ${isToday ? "bg-primary/5" : ""
                    }`}
                >
                  <span
                    className={`text-sm font-medium ${isToday
                        ? "bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                        : ""
                      }`}
                  >
                    {d.getDate()}
                  </span>
                  {count > 0 && (
                    <span className="mt-1 inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-semibold">
                      {count}
                    </span>
                  )}
                </div>
              );
            })}
            {Array.from({ length: trailingEmpty }).map((_, i) => (
              <div key={`trail-${i}`} className="min-h-[72px] border-b border-r border-stone-50 bg-stone-50/50" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
