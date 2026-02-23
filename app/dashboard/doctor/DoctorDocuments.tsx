"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Loader2, FileCheck } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

type Props = { onVerified?: () => void };

export default function DoctorDocuments({ onVerified }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({ citizenship: "", license: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchMe = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.replace("/doctor/login");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.get<{
        success: boolean;
        verify?: boolean;
        citizenship?: string;
        license?: string;
      }>("/api/me", { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) {
        setForm({
          citizenship: data.citizenship ?? "",
          license: data.license ?? "",
        });
      }
    } catch {
      setForm({ citizenship: "", license: "" });
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    if (!form.citizenship.trim() || !form.license.trim()) {
      toast.error("Citizenship and license URLs are required");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(
        "/api/doctor/submit-documents",
        { citizenship: form.citizenship.trim(), license: form.license.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Documents submitted for verification");
      await fetchMe();
      onVerified?.();
    } catch (err: unknown) {
      toast.error(axios.isAxiosError(err) && err.response?.data?.message ? String(err.response.data.message) : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 w-full">
        <div className="flex items-center justify-center gap-3 py-16 text-stone-500 text-lg">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span>Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 w-full max-w-2xl mx-auto">
      <Card className="shadow-none border border-stone-200">
        <CardHeader className="space-y-3">
          <CardTitle className="flex items-center gap-2 text-2xl font-semibold text-primary">
            <FileCheck className="w-8 h-8" />
            Documents & verification
          </CardTitle>
          <CardDescription className="text-base leading-relaxed">
            Submit your citizenship and license document URLs. Admin will verify you; once verified, you can access appointments, schedule and patients.
          </CardDescription>
          <p className="text-base mt-2">
            Status:{" "}
            <span className="text-amber-600 font-semibold">Not verified</span>
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-base font-medium text-foreground">Citizenship document URL</label>
              <Input
                value={form.citizenship}
                onChange={(e) => setForm((p) => ({ ...p, citizenship: e.target.value }))}
                placeholder="https://..."
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <label className="text-base font-medium text-foreground">License document URL</label>
              <Input
                value={form.license}
                onChange={(e) => setForm((p) => ({ ...p, license: e.target.value }))}
                placeholder="https://..."
                className="h-12 text-base"
              />
            </div>
            <Button type="submit" disabled={submitting} className="mt-2 h-12 px-6 text-base">
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Submitting…
                </>
              ) : (
                "Submit for verification"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
