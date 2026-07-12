'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Mail, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function VerifyContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'your email address';

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900 items-center justify-center p-6">
      
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-xl text-center">
        
        {/* Brand Icon */}
        <div className="flex justify-center mb-8">
          <div className="p-4 rounded-full bg-blue-50 border border-blue-100 text-primary">
            <Mail className="h-10 w-10 text-primary" />
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-slate-950 mb-3 tracking-tight">
          Verify your email
        </h1>
        
        <p className="text-sm text-slate-600 mb-8 leading-relaxed">
          We have sent a verification link to <br />
          <strong className="text-slate-900 font-bold">{email}</strong>.<br />
          Please click the link in the email to activate your account.
        </p>

        <div className="space-y-4">
          <Link 
            href="/auth/login"
            className="w-full py-3 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-[#084e96] transition-all flex items-center justify-center gap-2 shadow-md"
          >
            Go to Login <ArrowRight className="h-4 w-4" />
          </Link>
          
          <div className="text-xs text-slate-400">
            Didn't receive the email? Check your spam folder or{' '}
            <button 
              type="button" 
              onClick={() => alert('Verification email resent!')} 
              className="text-primary hover:underline font-bold"
            >
              resend email
            </button>
          </div>
        </div>

        {/* Back Link */}
        <div className="border-t border-slate-100 mt-8 pt-6 flex justify-center">
          <Link href="/auth/register" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary transition-colors font-semibold">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Register
          </Link>
        </div>

      </div>

    </div>
  );
}

export default function Verify() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex bg-slate-50 items-center justify-center p-6 text-slate-500 text-sm">
        Loading...
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
