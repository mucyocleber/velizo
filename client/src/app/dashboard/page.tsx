'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  LogOut, 
  User, 
  Briefcase, 
  FileCheck, 
  ShieldCheck, 
  Globe, 
  ChevronRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      // 1. Get auth session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        // Redirect to login if unauthenticated
        router.push('/');
        return;
      }

      setUser(session.user);

      // 2. Fetch user profile from database
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }
      setLoading(false);
    };

    fetchSessionAndProfile();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex bg-slate-50 items-center justify-center p-6 text-slate-500 font-medium text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span>Loading your secure portal...</span>
        </div>
      </div>
    );
  }

  const isCandidate = profile?.role === 'candidate';

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      
      {/* ─── DASHBOARD HEADER ───────────────────────────────────── */}
      <header className="w-full border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo-v.svg" alt="VELIZO" className="h-8 w-auto filter drop-shadow-[0_2px_8px_rgba(10,102,194,0.15)]" />
            <span className="text-lg font-bold tracking-tight">
              VELI<span className="text-primary font-black">ZO</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-right">
              <span className="text-xs font-bold text-slate-800 block leading-none">{profile?.full_name || 'User'}</span>
              <span className="text-[10px] font-bold text-slate-400 capitalize block text-left leading-none mt-1">
                {profile?.role === 'candidate' ? 'Job Seeker' : 'Recruiter'}
              </span>
            </div>
            
            <button 
              onClick={handleSignOut}
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-red-600 transition-all flex items-center gap-1.5 text-xs font-semibold"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── DASHBOARD CONTAINER ────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
        
        {/* Welcome Section */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-md mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-950 tracking-tight">
              Hello, {profile?.full_name || 'User'}!
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-teal-600" />
              Account active under verified database session
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold uppercase tracking-wider bg-slate-50 border border-slate-200/50 px-4 py-2 rounded-xl">
            <Globe className="h-4 w-4 text-teal-600" />
            <span>CA & Global Access</span>
          </div>
        </div>

        {/* Dashboard Content split */}
        {isCandidate ? (
          /* 👨‍💻 Candidate Workspace View */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card: Career Passport */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="p-3 rounded-xl bg-blue-50 text-primary w-fit mb-4">
                  <FileCheck className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5">Your Career Passport</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">Manage your verified education records, work history, and certificates. Display a high Trust Score to recruiters.</p>
              </div>
              <Link href="/passport" className="py-2.5 rounded-lg bg-primary hover:bg-[#084e96] text-white text-xs font-semibold text-center transition-all flex items-center justify-center gap-1">
                Open Passport <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Card: AI Assistant */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="p-3 rounded-xl bg-purple-50 text-purple-600 w-fit mb-4">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5">AI Interview Coach</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">Analyze your resume, test ATS compliance, and generate mock interview prep sessions dynamically.</p>
              </div>
              <Link href="/coach" className="py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold text-center transition-all flex items-center justify-center gap-1">
                Open AI Coach <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Card: Job Opportunities */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="p-3 rounded-xl bg-teal-50 text-teal-600 w-fit mb-4">
                  <Briefcase className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5">Job Placements</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">Browse and search matching international listings. Apply instantly with your verified credentials.</p>
              </div>
              <Link href="/jobs" className="py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold text-center transition-all flex items-center justify-center gap-1">
                Explore Jobs <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

          </div>
        ) : (
          /* 🏢 Employer Recruiter View */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Card: Job Postings */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="p-3 rounded-xl bg-teal-50 text-teal-600 w-fit mb-4">
                  <Briefcase className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5">Manage Listings</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">Create new international job postings, manage existing drafts, and filter incoming applications.</p>
              </div>
              <Link href="/employer/jobs" className="py-2.5 rounded-lg bg-primary hover:bg-[#084e96] text-white text-xs font-semibold text-center transition-all flex items-center justify-center gap-1">
                Post a Job <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Card: Applicant Screening */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="p-3 rounded-xl bg-blue-50 text-primary w-fit mb-4">
                  <User className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5">Screen Applications</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">Review candidate profiles, inspect verified Career Passports, and update application review status.</p>
              </div>
              <Link href="/employer/applications" className="py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold text-center transition-all flex items-center justify-center gap-1">
                Review Applicants <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

          </div>
        )}

      </main>

    </div>
  );
}
