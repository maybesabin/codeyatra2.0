"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

const Appointments = () => {
  const router = useRouter();
  const [counts, setCounts] = useState({
    Total: 0,
    Pending: 0,
    Completed: 0,
    Cancelled: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchCounts = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.replace("/doctor/login");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.get<{
        success: boolean;
        counts: { total: number; pending: number; completed: number; cancelled: number };
      }>("/api/doctor/appointments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success && data.counts) {
        setCounts({
          Total: data.counts.total,
          Pending: data.counts.pending,
          Completed: data.counts.completed,
          Cancelled: data.counts.cancelled,
        });
      }
    } catch {
      setCounts({ Total: 0, Pending: 0, Completed: 0, Cancelled: 0 });
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const entries = [
    { key: "Total" as const, label: "Total" },
    { key: "Pending" as const, label: "Pending" },
    { key: "Completed" as const, label: "Completed" },
    { key: "Cancelled" as const, label: "Cancelled" },
  ];

  return (
    <div className="p-6 w-full">
      <header className="mt-6 mb-2">
        <h1 className="text-4xl text-primary font-semibold">Appointments</h1>
        <p className="text-sm mt-1 text-stone-400">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </header>
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-stone-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading…</span>
        </div>
      ) : (
        <div className="grid lg:grid-cols-4 md:grid-cols-2 w-full gap-4">
          {entries.map(({ key, label }) => (
            <div
              key={key}
              className="p-6 flex-1 w-full ring ring-neutral-300 shadow-md rounded-xl"
            >
              <p className="text-sm text-neutral-500">{label}</p>
              <p className="font-semibold text-primary text-2xl">{counts[key]}</p>
              <p className="text-sm text-neutral-500">{label} appointments</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Appointments;
