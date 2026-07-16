'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, ArrowLeft, ArrowRight, KeyRound, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMsg('Please enter your email address.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      setSuccessMsg('Check your inbox! We sent you a password reset link.');
      setEmail('');
    } catch (err) {
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900 items-center justify-center p-6 relative overflow-hidden">
      {/* Visual background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-50/40 via-transparent to-transparent -z-10" />
      
      {/* Content Card */}
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-xl relative">
        
        {/* Brand/Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-4 rounded-full bg-blue-50 border border-blue-100 text-primary mb-4">
            <KeyRound className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">
            Forgot Password?
          </h1>
          <p className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed">
            Enter your email address below, and we'll send you a link to reset your password.
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

        {!successMsg ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-center text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  placeholder="name@domain.com"
                  className="input-style pl-11 pr-11 text-center text-xs focus:ring-2 focus:ring-blue-100"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-xs font-bold tracking-wider uppercase text-white bg-primary hover:bg-[#084e96] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Sending Link...' : 'Send Reset Link'} <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        ) : (
          <div className="text-center mt-6">
            <p className="text-xs text-slate-450 mb-6 leading-relaxed">
              Didn't receive the email? Check your spam folder or try requesting a new link.
            </p>
            <button
              type="button"
              onClick={() => setSuccessMsg('')}
              className="text-primary text-xs font-bold hover:underline"
            >
              Try Another Email
            </button>
          </div>
        )}

        {/* Back Link */}
        <div className="mt-8 flex justify-center pt-6 border-t border-slate-100">
          <Link href="/auth/login" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors font-semibold">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
