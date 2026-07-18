'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import { HelpCircle, Search, FileText, MessageSquare } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-0">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8 w-full flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <HelpCircle className="h-5.5 w-5.5 text-primary" /> Help & Support Center
            </h1>
            <p className="text-xs text-slate-455 font-bold mt-0.5">
              Find answers to verification processes, international job placements, and credentials security
            </p>
          </div>
        </div>

        {/* Search help bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col items-center">
          <h3 className="text-xs font-extrabold text-slate-800 mb-3">How can we help you today?</h3>
          <div className="relative w-full max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input 
              type="text" 
              placeholder="Search help articles (e.g. passport score, employer verification)..." 
              className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-slate-50/50 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary transition-all font-semibold"
            />
          </div>
        </div>

        {/* Help categories list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <FileText className="h-4 w-4 text-primary" /> Popular Articles
            </h4>
            <ul className="space-y-2 text-[11px] text-slate-550 font-bold">
              <li><a href="#" className="hover:text-primary hover:underline">How do I increase my Career Passport score?</a></li>
              <li><a href="#" className="hover:text-primary hover:underline">How long does education background verification take?</a></li>
              <li><a href="#" className="hover:text-primary hover:underline">Is my passport information secure from third parties?</a></li>
            </ul>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <MessageSquare className="h-4 w-4 text-primary" /> Direct Contact
              </h4>
              <p className="text-[11px] text-slate-550 font-semibold mt-2">
                Can't find what you need? Reach out directly to our global validation support desk.
              </p>
            </div>
            <button className="w-full py-2 bg-primary hover:bg-[#084e96] text-white text-xs font-bold rounded-xl transition-all shadow-3xs mt-4">
              Submit Support Ticket
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
