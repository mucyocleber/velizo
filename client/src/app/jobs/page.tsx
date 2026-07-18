'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { supabase } from '@/lib/supabase';
import { Briefcase, MapPin, Search, DollarSign, Filter, ChevronRight } from 'lucide-react';

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      const { data } = await supabase
        .from('jobs_with_companies')
        .select('*')
        .eq('status', 'published')
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Briefcase className="h-5.5 w-5.5 text-primary" /> Browse Placements
            </h1>
            <p className="text-xs text-slate-455 font-bold mt-0.5">
              Explore open positions and filter international roles targeting global candidates
            </p>
          </div>
        </div>

        {/* Layout split: filters and results */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {/* Filters column */}
          <div className="md:col-span-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Filter className="h-4 w-4" /> Filters
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Job Category</label>
                <select className="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50">
                  <option>All Categories</option>
                  <option>Technology</option>
                  <option>Healthcare</option>
                  <option>Finance</option>
                  <option>Logistics</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Remote Option</label>
                <select className="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50">
                  <option>All Types</option>
                  <option>Full Remote</option>
                  <option>Hybrid</option>
                  <option>On-site</option>
                </select>
              </div>
            </div>
          </div>

          {/* Job listings column */}
          <div className="md:col-span-3 space-y-4">
            {loading ? (
              <div className="text-center py-12 text-slate-400 font-semibold text-xs">
                Loading matching jobs...
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white p-12 text-center text-slate-400 font-semibold text-xs rounded-2xl border border-slate-200 shadow-sm">
                No active jobs available.
              </div>
            ) : (
              jobs.map((job) => (
                <div 
                  key={job.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-primary/50 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {job.company_name}
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-900 leading-snug">{job.title}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-500 font-semibold">
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-slate-400" /> {job.city || job.country} ({job.remote_type})</span>
                      <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5 text-slate-400" /> {job.job_type?.replace('_', ' ') || 'Full Time'}</span>
                      {job.salary_range && <span className="flex items-center gap-0.5"><DollarSign className="h-3.5 w-3.5 text-slate-400" /> {job.salary_range}</span>}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 self-center hidden sm:block" />
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
