'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Search, 
  LogOut, 
  Bell, 
  ShieldCheck, 
  Briefcase, 
  ClipboardList, 
  MessageSquare,
  Compass, 
  Menu, 
  X, 
  ArrowRight, 
  ChevronRight, 
  Users,
  Building2,
  ExternalLink,
  Plus,
  Info,
  Compass as HomeIcon
} from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Search and Suggestions states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ jobs: any[], companies: any[] }>({ jobs: [], companies: [] });
  const [recommendations, setRecommendations] = useState<any[]>([]);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Session and Profile Tracking
  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      
      if (currentSession?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentSession.user.id)
          .single();
        
        if (profileData) {
          setProfile(profileData);
          fetchRecommendations(profileData);
        }
      }
      setLoading(false);
    };

    fetchSessionAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      setSession(currentSession);
      if (currentSession?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentSession.user.id)
          .single();
        if (profileData) {
          setProfile(profileData);
          fetchRecommendations(profileData);
        }
      } else {
        setProfile(null);
        setRecommendations([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Fetch personalized job recommendations from database
  const fetchRecommendations = async (profileData: any) => {
    if (!profileData) return;
    
    try {
      let query = supabase
        .from('jobs_with_companies')
        .select('*')
        .eq('status', 'published');

      if (profileData.role === 'candidate') {
        const { data: candidateData } = await supabase
          .from('candidates')
          .select('preferred_job_categories')
          .eq('id', profileData.id)
          .single();

        if (candidateData?.preferred_job_categories?.length) {
          // Filter jobs matching candidate preferred categories
          query = query.in('category', candidateData.preferred_job_categories);
        }
      }

      const { data: recommendedJobs } = await query.limit(3);
      if (recommendedJobs && recommendedJobs.length > 0) {
        setRecommendations(recommendedJobs);
      } else {
        // Fallback to general latest jobs
        const { data: fallbackJobs } = await supabase
          .from('jobs_with_companies')
          .select('*')
          .eq('status', 'published')
          .limit(3);
        if (fallbackJobs) setRecommendations(fallbackJobs);
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    }
  };

  // 3. Dynamic Database Autocomplete Search
  const handleSearchChange = async (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults({ jobs: [], companies: [] });
      return;
    }

    try {
      // Query jobs in database matching query term
      const { data: jobMatches } = await supabase
        .from('jobs_with_companies')
        .select('*')
        .eq('status', 'published')
        .or(`title.ilike.%${val}%,category.ilike.%${val}%,company_name.ilike.%${val}%`)
        .limit(5);

      // Query companies matching query term
      const { data: companyMatches } = await supabase
        .from('company_profiles')
        .select('*')
        .or(`company_name.ilike.%${val}%,industry.ilike.%${val}%`)
        .limit(3);

      setSearchResults({
        jobs: jobMatches || [],
        companies: companyMatches || []
      });
    } catch (err) {
      console.error('Search query error:', err);
    }
  };

  // Keyboard shortcut listener for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-focus input when search panel opens
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const nameInitial = profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U';
  const isCandidate = profile?.role === 'candidate';

  return (
    <>
      {/* ─── MAIN NAV HEADER ────────────────────────────────────── */}
      <header className="w-full border-b border-slate-200 bg-white sticky top-0 z-45 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          
          {/* Logo & Search Trigger (Left side on Desktop, Logo only on Mobile) */}
          <div className="flex items-center gap-3 shrink-0 md:flex-1 md:max-w-md">
            <Link href={session ? "/home" : "/"} className="flex items-center gap-1.5 shrink-0 group">
              <img src="/logo-v.svg" alt="VELIZO" className="h-8 w-auto filter drop-shadow-[0_2px_8px_rgba(10,102,194,0.15)] group-hover:scale-105 transition-transform" />
              <span className="text-sm font-extrabold tracking-tight hidden sm:inline-block">
                VELI<span className="text-primary font-black">ZO</span>
              </span>
            </Link>
            
            {/* Desktop Search Trigger */}
            <div 
              onClick={() => setIsSearchOpen(true)}
              className="relative w-full hidden md:block cursor-pointer"
            >
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold">
                <Search className="h-4 w-4" />
              </span>
              <div className="w-full bg-[#EDF3F8]/80 pl-9 pr-14 py-1.5 rounded text-xs font-semibold text-slate-550 border border-transparent hover:bg-[#E1E9F0]/80 transition-colors flex items-center justify-between">
                <span>Search jobs, companies...</span>
                <span className="bg-white text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded text-[9px] font-bold shadow-2xs">
                  Ctrl K
                </span>
              </div>
            </div>
          </div>

          {/* Centered Search Trigger (Mobile Only - fits between Logo and Avatar) */}
          <div 
            onClick={() => setIsSearchOpen(true)}
            className="flex-1 max-w-xs md:hidden cursor-pointer"
          >
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400">
                <Search className="h-3.5 w-3.5" />
              </span>
              <div className="w-full bg-[#EDF3F8]/80 pl-8 pr-2 py-1.5 rounded-lg text-[10px] font-semibold text-slate-500 border border-transparent flex items-center justify-between">
                <span className="truncate">Search jobs...</span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Desktop Navigation Links & Desktop Profile Avatar */}
          <div className="hidden md:flex items-center gap-6">
            {session ? (
              // ─── AUTHENTICATED DESKTOP NAVBAR LINKS ───
              <>
                <Link href="/home" className={`flex flex-col items-center justify-center px-2 h-14 shrink-0 transition-colors ${
                  pathname === '/home' ? 'text-primary border-b-2 border-primary font-bold' : 'text-slate-500 hover:text-slate-805'
                }`}>
                  <HomeIcon className="h-5 w-5" />
                  <span className="text-[9px] font-bold mt-0.5">Home</span>
                </Link>
                
                {isCandidate ? (
                  <>
                    <Link href="/jobs" className={`flex flex-col items-center justify-center px-2 h-14 shrink-0 transition-colors ${
                      pathname === '/jobs' ? 'text-primary border-b-2 border-primary font-bold' : 'text-slate-500 hover:text-slate-805'
                    }`}>
                      <Briefcase className="h-5 w-5" />
                      <span className="text-[9px] font-bold mt-0.5">Jobs</span>
                    </Link>
                    <Link href="/applications" className={`flex flex-col items-center justify-center px-2 h-14 shrink-0 transition-colors ${
                      pathname === '/applications' ? 'text-primary border-b-2 border-primary font-bold' : 'text-slate-500 hover:text-slate-805'
                    }`}>
                      <ClipboardList className="h-5 w-5" />
                      <span className="text-[9px] font-bold mt-0.5">Applications</span>
                    </Link>
                    <Link href="/messages" className={`flex flex-col items-center justify-center px-2 h-14 shrink-0 transition-colors ${
                      pathname === '/messages' ? 'text-primary border-b-2 border-primary font-bold' : 'text-slate-500 hover:text-slate-805'
                    }`}>
                      <MessageSquare className="h-5 w-5" />
                      <span className="text-[9px] font-bold mt-0.5">Messages</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/employer/jobs" className={`flex flex-col items-center justify-center px-2 h-14 shrink-0 transition-colors ${
                      pathname.startsWith('/employer/jobs') ? 'text-primary border-b-2 border-primary font-bold' : 'text-slate-500 hover:text-slate-805'
                    }`}>
                      <Briefcase className="h-5 w-5" />
                      <span className="text-[9px] font-bold mt-0.5">Post Job</span>
                    </Link>
                    <Link href="/employer/applications" className={`flex flex-col items-center justify-center px-2 h-14 shrink-0 transition-colors ${
                      pathname.startsWith('/employer/applications') ? 'text-primary border-b-2 border-primary font-bold' : 'text-slate-500 hover:text-slate-805'
                    }`}>
                      <Users className="h-5 w-5" />
                      <span className="text-[9px] font-bold mt-0.5">Candidates</span>
                    </Link>
                    <Link href="/messages" className={`flex flex-col items-center justify-center px-2 h-14 shrink-0 transition-colors ${
                      pathname === '/messages' ? 'text-primary border-b-2 border-primary font-bold' : 'text-slate-500 hover:text-slate-805'
                    }`}>
                      <MessageSquare className="h-5 w-5" />
                      <span className="text-[9px] font-bold mt-0.5">Messages</span>
                    </Link>
                  </>
                )}

                {/* Notifications & Profile Avatar & Log Out (Desktop) */}
                <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
                  {/* Notifications Icon */}
                  <Link href="/notifications" className="relative p-1.5 text-slate-550 hover:text-slate-805 hover:bg-slate-50 rounded-full transition-colors shrink-0" title="Notifications">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                  </Link>

                  <Link 
                    href={isCandidate ? "/passport" : "/home"}
                    className="flex items-center gap-2 hover:opacity-90 transition-opacity shrink-0"
                    title="View Profile"
                  >
                    <div className="h-8 w-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-primary text-xs font-bold shrink-0 overflow-hidden shadow-2xs">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="avatar" className="h-full w-full object-cover" />
                      ) : nameInitial}
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] font-extrabold text-slate-800 block leading-tight truncate max-w-[80px]">
                        {profile?.full_name || 'User'}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 block capitalize leading-none mt-0.5">
                        Profile
                      </span>
                    </div>
                  </Link>
                  
                  <button 
                    onClick={handleSignOut}
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-red-650 transition-colors cursor-pointer shrink-0"
                    title="Log Out"
                  >
                    <LogOut className="h-4.5 w-4.5" />
                  </button>
                </div>
              </>
            ) : (
              // ─── GUEST/UNAUTHENTICATED PUBLIC LINKS ───
              <div className="flex items-center gap-2">
                <Link href="/auth/login" className="text-xs font-bold text-slate-655 hover:text-slate-900 px-2">
                  Sign In
                </Link>
                <Link 
                  href="/auth/register" 
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-primary hover:bg-[#084e96] transition-all flex items-center gap-1 shrink-0"
                >
                  Create Account <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE PROFILE AVATAR (Right side on Mobile, links directly to Profile/Passport, no dropdown) */}
          {session && (
            <div className="md:hidden flex items-center gap-2">
              <Link href="/notifications" className="relative p-1 text-slate-500" title="Notifications">
                <Bell className="h-4.5 w-4.5" />
                <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 bg-red-500 rounded-full"></span>
              </Link>
              <Link 
                href={isCandidate ? "/passport" : "/home"}
                className="h-8 w-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-primary text-xs font-bold shrink-0 overflow-hidden shadow-2xs cursor-pointer"
                title="View Profile"
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="avatar" className="h-full w-full object-cover" />
                ) : nameInitial}
              </Link>
            </div>
          )}

        </div>
      </header>

      {/* ─── DYNAMIC SEARCH OVERLAY ──────────────────────────────── */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center p-4 pt-16 sm:pt-28">
          <div 
            ref={modalRef}
            className="bg-white max-w-2xl w-full rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-scaleUp"
          >
            {/* Modal Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center text-primary">
                  <Search className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900">VELIZO Dynamic Workspace Search</h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">Search database records for jobs and partner companies</p>
                </div>
              </div>
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-655 transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Main Search Input */}
            <div className="p-4 border-b border-slate-100 flex items-center gap-3">
              <Search className="h-5 w-5 text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Type to search jobs, categories, or companies..."
                className="w-full text-xs font-medium text-slate-800 outline-none border-none placeholder-slate-400 bg-transparent"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>

            {/* Autocomplete Layout */}
            <div className="flex-1 overflow-y-auto max-h-[350px] custom-scrollbar">
              
              {/* DATABASE SEARCH RESULTS */}
              {searchQuery ? (
                <div className="p-4 space-y-4">
                  {/* Job Matches */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5 text-slate-400" /> Matching Placements
                    </h4>
                    {searchResults.jobs.length === 0 ? (
                      <p className="text-[10px] text-slate-455 italic pl-1.5">No jobs match your query.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {searchResults.jobs.map((job) => (
                          <Link 
                            key={job.id} 
                            href="/jobs" 
                            onClick={() => setIsSearchOpen(false)}
                            className="flex justify-between items-center p-2 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-150 transition-colors group cursor-pointer"
                          >
                            <div>
                              <span className="text-[11px] font-bold text-slate-800 group-hover:text-primary transition-colors block">
                                {job.title}
                              </span>
                              <span className="text-[9px] text-slate-455 font-bold block mt-0.5">
                                {job.company_name} • {job.city || job.country} • {job.category}
                              </span>
                            </div>
                            <span className="text-[9px] font-extrabold text-primary flex items-center gap-0.5">
                              Apply <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Company Matches */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" /> Partner Companies
                    </h4>
                    {searchResults.companies.length === 0 ? (
                      <p className="text-[10px] text-slate-455 italic pl-1.5">No companies match your query.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {searchResults.companies.map((comp) => (
                          <div 
                            key={comp.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-150 transition-colors cursor-pointer"
                          >
                            <div>
                              <span className="text-[11px] font-bold text-slate-800 block">
                                {comp.company_name}
                              </span>
                              <span className="text-[9px] text-slate-455 font-bold block mt-0.5">
                                {comp.industry} • {comp.city || comp.country} • {comp.company_size}
                              </span>
                            </div>
                            {comp.website && (
                              <a 
                                href={comp.website} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-[9px] font-extrabold text-slate-500 hover:text-primary flex items-center gap-0.5"
                              >
                                Website <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* PERSONALIZED RECOMMENDATIONS (Empty Query) */
                <div className="p-5 space-y-6">
                  {recommendations.length > 0 && (
                    <div className="space-y-2.5">
                      <h4 className="text-[10px] font-extrabold text-teal-700 bg-teal-50 border border-teal-100/50 px-2.5 py-1 rounded-lg w-fit uppercase tracking-widest flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-teal-650" /> Recommended For You
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold pl-1.5">
                        Job placements matching your target role and categories:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {recommendations.map((job) => (
                          <Link 
                            key={job.id} 
                            href="/jobs" 
                            onClick={() => setIsSearchOpen(false)}
                            className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 hover:border-teal-200 transition-all flex flex-col justify-between h-[110px] group cursor-pointer"
                          >
                            <div>
                              <span className="text-[10px] font-extrabold text-slate-500 block truncate uppercase tracking-wider leading-none mb-1">
                                {job.company_name}
                              </span>
                              <h4 className="text-[11px] font-extrabold text-slate-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                                {job.title}
                              </h4>
                            </div>
                            <span className="text-[9px] font-bold text-slate-450 block mt-2">
                              {job.city || job.country} • {job.remote_type}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-155 flex justify-between items-center text-[10px] text-slate-455 font-bold px-4">
              <span className="flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-slate-400" />
                <span>Tip: Press <kbd className="bg-slate-200 px-1 py-0.5 rounded text-[9px] font-bold text-slate-600 border border-slate-300">Esc</kbd> to exit search</span>
              </span>
              {searchQuery && (
                <button 
                  onClick={() => { setSearchQuery(''); setSearchResults({ jobs: [], companies: [] }); }}
                  className="text-slate-500 hover:text-slate-805 font-bold hover:underline cursor-pointer"
                >
                  Clear search
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ─── MOBILE BOTTOM NAVIGATION BAR ────────────────────────── */}
      {session && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] h-16 flex items-center justify-around px-2 md:hidden">
          {/* Home */}
          <Link 
            href="/home" 
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-colors cursor-pointer ${
              pathname === '/home' ? 'text-primary font-bold' : 'text-slate-500 hover:text-primary'
            }`}
          >
            <HomeIcon className="h-5 w-5" />
            <span className="text-[9px] font-bold mt-1">Home</span>
          </Link>

          {/* Jobs */}
          {isCandidate ? (
            <Link 
              href="/jobs" 
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-colors cursor-pointer ${
                pathname === '/jobs' ? 'text-primary font-bold' : 'text-slate-500 hover:text-primary'
              }`}
            >
              <Briefcase className="h-5 w-5" />
              <span className="text-[9px] font-bold mt-1">Jobs</span>
            </Link>
          ) : (
            <Link 
              href="/employer/jobs" 
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-colors cursor-pointer ${
                pathname.startsWith('/employer/jobs') ? 'text-primary font-bold' : 'text-slate-500 hover:text-primary'
              }`}
            >
              <Plus className="h-5 w-5" />
              <span className="text-[9px] font-bold mt-1">Post Job</span>
            </Link>
          )}

          {/* Applications / Candidates */}
          {isCandidate ? (
            <Link 
              href="/applications" 
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-colors cursor-pointer ${
                pathname === '/applications' ? 'text-primary font-bold' : 'text-slate-500 hover:text-primary'
              }`}
            >
              <ClipboardList className="h-5 w-5" />
              <span className="text-[9px] font-bold mt-1">Applications</span>
            </Link>
          ) : (
            <Link 
              href="/employer/applications" 
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-colors cursor-pointer ${
                pathname.startsWith('/employer/applications') ? 'text-primary font-bold' : 'text-slate-500 hover:text-primary'
              }`}
            >
              <Users className="h-5 w-5" />
              <span className="text-[9px] font-bold mt-1">Candidates</span>
            </Link>
          )}

          {/* Messages */}
          <Link 
            href="/messages" 
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-colors cursor-pointer ${
              pathname === '/messages' ? 'text-primary font-bold' : 'text-slate-500 hover:text-primary'
            }`}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="text-[9px] font-bold mt-1">Messages</span>
          </Link>
        </nav>
      )}

      {/* Styled Animations CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-slideDown {
          animation: slideDown 0.25s ease-out forwards;
        }
        .animate-scaleUp {
          animation: scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </>
  );
}
