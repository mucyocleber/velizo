'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import { CreditCard, Check, Sparkles } from 'lucide-react';

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-0">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8 w-full flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <CreditCard className="h-5.5 w-5.5 text-primary" /> Premium Subscription
            </h1>
            <p className="text-xs text-slate-455 font-bold mt-0.5">
              Unlock advanced placement matches, verified fast-track routes, and unlimited AI coach assistance
            </p>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch max-w-2xl mx-auto w-full pt-4">
          {/* Basic tier */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Free Tier</h3>
              <div className="flex items-baseline gap-1.5 my-3">
                <span className="text-2xl font-black text-slate-900">$0</span>
                <span className="text-[10px] text-slate-450 font-bold">/ forever</span>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold mb-6">
                Core profile creation and standard job search matching.
              </p>
              
              <ul className="space-y-2 text-[11px] text-slate-655 font-bold mb-6">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Apply to 5 jobs per month</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Verification of basic credentials</li>
              </ul>
            </div>
            <button className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-655 text-xs font-bold rounded-xl transition-all border border-slate-200">
              Current Plan
            </button>
          </div>

          {/* Premium tier */}
          <div className="bg-white p-6 rounded-2xl border-2 border-primary shadow-md flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-3 right-3 bg-primary text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <Sparkles className="h-2.5 w-2.5" /> Popular
            </div>
            
            <div>
              <h3 className="text-xs font-extrabold text-primary uppercase tracking-widest">Premium Placement</h3>
              <div className="flex items-baseline gap-1.5 my-3">
                <span className="text-2xl font-black text-slate-900">$9</span>
                <span className="text-[10px] text-slate-450 font-bold">/ month</span>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold mb-6">
                Fast-track applications, custom credentials review, and full AI support.
              </p>
              
              <ul className="space-y-2 text-[11px] text-slate-655 font-bold mb-6">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Unlimited job applications</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Direct message verified recruiters</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> 24/7 Unlimited AI Coach access</li>
              </ul>
            </div>
            <button className="w-full py-2 bg-primary hover:bg-[#084e96] text-white text-xs font-bold rounded-xl transition-all shadow-3xs">
              Upgrade Now
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
