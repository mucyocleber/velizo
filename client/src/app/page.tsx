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
  CheckCircle2,
  BrainCircuit,
  Eye,
  EyeOff
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Preloader from '@/components/shared/Preloader';

const countries = [
  { code: 'ca', name: 'Canada' },
  { code: 'us', name: 'USA' },
  { code: 'gb', name: 'UK' },
  { code: 'de', name: 'Germany' },
  { code: 'rw', name: 'Rwanda' },
  { code: 'jp', name: 'Japan' },
  { code: 'fr', name: 'France' },
  { code: 'au', name: 'Australia' },
  { code: 'sg', name: 'Singapore' },
  { code: 'ae', name: 'UAE' },
  { code: 'ke', name: 'Kenya' },
  { code: 'br', name: 'Brazil' },
  { code: 'in', name: 'India' },
  { code: 'za', name: 'South Africa' },
  { code: 'nl', name: 'Netherlands' },
  { code: 'ch', name: 'Switzerland' },
  { code: 'se', name: 'Sweden' },
  { code: 'ng', name: 'Nigeria' },
  { code: 'kr', name: 'South Korea' },
  { code: 'es', name: 'Spain' },
  { code: 'it', name: 'Italy' },
  { code: 'nz', name: 'New Zealand' },
  { code: 'ie', name: 'Ireland' },
  { code: 'mx', name: 'Mexico' },
  { code: 'eg', name: 'Egypt' },
  { code: 'be', name: 'Belgium' },
  { code: 'at', name: 'Austria' },
  { code: 'dk', name: 'Denmark' },
  { code: 'no', name: 'Norway' },
  { code: 'fi', name: 'Finland' },
  { code: 'pl', name: 'Poland' },
  { code: 'tr', name: 'Turkey' },
  { code: 'sa', name: 'Saudi Arabia' },
  { code: 'qa', name: 'Qatar' },
  { code: 'gh', name: 'Ghana' },
  { code: 'ma', name: 'Morocco' },
  { code: 'co', name: 'Colombia' },
  { code: 'ar', name: 'Argentina' },
  { code: 'pt', name: 'Portugal' },
  { code: 'vn', name: 'Vietnam' }
];

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'register' | 'login'>('register');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      if (!fullName || !email || !password) {
        setErrorMsg('Please fill in all required fields.');
        setLoading(false);
        return;
      }

      try {
        const trimmedEmail = email.trim();
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: {
              full_name: fullName,
              role: 'candidate'
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
          router.push(`/auth/verify?email=${encodeURIComponent(trimmedEmail)}`);
        }
      } catch (err: any) {
        setErrorMsg('Registration failed. Please try again.');
        setLoading(false);
      }
    } else {
      if (!email || !password) {
        setErrorMsg('Please enter both email and password.');
        setLoading(false);
        return;
      }

      try {
        const trimmedEmail = email.trim();
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

        if (error) {
          setErrorMsg(error.message);
          setLoading(false);
          return;
        }

        if (data.user) {
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
          queryParams: activeTab === 'register' ? { role: 'candidate' } : undefined
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

      {/* ─── LEFT PANEL (High-End Interactive Feature Showcase - Desktop Only) ─── */}
      <div 
        className="hidden lg:flex lg:w-[55%] border-r border-slate-200/60 p-16 flex-col justify-between relative overflow-hidden bg-cover bg-center"
        style={{ 
          backgroundImage: "linear-gradient(rgba(248, 250, 252, 0.93), rgba(248, 250, 252, 0.93)), url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80')" 
        }}
      >
        <div className="absolute inset-0 dot-grid opacity-[0.8] -z-10" />
        
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <img src="/logo-v.svg" alt="VELIZO" className="h-9 w-auto filter drop-shadow-[0_2px_8px_rgba(10,102,194,0.12)]" />
          <span className="text-xl font-bold tracking-tight text-slate-900">
            VELI<span className="text-primary font-black">ZO</span>
          </span>
        </div>

        {/* 💻 Center Interactive Dashboard Mockups */}
        <div className="w-full max-w-lg mx-auto my-auto space-y-8 py-10">
          
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-100 bg-blue-50/50 text-xs text-primary font-bold">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Global Talent Protocol</span>
            </div>
            <h2 className="text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
              Access trusted global roles <span className="gradient-text">verified across borders</span>.
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed max-w-md">
              Everyone is welcome to apply. Build a verifiable career record, match compatibility requirements instantly, and land placements in Canada or any country of your choice.
            </p>
          </div>

          {/* 🇨🇦🇺🇸🇬🇧🇩🇪 Animated Country Flags Infinite Marquee */}
          <div className="w-full overflow-hidden py-3.5 bg-white/40 border-y border-slate-200/40 backdrop-blur-sm relative">
            <div className="flex w-[200%] gap-12 marquee-track">
              {/* Track 1 */}
              <div className="flex justify-around items-center min-w-full shrink-0 gap-8">
                {countries.map((country, idx) => (
                  <span key={`t1-${country.code}-${idx}`} className="flex items-center gap-2.5 text-xs font-bold text-slate-750 shrink-0">
                    <img src={`https://flagcdn.com/${country.code}.svg`} alt={country.name} className="h-3.5 w-5 rounded-sm object-cover shadow-sm border border-slate-200/40" />
                    {country.name}
                  </span>
                ))}
              </div>
              {/* Track 2 (For seamless loop) */}
              <div className="flex justify-around items-center min-w-full shrink-0 gap-8">
                {countries.map((country, idx) => (
                  <span key={`t2-${country.code}-${idx}`} className="flex items-center gap-2.5 text-xs font-bold text-slate-750 shrink-0">
                    <img src={`https://flagcdn.com/${country.code}.svg`} alt={country.name} className="h-3.5 w-5 rounded-sm object-cover shadow-sm border border-slate-200/40" />
                    {country.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 📇 Interactive Card 1: The Career Passport Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_10px_35px_-10px_rgba(15,23,42,0.06)] relative group hover:border-primary/20 transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-base font-bold text-slate-900">Career Trust Passport</h4>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Secure Professional Credentials</p>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-100 text-[10px] font-bold text-teal-700">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span> Verification Enabled
              </span>
            </div>

            {/* Verification Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-teal-50 border border-teal-100 text-teal-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className="font-semibold text-slate-700">Academic Records Validation</span>
                </div>
                <span className="text-[10px] text-teal-600 font-bold uppercase tracking-wider">✓ Secure</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-teal-50 border border-teal-100 text-teal-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className="font-semibold text-slate-700">Work History & Reference Check</span>
                </div>
                <span className="text-[10px] text-teal-600 font-bold uppercase tracking-wider">✓ Secure</span>
              </div>

              {/* Progress: Trust Score */}
              <div className="border-t border-slate-100 pt-4 mt-2">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-slate-500 font-semibold">Validation Integrity Index</span>
                  <span className="text-primary font-bold">98% Match Rate</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-primary to-blue-400 h-full rounded-full" style={{ width: '98%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* 📊 Interactive Card 2: AI Compatibility Scoring Match */}
          <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-[0_8px_25px_-10px_rgba(15,23,42,0.04)] flex justify-between items-center max-w-sm hover:border-primary/20 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-primary">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-800">Job Matching Compatibility</h5>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Automated Credentials Analysis</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-primary">Active</span>
              <span className="text-[9px] text-teal-600 font-bold block">Verified Match</span>
            </div>
          </div>

        </div>

        {/* Footer brand stamp */}
        <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold tracking-wide">
          <ShieldCheck className="h-5 w-5 text-teal-600" />
          <span>Verifiable Security Protocol Active</span>
        </div>
      </div>

      {/* ─── RIGHT PANEL (Sleek Account Forms - Desktop & Mobile) ─── */}
      <div className="w-full lg:w-[45%] flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 md:p-10 bg-[#F8FAFC] relative dot-grid gap-6">
        
        {/* Mobile Header Logo */}
        <div className="flex items-center justify-between w-full max-w-md">
          <div className="flex items-center gap-2.5 lg:hidden">
            <img src="/logo-v.svg" alt="VELIZO" className="h-8 w-auto filter drop-shadow-[0_2px_8px_rgba(10,102,194,0.12)]" />
            <span className="text-lg font-bold tracking-tight">VELI<span className="text-primary font-black">ZO</span></span>
          </div>
          
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-white border border-slate-200/50 px-3 py-1.5 rounded-xl shadow-sm ml-auto">
            <Globe className="h-3.5 w-3.5 text-teal-600 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Global Gateway</span>
          </div>
        </div>

        {/* Main Form Center Card (Floating White Box) */}
        <div className="w-full max-w-md bg-white border border-slate-200/80 p-6 sm:p-8 md:p-10 rounded-[28px] shadow-[0_20px_50px_rgba(15,23,42,0.04)] hover:border-slate-300/60 transition-colors relative z-10">
          
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">
              {activeTab === 'register' ? 'Join the Global Ecosystem' : 'Welcome Back'}
            </h1>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed max-w-xs mx-auto">
              {activeTab === 'register' 
                ? 'Create a verifiable profile to access international roles.' 
                : 'Sign in to access your secure professional workspace.'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold leading-relaxed animate-[shake_0.4s_ease-in-out]">
              {errorMsg}
            </div>
          )}

          {/* 🔘 Tab Switchers (Premium iOS Segmented Style) */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 border border-slate-200/40 rounded-xl mb-6">
            <button
              type="button"
              className={`py-2.5 rounded-lg text-xs font-bold transition-all duration-205 cursor-pointer relative z-20 ${
                activeTab === 'register'
                  ? 'bg-white text-slate-900 shadow-sm font-extrabold'
                  : 'text-slate-400 hover:text-slate-700'
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
              className={`py-2.5 rounded-lg text-xs font-bold transition-all duration-205 cursor-pointer relative z-20 ${
                activeTab === 'login'
                  ? 'bg-white text-slate-900 shadow-sm font-extrabold'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              onClick={() => {
                setActiveTab('login');
                setErrorMsg('');
              }}
            >
              Sign In
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name (Only on Registration) */}
            {activeTab === 'register' && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider text-center">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="input-style pl-11 pr-11 text-center text-xs focus:ring-2 focus:ring-blue-100"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider text-center">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  placeholder="name@domain.com"
                  className="input-style pl-11 pr-11 text-center text-xs focus:ring-2 focus:ring-blue-100"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider text-center">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={activeTab === 'register' ? 'Min. 8 characters' : 'Enter your password'}
                  className="input-style pl-11 pr-11 text-center text-xs focus:ring-2 focus:ring-blue-100"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer z-20"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {activeTab === 'register' && (
                <p className="text-[10px] text-slate-400 leading-normal mt-3 bg-slate-50 border border-slate-200/50 p-2.5 rounded-lg text-center">
                  Note: You will complete your professional career passport profile (skills, resume, and experience details) after entering your dashboard.
                </p>
              )}

              {activeTab === 'login' && (
                <div className="text-center mt-2.5">
                  <button type="button" className="text-[10px] text-primary hover:underline font-bold cursor-pointer">
                    Forgot Password?
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-xs font-bold tracking-wider uppercase text-white bg-primary hover:bg-[#084e96] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 mt-6 cursor-pointer"
            >
              {loading 
                ? 'Processing...'
                : (activeTab === 'register' ? 'Create Account' : 'Sign In')}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-bold text-slate-350 uppercase">
              <span className="bg-white px-3 tracking-wider">Or register with</span>
            </div>
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleOAuth}
            className="w-full py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2.5 shadow-sm hover:shadow-md cursor-pointer"
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

        {/* Footer info */}
        <div className="text-center text-[10px] text-slate-400 font-semibold max-w-md">
          By continuing, you agree to VELIZO's Terms of Service and Privacy Policy.
        </div>

      </div>

    </div>
  );
}
