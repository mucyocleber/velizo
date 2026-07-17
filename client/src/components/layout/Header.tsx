'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Search, 
  Sparkles, 
  LogOut, 
  Bell, 
  ShieldCheck, 
  Briefcase, 
  FileCheck, 
  Compass, 
  Menu, 
  X, 
  ArrowRight, 
  ChevronRight, 
  Loader2,
  Info,
  HelpCircle,
  Users,
  Building2,
  ExternalLink,
  Plus,
  Compass as HomeIcon
} from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Mobile drawer state
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Search and Suggestions states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ jobs: any[], companies: any[] }>({ jobs: [], companies: [] });
  const [recommendations, setRecommendations] = useState<any[]>([]);
  
  // AI assistant states
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'ai'>('search'); // Switch between normal search and AI chat
  
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
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

  // Dropdown click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
    setIsMobileOpen(false);
  };

  // 4. Query VELIZO AI Assistant
  const handleAskVELIZO = async (queryText?: string) => {
    const textToSend = queryText || searchQuery;
    if (!textToSend.trim()) return;

    setActiveTab('ai'); // Switch UI to AI Response panel
    setAiLoading(true);
    setAiResponse('');
    
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    try {
      const res = await fetch(`${API_BASE}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: textToSend,
          context: profile ? `User role: ${profile.role}, Full Name: ${profile.full_name}, Email: ${profile.email}` : ''
        })
      });

      const data = await res.json();
      if (data.success && data.data?.message) {
        setAiResponse(data.data.message);
      } else {
        setAiResponse(data.error?.message || 'Error: Failed to obtain response from VELIZO AI Assistant.');
      }
    } catch (err) {
      console.error('VELIZO AI chat error:', err);
      setAiResponse('VELIZO AI Assistant is offline. Please verify that your backend server is running on port 5000.');
    } finally {
      setAiLoading(false);
    }
  };

  const nameInitial = profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U';
  const isCandidate = profile?.role === 'candidate';

  const suggestions = [
    {
      title: 'Sponsorship Finder',
      query: 'Find international tech jobs with visa sponsorship and relocation support',
      desc: 'Ask AI for verified sponsor hiring tracks'
    },
    {
      title: 'Immigration Pathways',
      query: 'Explain fast-track global work permit options for tech professionals',
      desc: 'Get relocation visa requirements instantly'
    },
    {
      title: 'Trust Score Criteria',
      query: 'How do I complete my Career Passport to get verified?',
      desc: 'Steps to reach 100% profile score'
    }
  ];

  return (
    <>
      {/* ─── MAIN NAV HEADER ────────────────────────────────────── */}
      <header className="w-full border-b border-slate-200 bg-white sticky top-0 z-45 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          
          {/* 1. LEFT SIDE: LOGO */}
          <div className="flex-none w-36 sm:w-44 flex items-center">
            <Link href={session ? "/home" : "/"} className="flex items-center gap-1.5 group">
              <img src="/logo-v.svg" alt="VELIZO" className="h-8 w-auto filter drop-shadow-[0_2px_8px_rgba(10,102,194,0.15)] group-hover:scale-105 transition-transform" />
              <span className="text-sm font-extrabold tracking-tight hidden xs:inline-block">
                VELI<span className="text-primary font-black">ZO</span>
              </span>
            </Link>
          </div>

          {/* 2. CENTER: CENTERED SLEEK SEARCH BAR */}
          <div className="flex-1 max-w-lg">
            <div 
              onClick={() => setIsSearchOpen(true)}
              className="relative w-full cursor-pointer"
            >
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <div className="w-full bg-[#EDF3F8]/70 hover:bg-[#E1E9F0]/80 pl-9 pr-14 py-1.5 rounded-lg text-xs font-semibold text-slate-500 border border-slate-200/50 transition-all flex items-center justify-between shadow-xs">
                <span className="truncate">Search jobs, companies, ask AI...</span>
                <span className="hidden sm:inline-block bg-white text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded text-[9px] font-bold shadow-2xs">
                  Ctrl K
                </span>
              </div>
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-purple-600">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              </span>
            </div>
          </div>

          {/* 3. RIGHT SIDE: USER PROFILE AVATAR OR PUBLIC ACTIONS */}
          <div className="flex-none w-36 sm:w-44 flex items-center justify-end">
            {session ? (
              <div className="relative" ref={profileDropdownRef}>
                {/* Avatar Button */}
                <button 
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-primary text-xs font-bold shrink-0 overflow-hidden shadow-2xs">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="avatar" className="h-full w-full object-cover" />
                    ) : nameInitial}
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 rotate-90 hidden sm:block" />
                </button>

                {/* Modern Dropdown Card */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-3 px-2 z-50 animate-scaleUp">
                    {/* User info */}
                    <div className="px-3 py-2 border-b border-slate-100 flex items-start gap-2.5">
                      <div className="h-10 w-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-primary text-sm font-extrabold shrink-0 overflow-hidden">
                        {profile?.avatar_url ? (
                          <img src={profile.avatar_url} alt="avatar" className="h-full w-full object-cover" />
                        ) : nameInitial}
                      </div>
                      <div className="text-left overflow-hidden">
                        <span className="text-xs font-extrabold text-slate-800 block truncate leading-tight">
                          {profile?.full_name || 'User'}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 block capitalize leading-none mt-0.5">
                          {profile?.role === 'candidate' ? 'Job Seeker' : 'Employer'}
                        </span>
                        <span className="text-[9px] text-slate-400 truncate block mt-1 font-semibold">
                          {profile?.email}
                        </span>
                      </div>
                    </div>

                    {/* Navigation shortcuts (Quick access) */}
                    <div className="py-2 border-b border-slate-100 text-xs font-semibold">
                      <Link 
                        href="/home" 
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-slate-655 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        <HomeIcon className="h-4 w-4 text-slate-450" />
                        <span>Home Workspace</span>
                      </Link>
                      
                      {isCandidate ? (
                        <>
                          <Link 
                            href="/passport" 
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-slate-655 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                          >
                            <FileCheck className="h-4 w-4 text-slate-455" />
                            <span>Career Passport</span>
                          </Link>
                          <Link 
                            href="/jobs" 
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-slate-655 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                          >
                            <Briefcase className="h-4 w-4 text-slate-455" />
                            <span>Browse Jobs</span>
                          </Link>
                          <Link 
                            href="/coach" 
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-slate-655 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                          >
                            <Sparkles className="h-4 w-4 text-purple-500" />
                            <span>AI Interview Coach</span>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link 
                            href="/employer/jobs" 
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-slate-655 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                          >
                            <Briefcase className="h-4 w-4 text-slate-455" />
                            <span>Manage Placements</span>
                          </Link>
                          <Link 
                            href="/employer/applications" 
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-slate-655 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                          >
                            <Users className="h-4 w-4 text-slate-455" />
                            <span>Candidate Applications</span>
                          </Link>
                        </>
                      )}
                    </div>

                    {/* Log out */}
                    <div className="pt-2">
                      <button 
                        onClick={handleSignOut}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // ─── GUEST/UNAUTHENTICATED PUBLIC LINKS ───
              <div className="flex items-center gap-2">
                <Link href="/auth/login" className="text-xs font-bold text-slate-655 hover:text-slate-950 px-2 shrink-0">
                  Sign In
                </Link>
                <Link 
                  href="/auth/register" 
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-primary hover:bg-[#084e96] transition-all flex items-center gap-1 shrink-0 shadow-sm"
                >
                  Join <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* ─── DYNAMIC SEARCH & VELIZO AI ASSISTANT OVERLAY ────────── */}
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
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">Search database records or consult the VELIZO AI Assistant</p>
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
                placeholder="Search jobs, categories, companies, or type AI questions..."
                className="w-full text-xs font-medium text-slate-800 outline-none border-none placeholder-slate-400 bg-transparent"
                value={searchQuery}
                onChange={(e) => {
                  setActiveTab('search'); // Reset back to search tab when typing
                  handleSearchChange(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (searchQuery.trim()) {
                      handleAskVELIZO();
                    }
                  }
                }}
              />
              <button
                onClick={() => handleAskVELIZO()}
                disabled={aiLoading || !searchQuery.trim()}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-750 disabled:opacity-50 text-white text-[10px] font-bold rounded-lg transition-all shrink-0 flex items-center gap-1 cursor-pointer"
                title="Query the AI assistant"
              >
                <Sparkles className="h-3 w-3" /> Ask VELIZO AI
              </button>
            </div>

            {/* Autocomplete / Tab Selection Layout */}
            <div className="flex-1 overflow-y-auto max-h-[350px] custom-scrollbar">
              
              {/* Tab Navigation (Search Results vs AI chat response) */}
              {searchQuery && (
                <div className="flex border-b border-slate-150 px-4 bg-slate-50/50">
                  <button 
                    onClick={() => setActiveTab('search')}
                    className={`py-2 px-3 text-[10px] font-bold border-b-2 transition-all ${
                      activeTab === 'search' 
                        ? 'border-primary text-slate-900' 
                        : 'border-transparent text-slate-450 hover:text-slate-600'
                    }`}
                  >
                    Database Matches ({searchResults.jobs.length + searchResults.companies.length})
                  </button>
                  <button 
                    onClick={() => {
                      if (!aiResponse && !aiLoading) handleAskVELIZO();
                      else setActiveTab('ai');
                    }}
                    className={`py-2 px-3 text-[10px] font-bold border-b-2 transition-all flex items-center gap-1 ${
                      activeTab === 'ai' 
                        ? 'border-purple-600 text-purple-700' 
                        : 'border-transparent text-slate-455 hover:text-slate-600'
                    }`}
                  >
                    <Sparkles className="h-3 w-3" /> VELIZO AI Assistant
                  </button>
                </div>
              )}

              {/* TAB 1: NORMAL DATABASE SEARCH RESULTS */}
              {activeTab === 'search' && searchQuery && (
                <div className="p-4 space-y-4">
                  {/* Job Matches */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5 text-slate-400" /> Matching Placements
                    </h4>
                    {searchResults.jobs.length === 0 ? (
                      <p className="text-[10px] text-slate-450 italic pl-1.5">No jobs match your query.</p>
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
                              <span className="text-[9px] text-slate-450 font-bold block mt-0.5">
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
                      <p className="text-[10px] text-slate-450 italic pl-1.5">No companies match your query.</p>
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
                              <span className="text-[9px] text-slate-450 font-bold block mt-0.5">
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
              )}

              {/* TAB 2: VELIZO AI ASSISTANT PANEL */}
              {activeTab === 'ai' && searchQuery && (
                <div className="p-4 space-y-3 bg-slate-50/50">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded w-fit">
                    <Sparkles className="h-3 w-3 text-purple-650" />
                    VELIZO AI Assistant Response
                  </div>

                  {aiLoading ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-500 text-xs font-semibold">
                      <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                      <span>VELIZO AI is drafting response...</span>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-700 leading-relaxed font-semibold whitespace-pre-wrap select-text selection:bg-purple-100 bg-white border border-slate-150 p-4 rounded-xl shadow-sm">
                      {aiResponse}
                    </div>
                  )}
                </div>
              )}

              {/* SUGGESTIONS & PERSONALIZED RECOMMENDATIONS (Empty Query) */}
              {!searchQuery && (
                <div className="p-5 space-y-6">
                  
                  {/* Recommended Jobs based on user profile info */}
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

                  {/* AI Quick chat prompts */}
                  <div className="space-y-2.5 pt-4 border-t border-slate-100">
                    <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest pl-1.5">
                      Ask VELIZO AI Assistant
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {suggestions.map((sug) => (
                        <div 
                          key={sug.title}
                          onClick={() => {
                            setSearchQuery(sug.query);
                            handleAskVELIZO(sug.query);
                          }}
                          className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 hover:border-primary/20 transition-all cursor-pointer group"
                        >
                          <h4 className="text-[10px] font-extrabold text-slate-800 flex items-center gap-1 group-hover:text-primary transition-colors">
                            {sug.title} <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                          </h4>
                          <p className="text-[9px] text-slate-500 leading-snug font-semibold mt-1">
                            {sug.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-150 flex justify-between items-center text-[10px] text-slate-450 font-bold px-4">
              <span className="flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-slate-400" />
                <span>Tip: Press <kbd className="bg-slate-200 px-1 py-0.5 rounded text-[9px] font-bold text-slate-600 border border-slate-300">Esc</kbd> to exit search</span>
              </span>
              {(aiResponse || searchQuery) && (
                <button 
                  onClick={() => { setAiResponse(''); setSearchQuery(''); setSearchResults({ jobs: [], companies: [] }); }}
                  className="text-slate-500 hover:text-slate-800 font-bold hover:underline cursor-pointer"
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
              pathname === '/home' ? 'text-primary' : 'text-slate-500 hover:text-primary'
            }`}
          >
            <HomeIcon className="h-5 w-5" />
            <span className="text-[9px] font-bold mt-1">Home</span>
          </Link>

          {/* Role specific 1: Passport or Post Job */}
          {isCandidate ? (
            <Link 
              href="/passport" 
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-colors cursor-pointer ${
                pathname === '/passport' ? 'text-primary' : 'text-slate-500 hover:text-primary'
              }`}
            >
              <FileCheck className="h-5 w-5" />
              <span className="text-[9px] font-bold mt-1">Passport</span>
            </Link>
          ) : (
            <Link 
              href="/employer/jobs" 
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-colors cursor-pointer ${
                pathname.startsWith('/employer/jobs') ? 'text-primary' : 'text-slate-500 hover:text-primary'
              }`}
            >
              <Plus className="h-5 w-5" />
              <span className="text-[9px] font-bold mt-1">Post Job</span>
            </Link>
          )}

          {/* VELIZO AI Center Search Trigger */}
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center text-purple-600 hover:text-purple-800 transition-colors cursor-pointer"
          >
            <div className="h-9 w-9 rounded-full bg-purple-50 flex items-center justify-center border border-purple-100 hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <span className="text-[9px] font-extrabold mt-0.5">VELIZO AI</span>
          </button>

          {/* Role specific 2: Jobs or Candidates */}
          {isCandidate ? (
            <Link 
              href="/jobs" 
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-colors cursor-pointer ${
                pathname === '/jobs' ? 'text-primary' : 'text-slate-500 hover:text-primary'
              }`}
            >
              <Briefcase className="h-5 w-5" />
              <span className="text-[9px] font-bold mt-1">Jobs</span>
            </Link>
          ) : (
            <Link 
              href="/employer/applications" 
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-colors cursor-pointer ${
                pathname.startsWith('/employer/applications') ? 'text-primary' : 'text-slate-500 hover:text-primary'
              }`}
            >
              <Users className="h-5 w-5" />
              <span className="text-[9px] font-bold mt-1">Candidates</span>
            </Link>
          )}

          {/* Role specific 3: AI Coach or Sign Out */}
          {isCandidate ? (
            <Link 
              href="/coach" 
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-colors cursor-pointer ${
                pathname === '/coach' ? 'text-primary' : 'text-slate-500 hover:text-primary'
              }`}
            >
              <Sparkles className="h-5 w-5 text-purple-550" />
              <span className="text-[9px] font-bold mt-1">AI Coach</span>
            </Link>
          ) : (
            <button 
              onClick={handleSignOut}
              className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center text-slate-500 hover:text-red-650 transition-colors cursor-pointer"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-[9px] font-bold mt-1">Log Out</span>
            </button>
          )}
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
