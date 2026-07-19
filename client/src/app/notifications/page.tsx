'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/components/layout/Header';
import { 
  Bell, 
  Trash2, 
  Check, 
  CheckCheck, 
  ArrowLeft, 
  Sparkles, 
  ClipboardList, 
  MessageSquare, 
  Briefcase,
  Eye,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

function NotificationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // 1. Session check
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        router.push('/auth/login');
        return;
      }
      setSession(currentSession);
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentSession.user.id)
        .single();
        
      if (profileData) {
        setProfile(profileData);
        fetchNotifications(currentSession.user.id);
      }
      setLoading(false);
    };

    checkSession();
  }, []);

  // Auto-select notification if ?id= is provided in URL (from Header bell click)
  useEffect(() => {
    const idParam = searchParams?.get('id');
    if (idParam && notifications.length > 0) {
      const target = notifications.find(n => n.id === idParam);
      if (target && selectedNotification?.id !== idParam) {
        handleSelectNotification(target);
      }
    }
  }, [searchParams, notifications, selectedNotification]);

  // 2. Real-time Subscription
  useEffect(() => {
    if (!session?.user?.id) return;

    const notificationsChannel = supabase
      .channel(`page-notifications-${session.user.id}`)
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

  // Fetch all notifications from database
  const fetchNotifications = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (data) {
        setNotifications(data);
        // Sync selected notification details if it was updated
        if (selectedNotification) {
          const updated = data.find(n => n.id === selectedNotification.id);
          if (updated) setSelectedNotification(updated);
        }
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  // Actions
  const handleSelectNotification = async (notif: any) => {
    setSelectedNotification(notif);
    if (!notif.is_read) {
      // Mark read automatically
      try {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notif.id);
        
        // Update local state instantly
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
        setSelectedNotification({ ...notif, is_read: true });
      } catch (err) {
        console.error('Error marking as read:', err);
      }
    }
  };

  const handleMarkAllRead = async () => {
    if (!session?.user?.id) return;
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', session.user.id)
        .eq('is_read', false);

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      if (selectedNotification) {
        setSelectedNotification({ ...selectedNotification, is_read: true });
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleToggleReadStatus = async (notif: any) => {
    const nextStatus = !notif.is_read;
    try {
      await supabase
        .from('notifications')
        .update({ is_read: nextStatus })
        .eq('id', notif.id);

      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: nextStatus } : n));
      setSelectedNotification({ ...notif, is_read: nextStatus });
    } catch (err) {
      console.error('Error updating read status:', err);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      setNotifications(prev => prev.filter(n => n.id !== id));
      if (selectedNotification?.id === id) {
        setSelectedNotification(null);
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  // Icon selector helper
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'welcome':
        return <Sparkles className="h-5 w-5 text-amber-500" />;
      case 'application_update':
        return <ClipboardList className="h-5 w-5 text-emerald-500" />;
      case 'message':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'job_alert':
        return <Briefcase className="h-5 w-5 text-indigo-500" />;
      default:
        return <Bell className="h-5 w-5 text-slate-500" />;
    }
  };

  // Routing actions based on type
  const getActionDetails = (notif: any) => {
    const isCandidate = profile?.role === 'candidate';
    switch (notif.type) {
      case 'welcome':
        return { label: 'Go to Profile', path: isCandidate ? '/passport' : '/home' };
      case 'application_update':
        return { label: 'View Applications', path: isCandidate ? '/applications' : '/employer/applications' };
      case 'message':
        return { label: 'Open Messaging', path: '/messages' };
      case 'job_alert':
        return { label: 'Browse Placements', path: '/jobs' };
      default:
        return { label: 'Go to Dashboard', path: '/home' };
    }
  };

  // Filter list
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-455 font-bold text-xs">Loading Workspace...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-0">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8 w-full flex-1 flex flex-col">
        {/* Page title and Mark All button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Bell className="h-5.5 w-5.5 text-primary" /> Notifications
            </h1>
            <p className="text-xs text-slate-450 font-bold mt-0.5">
              Manage your application status alerts, system matches, and chats
            </p>
          </div>
          {notifications.some(n => !n.is_read) && (
            <button 
              onClick={handleMarkAllRead}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all shadow-3xs flex items-center gap-2 cursor-pointer"
            >
              <CheckCheck className="h-4 w-4 text-slate-500" /> Mark all read
            </button>
          )}
        </div>

        {/* Outer Split screen Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 items-stretch">
          
          {/* LEFT 2 COLUMNS: Notifications List */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            {/* Filter controls */}
            <div className="flex border-b border-slate-200 px-4 bg-slate-50/50">
              <button 
                onClick={() => setFilter('all')}
                className={`py-3 px-4 text-xs font-extrabold border-b-2 transition-all ${
                  filter === 'all' 
                    ? 'border-primary text-slate-900' 
                    : 'border-transparent text-slate-450 hover:text-slate-655'
                }`}
              >
                All ({notifications.length})
              </button>
              <button 
                onClick={() => setFilter('unread')}
                className={`py-3 px-4 text-xs font-extrabold border-b-2 transition-all ${
                  filter === 'unread' 
                    ? 'border-primary text-slate-900' 
                    : 'border-transparent text-slate-455 hover:text-slate-655'
                }`}
              >
                Unread ({notifications.filter(n => !n.is_read).length})
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[550px] custom-scrollbar">
              {filteredNotifications.length === 0 ? (
                <div className="p-16 text-center text-slate-400 font-semibold text-xs">
                  <Bell className="h-10 w-10 mx-auto text-slate-350 mb-3" />
                  No notifications matching your filter
                </div>
              ) : (
                filteredNotifications.map((notif) => (
                  <div 
                    key={notif.id}
                    onClick={() => handleSelectNotification(notif)}
                    className={`p-4 flex items-start gap-4 hover:bg-slate-55/80 transition-colors cursor-pointer relative ${
                      selectedNotification?.id === notif.id ? 'bg-slate-50/60 ring-2 ring-primary/10' : ''
                    } ${!notif.is_read ? 'bg-blue-50/10' : ''}`}
                  >
                    {/* Unread indicator */}
                    {!notif.is_read && (
                      <span className="absolute top-5 right-4 h-2 w-2 bg-primary rounded-full ring-2 ring-white"></span>
                    )}

                    {/* Icon */}
                    <div className="p-2 bg-slate-100 rounded-xl shrink-0">
                      {getNotificationIcon(notif.type)}
                    </div>

                    {/* Details content */}
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-extrabold text-slate-850 truncate">
                          {notif.title}
                        </h4>
                        <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap">
                          {new Date(notif.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-semibold line-clamp-2 leading-relaxed mt-1">
                        {notif.content}
                      </p>
                    </div>

                    <ChevronRight className="h-4 w-4 text-slate-400 self-center shrink-0" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RIGHT 1 COLUMN: Detail view */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col">
            {selectedNotification ? (
              <div className="flex flex-col h-full justify-between gap-5 animate-scaleUp">
                
                {/* Meta details header */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-2.5">
                    <span className="text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-slate-100 text-slate-655 border border-slate-200">
                      {selectedNotification.type?.replace('_', ' ') || 'alert'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-extrabold">
                      {new Date(selectedNotification.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h2 className="text-sm font-extrabold text-slate-900 leading-snug">
                    {selectedNotification.title}
                  </h2>
                  
                  <div className="text-xs font-semibold text-slate-655 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-150">
                    {selectedNotification.content}
                  </div>
                </div>

                {/* Bottom Actions panel */}
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  {/* Category action link */}
                  <Link 
                    href={getActionDetails(selectedNotification).path}
                    className="w-full py-2.5 bg-primary hover:bg-[#084e96] text-white text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-3xs"
                  >
                    {getActionDetails(selectedNotification).label} <ExternalLink className="h-3.5 w-3.5" />
                  </Link>

                  {/* Secondary controls */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button 
                      onClick={() => handleToggleReadStatus(selectedNotification)}
                      className="py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      {selectedNotification.is_read ? 'Mark unread' : 'Mark read'}
                    </button>
                    <button 
                      onClick={() => handleDeleteNotification(selectedNotification.id)}
                      className="py-2 bg-red-50 hover:bg-red-100 border border-red-200/50 text-red-655 hover:text-red-700 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-20 text-slate-400">
                <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mb-3 shadow-3xs">
                  <Bell className="h-5.5 w-5.5" />
                </div>
                <h3 className="text-xs font-extrabold text-slate-800">No Notification Selected</h3>
                <p className="text-[10px] text-slate-450 font-bold mt-1 pr-4 pl-4">
                  Select any notification on the left to read its full details and take direct recruitment actions.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-455 font-bold text-xs">Loading Workspace...</div>
      </div>
    }>
      <NotificationsContent />
    </Suspense>
  );
}
