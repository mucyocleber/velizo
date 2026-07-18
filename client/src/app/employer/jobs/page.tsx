'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { supabase } from '@/lib/supabase';
import { Plus, Briefcase, Calendar, MapPin, Trash2 } from 'lucide-react';

export default function EmployerJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from('jobs')
        .select('*')
        .eq('employer_id', session.user.id)
        .order('created_at', { ascending: false });

      if (data) setJobs(data);
      setLoading(false);
    };

    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-0">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8 w-full flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Briefcase className="h-5.5 w-5.5 text-primary" /> My Posted Placements
            </h1>
            <p className="text-xs text-slate-455 font-bold mt-0.5">
              Manage, monitor, and post international job placements for matching global candidates
            </p>
          </div>
          <button className="px-4 py-2.5 bg-primary hover:bg-[#084e96] text-white rounded-xl text-xs font-bold transition-all shadow-3xs flex items-center gap-1.5 cursor-pointer">
            <Plus className="h-4 w-4" /> Post New Job
          </button>
        </div>

        {/* Posted jobs list */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
            <span className="col-span-2">Job Title & Details</span>
            <span>Posted On</span>
            <span className="text-right">Actions</span>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-12 text-center text-slate-400 font-semibold text-xs">
                Loading job listings...
              </div>
            ) : jobs.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-semibold text-xs">
                You haven't posted any jobs yet.
              </div>
            ) : (
              jobs.map((job) => (
                <div key={job.id} className="p-4 grid grid-cols-4 items-center text-xs font-semibold text-slate-700">
                  <div className="col-span-2 space-y-1">
                    <span className="font-extrabold text-slate-900 block">{job.title}</span>
                    <span className="text-[10px] text-slate-450 block font-bold flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" /> {job.city || job.country} ({job.remote_type})
                    </span>
                  </div>
                  <span className="text-slate-455 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {new Date(job.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <div className="text-right">
                    <button className="p-1.5 hover:bg-red-50 rounded text-slate-400 hover:text-red-600 transition-colors cursor-pointer" title="Delete placement">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
