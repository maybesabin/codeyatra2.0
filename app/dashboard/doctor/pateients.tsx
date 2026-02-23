"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";

type Status = "pending" | "completed" | "cancelled";

type Priority = "low" | "moderate" | "high";

interface Appointment {
  id: string;
  user: string;
  age: number;
  gender: "M" | "F" | "O";
  problem: string;
  bookedOn: string;
  date: string;
  status: Status;
  priority?: Priority;
  avatar: string;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

const fmt = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const fmtTime = (dateStr: string) =>
  new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

const avatarColor = (id: string) => {
  const colors = [
    "bg-teal-200 text-teal-800",
    "bg-indigo-200 text-indigo-800",
    "bg-pink-200 text-pink-800",
  ];
  const index = id.charCodeAt(0) % colors.length;
  return colors[index];
};

const Badge = ({ status }: { status: Status }) => {
  const statusMap: Record<Status, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    completed: "bg-blue-100 text-blue-700",
    cancelled: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${statusMap[status]}`}
    >
      {status}
    </span>
  );
};

const PriorityBadge = ({ priority }: { priority?: Priority }) => {
  if (!priority) return <span className="text-stone-400 text-xs">—</span>;
  const map: Record<Priority, string> = {
    low: "bg-stone-100 text-stone-700",
    moderate: "bg-amber-100 text-amber-700",
    high: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${map[priority]}`}>
      {priority}
    </span>
  );
};

const DetailModal = ({
  appt,
  onClose,
}: {
  appt: Appointment;
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96">
        <h2 className="font-semibold text-lg mb-2">{appt.user}</h2>
        <p className="text-stone-600 mb-2">{appt.problem}</p>
        {appt.priority && (
          <p className="text-sm text-stone-500 mb-3">
            Priority: <PriorityBadge priority={appt.priority} />
          </p>
        )}
        <button
          onClick={onClose}
          className="mt-4 px-3 py-1 bg-primary text-white rounded-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const CancelAppointmentModal = ({
  onConfirm,
  onClose,
  message,
  onMessageChange,
  loading,
}: {
  onConfirm: () => void;
  onClose: () => void;
  message: string;
  onMessageChange: (v: string) => void;
  loading: boolean;
}) => {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[360px] max-w-[90vw]">
        <h2 className="font-semibold text-lg mb-1">Cancel appointment</h2>
        <p className="text-sm text-stone-500 mb-3">
          Optionally add a short message for the patient (e.g. reason or alternative).
        </p>
        <textarea
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="e.g. Schedule conflict, please book another slot."
          className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary h-20"
          maxLength={500}
        />
        <div className="flex gap-2 mt-4 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
                Cancelling…
              </>
            ) : (
              "Cancel appointment"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function DoctorDashboard() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [counts, setCounts] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Status | "all">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [cancelModal, setCancelModal] = useState<{ apptId: string } | null>(null);
  const [cancelMessage, setCancelMessage] = useState("");

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
        appointments: Appointment[];
        counts: { total: number; pending: number; completed: number; cancelled: number };
      }>("/api/doctor/appointments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success && data.appointments) {
        setAppointments(data.appointments);
        if (data.counts) setCounts(data.counts);
      } else {
        setAppointments([]);
      }
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleStatusUpdate = async (
    apptId: string,
    newStatus: "completed" | "cancelled",
    message?: string
  ) => {
    const token = getToken();
    if (!token) return;
    setUpdatingId(apptId);
    try {
      const body: { status: string; message?: string } = { status: newStatus };
      if (newStatus === "cancelled" && message?.trim()) body.message = message.trim();
      await axios.patch(
        `/api/doctor/appointments/${apptId}`,
        body,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(newStatus === "completed" ? "Appointment approved" : "Appointment cancelled");
      setCancelModal(null);
      setCancelMessage("");
      fetchAppointments();
    } catch (err) {
      const msg = axios.isAxiosError(err) && err.response?.data?.message
        ? String(err.response.data.message)
        : "Update failed";
      toast.error(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancelClick = (apptId: string) => {
    setCancelMessage("");
    setCancelModal({ apptId });
  };

  const handleCancelConfirm = () => {
    if (!cancelModal) return;
    handleStatusUpdate(cancelModal.apptId, "cancelled", cancelMessage);
  };

  const filtered = appointments.filter((a) => {
    const matchStatus = filter === "all" || a.status === filter;
    const matchSearch =
      a.user.toLowerCase().includes(search.toLowerCase()) ||
      a.problem.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const displayCounts = {
    all: counts.total,
    pending: counts.pending,
    completed: counts.completed,
    cancelled: counts.cancelled,
  };

  return (
    <div className="bg-stone-50 font-sans p-6">
      <header className="mb-2">
        <h1 className="text-4xl text-primary font-semibold">Patients</h1>
      </header>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search patient or condition…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-stone-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <div className="flex gap-1 bg-white border border-stone-200 rounded-xl p-1">
          {(["all", "pending", "completed", "cancelled"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 cursor-pointer rounded-lg text-xs font-medium transition capitalize ${filter === s
                ? "bg-primary text-white  shadow-sm"
                : "text-stone-500 hover:text-stone-700"
                }`}
            >
              {s === "all"
                ? `All (${displayCounts.all})`
                : `${s} (${displayCounts[s]})`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex items-center justify-center gap-2 text-stone-500">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading appointments…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-stone-400 text-sm">
            No appointments match your search.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-400">
              <tr>
                <th className="px-5 py-3 text-left">Patient</th>
                <th className="px-5 py-3 text-left">Condition</th>
                <th className="px-5 py-3 text-left">Booked On</th>
                <th className="px-5 py-3 text-left">Scheduled For</th>
                <th className="px-5 py-3 text-left">Priority</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((appt) => (
                <tr
                  key={appt.id}
                  className="border-b border-stone-50 hover:bg-stone-50/80 cursor-pointer transition"
                  onClick={() => setSelected(appt)}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${avatarColor(
                          appt.id
                        )}`}
                      >
                        {appt.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-stone-800">{appt.user}</p>
                        <p className="text-stone-400 text-xs">
                          {appt.age} yrs ·{" "}
                          {appt.gender === "M"
                            ? "Male"
                            : appt.gender === "F"
                              ? "Female"
                              : "Other"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-stone-600 max-w-[160px] truncate">
                    {appt.problem}
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-stone-700">{fmt(appt.bookedOn)}</p>
                    <p className="text-stone-400 text-xs">
                      {fmtTime(appt.bookedOn)}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-stone-700">{fmt(appt.date)}</p>
                    <p className="text-stone-400 text-xs">
                      {fmtTime(appt.date)}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <PriorityBadge priority={appt.priority} />
                  </td>
                  <td className="px-5 py-4">
                    <Badge status={appt.status} />
                  </td>

                  <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    {appt.status === "pending" ? (
                      <div className="flex gap-1.5 flex-wrap">
                        <button
                          type="button"
                          disabled={updatingId === appt.id}
                          onClick={() => handleStatusUpdate(appt.id, "completed")}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50"
                        >
                          {updatingId === appt.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Check className="w-3 h-3" />
                          )}
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={updatingId === appt.id}
                          onClick={() => handleCancelClick(appt.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                        >
                          <X className="w-3 h-3" />
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span className="text-stone-400 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <DetailModal appt={selected} onClose={() => setSelected(null)} />
      )}

      {cancelModal && (
        <CancelAppointmentModal
          message={cancelMessage}
          onMessageChange={setCancelMessage}
          onConfirm={handleCancelConfirm}
          onClose={() => {
            setCancelModal(null);
            setCancelMessage("");
          }}
          loading={updatingId === cancelModal.apptId}
        />
      )}
    </div>
  );
}
