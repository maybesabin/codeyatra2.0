"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Patients from "./pateients";
import Appointments from "./appointments";
import Calendar from "./Calendar";
import DoctorDocuments from "./DoctorDocuments";
import { Loader2 } from "lucide-react";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export default function DoctorDashboardPage() {
  const router = useRouter();
  const [verify, setVerify] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.replace("/doctor/login");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.get<{ success: boolean; verify?: boolean }>("/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) setVerify(data.verify ?? false);
      else setVerify(null);
    } catch {
      setVerify(null);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  if (loading) {
    return (
      <div className="w-full p-6 flex items-center justify-center min-h-[200px]">
        <div className="flex items-center gap-3 text-stone-500 text-lg">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span>Loading…</span>
        </div>
      </div>
    );
  }

  if (!verify) {
    return <DoctorDocuments onVerified={fetchMe} />;
  }

  return (
    <>
      <Appointments />
      <Calendar />
      <Patients />
    </>
  );
}
