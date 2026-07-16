'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Listen for auth state changes, especially PASSWORD_RECOVERY
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        router.push('/auth/reset-password');
      }
    });

    const handleAuthCallback = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      const url = new URL(window.location.href);
      const isRecovery = url.searchParams.get('type') === 'recovery' || 
                         url.hash.includes('type=recovery') || 
                         url.searchParams.get('next')?.includes('reset-password');

      if (session) {
        if (isRecovery) {
          router.push('/auth/reset-password');
        } else {
          router.push('/dashboard');
        }
      } else {
        // If session is not ready yet, set a small timeout and check again
        const timer = setTimeout(async () => {
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          if (retrySession) {
            if (isRecovery) {
              router.push('/auth/reset-password');
            } else {
              router.push('/dashboard');
            }
          } else {
            router.push('/auth/login');
          }
        }, 1500);
        return () => clearTimeout(timer);
      }
    };
    
    handleAuthCallback();

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className="min-h-screen flex bg-slate-50 items-center justify-center p-6 text-slate-500 font-medium text-sm">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span>Verifying your session, please wait...</span>
      </div>
    </div>
  );
}
