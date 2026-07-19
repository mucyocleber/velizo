'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { supabase } from '@/lib/supabase';
import { 
  ClipboardList, 
  Calendar, 
  MapPin, 
  ExternalLink, 
  ArrowLeft, 
  ShieldCheck, 
  Globe, 
  Compass, 
  Clock, 
  FileText, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle2,
  DollarSign,
  Building2,
  ChevronRight,
  Info
} from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

export default function ApplicationDetailPage({ params }: Props) {
  const router = useRouter();
  const [appId, setAppId] = useState<string | null>(null);
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Unwrap params safely
  useEffect(() => {
    params.then(p => setAppId(p.id));
  }, [params]);

  useEffect(() => {
    if (!appId) return;

    const fetchApplicationDetails = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }

      // Query job application details with nested joins
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          jobs (
            id,
            title,
            category,
            remote_type,
            country,
            city,
            salary_min,
            salary_max,
            currency,
            employer_id,
            profiles (
              company_profiles (
                company_name,
                logo_url
              )
            )
          )
        `)
        .eq('id', appId)
        .maybeSingle();

      if (error || !data) {
        console.error('Error fetching application details:', error);
        setLoading(false);
        return;
      }

      setApp(data);
      setLoading(false);
    };

    fetchApplicationDetails();
  }, [appId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-6 text-slate-500 font-medium text-xs">
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span>Fetching application details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="max-w-3xl mx-auto px-4 py-16 w-full flex-1 flex flex-col items-center justify-center text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-slate-350" />
          <h2 className="text-lg font-black text-slate-800">Application Not Found</h2>
          <p className="text-xs text-slate-455 max-w-sm">
            This application record does not exist or you do not have permission to view it.
          </p>
          <Link href="/applications" className="px-4 py-2 bg-primary hover:bg-[#084e96] text-white text-xs font-bold rounded-xl transition-colors">
            Back to Applications
          </Link>
        </main>
      </div>
    );
  }

  const job = app.jobs;
  const companyName = job?.profiles?.company_profiles?.company_name || 'Employer';
  const logoUrl = job?.profiles?.company_profiles?.logo_url;
  const employerId = job?.employer_id;

  // Active status helpers
  const isSubmitted = true;
  const isReviewing = ['reviewing', 'shortlisted', 'interview', 'offered', 'hired', 'rejected'].includes(app.status);
  const isInterview = ['interview', 'offered', 'hired'].includes(app.status);
  const isDecision = ['offered', 'hired', 'rejected'].includes(app.status);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'submitted': return 'Submitted Successfully';
      case 'reviewing': return 'Under Review';
      case 'shortlisted': return 'Shortlisted';
      case 'interview': return 'Interview Scheduled';
      case 'offered': return 'Offer Received';
      case 'hired': return 'Placed & Hired';
      case 'rejected': return 'Application Closed';
      case 'withdrawn': return 'Application Withdrawn';
      default: return 'In Progress';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-8">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-6 w-full flex-1 flex flex-col space-y-6">
        
        {/* Navigation Row */}
        <div>
          <Link 
            href="/applications" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Applications List</span>
          </Link>
        </div>

        {/* Application Header Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-3xs space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-primary font-bold shrink-0 overflow-hidden">
                {logoUrl ? (
                  <img src={logoUrl} alt={companyName} className="h-full w-full object-cover" />
                ) : (
                  <Building2 className="h-6 w-6 text-primary" />
                )}
              </div>
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-800">
                    {companyName}
                  </span>
                  <span className="text-slate-300 text-xs">•</span>
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                    Application Details
                  </span>
                </div>
                <h1 className="text-lg font-black text-slate-900 leading-tight">
                  {job?.title || 'Placement Application'}
                </h1>
              </div>
            </div>

            {/* Status tag */}
            <div className="shrink-0">
              <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg border ${
                app.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-200' :
                app.status === 'hired' || app.status === 'offered' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                app.status === 'submitted' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                'bg-amber-50 text-amber-600 border-amber-200'
              }`}>
                {getStatusText(app.status)}
              </span>
            </div>
          </div>

          {/* Quick Specifications list */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Placement Location</span>
              <span className="text-slate-800 font-extrabold flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                {job?.city ? `${job.city}, ${job.country}` : job?.country || 'Remote'}
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Date Applied</span>
              <span className="text-slate-800 font-extrabold flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                {new Date(app.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Placement Type</span>
              <span className="text-slate-800 font-extrabold capitalize">
                {job?.remote_type || 'remote'} • {job?.employment_type?.replace('-', ' ') || 'full-time'}
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Compensation Estimate</span>
              <span className="text-slate-800 font-extrabold flex items-center gap-0.5">
                <DollarSign className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                {job?.salary_min && job?.salary_max 
                  ? `${Number(job.salary_min).toLocaleString()} - ${Number(job.salary_max).toLocaleString()} ${job.currency}`
                  : 'Competitive Salary'}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Application info split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Column: Cover Letter & Submissions details (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Cover Letter Block */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-3xs space-y-4">
              <h2 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2.5 uppercase tracking-wide">
                Your Cover Letter / Pitch
              </h2>
              {app.cover_letter ? (
                <p className="text-xs text-slate-600 leading-relaxed font-semibold whitespace-pre-line italic">
                  "{app.cover_letter}"
                </p>
              ) : (
                <p className="text-xs text-slate-450 italic font-semibold">
                  No cover letter was submitted with this application.
                </p>
              )}
            </div>

            {/* Submitted Passport Credentials Summary */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-3xs space-y-4">
              <h2 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2.5 uppercase tracking-wide">
                Linked Credentials Passport
              </h2>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-50 border border-blue-150 rounded-lg flex items-center justify-center text-primary shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800">VELIZO_Career_Passport.pdf</p>
                    <p className="text-[10px] text-slate-450 font-semibold mt-0.5">Includes verified education & work history certifications.</p>
                  </div>
                </div>
                
                <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 shrink-0">
                  Verified Active
                </span>
              </div>
            </div>

            {/* Employer Feedback Block */}
            {app.employer_feedback && (
              <div className="bg-amber-50/30 border border-amber-100 rounded-2xl p-6 shadow-3xs space-y-3">
                <h2 className="text-sm font-black text-amber-800 uppercase tracking-wide flex items-center gap-1.5">
                  <Info className="h-4.5 w-4.5 text-amber-600 shrink-0" /> Recruiter Feedback
                </h2>
                <p className="text-xs text-amber-900 leading-relaxed font-semibold whitespace-pre-line">
                  {app.employer_feedback}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Dynamic Status Tracker Stepper (1/3) */}
          <div className="space-y-6">
            
            {/* Visual Timeline Stepper Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs space-y-5">
              <h3 className="text-xs font-black text-slate-900 border-b border-slate-100 pb-2.5 uppercase tracking-wide">
                Application Progress Tracker
              </h3>

              {/* Steps List */}
              <div className="relative pl-6 border-l-2 border-slate-150 space-y-6 text-xs font-semibold text-slate-500">
                
                {/* Step 1: Submitted */}
                <div className="relative">
                  <span className={`absolute -left-[30px] top-0.5 h-4 w-4 rounded-full border-2 border-white ring-2 flex items-center justify-center ${
                    isSubmitted ? 'bg-primary ring-blue-100 text-white' : 'bg-slate-200 ring-slate-100'
                  }`}>
                    {isSubmitted && <CheckCircle2 className="h-3.5 w-3.5 fill-primary text-white" />}
                  </span>
                  <div className={isSubmitted ? 'text-slate-800' : 'text-slate-400'}>
                    <p className="font-extrabold text-[11px]">Application Submitted</p>
                    <p className="text-[10px] text-slate-450 mt-0.5">Your credentials passport was successfully sent.</p>
                  </div>
                </div>

                {/* Step 2: Under Review */}
                <div className="relative">
                  <span className={`absolute -left-[30px] top-0.5 h-4 w-4 rounded-full border-2 border-white ring-2 flex items-center justify-center ${
                    isReviewing ? 'bg-primary ring-blue-100 text-white' : 'bg-slate-200 ring-slate-100'
                  }`}>
                    {isReviewing ? (
                      <CheckCircle2 className="h-3.5 w-3.5 fill-primary text-white" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    )}
                  </span>
                  <div className={isReviewing ? 'text-slate-800' : 'text-slate-400'}>
                    <p className="font-extrabold text-[11px]">Recruiter Screening</p>
                    <p className="text-[10px] text-slate-450 mt-0.5">Recruiter is reviewing your verification history.</p>
                  </div>
                </div>

                {/* Step 3: Interviewing */}
                <div className="relative">
                  <span className={`absolute -left-[30px] top-0.5 h-4 w-4 rounded-full border-2 border-white ring-2 flex items-center justify-center ${
                    isInterview ? 'bg-primary ring-blue-100 text-white' : 'bg-slate-200 ring-slate-100'
                  }`}>
                    {isInterview ? (
                      <CheckCircle2 className="h-3.5 w-3.5 fill-primary text-white" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    )}
                  </span>
                  <div className={isInterview ? 'text-slate-800' : 'text-slate-400'}>
                    <p className="font-extrabold text-[11px]">Interview Stage</p>
                    <p className="text-[10px] text-slate-450 mt-0.5">Scheduling direct conversation with the hiring team.</p>
                  </div>
                </div>

                {/* Step 4: Final Outcome */}
                <div className="relative">
                  <span className={`absolute -left-[30px] top-0.5 h-4 w-4 rounded-full border-2 border-white ring-2 flex items-center justify-center ${
                    isDecision ? (
                      app.status === 'rejected' ? 'bg-red-500 ring-red-100' : 'bg-emerald-500 ring-emerald-100'
                    ) : 'bg-slate-200 ring-slate-100'
                  }`}>
                    {isDecision ? (
                      <CheckCircle2 className="h-3.5 w-3.5 fill-current text-white" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    )}
                  </span>
                  <div className={isDecision ? 'text-slate-800' : 'text-slate-400'}>
                    <p className="font-extrabold text-[11px]">Final Decision</p>
                    <p className="text-[10px] text-slate-450 mt-0.5">
                      {app.status === 'rejected' ? 'Application closed.' : 
                       app.status === 'hired' || app.status === 'offered' ? 'Offer extended!' : 
                       'Awaiting final evaluation.'}
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Recruiter Communication Widget */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs space-y-3.5 text-center">
              <MessageSquare className="h-8 w-8 text-primary/75 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-xs font-black text-slate-900">Need to Follow Up?</h4>
                <p className="text-[10px] text-slate-455 font-bold leading-relaxed max-w-[200px] mx-auto">
                  Send a secure direct workspace message to the recruiter of this placement.
                </p>
              </div>
              
              <Link 
                href={`/messages?userId=${employerId}`}
                className="inline-flex w-full items-center justify-center py-2 bg-gradient-to-r from-primary to-[#084e96] hover:from-[#084e96] hover:to-[#063f7a] text-white text-[11px] font-black rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 shadow-3xs gap-1.5 cursor-pointer"
              >
                <span>Message Recruiter</span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
              </Link>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}
