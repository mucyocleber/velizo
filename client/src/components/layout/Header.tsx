'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Compass as HomeIcon
} from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Mobile drawer state
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // AI Palette states
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  
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
        if (profileData) setProfile(profileData);
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
        if (profileData) setProfile(profileData);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. keyboard listener for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsAIOpen(true);
      }
      if (e.key === 'Escape') {
        setIsAIOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isAIOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isAIOpen]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    setIsMobileOpen(false);
  };

  // 3. Ask Gemini Action
  const handleAskGemini = async (queryText?: string) => {
    const textToSend = queryText || aiQuery;
    if (!textToSend.trim()) return;

    setAiLoading(true);
    setAiResponse('');
    
    // Fallback URL to port 5000 if env is missing
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
        setAiResponse(data.error?.message || 'Error: Failed to obtain response from Gemini AI.');
      }
    } catch (err) {
      console.error('Gemini chat error:', err);
      setAiResponse('AI service is temporarily offline. Please verify that your backend server is running on port 5000.');
    } finally {
      setAiLoading(false);
    }
  };

  const nameInitial = profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U';
  const isCandidate = profile?.role === 'candidate';

  const suggestions = [
    {
      title: 'Sponsorship Finder',
      query: 'Find tech jobs with visa sponsorship in Vancouver',
      desc: 'Browse verified companies hiring global talent'
    },
    {
      title: 'Immigration Guide',
      query: 'Explain the British Columbia Tech stream work permit process',
      desc: 'Understand Canadian immigration rules'
    },
    {
      title: 'Trust Passport Score',
      query: 'How do I complete my Career Passport to get verified?',
      desc: 'Increase your response rate by 10x'
    }
  ];

  return (
    <>
      {/* ─── MAIN NAV HEADER ────────────────────────────────────── */}
      <header className="w-full border-b border-slate-200 bg-white sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          
          {/* Logo & Gemini Search Trigger */}
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <Link href={session ? "/home" : "/"} className="flex items-center gap-1.5 shrink-0 group">
              <img src="/logo-v.svg" alt="VELIZO" className="h-8 w-auto filter drop-shadow-[0_2px_8px_rgba(10,102,194,0.15)] group-hover:scale-105 transition-transform" />
              <span className="text-base font-extrabold tracking-tight">
                VELI<span className="text-primary font-black">ZO</span>
              </span>
            </Link>
            
            {/* Search Input (Triggers Ctrl+K Gemini Overlay) */}
            <div 
              onClick={() => setIsAIOpen(true)}
              className="relative w-full hidden md:block cursor-pointer"
            >
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-450">
                <Search className="h-4 w-4" />
              </span>
              <div className="w-full bg-[#EDF3F8]/80 pl-9 pr-14 py-1.5 rounded text-xs font-semibold text-slate-500 border border-transparent hover:bg-[#E1E9F0]/80 transition-colors flex items-center justify-between">
                <span>Ask Gemini AI / Search...</span>
                <span className="bg-slate-250 text-slate-500 px-1.5 py-0.5 rounded text-[10px] font-bold border border-slate-300">
                  Ctrl K
                </span>
              </div>
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-purple-600">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              </span>
            </div>
          </div>

          {/* Navigation Links & Account Actions */}
          <div className="flex items-center gap-2 sm:gap-6">
            {session ? (
              // ─── AUTHENTICATED NAVBAR LINKS ───
              <>
                <Link href="/home" className="flex flex-col items-center justify-center text-slate-800 hover:text-slate-950 px-2 h-14 shrink-0 border-b-2 border-slate-850">
                  <HomeIcon className="h-5 w-5" />
                  <span className="text-[9px] font-bold mt-0.5 hidden md:block">Home</span>
                </Link>
                
                {isCandidate ? (
                  <>
                    <Link href="/passport" className="flex flex-col items-center justify-center text-slate-500 hover:text-slate-800 px-2 h-14 shrink-0">
                      <FileCheck className="h-5 w-5" />
                      <span className="text-[9px] font-bold mt-0.5 hidden md:block">Passport</span>
                    </Link>
                    <Link href="/jobs" className="flex flex-col items-center justify-center text-slate-500 hover:text-slate-800 px-2 h-14 shrink-0">
                      <Briefcase className="h-5 w-5" />
                      <span className="text-[9px] font-bold mt-0.5 hidden md:block">Jobs</span>
                    </Link>
                    <Link href="/coach" className="flex flex-col items-center justify-center text-slate-500 hover:text-slate-800 px-2 h-14 shrink-0">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      <span className="text-[9px] font-bold mt-0.5 hidden md:block font-extrabold text-purple-650">AI Coach</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/employer/jobs" className="flex flex-col items-center justify-center text-slate-500 hover:text-slate-800 px-2 h-14 shrink-0">
                      <Briefcase className="h-5 w-5" />
                      <span className="text-[9px] font-bold mt-0.5 hidden md:block">Manage Jobs</span>
                    </Link>
                    <Link href="/employer/applications" className="flex flex-col items-center justify-center text-slate-500 hover:text-slate-800 px-2 h-14 shrink-0">
                      <Users className="h-5 w-5" />
                      <span className="text-[9px] font-bold mt-0.5 hidden md:block">Candidates</span>
                    </Link>
                  </>
                )}

                {/* Profile Panel & Sign Out */}
                <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-primary text-xs font-bold shrink-0 overflow-hidden">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="avatar" className="h-full w-full object-cover" />
                      ) : nameInitial}
                    </div>
                    <div className="hidden sm:block text-left">
                      <span className="text-[10px] font-extrabold text-slate-800 block leading-tight truncate max-w-[80px]">
                        {profile?.full_name || 'User'}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 block capitalize leading-none mt-0.5">
                        {profile?.role === 'candidate' ? 'Job Seeker' : 'Employer'}
                      </span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleSignOut}
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                    title="Log Out"
                  >
                    <LogOut className="h-4.5 w-4.5" />
                  </button>
                </div>
              </>
            ) : (
              // ─── GUEST/UNAUTHENTICATED PUBLIC LINKS ───
              <>
                <Link href="/auth/login" className="text-xs font-bold text-slate-650 hover:text-slate-900 px-2">
                  Sign In
                </Link>
                <Link 
                  href="/auth/register" 
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-primary hover:bg-[#084e96] transition-all flex items-center gap-1 shrink-0"
                >
                  Create Account <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}

            {/* Mobile menu triggers */}
            <button 
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="p-1.5 rounded bg-slate-50 hover:bg-slate-100 text-slate-600 md:hidden border border-slate-200 shrink-0"
            >
              {isMobileOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
            </button>

          </div>
        </div>
      </header>

      {/* ─── MOBILE DRAWER OVERLAY ──────────────────────────────── */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm md:hidden" onClick={() => setIsMobileOpen(false)}>
          <div 
            className="absolute top-14 left-0 right-0 bg-white border-b border-slate-200 p-5 flex flex-col gap-4 shadow-xl animate-slideDown"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input for Mobile (triggers Gemini) */}
            <div 
              onClick={() => { setIsMobileOpen(false); setIsAIOpen(true); }}
              className="relative w-full"
            >
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-450">
                <Search className="h-4 w-4" />
              </span>
              <div className="w-full bg-[#EDF3F8]/80 pl-9 py-2 rounded text-xs font-semibold text-slate-550 border border-transparent flex justify-between items-center">
                <span>Ask Gemini AI / Search...</span>
                <Sparkles className="h-3.5 w-3.5 text-purple-600 mr-2 animate-pulse" />
              </div>
            </div>

            {session ? (
              <>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">
                  navigation
                </div>
                <Link href="/home" onClick={() => setIsMobileOpen(false)} className="flex items-center justify-between py-2 text-sm font-bold text-slate-700 hover:text-primary">
                  <span>Home Portal</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
                {isCandidate ? (
                  <>
                    <Link href="/passport" onClick={() => setIsMobileOpen(false)} className="flex items-center justify-between py-2 text-sm font-bold text-slate-700 hover:text-primary">
                      <span>Career Passport</span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                    <Link href="/jobs" onClick={() => setIsMobileOpen(false)} className="flex items-center justify-between py-2 text-sm font-bold text-slate-700 hover:text-primary">
                      <span>Browse Jobs</span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                    <Link href="/coach" onClick={() => setIsMobileOpen(false)} className="flex items-center justify-between py-2 text-sm font-bold text-purple-700 hover:text-purple-800">
                      <span>AI Interview Coach</span>
                      <Sparkles className="h-4 w-4 text-purple-500 animate-pulse" />
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/employer/jobs" onClick={() => setIsMobileOpen(false)} className="flex items-center justify-between py-2 text-sm font-bold text-slate-700 hover:text-primary">
                      <span>Manage Jobs</span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                    <Link href="/employer/applications" onClick={() => setIsMobileOpen(false)} className="flex items-center justify-between py-2 text-sm font-bold text-slate-700 hover:text-primary">
                      <span>Candidate Applications</span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </>
                )}
                
                <button 
                  onClick={handleSignOut}
                  className="w-full mt-2 py-2.5 bg-red-50 hover:bg-red-100 text-red-650 text-xs font-bold rounded-lg border border-red-200 transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log Out of Account</span>
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setIsMobileOpen(false)} className="w-full py-2.5 text-center text-xs font-bold text-slate-700 border border-slate-200 rounded-lg">
                  Sign In
                </Link>
                <Link href="/auth/register" onClick={() => setIsMobileOpen(false)} className="w-full py-2.5 text-center text-xs font-bold text-white bg-primary rounded-lg flex items-center justify-center gap-1">
                  Create Account <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── GEMINI AI COMMAND PALETTE MODAL OVERLAY ─────────────── */}
      {isAIOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center p-4 pt-16 sm:pt-28">
          <div 
            ref={modalRef}
            className="bg-white max-w-2xl w-full rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-scaleUp"
          >
            {/* Modal Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                  <Sparkles className="h-4.5 w-4.5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900">Gemini AI Workspace Assistant</h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">Explore jobs, immigration routes, and trust criteria</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAIOpen(false)}
                className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-655 transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Input query field */}
            <div className="p-4 border-b border-slate-100 flex items-center gap-3">
              <Search className="h-5 w-5 text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask anything (e.g. 'nodejs developer jobs in Vancouver')..."
                className="w-full text-xs font-medium text-slate-800 outline-none border-none placeholder-slate-400 bg-transparent"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAskGemini();
                }}
              />
              <button
                onClick={() => handleAskGemini()}
                disabled={aiLoading || !aiQuery.trim()}
                className="px-3.5 py-1.5 bg-primary hover:bg-[#084e96] disabled:opacity-50 text-white text-[10px] font-bold rounded-lg transition-all shrink-0 cursor-pointer"
              >
                Ask Gemini
              </button>
            </div>

            {/* Suggestions panel (shows when no query/response) */}
            {!aiResponse && !aiLoading && (
              <div className="p-5 space-y-4">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  suggested prompts
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {suggestions.map((sug) => (
                    <div 
                      key={sug.title}
                      onClick={() => {
                        setAiQuery(sug.query);
                        handleAskGemini(sug.query);
                      }}
                      className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 hover:border-primary/20 transition-all cursor-pointer group"
                    >
                      <h4 className="text-[11px] font-extrabold text-slate-850 flex items-center gap-1 group-hover:text-primary transition-colors">
                        {sug.title} <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                      </h4>
                      <p className="text-[10px] text-slate-500 leading-snug font-semibold mt-1">
                        {sug.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Response Output / Loading */}
            {(aiLoading || aiResponse) && (
              <div className="p-5 max-h-[320px] overflow-y-auto custom-scrollbar border-b border-slate-100 bg-slate-50/50">
                {aiLoading ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-500 text-xs font-semibold">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                    <span>Gemini is generating response...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded w-fit">
                      <Sparkles className="h-3 w-3 text-purple-650" />
                      Gemini Response
                    </div>
                    <div className="text-xs text-slate-700 leading-relaxed font-semibold whitespace-pre-wrap select-text selection:bg-purple-100">
                      {aiResponse}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 flex justify-between items-center text-[10px] text-slate-400 font-semibold px-4">
              <span className="flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-slate-400" />
                <span>Tip: Press <kbd className="bg-slate-200 px-1 py-0.5 rounded text-[9px] font-bold text-slate-600 border border-slate-300">Esc</kbd> to close at any time</span>
              </span>
              {aiResponse && (
                <button 
                  onClick={() => { setAiResponse(''); setAiQuery(''); }}
                  className="text-slate-500 hover:text-slate-800 font-bold hover:underline cursor-pointer"
                >
                  Clear chat
                </button>
              )}
            </div>

          </div>
        </div>
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
