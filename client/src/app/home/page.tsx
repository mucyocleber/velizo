'use client';

import React, { useEffect, useState, useCallback } from 'react';
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
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  Calendar,
  Plus,
  Compass,
  Bookmark,
  Building2,
  Users,
  Search,
  ExternalLink,
  Award,
  Check,
  AlertCircle,
  MapPin,
  Mail,
  Share2,
  AtSign,
  MessageCircle
} from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/layout/Header';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [candidate, setCandidate] = useState<any>(null);
  const [passport, setPassport] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ candidates: 0, companies: 0, jobs: 0 });
  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const PAGE_SIZE = 15;
  // Right sidebar dynamic data
  const [topEmployers, setTopEmployers] = useState<any[]>([]);
  const [hotCategories, setHotCategories] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return 'Just now';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        router.push('/');
        return;
      }

      setUser(session.user);

      // Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileData) {
        setProfile(profileData);

        // Fetch candidate specifics if candidate
        if (profileData.role === 'candidate') {
          const { data: candidateData } = await supabase
            .from('candidates')
            .select('*')
            .eq('id', session.user.id)
            .single();
          if (candidateData) setCandidate(candidateData);

          const { data: passportData } = await supabase
            .from('career_passports')
            .select('*')
            .eq('candidate_id', session.user.id)
            .single();
          if (passportData) setPassport(passportData);
        }

        // Fetch company details if employer
        if (profileData.role === 'employer') {
          const { data: companyData } = await supabase
            .from('company_profiles')
            .select('*')
            .eq('employer_id', session.user.id)
            .single();
          if (companyData) setCompany(companyData);
        }
      }

      // Count total published jobs for pagination
      const { count: totalCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published');
      if (totalCount !== null) setTotalJobs(totalCount);

      // Fetch platform counts + sidebar data in parallel
      const [candRes, compRes, jobRes, employersRes, categoriesRes, recentRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'candidate'),
        supabase.from('company_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'published'),
        // Top verified employers by number of published jobs
        supabase
          .from('company_profiles')
          .select('company_name, logo_url, industry, country, is_verified')
          .eq('is_verified', true)
          .limit(5),
        // Hot job categories from published jobs
        supabase
          .from('jobs')
          .select('category')
          .eq('status', 'published'),
        // Recent applications for the current user (if candidate)
        user ? supabase
          .from('job_applications')
          .select(`id, status, created_at, jobs(title, category)`)
          .eq('candidate_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3) : Promise.resolve({ data: [] })
      ]);

      setStats({
        candidates: candRes.count || 0,
        companies: compRes.count || 0,
        jobs: jobRes.count || 0
      });

      if (employersRes.data) setTopEmployers(employersRes.data);

      // Aggregate category counts client-side
      if (categoriesRes.data) {
        const catMap: Record<string, number> = {};
        categoriesRes.data.forEach((j: any) => {
          if (j.category) catMap[j.category] = (catMap[j.category] || 0) + 1;
        });
        const sorted = Object.entries(catMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([name, count]) => ({ name, count }));
        setHotCategories(sorted);
      }

      if (recentRes.data) setRecentActivity(recentRes.data);

      setLoading(false);
    };

    fetchSessionAndProfile();
  }, [router]);

  // Separate paginated jobs fetcher
  const fetchJobs = useCallback(async (page: number) => {
    setJobsLoading(true);
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data: jobsData, count } = await supabase
      .from('jobs_with_companies')
      .select('*', { count: 'exact' })
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(from, to);
    if (jobsData) setJobs(jobsData);
    if (count !== null) setTotalJobs(count);
    setJobsLoading(false);
  }, [PAGE_SIZE]);

  useEffect(() => {
    fetchJobs(currentPage);
  }, [currentPage, fetchJobs]);



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
  const nameInitial = profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U';

  const getCandidateCompletion = () => {
    const completed = [];
    const missing = [];
    
    completed.push({ name: 'Account created', code: 'account' });
    
    if (candidate?.summary) {
      completed.push({ name: 'Professional Summary', code: 'summary' });
    } else {
      missing.push({ name: 'Add Summary Headline', code: 'summary' });
    }
    
    if (candidate?.nationality) {
      completed.push({ name: 'Nationality configured', code: 'nationality' });
    } else {
      missing.push({ name: 'Set Nationality', code: 'nationality' });
    }
    
    if (candidate?.current_location) {
      completed.push({ name: 'Location specified', code: 'location' });
    } else {
      missing.push({ name: 'Add Location Details', code: 'location' });
    }
    
    if (candidate?.phone_number) {
      completed.push({ name: 'Contact number added', code: 'phone' });
    } else {
      missing.push({ name: 'Verify Phone Number', code: 'phone' });
    }
    
    const percentage = Math.round((completed.length / 5) * 100);
    return { percentage, completed, missing };
  };

  const getEmployerCompletion = () => {
    const completed = [];
    const missing = [];
    
    if (company?.company_name) {
      completed.push({ name: 'Company Name set', code: 'name' });
    } else {
      missing.push({ name: 'Define Company Name', code: 'name' });
    }
    
    if (company?.website) {
      completed.push({ name: 'Website linked', code: 'website' });
    } else {
      missing.push({ name: 'Add Corporate Website', code: 'website' });
    }
    
    if (company?.industry) {
      completed.push({ name: 'Industry configured', code: 'industry' });
    } else {
      missing.push({ name: 'Configure Industry Sector', code: 'industry' });
    }
    
    if (company?.company_size) {
      completed.push({ name: 'Company Size set', code: 'size' });
    } else {
      missing.push({ name: 'Specify Employee Count', code: 'size' });
    }
    
    if (company?.description) {
      completed.push({ name: 'Description created', code: 'desc' });
    } else {
      missing.push({ name: 'Add Company Description', code: 'desc' });
    }
    
    const percentage = Math.round((completed.length / 5) * 100);
    return { percentage, completed, missing };
  };

  return (
    <>
      <div className="min-h-screen flex flex-col bg-[#F3F4F6] font-sans text-slate-900">
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}} />
      
      {/* ─── DYNAMIC NAV HEADER ─────────────────────────────────── */}
      <Header />

      {/* ─── THREE COLUMN LAYOUT ────────────────────────────────── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 pt-4 pb-20 lg:pb-4 grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch lg:h-[calc(100vh-3.5rem)] lg:overflow-hidden">
        
        {/* ─── COLUMN 1: LEFT USER SIDEBAR CARD (1/4) ──────────────── */}
        <section className="lg:col-span-1 space-y-4 lg:h-[calc(100vh-5.5rem)] lg:overflow-y-auto pb-6 pr-1 custom-scrollbar">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {/* Banner Cover */}
            <div className="h-14 bg-gradient-to-r from-blue-700 to-indigo-800 relative" />
            
            {/* Avatar positioning */}
            <div className="px-6 pb-4 relative flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-white p-0.5 border border-slate-200 -mt-8 mb-3 shadow-sm shrink-0">
                <div className="h-full w-full rounded-full bg-slate-50 flex items-center justify-center text-primary text-lg font-bold">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="avatar" className="h-full w-full rounded-full object-cover" />
                  ) : nameInitial}
                </div>
              </div>
              
              <h2 className="text-sm font-extrabold text-slate-900 leading-snug">
                {profile?.full_name || 'User'}
              </h2>
              <p className="text-[11px] text-slate-500 font-bold leading-normal mt-1 min-h-[30px] line-clamp-2">
                {profile?.headline || (isCandidate 
                  ? 'Job seeker seeking global sponsorship opportunities' 
                  : 'Recruiter at VELIZO Verified Partner')}
              </p>
            </div>

            {/* Role-Specific Completion Tracker */}
            <div className="border-t border-slate-100 p-4 space-y-4">
              {isCandidate ? (() => {
                const { percentage, completed, missing } = getCandidateCompletion();
                return (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">Profile Completed</span>
                      <span className="text-xs font-black text-teal-655">{percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-teal-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }} 
                      />
                    </div>

                    {/* Progress details */}
                    <div className="space-y-1.5 pt-1">
                      {completed.map((item) => (
                        <div key={item.code} className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold">
                          <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate">{item.name}</span>
                        </div>
                      ))}
                      {missing.map((item) => (
                        <div key={item.code} className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                          <AlertCircle className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                          <span className="truncate">{item.name}</span>
                        </div>
                      ))}
                    </div>

                    {/* Trust Score */}
                    {passport && (
                      <div className="pt-2 border-t border-slate-100 space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500">
                          <span>Passport Trust Score</span>
                          <span className="text-primary font-black">{passport.trust_score}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-primary h-full rounded-full transition-all duration-500" 
                            style={{ width: `${passport.trust_score}%` }} 
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })() : (() => {
                const { percentage, completed, missing } = getEmployerCompletion();
                return (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold text-slate-455 uppercase tracking-wider">Company Profile</span>
                      <span className="text-xs font-black text-primary">{percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary h-full rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }} 
                      />
                    </div>

                    {/* Progress details */}
                    <div className="space-y-1.5 pt-1">
                      {completed.map((item) => (
                        <div key={item.code} className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold">
                          <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate">{item.name}</span>
                        </div>
                      ))}
                      {missing.map((item) => (
                        <div key={item.code} className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                          <AlertCircle className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                          <span className="truncate">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Complete Profile CTA Link */}
            <div className="border-t border-slate-100 p-3 bg-slate-50 hover:bg-slate-100/80 transition-colors text-center">
              <Link 
                href={isCandidate ? "/passport" : "/passport"} 
                className="text-[11px] font-bold text-primary flex items-center justify-center gap-1.5"
              >
                {isCandidate ? (
                  <>
                    <FileCheck className="h-3.5 w-3.5" />
                    <span>Complete Career Passport</span>
                  </>
                ) : (
                  <>
                    <Building2 className="h-3.5 w-3.5" />
                    <span>Update Company Profile</span>
                  </>
                )}
              </Link>
            </div>
          </div>

          {/* Mini-links box */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-xs font-semibold text-slate-500 space-y-2.5">
            <h4 className="text-slate-800 text-[10px] font-bold uppercase tracking-wider mb-1">shortcuts</h4>
            <Link href={isCandidate ? "/jobs" : "/employer/applications"} className="flex items-center gap-2 hover:text-primary transition-colors">
              <Briefcase className="h-4 w-4 text-slate-400" />
              <span>{isCandidate ? 'Explore Placements' : 'Screen Applications'}</span>
            </Link>
            {isCandidate ? (
              <Link href="/coach" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span>AI Interview Coaching</span>
              </Link>
            ) : (
              <Link href="/employer/jobs" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Plus className="h-4 w-4 text-slate-400" />
                <span>Post Job Placements</span>
              </Link>
            )}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[10px] text-slate-400">
              <Award className="h-4 w-4 text-yellow-600" />
              <span>{isCandidate ? 'Verified Passport Standard' : 'Verified Recruiter Standard'}</span>
            </div>
          </div>
        </section>

        {/* ─── COLUMN 2 & 3: CENTER FEED (2/4) ────────────────────── */}
        <section className="lg:col-span-2 space-y-4 lg:h-[calc(100vh-5.5rem)] lg:overflow-y-auto pb-6 px-1 custom-scrollbar">
          

          {/* Pinned System Update Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 space-y-6">
            {/* Header info */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800 block">
                  VELIZO PLATFORM
                </span>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shrink-0" />
                  <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest">
                    SYSTEM WORKSPACE UPDATE
                  </span>
                  <span className="text-[10px] font-bold text-slate-350">
                    &bull; PINNED
                  </span>
                </div>
              </div>
              <Bookmark className="h-5 w-5 text-primary" />
            </div>

            {/* Announcement Message Layout: Speech bubble speaking woman */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Welcoming Woman Left Column */}
              <div className="md:col-span-3 flex justify-center">
                <img 
                  src="/welcome_announcement.png" 
                  alt="Welcome Announcement" 
                  className="max-h-48 md:max-h-52 w-auto object-contain rounded-xl drop-shadow-md"
                />
              </div>
              
              {/* Speech Bubble Right Column */}
              <div className="md:col-span-9 relative pl-2">
                <div className="relative bg-slate-50 p-5 rounded-2xl border border-slate-250 text-xs font-semibold text-slate-655 leading-relaxed shadow-3xs">
                  {/* Speech bubble tail pointing left */}
                  <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-slate-250" />
                  <div className="absolute top-1/2 -left-[7px] -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-slate-50" />
                  
                  Welcome to the new VELIZO workspace! We have upgraded the verification engine to synchronize with standard global employer trust rules. Complete your Education and Employment history to trigger automatic verification requests.
                </div>
              </div>
            </div>

            {/* Verification Section Layout: Text left, Image right */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50/30 to-indigo-50/10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center shadow-sm">
              <div className="md:col-span-9 space-y-5">
                <div className="space-y-1.5">
                  <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="h-5.5 w-5.5 text-primary shrink-0" /> Verify Your Credentials
                  </h4>
                  <p className="text-xs text-slate-605 font-semibold leading-relaxed">
                    Verified profiles receive{' '}
                    <span className="text-primary font-black bg-blue-50/80 px-2 py-0.5 rounded-md border border-blue-100 shadow-3xs inline-block">
                      10x higher response rates
                    </span>{' '}
                    from verified international recruiters and hiring managers.
                  </p>
                </div>

                {/* Steps Checklist */}
                <div className="space-y-2.5">
                  <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Verification Steps Checklist
                  </h5>

                  <div className="flex flex-wrap gap-2">
                    {isCandidate ? (
                      <>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-150 bg-white shadow-3xs shrink-0">
                          <CheckCircle2 className={`h-4 w-4 shrink-0 ${passport?.identity_verified ? 'text-emerald-500' : 'text-slate-300'}`} />
                          <span className="text-[10px] font-extrabold text-slate-700">Identity Check</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-150 bg-white shadow-3xs shrink-0">
                          <CheckCircle2 className={`h-4 w-4 shrink-0 ${passport?.education_verified ? 'text-emerald-500' : 'text-slate-300'}`} />
                          <span className="text-[10px] font-extrabold text-slate-700">Education Details</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-150 bg-white shadow-3xs shrink-0">
                          <CheckCircle2 className={`h-4 w-4 shrink-0 ${passport?.employment_verified ? 'text-emerald-500' : 'text-slate-300'}`} />
                          <span className="text-[10px] font-extrabold text-slate-700">Employment History</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-150 bg-white shadow-3xs shrink-0">
                          <CheckCircle2 className={`h-4 w-4 shrink-0 ${company?.is_verified ? 'text-emerald-500' : 'text-slate-300'}`} />
                          <span className="text-[10px] font-extrabold text-slate-700">Corporate Details</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-150 bg-white shadow-3xs shrink-0">
                          <CheckCircle2 className={`h-4 w-4 shrink-0 ${company?.website ? 'text-emerald-500' : 'text-slate-300'}`} />
                          <span className="text-[10px] font-extrabold text-slate-700">Website Linked</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-150 bg-white shadow-3xs shrink-0">
                          <CheckCircle2 className={`h-4 w-4 shrink-0 ${company?.description ? 'text-emerald-500' : 'text-slate-300'}`} />
                          <span className="text-[10px] font-extrabold text-slate-700">Business Summary</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Start CTA Button */}
                <div className="pt-1">
                  <Link 
                    href="/passport" 
                    className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-primary to-[#084e96] hover:from-[#084e96] hover:to-[#063f7a] text-white text-[11px] font-black rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 shadow-md hover:shadow-lg gap-2 cursor-pointer group"
                  >
                    <span>Start Verification</span>
                    <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>

              {/* Verification Illustration Right Column */}
              <div className="md:col-span-3 flex justify-center">
                <img 
                  src="/credentials_verification.png" 
                  alt="Credentials Verification" 
                  className="max-h-48 md:max-h-52 w-auto object-contain rounded-xl drop-shadow-md"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Jobs Feed */}
          {jobs.map((job) => {
            const timeAgo = formatTimeAgo(job.created_at);
            const skills = job.skills_required || [];

            return (
              <div key={job.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs hover:shadow-xs hover:border-slate-300 transition-all duration-300 space-y-4">
                {/* Header: Publisher Info */}
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-primary font-bold shrink-0 overflow-hidden">
                      {job.logo_url ? (
                        <img src={job.logo_url} alt={job.company_name} className="h-full w-full object-cover" />
                      ) : (
                        <Building2 className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        {job.company_name || 'Anonymous Recruiter'} 
                        {job.company_verified && (
                          <span className="inline-flex items-center gap-0.5 text-[8px] font-black uppercase text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-100 shrink-0">
                            Verified
                          </span>
                        )}
                      </h3>
                      <p className="text-[10px] text-slate-450 font-bold mt-0.5">
                        Posted a placement in <span className="text-slate-655 font-extrabold">{job.category}</span>
                      </p>
                    </div>
                  </div>
                  
                  {/* Right Header Side: Remote Tag & Time */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-[9px] font-black text-primary bg-blue-50/50 border border-blue-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {job.remote_type}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {timeAgo}
                    </span>
                  </div>
                </div>

                {/* Job Description Text */}
                <p className="text-xs text-slate-650 leading-relaxed font-medium">
                  {job.description}
                </p>

                {/* International Match Card Details */}
                <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-200/80 space-y-3.5 hover:bg-slate-100/50 transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Match Score Badge */}
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-150 shadow-3xs">
                        <ShieldCheck className="h-3 w-3 text-teal-650 shrink-0" />
                        95% Match Score
                      </span>

                      {/* Visa sponsorship badge */}
                      {job.visa_sponsorship && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 shadow-3xs">
                          <Globe className="h-3 w-3 text-blue-550 shrink-0" />
                          Visa Sponsored
                        </span>
                      )}

                      {/* Relocation support badge */}
                      {job.relocation_support && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 shadow-3xs">
                          <Compass className="h-3 w-3 text-indigo-550 shrink-0" />
                          Relocation Support
                        </span>
                      )}
                    </div>

                    {/* Location detail */}
                    <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      {job.city ? `${job.city}, ${job.country}` : job.country}
                    </span>
                  </div>

                  {/* Skills required */}
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {skills.slice(0, 4).map((skill: string) => (
                        <span key={skill} className="text-[9px] font-extrabold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Title & Placement Highlights */}
                  <div className="border-t border-slate-200/60 pt-3 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-black text-slate-900">{job.title}</h4>
                      <p className="text-[11px] font-black text-primary flex items-center gap-0.5">
                        {job.salary_min && job.salary_max 
                          ? `${Number(job.salary_min).toLocaleString()} - ${Number(job.salary_max).toLocaleString()} ${job.currency || 'USD'}`
                          : 'Salary Competitive'}
                      </p>
                    </div>

                    <Link 
                      href={`/jobs/${job.id}`} 
                      className="px-4 py-2 bg-gradient-to-r from-primary to-[#084e96] hover:from-[#084e96] hover:to-[#063f7a] text-white text-xs font-black rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 shadow-3xs hover:shadow-2xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer group"
                    >
                      <span>Apply Placement</span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination Controls */}
          {totalJobs > PAGE_SIZE && (() => {
            const totalPages = Math.ceil(totalJobs / PAGE_SIZE);
            const getPageNumbers = () => {
              const pages: (number | '...')[] = [];
              if (totalPages <= 7) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
              } else {
                pages.push(1);
                if (currentPage > 3) pages.push('...');
                for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
                if (currentPage < totalPages - 2) pages.push('...');
                pages.push(totalPages);
              }
              return pages;
            };
            return (
              <div className="flex flex-col items-center gap-3 pt-4 pb-2">
                <div className="flex items-center gap-2">
                  {/* Previous */}
                  <button
                    onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); }}
                    disabled={currentPage === 1 || jobsLoading}
                    className="h-8 w-8 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-blue-50 hover:text-primary hover:border-primary/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-3xs"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {/* Page numbers */}
                  {getPageNumbers().map((page, i) =>
                    page === '...' ? (
                      <span key={`ellipsis-${i}`} className="h-8 w-8 flex items-center justify-center text-slate-400 text-xs font-bold">…</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page as number)}
                        disabled={jobsLoading}
                        className={`h-8 w-8 flex items-center justify-center rounded-xl text-xs font-black transition-all shadow-3xs ${
                          currentPage === page
                            ? 'bg-gradient-to-r from-primary to-[#084e96] text-white border border-blue-700/20 scale-105 shadow-md'
                            : 'border border-slate-200 bg-white text-slate-600 hover:bg-blue-50 hover:text-primary hover:border-primary/30'
                        } disabled:opacity-40`}
                      >
                        {page}
                      </button>
                    )
                  )}

                  {/* Next */}
                  <button
                    onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); }}
                    disabled={currentPage === totalPages || jobsLoading}
                    className="h-8 w-8 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-blue-50 hover:text-primary hover:border-primary/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-3xs"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-[10px] font-bold text-slate-400">
                  Showing {((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, totalJobs)} of {totalJobs} placements
                </p>
              </div>
            );
          })()}

          {/* Inline loading overlay for page transitions */}
          {jobsLoading && (
            <div className="flex items-center justify-center py-10 gap-2 text-xs font-bold text-slate-400">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span>Loading placements...</span>
            </div>
          )}

        </section>

        {/* COLUMN 3: RIGHT SIDEBAR (1/4) */}
        <section className="lg:col-span-1 space-y-4 lg:h-[calc(100vh-5.5rem)] lg:overflow-y-auto pb-6 pl-1 custom-scrollbar">

          {/* 1. Live Platform Stats Widget — dynamic from DB */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-extrabold text-slate-900 tracking-tight uppercase">Platform Statistics</h3>
            </div>
            <div className="space-y-2.5 text-xs font-semibold text-slate-500">
              {[
                { label: 'Active Candidates', value: stats.candidates, color: 'bg-blue-500' },
                { label: 'Sponsor Partners', value: stats.companies, color: 'bg-emerald-500' },
                { label: 'Live Placements', value: stats.jobs, color: 'bg-indigo-500' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between items-center py-0.5">
                  <span className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${color} shrink-0`} />
                    {label}
                  </span>
                  <span className="text-slate-800 font-extrabold tabular-nums">{value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Hot Job Categories — aggregated from DB */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Briefcase className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-extrabold text-slate-900 tracking-tight uppercase">Hot Categories</h3>
            </div>
            {hotCategories.length === 0 ? (
              <p className="text-[10px] text-slate-400 font-semibold">Loading categories...</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {hotCategories.map(({ name, count }) => (
                  <button
                    key={name}
                    onClick={() => {}}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-primary/30 hover:text-primary transition-all cursor-pointer text-[10px] font-extrabold text-slate-600"
                  >
                    {name}
                    <span className="text-[9px] font-black text-slate-400 ml-0.5">({count})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. Top Verified Employers — from company_profiles */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <h3 className="text-xs font-extrabold text-slate-900 tracking-tight uppercase">Verified Partners</h3>
            </div>
            {topEmployers.length === 0 ? (
              <p className="text-[10px] text-slate-400 font-semibold italic">No verified partners yet.</p>
            ) : (
              <div className="space-y-2.5">
                {topEmployers.map((emp: any, i: number) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center overflow-hidden shrink-0">
                      {emp.logo_url ? (
                        <img src={emp.logo_url} alt={emp.company_name} className="h-full w-full object-cover" />
                      ) : (
                        <Building2 className="h-3.5 w-3.5 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-extrabold text-slate-800 truncate">{emp.company_name}</p>
                      <p className="text-[9px] text-slate-400 font-semibold truncate">{emp.industry || emp.country}</p>
                    </div>
                    <span className="ml-auto text-[8px] font-black uppercase text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 shrink-0">
                      Verified
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. My Recent Activity — personal applications for candidates */}
          {isCandidate && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-primary" />
                  <h3 className="text-xs font-extrabold text-slate-900 tracking-tight uppercase">My Applications</h3>
                </div>
                <Link href="/applications" className="text-[9px] font-black text-primary hover:underline uppercase tracking-wider">
                  View All
                </Link>
              </div>
              {recentActivity.length === 0 ? (
                <p className="text-[10px] text-slate-400 font-semibold italic">No applications yet. Start applying!</p>
              ) : (
                <div className="space-y-2.5">
                  {recentActivity.map((app: any) => (
                    <Link key={app.id} href={`/applications/${app.id}`} className="flex items-start gap-2.5 group">
                      <div className="h-6 w-6 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Briefcase className="h-3 w-3 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-extrabold text-slate-800 group-hover:text-primary transition-colors truncate">
                          {(app.jobs as any)?.title || 'Placement'}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded border ${
                            app.status === 'submitted' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                            app.status === 'reviewing' || app.status === 'shortlisted' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                            app.status === 'offered' || app.status === 'hired' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                            app.status === 'rejected' ? 'bg-red-50 text-red-500 border-red-200' :
                            'bg-slate-50 text-slate-500 border-slate-200'
                          }`}>
                            {app.status}
                          </span>
                          <span className="text-[9px] text-slate-400 font-semibold">{formatTimeAgo(app.created_at)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 5. AI Career Coach Promo */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-indigo-900/40 rounded-xl p-4 text-center space-y-3.5">
            <div className="flex flex-col items-center">
              <div className="h-10 w-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-2">
                <Sparkles className="h-5 w-5 text-indigo-300" />
              </div>
              <h4 className="text-xs font-extrabold text-white leading-snug">Prepare with AI Coach</h4>
              <p className="text-[10px] text-slate-400 mt-1.5 max-w-[160px] leading-relaxed">
                Mock interview practice with real-time AI feedback on your responses.
              </p>
            </div>
            <Link href="/coach" className="block w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-lg transition-colors cursor-pointer shadow-sm">
              Start Practice Session
            </Link>
          </div>

        </section>

      </main>

    </div>

    {/* GLOBAL FOOTER */}
    <footer className="bg-slate-900 text-white mt-0">
      {/* Top wave divider */}
      <div className="bg-slate-50 h-6 relative">
        <div className="absolute inset-0 bg-slate-900" style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%)' }} />
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-12 pb-8 space-y-12">

        {/* Top row: brand + nav columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand column */}
          <div className="space-y-4 lg:col-span-1">
            <div>
              <h2 className="text-lg font-black tracking-tight text-white">VELIZO</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">International Placements Platform</p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-medium max-w-[220px]">
              Connecting global talent with world-class employers through trusted, verifiable credentials.
            </p>
            {/* Live Platform Stats in Footer */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="text-center">
                <p className="text-base font-black text-white">{stats.candidates.toLocaleString()}</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Candidates</p>
              </div>
              <div className="text-center">
                <p className="text-base font-black text-white">{stats.companies.toLocaleString()}</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Partners</p>
              </div>
              <div className="text-center">
                <p className="text-base font-black text-white">{stats.jobs.toLocaleString()}</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Live Jobs</p>
              </div>
            </div>
          </div>

          {/* Platform links */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Platform</h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Browse Placements', href: '/jobs' },
                { label: 'My Applications', href: '/applications' },
                { label: 'Career Passport', href: '/passport' },
                { label: 'AI Career Coach', href: '/coach' },
                { label: 'Subscription Plans', href: '/subscription' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-xs text-slate-400 hover:text-white font-semibold transition-colors flex items-center gap-1.5 group">
                    <ChevronRight className="h-3 w-3 text-slate-600 group-hover:text-primary transition-colors" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Employers */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">For Employers</h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Post a Placement', href: '/employer/jobs' },
                { label: 'View Applications', href: '/employer/applications' },
                { label: 'Verified Partners Program', href: '/subscription' },
                { label: 'Talent Matching Engine', href: '/home' },
                { label: 'Help Center', href: '/help' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-xs text-slate-400 hover:text-white font-semibold transition-colors flex items-center gap-1.5 group">
                    <ChevronRight className="h-3 w-3 text-slate-600 group-hover:text-primary transition-colors" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact / Social */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Connect</h3>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
                <Mail className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                support@velizo.com
              </li>
              <li className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
                <Globe className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                velizo.com
              </li>
            </ul>
            {/* Social Media Icons */}
            <div className="flex items-center gap-3 pt-1">
              {[
                { icon: MessageCircle, label: 'Twitter', href: '#' },
                { icon: AtSign, label: 'LinkedIn', href: '#' },
                { icon: Share2, label: 'Instagram', href: '#' },
              ].map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>

            {/* App store CTAs */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:border-slate-500 transition-colors cursor-pointer">
                <div className="text-left">
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Coming Soon</p>
                  <p className="text-[11px] font-black text-white">Mobile App</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[10px] text-slate-500 font-semibold">
            © {new Date().getFullYear()} VELIZO International Placements Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
              <button key={item} className="text-[10px] text-slate-500 hover:text-slate-300 font-semibold transition-colors cursor-pointer">
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
    </>
  );
}
