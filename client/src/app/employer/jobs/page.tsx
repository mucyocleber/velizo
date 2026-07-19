'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { supabase } from '@/lib/supabase';
import { 
  Plus, 
  Briefcase, 
  Calendar, 
  MapPin, 
  Trash2, 
  Eye, 
  Users, 
  Clock, 
  ExternalLink, 
  BarChart3, 
  Lock, 
  FileText,
  AlertCircle
} from 'lucide-react';

export default function EmployerJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployerData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // 1. Fetch Company profile
      const { data: companyData } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('employer_id', session.user.id)
        .maybeSingle();

      if (companyData) setCompany(companyData);

      // 2. Fetch Jobs with application counts (using Supabase nested count select)
      const { data: jobsData } = await supabase
        .from('jobs')
        .select(`
          *,
          job_applications(count)
        `)
        .eq('employer_id', session.user.id)
        .order('created_at', { ascending: false });

      if (jobsData) setJobs(jobsData);
      setLoading(false);
    };

    fetchEmployerData();
  }, []);

  const handleDelete = async (jobId: string, title: string) => {
    if (confirm(`Are you sure you want to delete the job posting "${title}"? All associated applications will also be deleted.`)) {
      const { error } = await supabase.from('jobs').delete().eq('id', jobId);
      if (error) {
        alert('Failed to delete job posting.');
      } else {
        setJobs(jobs.filter(j => j.id !== jobId));
      }
    }
  };

  const getRemainingDays = (deadlineStr: string | null) => {
    if (!deadlineStr) return 'Open-ended';
    const deadline = new Date(deadlineStr);
    const today = new Date();
    // set time to midnight to compare date only
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Closes today';
    if (diffDays === 1) return 'Closes tomorrow';
    return `${diffDays} days left`;
  };

  // KPI Calculations
  const totalPostings = jobs.length;
  const activePostings = jobs.filter(j => j.status === 'published').length;
  const totalViews = jobs.reduce((sum, j) => sum + (j.views_count || 0), 0);
  const totalApplications = jobs.reduce((sum, j) => {
    const count = j.job_applications?.[0]?.count || 0;
    return sum + count;
  }, 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-0">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-8 w-full flex-1 flex flex-col space-y-6">
        
        {/* Breadcrumb / Top Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                {company?.company_name || 'My Company'}
              </span>
              <span className="text-slate-300 text-xs">•</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Recruiter Workspace
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Briefcase className="h-5.5 w-5.5 text-primary shrink-0" /> Placement Console
            </h1>
            <p className="text-xs text-slate-455 font-bold">
              Manage international job postings, monitor placement statistics, and screen applicants.
            </p>
          </div>
          
          <button className="px-5 py-2.5 bg-gradient-to-r from-primary to-[#084e96] hover:from-[#084e96] hover:to-[#063f7a] text-white rounded-xl text-xs font-black transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer group">
            <Plus className="h-4.5 w-4.5 shrink-0 transition-transform group-hover:rotate-90" />
            <span>Post New Job</span>
          </button>
        </div>

        {/* Dashboard Analytics Overview Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Active Postings */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-primary shrink-0">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Posts</span>
              <span className="text-xl font-black text-slate-900 leading-tight block mt-0.5">
                {loading ? '...' : `${activePostings}/${totalPostings}`}
              </span>
            </div>
          </div>

          {/* Card 2: Total Views */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Views</span>
              <span className="text-xl font-black text-slate-900 leading-tight block mt-0.5">
                {loading ? '...' : totalViews.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Card 3: Total Applications */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Applications</span>
              <span className="text-xl font-black text-slate-900 leading-tight block mt-0.5">
                {loading ? '...' : totalApplications.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Card 4: Match Rate (Mock Metric) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Match Efficiency</span>
              <span className="text-xl font-black text-slate-900 leading-tight block mt-0.5">
                {loading ? '...' : '92.4%'}
              </span>
            </div>
          </div>
        </div>

        {/* Main List Section */}
        <div className="space-y-4">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider">
            Active Placements Directory
          </h2>

          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 text-center">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-xs font-bold text-slate-500">Loading placement listings...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 text-center space-y-3">
              <AlertCircle className="h-10 w-10 text-slate-300 mx-auto" />
              <div>
                <p className="text-sm font-extrabold text-slate-800">No placements posted yet</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Post your first job opening to start matching with verified candidates in the international recruitment pool.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {jobs.map((job) => {
                const appliedCount = job.job_applications?.[0]?.count || 0;
                const remainingText = getRemainingDays(job.application_deadline);
                const isClosed = job.status === 'closed' || job.status === 'archived';
                const isDraft = job.status === 'draft';
                const isPublished = job.status === 'published';

                return (
                  <div 
                    key={job.id} 
                    className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-5 hover:shadow-xs hover:border-slate-300 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden"
                  >
                    {/* Left side: Job details */}
                    <div className="space-y-3 max-w-xl">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Status tag */}
                        {isPublished && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                            <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                          </span>
                        )}
                        {isDraft && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                            Draft
                          </span>
                        )}
                        {isClosed && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                            Closed
                          </span>
                        )}

                        {/* Visa/Relocation tags */}
                        {job.visa_sponsorship && (
                          <span className="text-[9px] font-extrabold text-blue-600 bg-blue-50/50 px-2 py-0.5 rounded border border-blue-100">
                            Visa Sponsored
                          </span>
                        )}
                        {job.relocation_support && (
                          <span className="text-[9px] font-extrabold text-indigo-600 bg-indigo-50/50 px-2 py-0.5 rounded border border-indigo-100">
                            Relocation Support
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-base font-extrabold text-slate-900 hover:text-primary transition-colors">
                          {job.title}
                        </h3>
                        
                        <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3 text-[10px] font-bold text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            {job.city ? `${job.city}, ${job.country}` : job.country}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="capitalize">{job.employment_type?.replace('-', ' ')}</span>
                          <span className="text-slate-300">•</span>
                          <span className="capitalize">{job.remote_type}</span>
                        </div>
                      </div>

                      {/* Display skills requested */}
                      {job.skills_required && job.skills_required.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {job.skills_required.map((skill: string, index: number) => (
                            <span 
                              key={index}
                              className="text-[9px] font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Middle: Performance metrics */}
                    <div className="grid grid-cols-3 md:flex md:items-center gap-4 md:gap-8 border-t border-b border-slate-100 md:border-0 py-3 md:py-0 shrink-0">
                      {/* Metric 1: Views */}
                      <div className="text-center md:text-left min-w-[70px]">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Views</span>
                        <span className="text-sm font-black text-slate-800 flex items-center justify-center md:justify-start gap-1 mt-0.5">
                          <Eye className="h-4 w-4 text-slate-400" />
                          {job.views_count || 0}
                        </span>
                      </div>

                      {/* Metric 2: Applied */}
                      <div className="text-center md:text-left min-w-[80px]">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Applied</span>
                        <span className="text-sm font-black text-slate-800 flex items-center justify-center md:justify-start gap-1 mt-0.5">
                          <Users className="h-4 w-4 text-slate-400" />
                          {appliedCount}
                        </span>
                      </div>

                      {/* Metric 3: Time Remaining */}
                      <div className="text-center md:text-left min-w-[100px]">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Timeframe</span>
                        <span className="text-[11px] font-extrabold text-slate-700 flex items-center justify-center md:justify-start gap-1 mt-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {remainingText}
                        </span>
                      </div>
                    </div>

                    {/* Right side: Action buttons */}
                    <div className="flex items-center justify-end gap-2 shrink-0 md:pl-4">
                      <Link 
                        href={`/employer/applications?jobId=${job.id}`}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-black transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Users className="h-3.5 w-3.5" />
                        <span>Applicants</span>
                      </Link>

                      <button 
                        onClick={() => handleDelete(job.id, job.title)}
                        className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl border border-transparent hover:border-red-100 transition-all cursor-pointer" 
                        title="Delete placement"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
