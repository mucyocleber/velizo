'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Sparkles, 
  User, 
  Mail, 
  Lock, 
  Building2, 
  ArrowRight, 
  ShieldCheck,
  Globe,
  Briefcase,
  FileCheck,
  BrainCircuit
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Preloader from '@/components/shared/Preloader';

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'register' | 'login'>('register');
  const [role, setRole] = useState<'candidate' | 'employer'>('candidate');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if user is already logged in, redirect them to dashboard
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        router.push('/dashboard');
      }
    };
    checkUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (activeTab === 'register') {
      // Registration flow
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
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: role,
              ...(role === 'employer' && { company_name: companyName })
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });

        if (error) {
          setErrorMsg(error.message);
          setLoading(false);
          return;
        }

        if (data.user) {
          router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
        }
      } catch (err: any) {
        setErrorMsg('Registration failed. Please try again.');
        setLoading(false);
      }
    } else {
      // Login flow
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
          // Success redirect
          router.push('/dashboard');
        }
      } catch (err: any) {
        setErrorMsg('Authentication failed. Please try again.');
        setLoading(false);
      }
    }
  };

  const handleGoogleOAuth = async () => {
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: activeTab === 'register' ? { role: role } : undefined
        }
      });
      if (error) setErrorMsg(error.message);
    } catch (err) {
      setErrorMsg('Google OAuth failed.');
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-slate-900 overflow-x-hidden relative">
      
      {/* Animated Brand Preloader */}
      <Preloader />

      {/* ─── LEFT PANEL (Marketing Content - Desktop Only) ────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-50 border-r border-slate-200 p-16 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent -z-10" />
        
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <img src="/logo-v.svg" alt="VELIZO" className="h-9 w-auto filter drop-shadow-[0_2px_8px_rgba(10,102,194,0.15)]" />
          <span className="text-xl font-bold tracking-tight text-slate-900">
            VELI<span className="text-primary font-black">ZO</span>
          </span>
        </div>

        {/* Core Value Props */}
        <div className="max-w-md my-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-100 bg-blue-50/50 text-xs text-primary font-bold mb-8">
            <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
            <span>International Talent Gateway</span>
          </div>

          <h2 className="text-4xl font-extrabold text-slate-950 mb-8 leading-tight tracking-tight">
            Connecting Global Employers with Exceptional Talent
          </h2>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-white border border-slate-200 text-primary shadow-sm">
                <FileCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Verifiable Career Passport</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Securely exhibit your verified employment, education credentials and certifications.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-white border border-slate-200 text-primary shadow-sm">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Gemini AI Optimization</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Calculate ATS scores, analyze skill gaps, and get mock interview prep tailored to job postings.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-white border border-slate-200 text-primary shadow-sm">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Verified Job Listings</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Direct connection to Canadian & international roles with transparent salaries.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer brand stamp */}
        <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold tracking-wide">
          <ShieldCheck className="h-5 w-5 text-teal-600" />
          <span>Verifiable Trust Protocol Active</span>
        </div>
      </div>

      {/* ─── RIGHT PANEL (Unified Auth Card - Fully Responsive) ─── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between min-h-screen p-6 md:p-16 bg-white">
        
        {/* Mobile Header Logo */}
        <div className="flex items-center justify-between lg:justify-end w-full">
          <div className="flex items-center gap-2.5 lg:hidden">
            <img src="/logo-v.svg" alt="VELIZO" className="h-8 w-auto filter drop-shadow-[0_2px_8px_rgba(10,102,194,0.15)]" />
            <span className="text-lg font-bold tracking-tight">VELI<span className="text-primary font-black">ZO</span></span>
          </div>
          
          {/* Global indicator */}
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            <Globe className="h-4 w-4 text-teal-600" />
            <span>CA & Global Access</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md mx-auto my-auto py-10">
          
          <h1 className="text-3xl font-extrabold text-slate-950 mb-2 tracking-tight">
            {activeTab === 'register' ? 'Get started today' : 'Welcome back'}
          </h1>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            {activeTab === 'register' 
              ? 'Create a professional account and unlock global placement opportunities.' 
              : 'Sign in to access your dashboard, applications, and career insights.'}
          </p>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold leading-relaxed animate-[shake_0.4s_ease-in-out]">
              {errorMsg}
            </div>
          )}

          {/* 🔘 Tabs: Register vs Login */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-6 border border-slate-200/50">
            <button
              type="button"
              className={`py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                activeTab === 'register'
                  ? 'bg-white text-primary shadow-sm font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              onClick={() => {
                setActiveTab('register');
                setErrorMsg('');
              }}
            >
              Create Account
            </button>
            <button
              type="button"
              className={`py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                activeTab === 'login'
                  ? 'bg-white text-primary shadow-sm font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              onClick={() => {
                setActiveTab('login');
                setErrorMsg('');
              }}
            >
              Sign In
            </button>
          </div>

          {/* 👥 Candidate vs Employer Toggle (Only on Registration) */}
          {activeTab === 'register' && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-blue-50/50 border border-blue-100/50 rounded-xl mb-6">
              <button
                type="button"
                className={`py-2 rounded-lg text-[11px] font-bold transition-all ${
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
                className={`py-2 rounded-lg text-[11px] font-bold transition-all ${
                  role === 'employer'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                onClick={() => setRole('employer')}
              >
                Employer / Recruiter
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name (Only on Registration) */}
            {activeTab === 'register' && (
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
            )}

            {/* Company Name (Registration + Employer selection) */}
            {activeTab === 'register' && role === 'employer' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Company Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Building2 className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Innovate Tech Corp"
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
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Password
                </label>
                {activeTab === 'login' && (
                  <button type="button" className="text-xs text-primary hover:underline font-semibold">
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <input
                  type="password"
                  placeholder={activeTab === 'register' ? 'Min. 8 characters' : 'Enter your password'}
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
              className="w-full py-3.5 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-[#084e96] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {loading 
                ? (activeTab === 'register' ? 'Creating Account...' : 'Signing In...')
                : (activeTab === 'register' ? 'Create Account' : 'Sign In')}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs font-semibold text-slate-400 uppercase">
              <span className="bg-white px-3">Or continue with</span>
            </div>
          </div>

          {/* Google SSO Button */}
          <button
            type="button"
            onClick={handleGoogleOAuth}
            className="w-full py-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold transition-all flex items-center justify-center gap-2.5 shadow-sm hover:shadow-md"
          >
            <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

        </div>

        {/* Footer Text */}
        <div className="text-center text-[10px] text-slate-400 font-medium">
          By continuing, you agree to VELIZO's Terms of Service and Privacy Policy.
        </div>

      </div>

      {/* 🎨 CSS Animations for dynamic elements */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
      `}</style>

    </div>
  );
}
