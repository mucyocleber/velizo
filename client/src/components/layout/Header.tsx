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
  X, 
  ArrowRight, 
  ChevronRight, 
  Users,
  Building2,
  ExternalLink,
  Plus,
  Info,
  Compass as HomeIcon,
  User,
  FileText,
  FolderOpen,
  Bookmark,
  Settings,
  CreditCard,
  HelpCircle,
  Sparkles,
  CheckCheck
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
  
  // Dropdown / Drawer / Notifications states
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

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
          fetchNotifications(currentSession.user.id);
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
          fetchNotifications(currentSession.user.id);
        }
      } else {
        setProfile(null);
        setRecommendations([]);
        setNotifications([]);
        setUnreadCount(0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Set up real-time notification subscription
  useEffect(() => {
    if (!session?.user?.id) return;

    const notificationsChannel = supabase
      .channel(`realtime-notifications-${session.user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${session.user.id}`
        },
        () => {
          fetchNotifications(session.user.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationsChannel);
    };
  }, [session?.user?.id]);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 2. Fetch notifications from database
  const fetchNotifications = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (data && data.length > 0) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      } else {
        // If they have zero notifications ever, insert exactly one welcome notification
        // Check if they ever had a welcome notification to avoid double inserts
        const { count, error: countError } = await supabase
          .from('notifications')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId);

        if (!countError && count === 0) {
          const welcomeNotification = {
            user_id: userId,
            title: "Welcome to VELIZO!",
            content: "Complete your profile to unlock custom fast-track recommendations and start applying.",
            type: "welcome",
            is_read: false
          };
          
          const { data: insertedData } = await supabase
            .from('notifications')
            .insert(welcomeNotification)
            .select();
            
          if (insertedData) {
            setNotifications(insertedData);
            setUnreadCount(insertedData.filter(n => !n.is_read).length);
          }
        } else {
          setNotifications([]);
          setUnreadCount(0);
        }
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      if (!error) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!session?.user) return;
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', session.user.id)
        .eq('is_read', false);
      if (!error) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all read:', err);
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.is_read) {
      await handleMarkAsRead(notification.id);
    }
    setIsNotificationsOpen(false);
    // Always navigate to the full notifications page with the notification ID
    // so the detail view opens automatically on the right side
    router.push(`/notifications?id=${notification.id}`);
  };

  // Helper to format timestamps to relative time
  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // 3. Fetch personalized job recommendations from database
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

  // 4. Dynamic Database Autocomplete Search
  const handleSearchChange = async (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults({ jobs: [], companies: [] });
      return;
    }

    try {
      // Query jobs matching query term
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
    setIsProfileDropdownOpen(false);
    setIsMobileProfileOpen(false);
    router.push('/');
  };

  const nameInitial = profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U';
  const isCandidate = profile?.role === 'candidate';

  // Shared Notifications Panel Card Component
  const renderNotificationsPanel = () => (
    <div className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-[60] animate-scaleUp text-left">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-[#0a5fcc] to-indigo-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-3.5 w-3.5 text-white/80" />
          <span className="text-xs font-extrabold text-white tracking-wide">Notifications</span>
          {unreadCount > 0 && (
            <span className="bg-white/20 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{unreadCount} new</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); handleMarkAllAsRead(); }}
            className="text-[10px] text-blue-100 hover:text-white font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <CheckCheck className="h-3 w-3" /> Mark all read
          </button>
        )}
      </div>

      {/* Body List */}
      <div className="max-h-[320px] overflow-y-auto custom-scrollbar divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="p-10 text-center text-slate-400 font-semibold text-xs">
            <Bell className="h-8 w-8 mx-auto text-slate-300 mb-3" />
            <p className="font-extrabold text-slate-500">All caught up!</p>
            <p className="mt-0.5 text-[10px]">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`group p-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer relative ${
                !notif.is_read ? 'bg-blue-50/30' : ''
              }`}
            >
              {/* Unread dot */}
              {!notif.is_read && (
                <span className="absolute top-3.5 right-3 h-2 w-2 bg-[#0a5fcc] rounded-full ring-2 ring-white" />
              )}

              {/* Icon */}
              <div className={`p-1.5 rounded-xl shrink-0 ${
                notif.type === 'application_update' ? 'bg-emerald-50 text-emerald-600' :
                notif.type === 'message' ? 'bg-blue-50 text-blue-600' :
                notif.type === 'job_alert' ? 'bg-indigo-50 text-indigo-600' :
                'bg-amber-50 text-amber-600'
              }`}>
                {notif.type === 'application_update' ? <ClipboardList className="h-4 w-4" /> :
                 notif.type === 'message' ? <MessageSquare className="h-4 w-4" /> :
                 <Bell className="h-4 w-4" />}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <h4 className={`text-[11px] font-extrabold truncate leading-snug ${
                  !notif.is_read ? 'text-slate-900' : 'text-slate-600'
                }`}>
                  {notif.title}
                </h4>
                <p className="text-[10px] text-slate-500 font-medium leading-normal mt-0.5 line-clamp-2">
                  {notif.content}
                </p>
                <span className="text-[9px] text-slate-400 font-bold block mt-1">
                  {formatRelativeTime(notif.created_at)}
                </span>
              </div>

              {/* Mark as read button — always visible for unread, shows on hover for read */}
              {!notif.is_read && (
                <button
                  onClick={(e) => handleMarkAsRead(notif.id, e)}
                  className="self-center shrink-0 p-1.5 text-slate-400 hover:text-[#0a5fcc] hover:bg-blue-50 rounded-lg transition-all"
                  title="Mark as read"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-150 flex items-center justify-between">
        <span className="text-[10px] text-slate-400 font-semibold">{notifications.length} total</span>
        <button
          onClick={(e) => { e.stopPropagation(); setIsNotificationsOpen(false); router.push('/notifications'); }}
          className="text-[10px] text-[#0a5fcc] hover:underline font-extrabold flex items-center gap-1 cursor-pointer"
        >
          View all <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ═══ MAIN NAVIGATION HEADER ═══ */}
      <header className="w-full sticky top-0 z-45">
        {/* Gradient Accent Strip — top 2px branding line */}
        <div className="h-[3px] w-full bg-gradient-to-r from-[#0a5fcc] via-indigo-500 to-[#0a5fcc]" />

        {/* Main nav bar */}
        <div className="bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 h-[52px] flex items-center justify-between gap-3">

            {/* ── LEFT: Logo + Search ── */}
            <div className="flex items-center gap-6 shrink-0">
              <Link href={session ? "/home" : "/"} className="flex items-center gap-1.5 shrink-0 group">
                <img src="/logo-v.svg" alt="VELIZO" className="h-7 w-auto drop-shadow-[0_2px_8px_rgba(10,95,204,0.20)] group-hover:scale-105 transition-transform duration-200" />
                <span className="text-sm font-black tracking-tight leading-none">
                  VELI<span className="text-[#0a5fcc]">ZO</span>
                </span>
              </Link>

              {/* Desktop Search Trigger with extra breathing room */}
              <div
                onClick={() => setIsSearchOpen(true)}
                className="relative hidden md:flex cursor-pointer items-center w-52 h-8.5 bg-slate-100/80 hover:bg-slate-100 border border-slate-200/80 rounded-xl pl-8 pr-2 text-xs font-semibold text-slate-400 transition-all group"
              >
                <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400 group-hover:text-[#0a5fcc] transition-colors" />
                <span className="flex-1">Search jobs, companies...</span>
                <kbd className="bg-white text-[9px] text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded-md shadow-sm font-bold">⌘K</kbd>
              </div>
            </div>

            {/* ── MOBILE Search ── */}
            <div
              onClick={() => setIsSearchOpen(true)}
              className="flex-1 max-w-[120px] md:hidden cursor-pointer"
            >
              <div className="relative flex items-center h-8 bg-slate-100/80 border border-slate-200/80 rounded-xl pl-8 text-xs font-semibold text-slate-400">
                <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400" />
                <span>Search...</span>
              </div>
            </div>

            {/* ── CENTER: Nav Links ── */}
            {session && (
              <div className="hidden md:flex items-center justify-center gap-1">
                {[
                  { href: '/home', label: 'Home', icon: HomeIcon },
                  { href: '/jobs', label: 'Jobs', icon: Briefcase },
                  { href: isCandidate ? '/applications' : '/employer/applications', label: 'Applications', icon: ClipboardList },
                  { href: '/coach', label: 'AI Assistant', icon: Sparkles },
                ].map(({ href, label, icon: Icon }) => {
                  const active = pathname === href || (href !== '/home' && pathname.startsWith(href));
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex flex-col items-center justify-center px-4 h-[52px] text-center transition-all duration-150 shrink-0 border-b-2 ${
                        active
                          ? 'border-[#0a5fcc] text-[#0a5fcc]'
                          : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
                      }`}
                    >
                      <Icon className={`h-[18px] w-[18px] ${label === 'AI Assistant' ? 'text-purple-500 animate-pulse' : ''}`} />
                      <span className={`text-[9px] font-extrabold mt-0.5 uppercase tracking-wider ${active ? 'text-[#0a5fcc]' : ''}`}>{label}</span>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* ── RIGHT: Actions (Bell, Settings, User avatar) ── */}
            <div className="hidden md:flex items-center gap-3">
              {session ? (
                <>
                  {/* Notifications Bell */}
                  <div className="relative" ref={notificationsRef}>
                    <button
                      onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                      className={`relative flex items-center justify-center h-8 w-8 rounded-xl transition-all duration-150 cursor-pointer focus:outline-none ${
                        isNotificationsOpen ? 'bg-blue-50 text-[#0a5fcc]' : 'text-slate-500 hover:text-[#0a5fcc] hover:bg-slate-100'
                      }`}
                      title="Notifications"
                    >
                      <Bell className="h-[18px] w-[18px]" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 rounded-full text-[8px] font-black text-white flex items-center justify-center ring-2 ring-white">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>
                    {isNotificationsOpen && renderNotificationsPanel()}
                  </div>

                  {/* Settings */}
                  <Link
                    href="/passport"
                    className="flex items-center justify-center h-8 w-8 rounded-xl text-slate-500 hover:text-[#0a5fcc] hover:bg-slate-100 transition-all duration-150"
                    title="Account Settings"
                  >
                    <Settings className="h-[18px] w-[18px]" />
                  </Link>

                  {/* Profile Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className="flex items-center gap-2 pl-1 pr-3 h-8.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl transition-all duration-150 focus:outline-none cursor-pointer"
                      title="Profile Menu"
                    >
                      <div className="h-6.5 w-6.5 rounded-lg bg-gradient-to-br from-[#0a5fcc] to-indigo-500 flex items-center justify-center text-white text-[10px] font-black shrink-0 overflow-hidden">
                        {profile?.avatar_url ? (
                          <img src={profile.avatar_url} alt="avatar" className="h-full w-full object-cover" />
                        ) : nameInitial}
                      </div>
                      <div className="text-left hidden lg:block">
                        <span className="text-[10px] font-extrabold text-slate-700 leading-none block truncate max-w-[80px]">
                          {profile?.full_name?.split(' ')[0] || 'Account'}
                        </span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider leading-none block mt-0.5">
                          {isCandidate ? 'Candidate' : 'Employer'}
                        </span>
                      </div>
                      <ChevronRight className="h-3 w-3 text-slate-400 rotate-90 shrink-0" />
                    </button>

                    {/* Profile Dropdown */}
                    {isProfileDropdownOpen && (
                      <div className="absolute right-0 mt-2.5 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 px-1.5 z-50 animate-scaleUp">
                        {/* User Header */}
                        <div className="px-3 py-2.5 border-b border-slate-100 flex items-center gap-3 mb-1">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#0a5fcc] to-indigo-500 flex items-center justify-center text-white text-sm font-black shrink-0 overflow-hidden">
                            {profile?.avatar_url ? (
                              <img src={profile.avatar_url} alt="avatar" className="h-full w-full object-cover" />
                            ) : nameInitial}
                          </div>
                          <div className="overflow-hidden">
                            <span className="text-xs font-extrabold text-slate-800 block truncate leading-tight">{profile?.full_name || 'User'}</span>
                            <span className="text-[9px] font-bold text-[#0a5fcc] bg-blue-50 px-1.5 py-0.5 rounded mt-0.5 inline-block capitalize">
                              {isCandidate ? 'Job Seeker' : 'Employer'}
                            </span>
                          </div>
                        </div>

                        {/* Menu items */}
                        <div className="py-1 border-b border-slate-100 space-y-0.5">
                          {[
                            { href: isCandidate ? '/passport' : '/home', icon: User, label: 'My Profile' },
                            { href: '/passport', icon: FileText, label: 'Resume / CV' },
                            { href: '/passport', icon: FolderOpen, label: 'My Documents' },
                            { href: '/jobs', icon: Bookmark, label: 'Saved Jobs' },
                            { href: '/subscription', icon: CreditCard, label: 'Subscription' },
                            { href: '/help', icon: HelpCircle, label: 'Help Center' },
                          ].map(({ href, icon: Icon, label }) => (
                            <Link
                              key={label}
                              href={href}
                              onClick={() => setIsProfileDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
                            >
                              <Icon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              {label}
                            </Link>
                          ))}
                        </div>

                        <div className="pt-1">
                          <button
                            onClick={handleSignOut}
                            className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2.5 cursor-pointer"
                          >
                            <LogOut className="h-3.5 w-3.5" />
                            <span>Log Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                // Guest links
                <div className="flex items-center gap-2">
                  <Link href="/auth/login" className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors">
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-[#0a5fcc] hover:bg-[#084e96] transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    Create Account <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>

            {/* ── MOBILE Right: Notifications + Settings ── */}
            {session && (
              <div className="md:hidden flex items-center gap-2 relative" ref={notificationsRef}>
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative flex items-center justify-center h-8 w-8 rounded-xl text-slate-500 hover:bg-slate-100 cursor-pointer focus:outline-none"
                  title="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 bg-red-500 rounded-full text-[7px] font-black text-white flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {isNotificationsOpen && renderNotificationsPanel()}
                <Link href="/passport" className="flex items-center justify-center h-8 w-8 rounded-xl text-slate-500 hover:bg-slate-100" title="Settings">
                  <Settings className="h-5 w-5" />
                </Link>
              </div>
            )}

          </div>
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
                  <h3 className="text-xs font-extrabold text-slate-900">VELIZO Global Workspace Search</h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">Search jobs, companies, skills, countries, or cities</p>
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
                placeholder="Type to search jobs, companies, skills, countries, or cities..."
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
                        <ShieldCheck className="h-3.5 w-3.5 text-teal-655" /> Recommended For You
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold pl-1.5">
                        Job opportunities matching your target role and skills:
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

      {/* ─── MOBILE PROFILE SLIDE-OVER DRAWER ─────────────────────── */}
      {isMobileProfileOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm md:hidden" onClick={() => setIsMobileProfileOpen(false)}>
          <div 
            className="absolute top-0 right-0 bottom-0 w-80 bg-white shadow-2xl p-6 flex flex-col justify-between animate-slideLeft"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header info */}
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest">Account Menu</h3>
                <button onClick={() => setIsMobileProfileOpen(false)} className="p-1 rounded-full hover:bg-slate-100">
                  <X className="h-4.5 w-4.5 text-slate-555" />
                </button>
              </div>

              {/* Profile Overview */}
              <div className="py-4 flex items-center gap-3 border-b border-slate-100">
                <div className="h-11 w-11 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-primary text-sm font-extrabold overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="avatar" className="h-full w-full object-cover" />
                  ) : nameInitial}
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800">{profile?.full_name || 'User'}</h4>
                  <span className="text-[9px] font-bold text-slate-400 block capitalize">{profile?.role} Portal</span>
                  <span className="text-[9px] text-slate-400 block font-semibold truncate max-w-[170px] mt-0.5">{profile?.email}</span>
                </div>
              </div>

              {/* Menu Links (Account Settings removed as it is at the top gear icon) */}
              <div className="py-4 space-y-1 text-xs font-semibold">
                <Link 
                  href={isCandidate ? "/passport" : "/home"} 
                  onClick={() => setIsMobileProfileOpen(false)}
                  className="flex items-center gap-3 p-2.5 text-slate-655 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                >
                  <User className="h-4.5 w-4.5 text-slate-400" />
                  <span>My Profile</span>
                </Link>
                <Link 
                  href="/passport" 
                  onClick={() => setIsMobileProfileOpen(false)}
                  className="flex items-center gap-3 p-2.5 text-slate-655 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                >
                  <FileText className="h-4.5 w-4.5 text-slate-400" />
                  <span>Resume / CV</span>
                </Link>
                <Link 
                  href="/passport" 
                  onClick={() => setIsMobileProfileOpen(false)}
                  className="flex items-center gap-3 p-2.5 text-slate-655 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                >
                  <FolderOpen className="h-4.5 w-4.5 text-slate-400" />
                  <span>My Documents</span>
                </Link>
                <Link 
                  href="/jobs" 
                  onClick={() => setIsMobileProfileOpen(false)}
                  className="flex items-center gap-3 p-2.5 text-slate-655 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                >
                  <Bookmark className="h-4.5 w-4.5 text-slate-400" />
                  <span>Saved Jobs</span>
                </Link>
                <Link 
                  href="/subscription" 
                  onClick={() => setIsMobileProfileOpen(false)}
                  className="flex items-center gap-3 p-2.5 text-slate-655 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                >
                  <CreditCard className="h-4.5 w-4.5 text-slate-400" />
                  <span>Subscription</span>
                </Link>
                <Link 
                  href="/help" 
                  onClick={() => setIsMobileProfileOpen(false)}
                  className="flex items-center gap-3 p-2.5 text-slate-655 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                >
                  <HelpCircle className="h-4.5 w-4.5 text-slate-400" />
                  <span>Help Center</span>
                </Link>
              </div>
            </div>

            {/* Logout button */}
            <div>
              <button 
                onClick={handleSignOut}
                className="w-full py-3 bg-red-50 hover:bg-red-100 border border-red-200/50 text-red-655 hover:text-red-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="h-4.5 w-4.5" />
                <span>Logout</span>
              </button>
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

          {/* Applications */}
          <Link 
            href={isCandidate ? "/applications" : "/employer/applications"} 
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-colors cursor-pointer ${
              pathname === '/applications' || pathname.startsWith('/employer/applications') ? 'text-primary font-bold' : 'text-slate-500 hover:text-primary'
            }`}
          >
            <ClipboardList className="h-5 w-5" />
            <span className="text-[9px] font-bold mt-1">Applications</span>
          </Link>

          {/* AI Assistant */}
          <Link 
            href="/coach" 
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-colors cursor-pointer ${
              pathname === '/coach' ? 'text-primary font-bold text-purple-600' : 'text-slate-500 hover:text-primary'
            }`}
          >
            <Sparkles className="h-5 w-5 text-purple-500 animate-pulse" />
            <span className="text-[9px] font-bold mt-1">AI Assistant</span>
          </Link>

          {/* Mobile Profile Trigger (Bottom Nav button) */}
          <button 
            onClick={() => setIsMobileProfileOpen(true)}
            className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center text-slate-500 hover:text-primary cursor-pointer focus:outline-none"
          >
            <User className="h-5 w-5" />
            <span className="text-[9px] font-bold mt-1">Profile</span>
          </button>
        </nav>
      )}

      {/* Styled Animations CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-slideLeft {
          animation: slideLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-scaleUp {
          animation: scaleUp 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </>
  );
}
