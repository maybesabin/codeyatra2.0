import React, { useState } from "react";

type Status = "confirmed" | "pending" | "rejected" | "completed";

interface Appointment {
  id: string;
  patient: string;
  age: number;
  gender: "M" | "F";
  condition: string;
  bookedOn: string;
  scheduledFor: string;
  status: Status;
  rejectionReason?: string;
  notes?: string;
  avatar: string;
}

const APPOINTMENTS: Appointment[] = [
  {
    id: "A001",
    patient: "Priya Sharma",
    age: 34,
    gender: "F",
    condition: "Hypertension follow-up",
    bookedOn: "2025-02-18T09:14:00",
    scheduledFor: "2025-02-22T10:00:00",
    status: "confirmed",
    notes: "BP readings trending high. Medication review needed.",
    avatar: "PS",
  },
  {
    id: "A002",
    patient: "Arjun Mehta",
    age: 52,
    gender: "M",
    condition: "Type 2 Diabetes checkup",
    bookedOn: "2025-02-17T14:30:00",
    scheduledFor: "2025-02-22T11:30:00",
    status: "completed",
    notes: "HbA1c stable. Continue current regimen.",
    avatar: "AM",
  },
  {
    id: "A003",
    patient: "Neha Gupta",
    age: 28,
    gender: "F",
    condition: "Migraine consultation",
    bookedOn: "2025-02-19T11:00:00",
    scheduledFor: "2025-02-23T09:00:00",
    status: "rejected",
    rejectionReason:
      "Slot unavailable — doctor on leave. Rescheduled for next week.",
    avatar: "NG",
  },
];

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
    confirmed: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    rejected: "bg-red-100 text-red-700",
    completed: "bg-blue-100 text-blue-700",
  };
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${statusMap[status]}`}
    >
      {status}
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
        <h2 className="font-semibold text-lg mb-2">{appt.patient}</h2>
        <p>{appt.condition}</p>
        <p className="mt-2 text-sm text-stone-400">
          Notes: {appt.notes || "—"}
        </p>
        <button
          onClick={onClose}
          className="mt-4 px-3 py-1 bg-teal-600 text-white rounded-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default function DoctorDashboard() {
  const [filter, setFilter] = useState<Status | "all">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Appointment | null>(null);

  const filtered = APPOINTMENTS.filter((a) => {
    const matchStatus = filter === "all" || a.status === filter;
    const matchSearch =
      a.patient.toLowerCase().includes(search.toLowerCase()) ||
      a.condition.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = {
    all: APPOINTMENTS.length,
    confirmed: APPOINTMENTS.filter((a) => a.status === "confirmed").length,
    pending: APPOINTMENTS.filter((a) => a.status === "pending").length,
    rejected: APPOINTMENTS.filter((a) => a.status === "rejected").length,
    completed: APPOINTMENTS.filter((a) => a.status === "completed").length,
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Appointments</h1>
        <p className="text-sm text-stone-400">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </header>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search patient or condition…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-stone-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />

        <div className="flex gap-1 bg-white border border-stone-200 rounded-xl p-1">
          {(
            ["all", "confirmed", "pending", "rejected", "completed"] as const
          ).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition capitalize ${
                filter === s
                  ? "bg-stone-800 text-white shadow-sm"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              {s === "all" ? `All (${counts.all})` : `${s} (${counts[s]})`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
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
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Rejection Reason</th>
                <th className="px-5 py-3"></th>
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
                          appt.id,
                        )}`}
                      >
                        {appt.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-stone-800">
                          {appt.patient}
                        </p>
                        <p className="text-stone-400 text-xs">
                          {appt.age} yrs ·{" "}
                          {appt.gender === "M" ? "Male" : "Female"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-stone-600 max-w-[160px] truncate">
                    {appt.condition}
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-stone-700">{fmt(appt.bookedOn)}</p>
                    <p className="text-stone-400 text-xs">
                      {fmtTime(appt.bookedOn)}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-stone-700">{fmt(appt.scheduledFor)}</p>
                    <p className="text-stone-400 text-xs">
                      {fmtTime(appt.scheduledFor)}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <Badge status={appt.status} />
                  </td>
                  <td className="px-5 py-4 max-w-[200px] truncate">
                    {appt.rejectionReason ? (
                      <span className="text-red-500 text-xs">
                        {appt.rejectionReason}
                      </span>
                    ) : (
                      <span className="text-stone-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <button className="text-stone-400 hover:text-teal-600 transition">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-center text-xs text-stone-300 mt-6">
        Showing {filtered.length} of {APPOINTMENTS.length} appointments ·
        MediDesk v1.0
      </p>

      {selected && (
        <DetailModal appt={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
