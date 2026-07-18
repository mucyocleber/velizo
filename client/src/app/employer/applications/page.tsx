'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { supabase } from '@/lib/supabase';
import { ClipboardList, Calendar, User, Eye } from 'lucide-react';

export default function EmployerApplicationsPage() {
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
            employer_id
          ),
          profiles (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      // Filter applications belonging to jobs posted by this employer
      if (data) {
        const filtered = data.filter((app: any) => app.jobs?.employer_id === session.user.id);
        setApplications(filtered);
      }
      setLoading(false);
    };

    fetchApplications();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'shortlisted':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-600 border border-emerald-200">Shortlisted</span>;
      case 'rejected':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-red-50 text-red-500 border border-red-200">Rejected</span>;
      case 'applied':
      default:
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-blue-50 text-blue-600 border border-blue-200">Applied</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-0">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8 w-full flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <ClipboardList className="h-5.5 w-5.5 text-primary" /> Candidate Applications
            </h1>
            <p className="text-xs text-slate-455 font-bold mt-0.5">
              Review and screen applicant Career Passports applying for your active placements
            </p>
          </div>
        </div>

        {/* Applications list */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
            <span className="col-span-2">Candidate & Position</span>
            <span>Applied On</span>
            <span className="text-right">Action / Status</span>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-12 text-center text-slate-400 font-semibold text-xs">
                Loading applications...
              </div>
            ) : applications.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-semibold text-xs">
                No candidate applications submitted yet.
              </div>
            ) : (
              applications.map((app) => {
                const jobTitle = app.jobs?.title || 'Job Position';
                const candidateName = app.profiles?.full_name || 'Applicant';
                return (
                  <div key={app.id} className="p-4 grid grid-cols-4 items-center text-xs font-semibold text-slate-700">
                    <div className="col-span-2 space-y-1">
                      <span className="font-extrabold text-slate-900 block flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-400" /> {candidateName}
                      </span>
                      <span className="text-[10px] text-slate-450 block font-bold">Applying for: {jobTitle}</span>
                    </div>
                    <span className="text-slate-455 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {new Date(app.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <div className="text-right flex items-center justify-end gap-3">
                      {getStatusBadge(app.status)}
                      <button className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-primary transition-colors cursor-pointer" title="View Career Passport">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
