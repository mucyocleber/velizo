'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Supabase client SDK automatically catches the hash params/code in the URL
    // and logs the user in. We check if a session is established and redirect.
    const handleAuthCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session) {
        router.push('/dashboard');
      } else {
        // If session is not ready yet, set a small timeout and check again
        const timer = setTimeout(async () => {
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          if (retrySession) {
            router.push('/dashboard');
          } else {
            // If it still fails, redirect back to login
            router.push('/auth/login');
          }
        }, 1500);
        return () => clearTimeout(timer);
      }
    };
    
    handleAuthCallback();
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
