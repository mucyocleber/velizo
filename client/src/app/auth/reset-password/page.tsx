'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Lock, ArrowRight, ShieldCheck, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Protect route: Ensure the user is actually authenticated (even temporarily via recovery token)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // If there's no active recovery session, redirect to login
        router.push('/auth/login');
      }
    };
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      setSuccessMsg('Your password has been reset successfully!');
      
      // Delay to let the user see the success message, then route to home
      setTimeout(() => {
        router.push('/home');
      }, 1500);
    } catch (err) {
      setErrorMsg('Failed to reset password. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900 items-center justify-center p-6 relative overflow-hidden">
      {/* Visual background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-50/40 via-transparent to-transparent -z-10" />
      
      {/* Content Card */}
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-xl relative">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-4 rounded-full bg-blue-50 border border-blue-100 text-primary mb-4">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">
            Reset Password
          </h1>
          <p className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed">
            Please enter and confirm your new secure password.
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

        {!successMsg && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div>
              <label className="block text-center text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
                New Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  className="input-style pl-11 pr-11 text-center text-xs focus:ring-2 focus:ring-blue-100"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer z-20"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-center text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  className="input-style pl-11 pr-11 text-center text-xs focus:ring-2 focus:ring-blue-100"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer z-20"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-xs font-bold tracking-wider uppercase text-white bg-primary hover:bg-[#084e96] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer mt-2"
            >
              {loading ? 'Updating Password...' : 'Reset Password'} <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
