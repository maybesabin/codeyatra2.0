'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState, useEffect, useCallback } from 'react';
import { UserPlus, Stethoscope, User, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';

type Doctor = { id: string; name: string; profilePicture?: string };
type FamilyMember = { id: string; name: string; gender: string; age: number; profilePicture: string; problem?: string };

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export default function UserDashboardPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [addMemberForm, setAddMemberForm] = useState({
    name: '',
    gender: '',
    age: '',
    profilePicture: '',
  });
  const [addMemberLoading, setAddMemberLoading] = useState(false);
  const [reportForm, setReportForm] = useState({
    forWho: 'self' as string,
    doctorId: '',
    problem: '',
    date: '',
  });
  const [reportLoading, setReportLoading] = useState(false);

  const fetchDoctors = useCallback(async () => {
    setLoadingDoctors(true);
    try {
      const { data } = await axios.get<{ success: boolean; doctors: Doctor[] }>('/api/doctors');
      if (data.success && data.doctors) setDoctors(data.doctors);
    } catch {
      setDoctors([]);
    } finally {
      setLoadingDoctors(false);
    }
  }, []);

  const fetchMembers = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoadingMembers(true);
    try {
      const { data } = await axios.get<{ success: boolean; members: FamilyMember[] }>('/api/members', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success && data.members) setMembers(data.members);
      else setMembers([]);
    } catch {
      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace('/login');
      return;
    }
    fetchDoctors();
    fetchMembers();
  }, [router, fetchDoctors, fetchMembers]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setAddMemberLoading(true);
    try {
      await axios.post(
        '/api/members',
        {
          name: addMemberForm.name,
          gender: addMemberForm.gender,
          age: Number(addMemberForm.age),
          profilePicture: addMemberForm.profilePicture || 'https://api.dicebear.com/7.x/avataaars/svg?seed=member',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Family member added');
      setAddMemberForm({ name: '', gender: '', age: '', profilePicture: '' });
      fetchMembers();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) && err.response?.data?.message ? String(err.response.data.message) : 'Failed to add member';
      toast.error(msg);
    } finally {
      setAddMemberLoading(false);
    }
  };

  const handleReportProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setReportLoading(true);
    try {
      const payload: { doctorId: string; problem: string; date: string; memberId?: string } = {
        doctorId: reportForm.doctorId,
        problem: reportForm.problem,
        date: reportForm.date,
      };
      if (reportForm.forWho !== 'self' && reportForm.forWho !== 'none') payload.memberId = reportForm.forWho;
      await axios.post('/api/appointments', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Appointment requested');
      setReportForm((prev) => ({ ...prev, problem: '', date: '', doctorId: '' }));
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) && err.response?.data?.message ? String(err.response.data.message) : 'Failed to submit';
      toast.error(msg);
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <header className="mb-10">
          <h1 className="text-5xl font-semibold text-primary">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage family and report health issues</p>
        </header>

        <div className="space-y-8">
          {/* Add family member */}
          <Card className="shadow-none border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserPlus className="w-5 h-5 text-primary" />
                Add family member
              </CardTitle>
              <CardDescription>Add a family member to report problems on their behalf.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddMember} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Name</label>
                    <Input
                      value={addMemberForm.name}
                      onChange={(e) => setAddMemberForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Full name"
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Age</label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={addMemberForm.age}
                      onChange={(e) => setAddMemberForm((p) => ({ ...p, age: e.target.value }))}
                      placeholder="Age"
                      required
                      className="h-12"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Gender</label>
                  <Select
                    value={addMemberForm.gender}
                    onValueChange={(v) => setAddMemberForm((p) => ({ ...p, gender: v }))}
                    required
                  >
                    <SelectTrigger className="py-6 w-full">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Profile picture URL (optional)</label>
                  <Input
                    value={addMemberForm.profilePicture}
                    onChange={(e) => setAddMemberForm((p) => ({ ...p, profilePicture: e.target.value }))}
                    placeholder="https://..."
                    className="h-12"
                  />
                </div>
                <Button type="submit" disabled={addMemberLoading} className="w-full sm:w-auto">
                  {addMemberLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add member'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Report a problem */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Stethoscope className="w-5 h-5 text-primary" />
                Report a problem
              </CardTitle>
              <CardDescription>Book an appointment for yourself or a family member with an available doctor.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleReportProblem} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Who is it for?</label>
                  <Select
                    value={reportForm.forWho}
                    onValueChange={(v) => setReportForm((p) => ({ ...p, forWho: v }))}
                  >
                    <SelectTrigger className="h-12 w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="self">
                        <span className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Myself
                        </span>
                      </SelectItem>
                      {members.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                      {members.length === 0 && (
                        <SelectItem value="none" disabled>
                          No family members — add one above
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Doctor</label>
                  <Select
                    value={reportForm.doctorId}
                    onValueChange={(v) => setReportForm((p) => ({ ...p, doctorId: v }))}
                    required
                    disabled={loadingDoctors}
                  >
                    <SelectTrigger className="h-12 w-full">
                      <SelectValue placeholder={loadingDoctors ? 'Loading doctors...' : 'Select doctor'} />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                      {!loadingDoctors && doctors.length === 0 && (
                        <SelectItem value="none" disabled>
                          No available doctors
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Problem / reason</label>
                  <Input
                    value={reportForm.problem}
                    onChange={(e) => setReportForm((p) => ({ ...p, problem: e.target.value }))}
                    placeholder="Brief description"
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Preferred date</label>
                  <Input
                    type="datetime-local"
                    value={reportForm.date}
                    onChange={(e) => setReportForm((p) => ({ ...p, date: e.target.value }))}
                    required
                    className="h-12"
                  />
                </div>
                <Button type="submit" disabled={reportLoading || loadingDoctors} className="w-full sm:w-auto">
                  {reportLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Request appointment'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
