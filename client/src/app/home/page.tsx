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
  Award
} from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/layout/Header';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [candidate, setCandidate] = useState<any>(null);
  const [passport, setPassport] = useState<any>(null);
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
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-4 grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch lg:h-[calc(100vh-3.5rem)] lg:overflow-hidden">
        
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

            {/* Profile Statistics */}
            <div className="border-t border-slate-100 py-3 text-xs text-slate-500 font-semibold space-y-2">
              <div className="flex justify-between px-4 hover:bg-slate-50 py-1 transition-colors">
                <span>Profile views</span>
                <span className="text-primary font-extrabold">142</span>
              </div>
              <div className="flex justify-between px-4 hover:bg-slate-50 py-1 transition-colors">
                <span>Connection index</span>
                <span className="text-primary font-extrabold">34</span>
              </div>

              {isCandidate && passport && (
                <div className="px-4 pt-2 border-t border-slate-100 space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span>Passport Trust Score</span>
                    <span className="text-teal-600 font-bold">{passport.trust_score}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-teal-500 h-full rounded-full" 
                      style={{ width: `${passport.trust_score}%` }} 
                    />
                  </div>
                </div>
              )}
            </div>

            {/* My Items Link */}
            <div className="border-t border-slate-100 p-3 bg-slate-50 hover:bg-slate-100 transition-colors text-center">
              <Link 
                href={isCandidate ? "/passport" : "/employer/jobs"} 
                className="text-[11px] font-bold text-primary flex items-center justify-center gap-1.5"
              >
                {isCandidate ? (
                  <>
                    <FileCheck className="h-3.5 w-3.5" />
                    <span>Manage Career Passport</span>
                  </>
                ) : (
                  <>
                    <Briefcase className="h-3.5 w-3.5" />
                    <span>Manage Posted Jobs</span>
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
              <span>Explore Active Placements</span>
            </Link>
            {isCandidate && (
              <Link href="/coach" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span>AI Interview Coaching</span>
              </Link>
            )}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[10px] text-slate-400">
              <Award className="h-4 w-4 text-yellow-600" />
              <span>Verified Credential Protocol</span>
            </div>
          </div>
        </section>

        {/* ─── COLUMN 2 & 3: CENTER FEED (2/4) ────────────────────── */}
        <section className="lg:col-span-2 space-y-4 lg:h-[calc(100vh-5.5rem)] lg:overflow-y-auto pb-6 px-1 custom-scrollbar">
          
          {/* Welcome & Quick Actions Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}! <span className="inline-block animate-bounce">👋</span>
              </h3>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">
                {isCandidate 
                  ? "Here are your workspace tools to accelerate your global placement journey." 
                  : "Recruitment manager dashboard controls to post and approve placements."}
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {isCandidate ? (
                <>
                  <Link href="/passport" className="flex flex-col items-center justify-center p-3 rounded-xl bg-teal-50/50 hover:bg-teal-50 border border-teal-100 hover:border-teal-200 text-center transition-all group cursor-pointer">
                    <ShieldCheck className="h-5 w-5 text-teal-600 mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-bold text-teal-850">Verify Passport</span>
                  </Link>
                  <Link href="/coach" className="flex flex-col items-center justify-center p-3 rounded-xl bg-purple-50/50 hover:bg-purple-50 border border-purple-100 hover:border-purple-200 text-center transition-all group cursor-pointer">
                    <Sparkles className="h-5 w-5 text-purple-600 mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-bold text-purple-855">AI Coach</span>
                  </Link>
                  <Link href="/jobs" className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-50/50 hover:bg-blue-50 border border-blue-100 hover:border-blue-200 text-center transition-all group cursor-pointer">
                    <Briefcase className="h-5 w-5 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-bold text-blue-850">Browse Jobs</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/employer/jobs" className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-50/50 hover:bg-blue-50 border border-blue-100 hover:border-blue-200 text-center transition-all group cursor-pointer">
                    <Plus className="h-5 w-5 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-bold text-blue-850">Post a Job</span>
                  </Link>
                  <Link href="/employer/applications" className="flex flex-col items-center justify-center p-3 rounded-xl bg-teal-50/50 hover:bg-teal-50 border border-teal-100 hover:border-teal-200 text-center transition-all group cursor-pointer">
                    <Users className="h-5 w-5 text-teal-600 mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-bold text-teal-850">View Candidates</span>
                  </Link>
                  <Link href="/employer/jobs" className="flex flex-col items-center justify-center p-3 rounded-xl bg-purple-50/50 hover:bg-purple-50 border border-purple-100 hover:border-purple-200 text-center transition-all group cursor-pointer">
                    <Briefcase className="h-5 w-5 text-purple-600 mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-bold text-purple-850">Manage Jobs</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Feed Pinned Post: Welcome Announcement */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-50 border border-blue-100 text-primary flex items-center justify-center shrink-0">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    VELIZO Platform <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                  </h3>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">System Update • Pinned</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-650 leading-relaxed font-medium">
              Welcome to the new VELIZO workspace! We have upgraded the verification engine to synchronize with standard global employer trust rules. Complete your Education and Employment history to trigger automatic verification requests.
            </p>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 flex flex-col justify-center items-center text-center p-6 text-white">
                <Award className="h-8 w-8 text-yellow-400 mb-2" />
                <h4 className="text-sm font-extrabold uppercase tracking-widest">Verify Your Credentials</h4>
                <p className="text-[10px] text-blue-100 mt-1 max-w-xs leading-relaxed">
                  Verified profiles receive 10x higher response rates from international employers.
                </p>
              </div>
              <div className="p-4 bg-slate-50 flex justify-between items-center text-xs font-bold">
                <span className="text-slate-600">Verification Steps Checklist</span>
                <Link href="/passport" className="text-primary hover:underline flex items-center gap-1">
                  Start Verification <ChevronRight className="h-3.5 w-3.5" />
                </Link>
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
