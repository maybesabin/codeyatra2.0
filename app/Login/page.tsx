'use client';

import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';

const page = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post<{ message: string; token: string }>('/api/login', formData);
      toast.success(data.message ?? 'Logged in successfully');
      router.push('/dashboard/user');
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? String(err.response.data.message)
          : 'Login failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid place-items-center min-h-screen w-full">
      <div className="w-full max-w-sm px-6">
        <div className="text-center mb-8">
          <div className="inline-block mb-4 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
            User Login
          </div>
          <h1 className="text-5xl font-bold text-primary mb-2">Log In</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="pl-10 py-6"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="pl-10 pr-10 py-6"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-medium py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[40px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Logging in...
              </>
            ) : (
              'Log In'
            )}
          </button>
        </form>

        <div className="my-6 border-t" />

        <p className="text-center text-sm">
          Don't have an account?{' '}
          <Link href="/signup" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </p>

        <div className="mt-6 pt-6 border-t text-center">
          <p className="text-xs text-muted-foreground mb-2">Are you a doctor?</p>
          <Link href="/doctor/login" className="text-primary hover:underline font-medium text-sm">
            Doctor Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default page;