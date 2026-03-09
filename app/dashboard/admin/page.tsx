"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Check, X, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

type Stats = {
  users: number;
  doctors: number;
  members: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  verifiedDoctors: number;
  unverifiedDoctors: number;
  verifiedMembers: number;
  unverifiedMembers: number;
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  verify: boolean;
  members: { id: string; name: string; age: number; gender: string; verify: boolean }[];
};

type DoctorRow = {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  verify: boolean;
};

type PendingRequest = {
  type: "member" | "user" | "doctor";
  id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [doctors, setDoctors] = useState<DoctorRow[]>([]);
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [tab, setTab] = useState<"users" | "doctors">("users");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<{ key: string; action: "approve" | "reject" } | null>(null);

  const fetchAll = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };
    setLoading(true);
    try {
      const [statsRes, usersRes, doctorsRes, pendingRes] = await Promise.all([
        axios.get<{ success: boolean; stats: Stats }>("/api/admin/stats", { headers }),
        axios.get<{ success: boolean; users: UserRow[] }>("/api/admin/users", { headers }),
        axios.get<{ success: boolean; doctors: DoctorRow[] }>("/api/admin/doctors", { headers }),
        axios.get<{ success: boolean; requests: PendingRequest[] }>("/api/admin/pending-requests", { headers }),
      ]);
      if (statsRes.data.success && statsRes.data.stats) setStats(statsRes.data.stats);
      if (usersRes.data.success && usersRes.data.users) setUsers(usersRes.data.users);
      if (doctorsRes.data.success && doctorsRes.data.doctors) setDoctors(doctorsRes.data.doctors);
      if (pendingRes.data.success && pendingRes.data.requests) setRequests(pendingRes.data.requests);
    } catch {
      setStats(null);
      setUsers([]);
      setDoctors([]);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handlePendingApprove = async (r: PendingRequest) => {
    const token = getToken();
    if (!token) return;
    const key = `${r.type}-${r.id}`;
    setPendingAction({ key, action: "approve" });
    try {
      if (r.type === "member") {
        await axios.post(`/api/admin/pending-members/${r.id}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Family member approved");
      } else if (r.type === "user") {
        await axios.patch(`/api/admin/users/${r.id}/verify`, { verify: true }, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("User verified");
      } else {
        await axios.patch(`/api/admin/doctors/${r.id}/verify`, { verify: true }, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Doctor verified");
      }
      fetchAll();
    } catch (err: unknown) {
      toast.error(axios.isAxiosError(err) && err.response?.data?.message ? String(err.response.data.message) : "Failed to approve");
    } finally {
      setPendingAction(null);
    }
  };

  const handlePendingReject = async (r: PendingRequest) => {
    const token = getToken();
    if (!token) return;
    setPendingAction({ key: `${r.type}-${r.id}-reject`, action: "reject" });
    try {
      if (r.type === "member") {
        await axios.post(`/api/admin/pending-members/${r.id}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } });
      } else if (r.type === "user") {
        await axios.patch(`/api/admin/users/${r.id}/verify`, { verify: false }, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.patch(`/api/admin/doctors/${r.id}/verify`, { verify: false }, { headers: { Authorization: `Bearer ${token}` } });
      }
      toast.success("Request rejected");
      fetchAll();
    } catch (err: unknown) {
      toast.error(axios.isAxiosError(err) && err.response?.data?.message ? String(err.response.data.message) : "Failed to reject");
    } finally {
      setPendingAction(null);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Delete user "${name}" and all their data?`)) return;
    const token = getToken();
    if (!token) return;
    setActionId(id);
    try {
      await axios.delete(`/api/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("User deleted");
      fetchAll();
    } catch (err: unknown) {
      toast.error(axios.isAxiosError(err) && err.response?.data?.message ? String(err.response.data.message) : "Failed to delete");
    } finally {
      setActionId(null);
    }
  };

  const handleDeleteDoctor = async (id: string, name: string) => {
    if (!confirm(`Delete doctor "${name}" and all their data?`)) return;
    const token = getToken();
    if (!token) return;
    setActionId(id);
    try {
      await axios.delete(`/api/admin/doctors/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Doctor deleted");
      fetchAll();
    } catch (err: unknown) {
      toast.error(axios.isAxiosError(err) && err.response?.data?.message ? String(err.response.data.message) : "Failed to delete");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="w-full p-8 bg-stone-50">
      <header className="mb-6">
        <h1 className="text-4xl font-semibold text-primary">Admin Dashboard</h1>
        <p className="text-base text-stone-400 mt-1">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center gap-3 py-20 text-stone-500 text-lg">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span>Loading…</span>
        </div>
      ) : (
        <>
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-5 mb-10">
            <div className="p-7 ring ring-neutral-300 shadow-md rounded-xl bg-white">
              <p className="text-base text-neutral-500">Users</p>
              <p className="font-semibold text-primary text-3xl mt-1">{stats?.users ?? 0}</p>
            </div>
            <div className="p-7 ring ring-neutral-300 shadow-md rounded-xl bg-white">
              <p className="text-base text-neutral-500">Total Members</p>
              <p className="font-semibold text-primary text-3xl mt-1">{stats?.members ?? 0}</p>
            </div>
            <div className="p-7 ring ring-neutral-300 shadow-md rounded-xl bg-white">
              <p className="text-base text-neutral-500">Verified Users</p>
              <p className="font-semibold text-green-600 text-3xl mt-1">{stats?.verifiedUsers ?? 0}</p>
            </div>
            <div className="p-7 ring ring-neutral-300 shadow-md rounded-xl bg-white">
              <p className="text-base text-neutral-500">Unverified Users</p>
              <p className="font-semibold text-amber-600 text-3xl mt-1">{stats?.unverifiedUsers ?? 0}</p>
            </div>
          </div>

          {requests.length > 0 && (
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-primary mb-5">Pending requests</h2>
              <div className="space-y-5">
                {requests.map((r) => {
                  const approveKey = `${r.type}-${r.id}`;
                  const rejectKey = `${r.type}-${r.id}-reject`;
                  const typeLabel = r.type === "member" ? "Family member" : r.type === "user" ? "User" : "Doctor";
                  const documentsHref =
                    r.type === "user"
                      ? `/dashboard/admin/users/${r.id}`
                      : r.type === "doctor"
                        ? `/dashboard/admin/doctors/${r.id}`
                        : r.userId
                          ? `/dashboard/admin/users/${r.userId}`
                          : undefined;
                  return (
                    <div key={approveKey} className="rounded-xl border border-stone-200 bg-white p-5 flex flex-wrap items-center justify-between gap-5">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-sm font-medium ${r.type === "member" ? "bg-blue-100 text-blue-700" : r.type === "user" ? "bg-indigo-100 text-indigo-700" : "bg-teal-100 text-teal-700"}`}>
                          {typeLabel}
                        </span>
                        <div>
                          <p className="font-medium text-lg">{r.name}</p>
                          <p className="text-base text-stone-500 mt-0.5">
                            {r.type === "member"
                              ? `Requested by ${r.userName ?? "—"} (${r.userEmail ?? ""}) · ${r.gender} · ${r.age} yrs`
                              : `${r.email} · ${r.gender} · ${r.age} yrs`}
                          </p>
                          {documentsHref && (
                            <Link
                              href={documentsHref}
                              className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-1"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> View documents
                            </Link>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => handlePendingApprove(r)}
                          disabled={!!pendingAction}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-base font-medium bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50"
                        >
                          {pendingAction?.key === approveKey && pendingAction?.action === "approve" ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePendingReject(r)}
                          disabled={!!pendingAction}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-base font-medium bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                        >
                          {pendingAction?.key === rejectKey && pendingAction?.action === "reject" ? <Loader2 className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5" />}
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <section>
            <div className="flex gap-2 mb-5 border-b border-stone-200">
              <button
                type="button"
                onClick={() => setTab("users")}
                className={`px-5 py-2.5 font-medium text-base rounded-t-lg ${tab === "users" ? "bg-primary text-white" : "text-stone-600 hover:bg-stone-100"}`}
              >
                Users
              </button>
              <button
                type="button"
                onClick={() => setTab("doctors")}
                className={`px-5 py-2.5 font-medium text-base rounded-t-lg ${tab === "doctors" ? "bg-primary text-white" : "text-stone-600 hover:bg-stone-100"}`}
              >
                Doctors
              </button>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
              {tab === "users" ? (
                users.length === 0 ? (
                  <p className="py-20 text-center text-stone-500 text-lg">No users.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-base">
                      <thead className="bg-stone-50 text-sm uppercase tracking-wide text-stone-400">
                        <tr>
                          <th className="px-6 py-4 text-left">User</th>
                          <th className="px-6 py-4 text-left">Family members</th>
                          <th className="px-6 py-4 text-left">Status</th>
                          <th className="px-6 py-4 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id} className="border-b border-stone-50 hover:bg-stone-50/80">
                            <td className="px-6 py-5">
                              <div>
                                <p className="font-medium text-stone-800">{u.name}</p>
                                <p className="text-stone-500 text-sm">{u.email}</p>
                                <p className="text-stone-500 text-sm">{u.age} yrs · {u.gender}</p>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              {u.members.length === 0 ? (
                                <span className="text-stone-400">—</span>
                              ) : (
                                <div className="space-y-1.5">
                                  {u.members.map((m) => (
                                    <div key={m.id} className="text-stone-600">
                                      {m.name} · {m.age} yrs · {m.gender}
                                      {m.verify ? <span className="ml-1 text-green-600 text-sm">✓</span> : null}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-5">
                              <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${u.verify ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                                {u.verify ? "Verified" : "Unverified"}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex gap-2 items-center">
                                <Link
                                  href={`/dashboard/admin/users/${u.id}`}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20"
                                >
                                  <ExternalLink className="w-4 h-4" /> View
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(u.id, u.name)}
                                  disabled={actionId === u.id}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                                >
                                  {actionId === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : doctors.length === 0 ? (
                <p className="py-20 text-center text-stone-500 text-lg">No doctors.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-base">
                    <thead className="bg-stone-50 text-sm uppercase tracking-wide text-stone-400">
                      <tr>
                        <th className="px-6 py-4 text-left">Doctor</th>
                        <th className="px-6 py-4 text-left">Status</th>
                        <th className="px-6 py-4 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctors.map((d) => (
                        <tr key={d.id} className="border-b border-stone-50 hover:bg-stone-50/80">
                          <td className="px-6 py-5">
                            <div>
                              <p className="font-medium text-stone-800">{d.name}</p>
                              <p className="text-stone-500 text-sm">{d.email}</p>
                              <p className="text-stone-500 text-sm">{d.age} yrs · {d.gender}</p>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${d.verify ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                              {d.verify ? "Verified" : "Unverified"}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex gap-2 items-center">
                              <Link
                                href={`/dashboard/admin/doctors/${d.id}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20"
                              >
                                <ExternalLink className="w-4 h-4" /> View
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleDeleteDoctor(d.id, d.name)}
                                disabled={actionId === d.id}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                              >
                                {actionId === d.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}