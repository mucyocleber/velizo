'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { supabase } from '@/lib/supabase';
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  DollarSign, 
  ArrowLeft, 
  ShieldCheck, 
  Globe, 
  Compass, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  FileText,
  User,
  Check,
  X
} from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

export default function JobDetailPage({ params }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [applied, setApplied] = useState(false);
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string>('');
  const [uploadingResume, setUploadingResume] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Unwrap params safely
  useEffect(() => {
    params.then(p => setJobId(p.id));
  }, [params]);

  useEffect(() => {
    if (!jobId) return;

    const fetchJobAndApplication = async () => {
      // 1. Fetch job details
      const { data: jobData, error: jobError } = await supabase
        .from('jobs_with_companies')
        .select('*')
        .eq('id', jobId)
        .maybeSingle();

      if (jobError || !jobData) {
        console.error('Error fetching job details:', jobError);
        setLoading(false);
        return;
      }

      setJob(jobData);

      // Increment views count on the database
      await supabase
        .from('jobs')
        .update({ views_count: (jobData.views_count || 0) + 1 })
        .eq('id', jobId);

      // 2. Fetch session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);

        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileData) setProfile(profileData);

        // 3. Check existing application
        const { data: appData } = await supabase
          .from('job_applications')
          .select('*')
          .eq('job_id', jobId)
          .eq('candidate_id', session.user.id)
          .maybeSingle();

        if (appData) {
          setApplied(true);
          setApplication(appData);
        }
      }

      setLoading(false);
    };

    fetchJobAndApplication();
  }, [jobId]);

  // Upload resume file to Supabase storage and return public URL
  const uploadResume = async (file: File): Promise<string> => {
    const ext = file.name.split('.').pop();
    const path = `${user.id}/${Date.now()}_resume.${ext}`;
    
    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(path, file, { upsert: true });
    
    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
    
    const { data } = supabase.storage.from('resumes').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (submitting || applied || success) return;
    setSubmitting(true);

    try {
      let finalResumeUrl = resumeUrl;

      // If a file was selected, upload it first
      if (resumeFile) {
        setUploadingResume(true);
        finalResumeUrl = await uploadResume(resumeFile);
        setResumeUrl(finalResumeUrl);
        setUploadingResume(false);
      }

      // Require at least a resume URL (uploaded file or passport URL)
      if (!finalResumeUrl) {
        throw new Error('Please attach your CV or credentials document before submitting.');
      }

      // 1. Insert into job_applications table
      const { data, error } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          candidate_id: user.id,
          resume_url: finalResumeUrl,
          cover_letter: coverLetter,
          status: 'submitted'
        })
        .select()
        .single();

      if (error) throw error;

      // 2. Create notification for the employer
      await supabase
        .from('notifications')
        .insert({
          user_id: job.employer_id,
          title: 'New Job Application',
          content: `${profile?.full_name || 'A candidate'} has applied to your opening for "${job.title}".`,
          type: 'application_update',
          is_read: false
        });

      setApplied(true);
      setApplication(data);
      setSuccess(true);
    } catch (err: any) {
      console.error('Error submitting application:', err);
      setUploadingResume(false);
      alert(err.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  const getRemainingDays = (deadlineStr: string | null) => {
    if (!deadlineStr) return 'Open-ended recruitment';
    const deadline = new Date(deadlineStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Closed / Expired';
    if (diffDays === 0) return 'Closes today';
    if (diffDays === 1) return 'Closes tomorrow';
    return `Closes in ${diffDays} days`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-6 text-slate-500 font-medium text-xs">
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span>Fetching placement specifications...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="max-w-3xl mx-auto px-4 py-16 w-full flex-1 flex flex-col items-center justify-center text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-slate-350" />
          <h2 className="text-lg font-black text-slate-800">Placement Not Found</h2>
          <p className="text-xs text-slate-450 max-w-sm">
            This job listing may have been closed, archived, or is no longer accepting international applications.
          </p>
          <Link href="/jobs" className="px-4 py-2 bg-primary hover:bg-[#084e96] text-white text-xs font-bold rounded-xl transition-colors">
            Back to Placements
          </Link>
        </main>
      </div>
    );
  }

  const isEmployer = profile?.role === 'employer' || profile?.role === 'agency';
  const remainingText = getRemainingDays(job.application_deadline);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-8">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-6 w-full flex-1 flex flex-col space-y-6">
        
        {/* Navigation Row */}
        <div>
          <Link 
            href="/jobs" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Browse Placements</span>
          </Link>
        </div>

        {/* Job Header Hero Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-3xs space-y-5 relative overflow-hidden">
          {/* Subtle colored top strip */}
          <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-[#0a5fcc] via-indigo-500 to-[#0a5fcc]" />
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-primary font-bold shrink-0 overflow-hidden">
                {job.logo_url ? (
                  <img src={job.logo_url} alt={job.company_name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-[#0a5fcc]/10 to-indigo-500/10 flex items-center justify-center text-[#0a5fcc] font-black text-sm uppercase">
                    {job.company_name?.charAt(0)}
                  </div>
                )}
              </div>
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-800">
                    {job.company_name}
                  </span>
                  {job.company_verified && (
                    <span className="inline-flex items-center gap-0.5 text-[8px] font-black uppercase text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100 shrink-0">
                      Verified Partner
                    </span>
                  )}
                </div>
                <h1 className="text-lg md:text-xl font-black text-slate-900 leading-tight">
                  {job.title}
                </h1>
              </div>
            </div>

            {/* Badges Column */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <span className="text-[10px] font-black text-primary bg-blue-50/50 border border-blue-100 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                {job.remote_type}
              </span>
              <span className="text-[10px] font-black text-emerald-650 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                {job.employment_type?.replace('-', ' ')}
              </span>
            </div>
          </div>

          {/* Quick specs grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Placement Location</span>
              <span className="text-slate-800 font-extrabold flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                {job.city ? `${job.city}, ${job.country}` : job.country}
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Compensation</span>
              <span className="text-slate-800 font-extrabold flex items-center gap-0.5">
                <DollarSign className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                {job.salary_min && job.salary_max 
                  ? `${Number(job.salary_min).toLocaleString()} - ${Number(job.salary_max).toLocaleString()} ${job.currency}`
                  : 'Competitive Salary'}
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Experience Level</span>
              <span className="text-slate-800 font-extrabold capitalize">{job.experience_level} Level</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Filing Deadline</span>
              <span className="text-slate-800 font-extrabold flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                {remainingText}
              </span>
            </div>
          </div>
        </div>

        {/* Details and Apply Column Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Column: Job Spec description (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Job Description Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-3xs space-y-4">
              <h2 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2.5 uppercase tracking-wide">
                Role Description
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed font-semibold whitespace-pre-line">
                {job.description}
              </p>
            </div>

            {/* Requirements Card */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-3xs space-y-4">
                <h2 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2.5 uppercase tracking-wide">
                  Key Requirements
                </h2>
                <ul className="space-y-3">
                  {job.requirements.map((req: string, index: number) => (
                    <li key={index} className="flex items-start gap-2.5 text-xs text-slate-650 font-semibold leading-relaxed">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits Card */}
            {job.benefits && job.benefits.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-3xs space-y-4">
                <h2 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2.5 uppercase tracking-wide">
                  Perks & Benefits
                </h2>
                <ul className="space-y-3">
                  {job.benefits.map((benefit: string, index: number) => (
                    <li key={index} className="flex items-start gap-2.5 text-xs text-slate-650 font-semibold leading-relaxed">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column: Application Process Box (1/3) */}
          <div className="space-y-6">
            
            {/* International Perks Highlight widget */}
            <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/20 border border-blue-100 rounded-2xl p-5 shadow-3xs space-y-4">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                International Placement Support
              </h3>
              
              <div className="space-y-3 text-xs font-semibold text-slate-600">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-800 font-extrabold text-[11px]">Match Rating verified</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Automated screening matching details verified by VELIZO Trust Engine.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Globe className={`h-4.5 w-4.5 shrink-0 mt-0.5 ${job.visa_sponsorship ? 'text-blue-500' : 'text-slate-300'}`} />
                  <div>
                    <p className="text-slate-800 font-extrabold text-[11px]">Visa Sponsorship</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {job.visa_sponsorship 
                        ? 'Official work permit visa support package available.' 
                        : 'Sponsorship not included for this listing.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Compass className={`h-4.5 w-4.5 shrink-0 mt-0.5 ${job.relocation_support ? 'text-indigo-500' : 'text-slate-300'}`} />
                  <div>
                    <p className="text-slate-800 font-extrabold text-[11px]">Relocation Package</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {job.relocation_support 
                        ? 'Assistance provided for travel, flight tickets, or temporary lodging.'
                        : 'Relocation expenses covered by candidate.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Application Submission box */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs space-y-4">
              <h3 className="text-xs font-black text-slate-900 border-b border-slate-100 pb-2.5 uppercase tracking-wide">
                Apply for Placement
              </h3>

              {success ? (
                <div className="text-center py-6 space-y-3">
                  <div className="h-10 w-10 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center text-emerald-500 mx-auto">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">Application Submitted!</h4>
                    <p className="text-[10px] text-slate-450 mt-1">
                      Your profile and credentials have been forwarded to {job.company_name}.
                    </p>
                  </div>
                </div>
              ) : applied ? (
                <div className="space-y-4">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                      <span>Status</span>
                      <span className="capitalize text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded font-black uppercase">
                        {application?.status || 'Submitted'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-450">
                      <Clock className="h-3.5 w-3.5" />
                      Applied on {new Date(application?.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  
                  {/* Status Timeline */}
                  <div className="relative pl-4 border-l border-slate-200 space-y-4 text-[10px] font-bold text-slate-500">
                    <div className="relative">
                      <span className="absolute -left-[20px] top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-100" />
                      <p className="text-slate-800 font-extrabold">Application Received</p>
                      <p className="text-[9px] text-slate-450 mt-0.5">Your credentials are now in review.</p>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-[20px] top-0.5 h-2.5 w-2.5 rounded-full bg-slate-300 border-2 border-white" />
                      <p className="text-slate-400">Recruiter Screening</p>
                    </div>
                  </div>
                </div>
              ) : isEmployer ? (
                <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl flex items-start gap-2.5">
                  <AlertCircle className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-800 font-bold leading-relaxed">
                    You are logged in as a recruiter. Recruiters cannot apply to job placements.
                  </p>
                </div>
              ) : !user ? (
                <div className="space-y-3 text-center py-4">
                  <User className="h-8 w-8 text-slate-350 mx-auto" />
                  <p className="text-[10px] text-slate-450 font-bold max-w-[180px] mx-auto">
                    Sign in to submit your credentials passport for matching.
                  </p>
                  <Link 
                    href="/auth/login" 
                    className="block w-full py-2 bg-primary hover:bg-[#084e96] text-white text-xs font-black rounded-xl transition-all shadow-3xs"
                  >
                    Log In / Register
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleApply} className="space-y-4">
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setResumeFile(file);
                    }}
                  />

                  {/* Resume / CV Upload */}
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">
                      Credentials / CV Document
                    </label>
                    {resumeFile ? (
                      <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span className="text-[10px] font-bold text-emerald-700 truncate">{resumeFile.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setResumeFile(null)}
                          className="shrink-0 text-emerald-400 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full p-3.5 bg-slate-50 border border-dashed border-slate-300 hover:border-primary hover:bg-blue-50/30 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-primary transition-all cursor-pointer"
                      >
                        <Upload className="h-4 w-4" />
                        <span>Upload CV / Credentials (PDF, DOC, Image)</span>
                      </button>
                    )}
                  </div>

                  {/* Cover Letter Input */}
                  <div className="space-y-1">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">
                      Message to Recruiter <span className="text-slate-300">(Optional)</span>
                    </label>
                    <textarea 
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Briefly pitch your interest in this role..."
                      className="w-full p-3 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary min-h-[90px] placeholder-slate-400 resize-none"
                    />
                  </div>

                  {/* Submission Button */}
                  <button 
                    type="submit"
                    disabled={submitting || applied || success || !resumeFile}
                    className="w-full py-2.5 bg-gradient-to-r from-primary to-[#084e96] hover:from-[#084e96] hover:to-[#063f7a] text-white text-xs font-black rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {submitting || uploadingResume ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{uploadingResume ? 'Uploading Document...' : 'Submitting Application...'}</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 shrink-0" />
                        <span>{resumeFile ? 'Submit Application' : 'Attach CV to Submit'}</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
