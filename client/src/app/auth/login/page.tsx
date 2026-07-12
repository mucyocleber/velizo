'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Sparkles, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Direct to home page or dashboard
        router.push('/');
      }
    } catch (err: any) {
      setErrorMsg('Authentication failed. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) setErrorMsg(error.message);
    } catch (err) {
      setErrorMsg('Google OAuth failed.');
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-slate-900">
      
      {/* ─── LEFT PANEL (Marketing & Brand Info) ────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-50 border-r border-slate-200 p-16 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-50/40 via-transparent to-transparent -z-10" />
        
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <img src="/logo-v.svg" alt="VELIZO" className="h-9 w-auto filter drop-shadow-[0_2px_8px_rgba(10,102,194,0.15)]" />
          <span className="text-xl font-bold tracking-tight text-slate-900">
            VELI<span className="text-primary font-black">ZO</span>
          </span>
        </div>

        {/* Brand Presentation */}
        <div className="max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-100 bg-blue-50/50 text-xs text-primary font-semibold mb-6">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Welcome Back to VELIZO</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-950 mb-6 leading-tight tracking-tight">
            Log in to manage your Career Passport & applications.
          </h2>
          <p className="text-slate-600 leading-relaxed text-sm mb-8">
            Access your verified profile, connect with matching international employers, and continue your career roadmap.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold">
              <ShieldCheck className="h-5 w-5 text-teal-600" />
              <span>Verifiable Credential Security Protocol</span>
            </div>
          </div>
        </div>

        {/* Footer branding */}
        <div className="text-xs text-slate-400 font-medium">
          All Rights Reserved © 2026. CodeMateRwa LTD
        </div>
      </div>

      {/* ─── RIGHT PANEL (Login Form) ─────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md">
          
          {/* Header Mobile Brand */}
          <div className="flex lg:hidden items-center gap-2.5 mb-8">
            <img src="/logo-v.svg" alt="VELIZO" className="h-8 w-auto" />
            <span className="text-lg font-bold">VELIZO</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-950 mb-2 tracking-tight">
            Welcome back
          </h1>
          <p className="text-slate-500 text-sm mb-8">
            Enter your credentials to access your portal.
          </p>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Mail className="h-4.5 w-4.5" />
                </span>
                <input
                  type="email"
                  placeholder="name@domain.com"
                  className="input-style pl-10 text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Password
                </label>
                <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline font-semibold">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="input-style pl-10 text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-[#084e96] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Sign In'} <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs font-semibold text-slate-400 uppercase">
              <span className="bg-white px-3">Or login with</span>
            </div>
          </div>

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all flex items-center justify-center gap-2.5 shadow-sm"
          >
            <img src="/globe.svg" alt="Google" className="h-4 w-4 filter grayscale contrast-200" />
            Continue with Google
          </button>

          <p className="mt-8 text-center text-xs text-slate-500 font-semibold">
            New to VELIZO?{' '}
            <Link href="/auth/register" className="text-primary hover:underline font-bold">
              Join now
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
}
