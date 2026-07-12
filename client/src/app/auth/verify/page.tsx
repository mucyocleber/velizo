'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Mail, ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email') || '';
  
  const [otp, setOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);

  // Countdown timer for resending OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Protect page: Redirect to register if no email is provided
  useEffect(() => {
    if (!email) {
      router.push('/auth/register');
    }
  }, [email, router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (otp.length !== 6) {
      setErrorMsg('Please enter a valid 6-digit verification code.');
      setLoading(false);
      return;
    }

    try {
      // Verify OTP code with Supabase Auth
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup'
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        setSuccessMsg('Account verified successfully!');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1200);
      }
    } catch (err: any) {
      setErrorMsg('Verification failed. Please check the code and try again.');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    
    setErrorMsg('');
    setSuccessMsg('');
    setResendLoading(true);

    try {
      // Re-trigger sign-up internally to resend verification code
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg('A new verification code has been sent to your email.');
        setCountdown(60); // Reset countdown
      }
    } catch (err) {
      setErrorMsg('Failed to resend verification code.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900 items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-xl">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-4 rounded-full bg-blue-50 border border-blue-100 text-primary mb-4">
            <Mail className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">
            Enter Verification Code
          </h1>
          <p className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed">
            We sent a 6-digit confirmation code to <br />
            <strong className="text-slate-800 font-bold break-all">{email}</strong>
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold leading-relaxed">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-700 font-semibold leading-relaxed flex items-center gap-2">
            <CheckCircle2 className="h-4.5 w-4.5 text-teal-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          {/* OTP Number Input */}
          <div>
            <label className="block text-center text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">
              6-Digit Code
            </label>
            <input
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              maxLength={6}
              autoFocus
              placeholder="0 0 0 0 0 0"
              className="w-full text-center text-3xl font-extrabold tracking-[0.4em] py-3 border border-slate-200 rounded-2xl bg-slate-50 text-slate-800 focus:bg-white focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-300 placeholder:tracking-normal"
              value={otp}
              onChange={(e) => {
                // Allow only numbers
                const val = e.target.value.replace(/[^0-9]/g, '');
                setOtp(val);
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-3.5 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-[#084e96] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {loading ? 'Verifying Code...' : 'Verify & Continue'} <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Resend / Action Area */}
        <div className="text-center text-xs text-slate-400 mt-6 pt-6 border-t border-slate-100">
          Didn't receive the code?{' '}
          {countdown > 0 ? (
            <span className="text-slate-500 font-semibold">Resend in {countdown}s</span>
          ) : (
            <button
              type="button"
              disabled={resendLoading}
              onClick={handleResend}
              className="text-primary hover:underline font-bold disabled:opacity-50"
            >
              {resendLoading ? 'Sending...' : 'Resend Code'}
            </button>
          )}
        </div>

        {/* Back Link */}
        <div className="mt-8 flex justify-center">
          <Link href="/auth/register" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors font-semibold">
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
