"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft, Check, X, ExternalLink, User, FileText } from "lucide-react";
import { toast } from "sonner";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

type DoctorDetail = {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  verify: boolean;
  profilePicture: string;
  citizenship: string;
  license: string;
  available: boolean;
};

function DocImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [error, setError] = useState(false);
  if (error) {
    return (
      <a href={src} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-center bg-stone-100 rounded-lg text-stone-500 text-sm hover:bg-stone-200 ${className}`}>
        <span className="flex items-center gap-1">
          <ExternalLink className="w-4 h-4" /> View document
        </span>
      </a>
    );
  }
  return (
    <a href={src} target="_blank" rel="noopener noreferrer" className="block group">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={`rounded-lg border border-stone-200 object-contain bg-stone-50 group-hover:ring-2 group-hover:ring-primary/30 transition-all ${className}`}
        onError={() => setError(true)}
      />
    </a>
  );
}

export default function AdminDoctorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [doctor, setDoctor] = useState<DoctorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchDoctor = useCallback(async () => {
    const token = getToken();
    if (!token || !id) {
      if (!token) router.replace("/admin/login");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.get<{ success: boolean; doctor: DoctorDetail }>(`/api/admin/doctors/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success && data.doctor) setDoctor(data.doctor);
      else setDoctor(null);
    } catch {
      setDoctor(null);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchDoctor();
  }, [fetchDoctor]);

  const handleVerify = async (verify: boolean) => {
    const token = getToken();
    if (!token || !id) return;
    setUpdating(true);
    try {
      await axios.patch(`/api/admin/doctors/${id}/verify`, { verify }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(verify ? "Doctor verified" : "Doctor unverified");
      setDoctor((d) => (d ? { ...d, verify } : null));
    } catch (err: unknown) {
      toast.error(axios.isAxiosError(err) && err.response?.data?.message ? String(err.response.data.message) : "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !doctor) {
    return (
      <div className="w-full p-6 flex items-center justify-center min-h-[280px] bg-stone-50">
        {loading ? (
          <div className="flex flex-col items-center gap-3 text-stone-500">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span>Loading…</span>
          </div>
        ) : (
          <div className="text-center bg-white rounded-xl border border-stone-200 p-8">
            <p className="text-stone-500 mb-4">Doctor not found</p>
            <Link href="/dashboard/admin" className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
              <ArrowLeft className="w-4 h-4" /> Back to dashboard
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full p-6 max-w-5xl mx-auto">
      <Link
        href="/dashboard/admin"
        className="inline-flex items-center gap-2 text-stone-600 hover:text-primary transition-colors mb-6 font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </Link>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 bg-linear-to-br from-stone-50 to-white">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="shrink-0">
                {doctor.profilePicture ? (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-white shadow-lg ring-1 ring-stone-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={doctor.profilePicture} alt={doctor.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-stone-200 flex items-center justify-center">
                    <User className="w-12 h-12 text-stone-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">{doctor.name}</h1>
                <p className="text-stone-500 mt-1">{doctor.email}</p>
                <p className="text-stone-500 text-sm mt-1">{doctor.age} years · {doctor.gender}</p>
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${doctor.verify ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {doctor.verify ? "Verified" : "Unverified"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleVerify(!doctor.verify)}
                    disabled={updating}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 ${doctor.verify
                      ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                  >
                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : doctor.verify ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                    {doctor.verify ? "Unverify" : "Verify"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 border-t border-stone-100">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-stone-800 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              Documents
            </h2>
            <div className="grid sm:grid-cols-3 gap-8">
              <div>
                <p className="text-sm font-medium text-stone-500 uppercase tracking-wide mb-3">Profile picture</p>
                {doctor.profilePicture ? (
                  <DocImage src={doctor.profilePicture} alt="Profile" className="w-full max-h-48 aspect-square" />
                ) : (
                  <div className="flex items-center justify-center h-32 rounded-xl bg-stone-100 text-stone-400 text-sm">No image</div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-stone-500 uppercase tracking-wide mb-3">Citizenship document</p>
                {doctor.citizenship ? (
                  <DocImage src={doctor.citizenship} alt="Citizenship" className="w-full max-h-48 min-h-[120px]" />
                ) : (
                  <div className="flex items-center justify-center h-32 rounded-xl bg-stone-100 text-stone-400 text-sm">No document</div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-stone-500 uppercase tracking-wide mb-3">License document</p>
                {doctor.license ? (
                  <DocImage src={doctor.license} alt="License" className="w-full max-h-48 min-h-[120px]" />
                ) : (
                  <div className="flex items-center justify-center h-32 rounded-xl bg-stone-100 text-stone-400 text-sm">No document</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
