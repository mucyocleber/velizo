'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { supabase } from '@/lib/supabase';
import { ClipboardList, Calendar, MapPin, ExternalLink, CheckCircle } from 'lucide-react';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
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
                company_name
              )
            )
          )
        `)
        .eq('candidate_id', session.user.id)
        .order('created_at', { ascending: false });

      if (data) setApplications(data);
      setLoading(false);
    };

    fetchApplications();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-blue-50 text-blue-650 border border-blue-200">Submitted</span>;
      case 'reviewing':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-amber-50 text-amber-655 border border-amber-200">In Review</span>;
      case 'shortlisted':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-indigo-50 text-indigo-655 border border-indigo-200">Shortlisted</span>;
      case 'interview':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-purple-50 text-purple-650 border border-purple-200">Interviewing</span>;
      case 'offered':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-650 border border-emerald-200">Offered</span>;
      case 'hired':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-100 text-emerald-700 border border-emerald-300">Hired</span>;
      case 'rejected':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-red-50 text-red-500 border border-red-200">Rejected</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-slate-50 text-slate-650 border border-slate-200">Applied</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-0">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8 w-full flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <ClipboardList className="h-5.5 w-5.5 text-primary" /> Application Tracker
            </h1>
            <p className="text-xs text-slate-455 font-bold mt-0.5">
              Track the progress, status, and verification milestones of your job applications
            </p>
          </div>
        </div>

        {/* List of applications */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
            <span className="col-span-2">Position & Employer</span>
            <span>Applied On</span>
            <span className="text-right">Status</span>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-12 text-center text-slate-400 font-semibold text-xs">
                Loading applications...
              </div>
            ) : applications.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-semibold text-xs">
                You haven't submitted any job applications yet.
              </div>
            ) : (
              applications.map((app) => {
                const jobTitle = (app.jobs as any)?.title || 'Job Position';
                const companyName = (app.jobs as any)?.profiles?.company_profiles?.company_name || 'Employer';
                return (
                  <Link 
                    key={app.id} 
                    href={`/applications/${app.id}`}
                    className="p-4 grid grid-cols-4 items-center text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors block border-b border-slate-100 last:border-0"
                  >
                    <div className="col-span-2 space-y-1">
                      <span className="font-extrabold text-slate-900 block">{jobTitle}</span>
                      <span className="text-[10px] text-slate-455 block font-bold">{companyName}</span>
                    </div>
                    <span className="text-slate-455 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {new Date(app.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <div className="text-right">
                      {getStatusBadge(app.status)}
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
