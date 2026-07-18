'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import { MessageSquare, Send, Search, Users, ShieldAlert } from 'lucide-react';

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-0">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8 w-full flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <MessageSquare className="h-5.5 w-5.5 text-primary" /> Recruiter Chats
            </h1>
            <p className="text-xs text-slate-450 font-bold mt-0.5">
              Secure international messaging channel between candidates and verified employers
            </p>
          </div>
        </div>

        {/* Messaging layout wrapper */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 items-stretch bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
          {/* Left panel: Active conversations */}
          <div className="md:col-span-1 border-r border-slate-200 flex flex-col bg-slate-50/50">
            <div className="p-4 border-b border-slate-200 bg-white">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Search className="h-4 w-4" />
                </span>
                <input 
                  type="text" 
                  placeholder="Search chats..." 
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-slate-50/50 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary transition-all font-semibold"
                />
              </div>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              <div className="p-4 hover:bg-slate-100/50 cursor-pointer transition-colors bg-blue-50/10 flex gap-3 items-center">
                <div className="h-9 w-9 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                  TC
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-xs font-extrabold text-slate-800 truncate">TechCorp Recruiter</h4>
                    <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap">2h ago</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold truncate mt-0.5">
                    We reviewed your Career Passport credentials and...
                  </p>
                </div>
              </div>

              <div className="p-4 hover:bg-slate-100/50 cursor-pointer transition-colors flex gap-3 items-center">
                <div className="h-9 w-9 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 text-xs font-bold shrink-0">
                  MF
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-xs font-extrabold text-slate-800 truncate">Maple Finance HR</h4>
                    <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap">Jul 17</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold truncate mt-0.5">
                    Let's schedule a video screening call next week.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: Active chat window */}
          <div className="md:col-span-2 flex flex-col justify-between bg-white h-full">
            {/* Chat header */}
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/30">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-primary text-xs font-bold">
                  TC
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-800">TechCorp Recruiter</h3>
                  <span className="text-[9px] font-bold text-teal-655 flex items-center gap-1 mt-0.5">
                    Verified Employer
                  </span>
                </div>
              </div>
            </div>

            {/* Chat messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[350px] custom-scrollbar bg-slate-50/20">
              {/* Message left */}
              <div className="flex items-start gap-2.5 max-w-[80%]">
                <div className="p-3 bg-white border border-slate-200 rounded-2xl rounded-tl-none shadow-3xs text-[11px] font-semibold text-slate-700 leading-relaxed">
                  Hi there, thanks for applying for the Senior Full-Stack role! We reviewed your Career Passport credentials. Could you share your availability for a chat?
                </div>
              </div>

              {/* Message right */}
              <div className="flex items-start gap-2.5 max-w-[80%] ml-auto justify-end">
                <div className="p-3 bg-primary text-white rounded-2xl rounded-tr-none shadow-3xs text-[11px] font-semibold leading-relaxed">
                  Hi! Thank you for reaching out. I'm available anytime Monday to Wednesday from 9 AM to 3 PM EST.
                </div>
              </div>
            </div>

            {/* Chat input footer */}
            <div className="p-4 border-t border-slate-200 bg-white">
              <form className="flex gap-3">
                <input 
                  type="text" 
                  placeholder="Type your message..." 
                  className="flex-1 px-4 py-2.5 border border-slate-200 bg-slate-50/50 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary transition-all font-semibold"
                />
                <button 
                  type="submit" 
                  className="px-4 py-2.5 bg-primary hover:bg-[#084e96] text-white rounded-xl text-xs font-bold transition-all shadow-3xs flex items-center gap-1.5 cursor-pointer"
                >
                  Send <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
