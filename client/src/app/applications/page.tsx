'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { supabase } from '@/lib/supabase';
import { 
  ClipboardList, 
  Calendar, 
  MapPin, 
  ExternalLink, 
  CheckCircle, 
  ChevronRight, 
  Clock, 
  ShieldCheck, 
  ArrowLeft,
  Building2
} from 'lucide-react';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
          .from('job_applications')
          .select(`
            id,
            status,
            created_at,
            job_id,
            jobs (
              title,
              profiles (
                company_profiles (
                  company_name,
                  logo_url
                )
              )
            )
          `)
          .eq('candidate_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) setApplications(data);
      } catch (err) {
        console.error('Error fetching applications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-blue-50 text-blue-650 border border-blue-200 shrink-0">Submitted</span>;
      case 'reviewing':
        return <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-655 border border-amber-200 shrink-0">In Review</span>;
      case 'shortlisted':
        return <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-655 border border-indigo-200 shrink-0">Shortlisted</span>;
      case 'interview':
        return <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-purple-50 text-purple-650 border border-purple-200 shrink-0">Interviewing</span>;
      case 'offered':
        return <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-250 shrink-0 animate-pulse">Offered</span>;
      case 'hired':
        return <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-300 shrink-0">Hired 🎉</span>;
      case 'rejected':
        return <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-red-50 text-red-500 border border-red-200 shrink-0">Rejected</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-slate-50 text-slate-650 border border-slate-200 shrink-0">Applied</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-0">
      <Header />
      
      {/* Decorative branding top bar accent line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-[#0a5fcc] via-indigo-500 to-[#0a5fcc]" />

      <main className="max-w-4xl mx-auto px-4 py-8 w-full flex-1 flex flex-col">
        {/* Page Hero Banner */}
        <div className="w-full bg-gradient-to-r from-[#0b1329] to-indigo-950 rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden border border-slate-800 shadow-md">
          {/* Subtle overlay decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#0a5fcc]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-2 text-left max-w-2xl">
            <span className="text-[9px] font-black text-[#0a5fcc] uppercase tracking-widest bg-blue-950/60 border border-blue-900/50 px-2.5 py-1 rounded-lg">
              Application Center
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
              Application Tracker
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-semibold leading-relaxed">
              Track the progress, status, and verification milestones of your job applications in real-time
            </p>
          </div>
        </div>

        {/* Dynamic Applications List Wrapper */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center text-slate-400 font-semibold text-xs flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span>Fetching your submitted placements...</span>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white p-12 text-center text-slate-400 font-semibold text-xs rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-3">
            <ClipboardList className="h-10 w-10 text-slate-350" />
            <p className="text-slate-800 text-sm font-extrabold">No Applications Found</p>
            <p className="text-slate-400 font-bold max-w-[280px] leading-relaxed">
              You haven't submitted any job applications yet. Visit the jobs page to start applying!
            </p>
            <Link 
              href="/jobs" 
              className="mt-2 px-4 py-2 bg-gradient-to-r from-primary to-[#084e96] hover:from-[#084e96] hover:to-[#063f7a] text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-sm"
            >
              Explore Placements
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* DESKTOP TABLE VIEW */}
            <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 grid grid-cols-12 text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
                <span className="col-span-6">Position & Employer</span>
                <span className="col-span-3">Applied On</span>
                <span className="col-span-3 text-right">Status</span>
              </div>

              <div className="divide-y divide-slate-100">
                {applications.map((app) => {
                  const jobTitle = (app.jobs as any)?.title || 'Job Position';
                  const companyName = (app.jobs as any)?.profiles?.company_profiles?.company_name || 'Employer';
                  const logoUrl = (app.jobs as any)?.profiles?.company_profiles?.logo_url;
                  
                  return (
                    <Link 
                      key={app.id} 
                      href={`/applications/${app.id}`}
                      className="px-5 py-4 grid grid-cols-12 items-center text-xs font-semibold text-slate-700 hover:bg-slate-50/50 transition-colors block border-b border-slate-100 last:border-0 group"
                    >
                      <div className="col-span-6 flex items-center gap-3.5 min-w-0">
                        {/* Company Logo wrapper */}
                        <div className="h-9 w-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center overflow-hidden shrink-0 shadow-3xs">
                          {logoUrl ? (
                            <img src={logoUrl} alt={companyName} className="h-full w-full object-cover" />
                          ) : (
                            <Building2 className="h-4.5 w-4.5 text-primary shrink-0" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="font-extrabold text-slate-900 group-hover:text-primary transition-colors block truncate">{jobTitle}</span>
                          <span className="text-[10px] text-slate-400 font-bold block mt-0.5 truncate">{companyName}</span>
                        </div>
                      </div>
                      <span className="col-span-3 text-slate-455 flex items-center gap-1.5 font-bold">
                        <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        {new Date(app.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <div className="col-span-3 text-right flex items-center justify-end gap-3 shrink-0">
                        {getStatusBadge(app.status)}
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors group-hover:translate-x-0.5 duration-150" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* MOBILE LAYOUT CARDS */}
            <div className="block md:hidden space-y-3.5">
              {applications.map((app) => {
                const jobTitle = (app.jobs as any)?.title || 'Job Position';
                const companyName = (app.jobs as any)?.profiles?.company_profiles?.company_name || 'Employer';
                const logoUrl = (app.jobs as any)?.profiles?.company_profiles?.logo_url;
                
                return (
                  <Link 
                    key={app.id} 
                    href={`/applications/${app.id}`}
                    className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all flex flex-col gap-3.5 cursor-pointer block group"
                  >
                    <div className="flex items-start gap-3">
                      {/* Logo */}
                      <div className="h-10 w-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 overflow-hidden shadow-3xs">
                        {logoUrl ? (
                          <img src={logoUrl} alt={companyName} className="h-full w-full object-cover" />
                        ) : (
                          <Building2 className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xs font-extrabold text-slate-900 group-hover:text-primary transition-colors leading-snug truncate">
                          {jobTitle}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5 truncate">{companyName}</p>
                      </div>
                      {getStatusBadge(app.status)}
                    </div>
                    
                    {/* Bottom Metadata details */}
                    <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-[10px] font-bold text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {new Date(app.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="text-primary flex items-center gap-0.5 font-black uppercase tracking-wider">
                        Track Steps <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
