'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  ChevronLeft,
  AlertCircle
} from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

function NotificationDetailContent({ params }: Props) {
  const router = useRouter();
  const [notificationId, setNotificationId] = useState<string | null>(null);
  const [notification, setNotification] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Unwrap params safely
  useEffect(() => {
    params.then(p => setNotificationId(p.id));
  }, [params]);

  useEffect(() => {
    if (!notificationId) return;

    const fetchNotificationDetails = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }

      // Fetch user profile to handle conditional CTA redirects
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (profileData) {
        setProfile(profileData);
      }

      // Fetch notification details
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', notificationId)
        .maybeSingle();

      if (error || !data) {
        console.error('Error fetching notification details:', error);
        setLoading(false);
        return;
      }

      setNotification(data);
      setLoading(false);

      // Automatically mark read on view
      if (!data.is_read) {
        try {
          await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId);
        } catch (err) {
          console.error('Error auto-marking notification as read:', err);
        }
      }
    };

    fetchNotificationDetails();
  }, [notificationId, router]);

  const handleToggleReadStatus = async () => {
    if (!notification) return;
    const nextStatus = !notification.is_read;
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: nextStatus })
        .eq('id', notification.id);

      if (!error) {
        setNotification({ ...notification, is_read: nextStatus });
      }
    } catch (err) {
      console.error('Error updating read status:', err);
    }
  };

  const handleDeleteNotification = async () => {
    if (!notification) return;
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notification.id);

      if (!error) {
        router.push('/notifications');
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  // Icon selector helper
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'welcome':
        return <Sparkles className="h-6 w-6 text-amber-500" />;
      case 'application_update':
        return <ClipboardList className="h-6 w-6 text-emerald-500" />;
      case 'message':
        return <MessageSquare className="h-6 w-6 text-blue-500" />;
      case 'job_alert':
        return <Briefcase className="h-6 w-6 text-indigo-500" />;
      default:
        return <Bell className="h-6 w-6 text-slate-500" />;
    }
  };

  // Routing actions helper
  const getActionDetails = (type: string) => {
    const isCandidate = profile?.role === 'candidate';
    switch (type) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-6 text-slate-500 font-medium text-xs">
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span>Fetching alert details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <AlertCircle className="h-12 w-12 text-slate-350 mb-3" />
          <h3 className="text-sm font-extrabold text-slate-800">Alert Not Found</h3>
          <p className="text-xs text-slate-450 font-semibold mt-1">
            This notification may have been deleted or is unavailable.
          </p>
          <Link href="/notifications" className="mt-4 px-4 py-2 bg-primary hover:bg-[#084e96] text-white text-xs font-black rounded-xl transition-all shadow-sm">
            Back to Notifications
          </Link>
        </div>
      </div>
    );
  }

  const action = getActionDetails(notification.type);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-0">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-8 w-full flex-1 flex flex-col justify-center">
        {/* Back Link */}
        <Link 
          href="/notifications"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 mb-6 w-fit transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Notifications
        </Link>

        {/* Premium Announcement / Notification detail container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden animate-scaleUp">
          {/* Header Strip with type color */}
          <div className={`px-6 py-4 flex items-center justify-between border-b border-slate-100 ${
            notification.type === 'application_update' ? 'bg-gradient-to-r from-emerald-50/50 to-teal-50/20' :
            notification.type === 'message' ? 'bg-gradient-to-r from-blue-50/50 to-indigo-50/20' :
            notification.type === 'job_alert' ? 'bg-gradient-to-r from-indigo-50/50 to-purple-50/20' :
            'bg-gradient-to-r from-amber-50/50 to-orange-50/20'
          }`}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-xl shadow-3xs border border-slate-150 shrink-0">
                {getNotificationIcon(notification.type)}
              </div>
              <div>
                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider bg-white/80 border border-slate-200/80 text-slate-600">
                  {notification.type?.replace('_', ' ') || 'alert'}
                </span>
                <span className="text-[10px] text-slate-400 font-extrabold block mt-0.5">
                  {new Date(notification.created_at).toLocaleString(undefined, { 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
            
            <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider border ${
              notification.is_read 
                ? 'bg-slate-50 text-slate-500 border-slate-200' 
                : 'bg-blue-50 text-[#0a5fcc] border-blue-200'
            }`}>
              {notification.is_read ? 'Read' : 'New'}
            </span>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-6">
            <div className="space-y-3">
              <h1 className="text-base font-black text-slate-900 leading-snug">
                {notification.title}
              </h1>
              <p className="text-xs font-semibold text-slate-655 leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-3xs">
                {notification.content}
              </p>
            </div>

            {/* Actions Grid */}
            <div className="border-t border-slate-100 pt-5 flex flex-col sm:flex-row gap-3 items-center justify-between">
              {/* Secondary actions: Mark read & delete */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleToggleReadStatus}
                  className="flex-1 sm:flex-none px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
                >
                  <Eye className="h-4 w-4 text-slate-500" />
                  {notification.is_read ? 'Mark Unread' : 'Mark Read'}
                </button>
                <button
                  onClick={handleDeleteNotification}
                  className="flex-1 sm:flex-none px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200/50 text-red-655 hover:text-red-700 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                  Delete
                </button>
              </div>

              {/* Dynamic CTA redirect */}
              <Link
                href={action.path}
                className="w-full sm:w-auto px-5 py-2 bg-gradient-to-r from-primary to-[#084e96] hover:from-[#084e96] hover:to-[#063f7a] text-white text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md cursor-pointer"
              >
                {action.label} <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function NotificationDetailPage({ params }: Props) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-455 font-bold text-xs">Loading Workspace...</div>
      </div>
    }>
      <NotificationDetailContent params={params} />
    </Suspense>
  );
}
