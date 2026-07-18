'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Briefcase, Sparkles, User, Mail, Lock, Building, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Register() {
  const router = useRouter();
  const [role, setRole] = useState<'candidate' | 'employer'>('candidate');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (!fullName || !email || !password) {
      setErrorMsg('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    if (role === 'employer' && !companyName) {
      setErrorMsg('Please fill in your company name.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          fullName,
          role,
          companyName: role === 'employer' ? companyName : undefined
        })
      });

      const resData = await res.json();

      if (!res.ok) {
        setErrorMsg(resData.error || 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }

      // Automatically sign in the user now that account is confirmed
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        // Fallback to login if auto sign-in fails
        router.push('/auth/login?registered=true');
      } else {
        router.push('/home');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            // Pass the default role to handle_new_user trigger metadata
            role: role
          }
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
            <span>International Talent Gateway</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-950 mb-6 leading-tight tracking-tight">
            Connect directly with verified North American & global employers.
          </h2>
          <p className="text-slate-600 leading-relaxed text-sm mb-8">
            Create your verifiable Career Passport today and display your verified education, employment, and skills credentials directly to matching recruiters.
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

      {/* ─── RIGHT PANEL (Registration Form) ───────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md">
          
          {/* Header Mobile Brand */}
          <div className="flex lg:hidden items-center gap-2.5 mb-8">
            <img src="/logo-v.svg" alt="VELIZO" className="h-8 w-auto" />
            <span className="text-lg font-bold">VELIZO</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-950 mb-2 tracking-tight">
            Create your account
          </h1>
          <p className="text-slate-500 text-sm mb-8">
            Join VELIZO and explore global opportunities.
          </p>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">
              {errorMsg}
            </div>
          )}

          {/* 👥 ROLE SELECTOR SWITCH */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              className={`py-2.5 rounded-lg text-xs font-bold transition-all ${
                role === 'candidate'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              onClick={() => setRole('candidate')}
            >
              Job Seeker (Candidate)
            </button>
            <button
              type="button"
              className={`py-2.5 rounded-lg text-xs font-bold transition-all ${
                role === 'employer'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              onClick={() => setRole('employer')}
            >
              Employer / Recruiter
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <User className="h-4.5 w-4.5" />
                </span>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="input-style pl-10 text-sm"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Company Name (only if Employer selected) */}
            {role === 'employer' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Company Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Building className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Tech Corp Ltd"
                    className="input-style pl-10 text-sm"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

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
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <input
                  type="password"
                  placeholder="Min. 8 characters"
                  className="input-style pl-10 text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-[#084e96] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Sign Up'} <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs font-semibold text-slate-400 uppercase">
              <span className="bg-white px-3">Or register with</span>
            </div>
          </div>

          {/* Google Register */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all flex items-center justify-center gap-2.5 shadow-sm"
          >
            <img src="/globe.svg" alt="Google" className="h-4 w-4 filter grayscale contrast-200" />
            Continue with Google
          </button>

          <p className="mt-8 text-center text-xs text-slate-500 font-semibold">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary hover:underline font-bold">
              Sign In
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
}
