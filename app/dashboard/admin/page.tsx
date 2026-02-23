"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

type PendingRequest = {
  id: string;
  userName: string;
  userEmail: string;
  name: string;
  gender: string;
  age: number;
  profilePicture: string;
  citizenship: string;
  createdAt: string;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchPending = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.get<{ success: boolean; requests: PendingRequest[] }>(
        "/api/admin/pending-members",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success && data.requests) setRequests(data.requests);
      else setRequests([]);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleApprove = async (id: string) => {
    const token = getToken();
    if (!token) return;
    setActionId(id);
    try {
      await axios.post(`/api/admin/pending-members/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Family member approved");
      fetchPending();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) && err.response?.data?.message
        ? String(err.response.data.message)
        : "Failed to approve";
      toast.error(msg);
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id: string) => {
    const token = getToken();
    if (!token) return;
    setActionId(id);
    try {
      await axios.post(`/api/admin/pending-members/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Request rejected");
      fetchPending();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) && err.response?.data?.message
        ? String(err.response.data.message)
        : "Failed to reject";
      toast.error(msg);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="w-full p-6">
      <header className="mb-8">
        <h1 className="text-4xl font-semibold text-primary">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Pending family member requests</p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading…</span>
        </div>
      ) : requests.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">No pending requests.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-border bg-card p-4 flex flex-wrap items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <p className="font-medium">{r.name}</p>
                <p className="text-sm text-muted-foreground">
                  Requested by {r.userName} ({r.userEmail})
                </p>
                <p className="text-sm text-muted-foreground">
                  {r.gender} · {r.age} yrs
                </p>
                <p className="text-sm text-muted-foreground truncate max-w-md">Citizenship: {r.citizenship}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleApprove(r.id)}
                  disabled={actionId === r.id}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50"
                >
                  {actionId === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => handleReject(r.id)}
                  disabled={actionId === r.id}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
