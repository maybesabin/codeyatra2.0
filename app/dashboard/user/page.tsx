'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { UserPlus, Stethoscope, User, Loader2, CalendarDays, FileCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';

type Doctor = { id: string; name: string; profilePicture?: string };
type FamilyMember = { id: string; name: string; gender: string; age: number; profilePicture: string; problem?: string };
type AppointmentItem = {
  id: string;
  doctorName: string;
  problem: string;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
  forName: string;
  cancellationMessage?: string;
  startTime?: string;
  endTime?: string;
  meetingLink?: string;
};

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
    citizenship: '',
  });
  const [addMemberLoading, setAddMemberLoading] = useState(false);
  const [reportForm, setReportForm] = useState({
    forWho: 'self' as string,
    doctorId: '',
    problem: '',
    date: '',
    priority: '' as string,
  });
  const [reportLoading, setReportLoading] = useState(false);
  const [priorityLoading, setPriorityLoading] = useState(false);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [appointmentsSummary, setAppointmentsSummary] = useState<string | null>(null);
  const [appointmentsSummaryLoading, setAppointmentsSummaryLoading] = useState(false);
  const [userVerify, setUserVerify] = useState<boolean | null>(null);
  const [userDocumentsForm, setUserDocumentsForm] = useState({ citizenship: '', profilePicture: '' });
  const [documentsLoading, setDocumentsLoading] = useState(false);

  const fetchMe = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const { data } = await axios.get<{ success?: boolean; verify?: boolean; citizenship?: string; profilePicture?: string }>('/api/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setUserVerify(data.verify ?? false);
        setUserDocumentsForm({
          citizenship: data.citizenship ?? '',
          profilePicture: data.profilePicture ?? '',
        });
      }
    } catch {
      setUserVerify(null);
    }
  }, []);

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

  const fetchAppointments = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoadingAppointments(true);
    try {
      const { data } = await axios.get<{ success: boolean; appointments: AppointmentItem[] }>('/api/user/appointments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(appointments)
      if (data.success && data.appointments) setAppointments(data.appointments);
      else setAppointments([]);
    } catch {
      setAppointments([]);
    } finally {
      setLoadingAppointments(false);
    }
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace('/login');
      return;
    }
    fetchMe();
    fetchDoctors();
    fetchMembers();
    fetchAppointments();
  }, [router, fetchMe, fetchDoctors, fetchMembers, fetchAppointments]);

  const handleSubmitDocuments = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setDocumentsLoading(true);
    try {
      const { data } = await axios.patch<{ success?: boolean; message?: string }>(
        '/api/me/documents',
        {
          citizenship: userDocumentsForm.citizenship.trim(),
          profilePicture: userDocumentsForm.profilePicture.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(data?.message ?? 'Documents submitted for verification');
      fetchMe();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) && err.response?.data?.message ? String(err.response.data.message) : 'Failed to submit documents';
      toast.error(msg);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setAddMemberLoading(true);
    try {
      const { data } = await axios.post<{ success?: boolean; message?: string }>(
        '/api/members',
        {
          name: addMemberForm.name,
          gender: addMemberForm.gender,
          age: Number(addMemberForm.age),
          profilePicture: addMemberForm.profilePicture.trim(),
          citizenship: addMemberForm.citizenship.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(data?.message ?? 'Sent for approval');
      setAddMemberForm({ name: '', gender: '', age: '', profilePicture: '', citizenship: '' });
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) && err.response?.data?.message ? String(err.response.data.message) : 'Failed to add member';
      toast.error(msg);
    } finally {
      setAddMemberLoading(false);
    }
  };

  const handleSetPriority = async () => {
    if (!reportForm.problem.trim()) {
      toast.error('Enter a problem first');
      return;
    }
    const token = getToken();
    if (!token) return;
    setPriorityLoading(true);
    try {
      const { data } = await axios.post<{ success?: boolean; priority?: string }>(
        '/api/appointments/infer-priority',
        { problem: reportForm.problem },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data?.success && data?.priority) {
        setReportForm((p) => ({ ...p, priority: data.priority! }));
        toast.success('Priority set');
      } else toast.error('Could not set priority');
    } catch {
      toast.error('Failed to set priority');
    } finally {
      setPriorityLoading(false);
    }
  };

  const handleReportProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    if (!reportForm.priority) {
      toast.error('Click "Set priority" first');
      return;
    }
    setReportLoading(true);
    try {
      const payload: { doctorId: string; problem: string; date: string; memberId?: string; priority: string } = {
        doctorId: reportForm.doctorId,
        problem: reportForm.problem,
        date: reportForm.date,
        priority: reportForm.priority,
      };
      if (reportForm.forWho !== 'self' && reportForm.forWho !== 'none') payload.memberId = reportForm.forWho;
      await axios.post('/api/appointments', payload, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Appointment requested');
      setReportForm((p) => ({ ...p, problem: '', date: '', doctorId: '', priority: '' }));
      fetchAppointments();
    } catch (err: unknown) {
      toast.error(axios.isAxiosError(err) && err.response?.data?.message ? String(err.response.data.message) : 'Failed to submit');
    } finally {
      setReportLoading(false);
    }
  };

  const handleSummarizeAppointments = async () => {
    const token = getToken();
    if (!token) return;
    if (!appointments.length) {
      toast.info('No appointments to summarize yet');
      return;
    }
    setAppointmentsSummaryLoading(true);
    setAppointmentsSummary(null);
    try {
      const { data } = await axios.post<{ success?: boolean; summary?: string; message?: string }>(
        '/api/user/appointments/summarize',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success && data.summary) {
        setAppointmentsSummary(data.summary);
      } else {
        toast.error(data.message || 'Could not generate summary');
      }
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.message
          ? String(err.response.data.message)
          : 'Failed to generate summary';
      toast.error(msg);
    } finally {
      setAppointmentsSummaryLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mx-auto px-4 py-10">
        <header className="mb-10">
          <h1 className="text-5xl font-semibold text-primary">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage family and report health issues</p>
        </header>

        <div className="space-y-8 mb-8 grid lg:grid-cols-2">
          {/* Documents & family: your verification + add family member */}
          <Card className="shadow-none border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl font-medium text-primary">
                <FileCheck className="w-7 h-7 text-primary" />
                Documents & family
              </CardTitle>
              <CardDescription>Submit your documents for verification, then add family members (each with their documents) for approval.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Your verification documents */}
              {userVerify !== true ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                    Your verification
                    {userVerify === false && <span className="text-xs font-normal text-amber-600">Pending</span>}
                  </h3>
                  <form onSubmit={handleSubmitDocuments} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Profile picture URL</label>
                      <Input
                        value={userDocumentsForm.profilePicture}
                        onChange={(e) => setUserDocumentsForm((p) => ({ ...p, profilePicture: e.target.value }))}
                        placeholder="https://..."
                        required
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Citizenship document URL</label>
                      <Input
                        value={userDocumentsForm.citizenship}
                        onChange={(e) => setUserDocumentsForm((p) => ({ ...p, citizenship: e.target.value }))}
                        placeholder="https://..."
                        required
                        className="h-12"
                      />
                    </div>
                    <Button type="submit" disabled={documentsLoading} className="w-full sm:w-auto py-6">
                      {documentsLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : 'Submit for verification'}
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                    Your verification
                    <span className="text-xs font-normal text-green-600">Verified</span>
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Your documents are verified. You can now add family members below.
                  </p>
                </div>
              )}

              {/* Add family member — only when verified */}
              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-primary" />
                  Add family member
                </h3>
                {userVerify !== true ? (
                  <p className="text-sm text-muted-foreground">
                    Submit your documents above and get verified first. Then you can add family members (each will need their documents and admin approval).
                  </p>
                ) : (
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
                      <label className="text-sm font-medium text-foreground">Profile picture URL</label>
                      <Input
                        value={addMemberForm.profilePicture}
                        onChange={(e) => setAddMemberForm((p) => ({ ...p, profilePicture: e.target.value }))}
                        placeholder="https://..."
                        required
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Citizenship document URL</label>
                      <Input
                        value={addMemberForm.citizenship}
                        onChange={(e) => setAddMemberForm((p) => ({ ...p, citizenship: e.target.value }))}
                        placeholder="https://..."
                        required
                        className="h-12"
                      />
                    </div>
                    <Button type="submit" disabled={addMemberLoading} className="w-full sm:w-auto py-6">
                      {addMemberLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding…</> : 'Add member (sent for approval)'}
                    </Button>
                  </form>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Report a problem */}
          <Card className={`shadow-none border-none ${userVerify !== true ? 'opacity-50' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl font-medium text-primary">
                <Stethoscope className="w-7 h-7 text-primary" />
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
                    <SelectTrigger className="h-16 w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="self">
                        <span className="flex items-center gap-2">
                          <User className="w-7 h-7" />
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
                  <Textarea
                    style={{ resize: 'none' }}
                    value={reportForm.problem}
                    onChange={(e) => setReportForm((p) => ({ ...p, problem: e.target.value }))}
                    placeholder="Brief description"
                    required
                    className="h-42"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Priority</label>
                  <div className="flex gap-2">
                    <Select value={reportForm.priority} onValueChange={(v) => setReportForm((p) => ({ ...p, priority: v }))}>
                      <SelectTrigger className="h-12 flex-1">
                        <SelectValue placeholder="Select or auto-set" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" onClick={handleSetPriority} disabled={priorityLoading || !reportForm.problem.trim()}>
                      {priorityLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Set priority'}
                    </Button>
                  </div>
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
                <Button type="submit" disabled={reportLoading || loadingDoctors || userVerify !== true} className="w-full sm:w-auto py-6">
                  {reportLoading ? (
                    <>
                      <Loader2 className="w-7 h-7 animate-spin" />
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

        {/* My appointments */}
        <Card className="shadow-none border-none">
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl font-medium text-primary">
                <CalendarDays className="w-7 h-7 text-primary" />
                My appointments
              </CardTitle>
              <CardDescription>Your appointment requests. Status updates when the doctor approves or cancels.</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSummarizeAppointments}
              disabled={appointmentsSummaryLoading || loadingAppointments || appointments.length === 0}
            >
              {appointmentsSummaryLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Summarizing…
                </>
              ) : (
                'Summarize'
              )}
            </Button>
          </CardHeader>
          <CardContent>
            {appointmentsSummary && (
              <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
                <p className="font-medium mb-1">Summary & next steps</p>
                <p className="text-muted-foreground whitespace-pre-line">{appointmentsSummary}</p>
              </div>
            )}
            {loadingAppointments ? (
              <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Loading appointments…</span>
              </div>
            ) : appointments.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No appointments yet. Request one above.</p>
            ) : (
              <div className="space-y-4">
                {appointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="rounded-xl border border-border bg-card p-4 text-card-foreground"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">{appt.doctorName}</p>
                        <p className="text-sm text-muted-foreground">For: {appt.forName}</p>
                        <p className="text-sm text-muted-foreground">{appt.problem}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(appt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {' · '}
                          {appt.startTime && appt.endTime
                            ? `${appt.startTime}–${appt.endTime}`
                            : new Date(appt.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {appt.meetingLink && (
                          <p className="text-xs mt-1">
                            <a
                              href={appt.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary underline"
                            >
                              Join Google Meet
                            </a>
                          </p>
                        )}
                        {appt.status === 'cancelled' && appt.cancellationMessage && (
                          <p className="text-sm text-muted-foreground mt-2 pt-2 border-t border-border italic">
                            Message from doctor: {appt.cancellationMessage}
                          </p>
                        )}
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${appt.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : appt.status === 'completed'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-red-100 text-red-700'
                          }`}
                      >
                        {appt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
