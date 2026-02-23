"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";

type Role = "user" | "doctor";
type Status = "active" | "suspended";

interface Person {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  status: Status;
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

const Badge = ({ status }: { status: Status }) => {
  const map: Record<Status, string> = {
    active: "bg-green-100 text-green-700",
    suspended: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${map[status]}`}
    >
      {status}
    </span>
  );
};

export default function AdminDashboard() {
  const router = useRouter();

  const [tab, setTab] = useState<Role>("user");
  const [data, setData] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.replace("/admin/login");
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.get<{
        success: boolean;
        people: Person[];
      }>(`/api/admin/${tab}s`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setData(data.people);
      } else {
        setData([]);
      }
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [tab, router]);

  // useEffect(() => {
  //   fetchData();
  // }, [fetchData]);

  const handleStatusUpdate = async (id: string, newStatus: Status) => {
    const token = getToken();
    if (!token) return;

    setUpdatingId(id);

    try {
      await axios.patch(
        `/api/admin/${tab}s/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success(
        newStatus === "active"
          ? "Activated successfully"
          : "Suspended successfully",
      );

      fetchData();
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = data.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-stone-50 p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["user", "doctor"] as const).map((role) => (
          <button
            key={role}
            onClick={() => setTab(role)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
              tab === role
                ? "bg-primary text-white"
                : "bg-white border border-stone-200 text-stone-600"
            }`}
          >
            {role}s
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder={`Search ${tab}s...`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6 rounded-xl border border-stone-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
      />

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex items-center justify-center gap-2 text-stone-500">
            <Loader2 className="w-6 h-6 animate-spin" />
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-stone-400 text-sm">
            No {tab}s found.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-400">
              <tr>
                <th className="px-5 py-3 text-left">Name</th>
                <th className="px-5 py-3 text-left">Email</th>
                <th className="px-5 py-3 text-left">Joined</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((person) => (
                <tr
                  key={person.id}
                  className="border-b border-stone-50 hover:bg-stone-50 transition"
                >
                  <td className="px-5 py-4 font-medium text-stone-800">
                    {person.name}
                  </td>

                  <td className="px-5 py-4 text-stone-600">{person.email}</td>

                  <td className="px-5 py-4 text-stone-600">
                    {fmt(person.createdAt)}
                  </td>

                  <td className="px-5 py-4">
                    <Badge status={person.status} />
                  </td>

                  <td className="px-5 py-4">
                    {person.status === "active" ? (
                      <button
                        disabled={updatingId === person.id}
                        onClick={() =>
                          handleStatusUpdate(person.id, "suspended")
                        }
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                      >
                        {updatingId === person.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <X className="w-3 h-3" />
                        )}
                        Suspend
                      </button>
                    ) : (
                      <button
                        disabled={updatingId === person.id}
                        onClick={() => handleStatusUpdate(person.id, "active")}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50"
                      >
                        <Check className="w-3 h-3" />
                        Activate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
