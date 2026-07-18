'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import { Sparkles, Send, Bot, ShieldCheck } from 'lucide-react';

export default function CoachPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-0">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8 w-full flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-5.5 w-5.5 text-purple-650" /> AI Career Assistant
            </h1>
            <p className="text-xs text-slate-455 font-bold mt-0.5">
              Review your CV, prepare for international interviews, and map custom placement credentials
            </p>
          </div>
        </div>

        {/* Chat card interface */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px] flex-1">
          {/* Top disclaimer */}
          <div className="p-3 bg-purple-50/50 border-b border-slate-150 flex items-center gap-2 px-4">
            <Bot className="h-4.5 w-4.5 text-purple-500 shrink-0" />
            <span className="text-[10px] text-purple-700 font-extrabold flex items-center gap-1.5">
              VELIZO Smart Coach (Active)
            </span>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[350px] custom-scrollbar bg-slate-50/10">
            <div className="flex items-start gap-3 max-w-[85%]">
              <div className="h-8 w-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-500 shrink-0">
                <Bot className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-slate-400">VELIZO AI Coach</span>
                <div className="p-3.5 bg-white border border-slate-200 rounded-2xl rounded-tl-none shadow-3xs text-xs font-semibold text-slate-700 leading-relaxed">
                  Welcome! I am your AI Career Coach. I can help verify your job passport credentials, analyze resume alignment with North American standards, or practice mock interview questions. What would you like to focus on today?
                </div>
              </div>
            </div>
          </div>

          {/* Footer input form */}
          <div className="p-4 border-t border-slate-200 bg-white mt-auto">
            <form className="flex gap-3">
              <input 
                type="text" 
                placeholder="Ask about international placements, resumes, or interview prep..." 
                className="flex-1 px-4 py-2.5 border border-slate-200 bg-slate-50/50 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all font-semibold"
              />
              <button 
                type="submit" 
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-3xs flex items-center gap-1.5 cursor-pointer"
              >
                Send <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
