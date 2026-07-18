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
  CheckCircle2,
  Image,
  Video,
  Calendar,
  Newspaper,
  Plus,
  Compass,
  Bookmark,
  Building2,
  Users,
  Search,
  ExternalLink,
  Award,
  Check,
  AlertCircle
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

      // Fetch latest jobs from view
      const { data: jobsData } = await supabase
        .from('jobs_with_companies')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(10);
      if (jobsData) setJobs(jobsData);

      // Fetch platform counts
      const [candRes, compRes, jobRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'candidate'),
        supabase.from('company_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'published')
      ]);

      setStats({
        candidates: candRes.count || 0,
        companies: compRes.count || 0,
        jobs: jobRes.count || 0
      });

      setLoading(false);
    };

    fetchSessionAndProfile();
  }, [router]);



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

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {isCandidate ? (
                      <>
                        <div className="flex items-center gap-2.5 p-3.5 rounded-xl border border-slate-150 bg-white shadow-3xs">
                          <CheckCircle2 className={`h-4.5 w-4.5 shrink-0 ${passport?.identity_verified ? 'text-emerald-500' : 'text-slate-300'}`} />
                          <span className="text-[10px] font-extrabold text-slate-705">Identity Check</span>
                        </div>
                        <div className="flex items-center gap-2.5 p-3.5 rounded-xl border border-slate-150 bg-white shadow-3xs">
                          <CheckCircle2 className={`h-4.5 w-4.5 shrink-0 ${passport?.education_verified ? 'text-emerald-500' : 'text-slate-300'}`} />
                          <span className="text-[10px] font-extrabold text-slate-705">Education Details</span>
                        </div>
                        <div className="flex items-center gap-2.5 p-3.5 rounded-xl border border-slate-150 bg-white shadow-3xs">
                          <CheckCircle2 className={`h-4.5 w-4.5 shrink-0 ${passport?.employment_verified ? 'text-emerald-500' : 'text-slate-300'}`} />
                          <span className="text-[10px] font-extrabold text-slate-705">Employment History</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2.5 p-3.5 rounded-xl border border-slate-150 bg-white shadow-3xs">
                          <CheckCircle2 className={`h-4.5 w-4.5 shrink-0 ${company?.is_verified ? 'text-emerald-500' : 'text-slate-300'}`} />
                          <span className="text-[10px] font-extrabold text-slate-705">Corporate Details</span>
                        </div>
                        <div className="flex items-center gap-2.5 p-3.5 rounded-xl border border-slate-150 bg-white shadow-3xs">
                          <CheckCircle2 className={`h-4.5 w-4.5 shrink-0 ${company?.website ? 'text-emerald-500' : 'text-slate-300'}`} />
                          <span className="text-[10px] font-extrabold text-slate-705">Website Linked</span>
                        </div>
                        <div className="flex items-center gap-2.5 p-3.5 rounded-xl border border-slate-150 bg-white shadow-3xs">
                          <CheckCircle2 className={`h-4.5 w-4.5 shrink-0 ${company?.description ? 'text-emerald-500' : 'text-slate-300'}`} />
                          <span className="text-[10px] font-extrabold text-slate-705">Business Summary</span>
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
          {jobs.map((job) => (
            <div key={job.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              {/* Post Header */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-50 border border-blue-150 flex items-center justify-center text-primary font-bold shrink-0">
                    {job.logo_url ? (
                      <img src={job.logo_url} alt={job.company_name} className="h-full w-full rounded-full object-cover" />
                    ) : (
                      job.company_name ? job.company_name.charAt(0).toUpperCase() : 'C'
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                      {job.company_name || 'Anonymous Recruiter'} 
                      <span className="text-[10px] font-bold text-slate-400">• Verified Partner</span>
                    </h3>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                      Just posted an opening in {job.department || job.category}
                    </p>
                  </div>
                </div>
                <span className="text-[9px] font-bold text-slate-450 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                  {job.remote_type}
                </span>
              </div>

              {/* Post Text */}
              <p className="text-xs text-slate-650 leading-relaxed font-medium">
                {job.description}
              </p>

              {/* Job Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/50 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
                      <ShieldCheck className="h-3 w-3 text-teal-600" />
                      95% Match Score
                    </span>
                    {job.skills_required && job.skills_required.slice(0, 3).map((skill: string) => (
                      <span key={skill} className="text-[9px] font-bold text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-900">{job.title}</h4>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    {job.company_name} • {job.city || job.country}
                  </p>
                  <p className="text-[11px] text-primary font-extrabold">
                    {job.salary_min && job.salary_max 
                      ? `$${Number(job.salary_min).toLocaleString()} - $${Number(job.salary_max).toLocaleString()} ${job.currency || 'CAD'}`
                      : 'Salary Competitive'}
                  </p>
                </div>
                <Link href={`/jobs`} className="px-3.5 py-2 bg-primary hover:bg-[#084e96] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer">
                  Apply Now <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}

        </section>

        {/* ─── COLUMN 3: RIGHT SIDEBAR NEWS & IMMIGRATION (1/4) ────── */}
        <section className="lg:col-span-1 space-y-4 lg:h-[calc(100vh-5.5rem)] lg:overflow-y-auto pb-6 pl-1 custom-scrollbar">
          
          {/* Live Platform Stats Widget */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="h-4.5 w-4.5 text-slate-500" />
              <h3 className="text-xs font-extrabold text-slate-900 tracking-tight uppercase">
                Platform Statistics
              </h3>
            </div>

            <div className="space-y-3 text-xs font-semibold text-slate-500">
              <div className="flex justify-between items-center py-0.5">
                <span>Active Candidates</span>
                <span className="text-slate-800 font-bold">{stats.candidates}</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span>Sponsor Partners</span>
                <span className="text-slate-800 font-bold">{stats.companies}</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span>Live Tech Jobs</span>
                <span className="text-slate-800 font-bold">{stats.jobs}</span>
              </div>
            </div>
          </div>

          {/* Global Immigration News Widget */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Newspaper className="h-4.5 w-4.5 text-slate-500" />
              <h3 className="text-xs font-extrabold text-slate-900 tracking-tight uppercase">
                Immigration & Career News
              </h3>
            </div>

            <div className="space-y-3">
              <div className="group cursor-pointer">
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-primary leading-snug transition-colors line-clamp-2">
                  Global tech sectors expand international sponsor tracks
                </h4>
                <p className="text-[9px] text-slate-400 font-semibold mt-1">3 days ago • 1.2K readers</p>
              </div>
              
              <div className="group cursor-pointer">
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-primary leading-snug transition-colors line-clamp-2">
                  How Trust Scores speed up work permits
                </h4>
                <p className="text-[9px] text-slate-400 font-semibold mt-1">1 day ago • 5.4K readers</p>
              </div>

              <div className="group cursor-pointer">
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-primary leading-snug transition-colors line-clamp-2">
                  Global tech visa pathways update for remote developers
                </h4>
                <p className="text-[9px] text-slate-400 font-semibold mt-1">4 days ago • 912 readers</p>
              </div>

              <div className="group cursor-pointer">
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-primary leading-snug transition-colors line-clamp-2">
                  Verifiable credentials: The new standard in tech recruitment
                </h4>
                <p className="text-[9px] text-slate-400 font-semibold mt-1">6h ago • 345 readers</p>
              </div>
            </div>
          </div>

          {/* Sponsor card / Promo */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center space-y-3.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block text-right">ad</span>
            <div className="flex flex-col items-center">
              <Sparkles className="h-6 w-6 text-purple-500 mb-2" />
              <h4 className="text-xs font-extrabold text-slate-900 leading-snug">Prepare with AI</h4>
              <p className="text-[10px] text-slate-500 mt-1 max-w-[180px] leading-relaxed">
                Mock interview practice with real-time feedback.
              </p>
            </div>
            <Link href="/coach" className="block w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer">
              Start Practice
            </Link>
          </div>

        </section>

      </main>

    </div>
  );
}
