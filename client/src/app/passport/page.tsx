'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { supabase } from '@/lib/supabase';
import { 
  ShieldCheck, 
  User, 
  Mail, 
  Award, 
  FileText, 
  CheckCircle, 
  HelpCircle,
  FolderOpen,
  Bookmark,
  CreditCard,
  LogOut,
  ChevronDown,
  ExternalLink,
  Lock,
  Building2,
  Phone,
  MapPin,
  Sparkles,
  Clock
} from 'lucide-react';

export default function PassportPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [passport, setPassport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Accordion sections state (key corresponds to section name, value boolean for expanded)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    verification: true, // Keep verification open by default
    documents: false,
    savedJobs: false,
    subscription: false,
    help: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  useEffect(() => {
    const fetchPassport = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/auth/login');
          return;
        }

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileData) {
          setProfile(profileData);
          if (profileData.role === 'candidate') {
            const { data: passportData } = await supabase
              .from('career_passports')
              .select('*')
              .eq('candidate_id', session.user.id)
              .maybeSingle();
            
            // If no passport exists, create a default one for the candidate
            if (!passportData) {
              const { data: newPassport } = await supabase
                .from('career_passports')
                .insert({
                  candidate_id: session.user.id,
                  career_score: 15,
                  identity_verified: false,
                  education_verified: false,
                  employment_verified: false
                })
                .select()
                .single();
              if (newPassport) setPassport(newPassport);
            } else {
              setPassport(passportData);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching passport details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPassport();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const isCandidate = profile?.role === 'candidate';

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
              Profile settings
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {isCandidate ? 'Career Passport' : 'Recruiter Workspace'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-semibold leading-relaxed">
              {isCandidate 
                ? 'Manage your professional credentials, upload passports, and monitor application milestones'
                : 'Manage your recruiter profile parameters and partner verification details'}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center text-slate-400 font-semibold text-xs flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span>Fetching profile settings...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            
            {/* LEFT COLUMN: Profile Overview */}
            <div className="md:col-span-1 space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#0a5fcc] to-indigo-500 flex items-center justify-center text-white text-xl font-black overflow-hidden mb-3 shadow-sm">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="avatar" className="h-full w-full object-cover animate-fade-in" />
                    ) : (
                      <span>{profile?.full_name?.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-800 leading-snug">{profile?.full_name}</h3>
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#0a5fcc] bg-blue-50 px-2 py-0.5 rounded border border-blue-100 mt-1 block w-fit">
                    {profile?.role === 'candidate' ? 'Job Seeker' : profile?.role || 'Employer'}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs font-semibold text-slate-600">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="truncate text-[11px] text-slate-650">{profile?.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="text-[10px] text-slate-400 font-bold">Joined {new Date(profile?.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Direct Logout Button */}
              <button 
                onClick={handleSignOut}
                className="w-full py-3 bg-red-50 hover:bg-red-100/80 border border-red-200 text-red-600 text-xs font-black uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-3xs"
              >
                <LogOut className="h-4.5 w-4.5" />
                <span>Sign Out Account</span>
              </button>
            </div>

            {/* RIGHT COLUMN: Interactive Settings Accordions (Facebook/Instagram Style) */}
            <div className="md:col-span-2 space-y-4">
              
              {/* 1. Verification Milestones Section */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <button 
                  onClick={() => toggleSection('verification')}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors border-b border-slate-100"
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <ShieldCheck className="h-4.5 w-4.5 text-[#0a5fcc]" />
                    <div>
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Verification Milestones</h3>
                      <p className="text-[9px] text-slate-400 font-bold mt-0.5">Track KYC checkmarks and platform Trust scores</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {isCandidate && (
                      <span className="text-[10px] font-black text-teal-600 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-lg">
                        Score: {passport?.career_score || 0}
                      </span>
                    )}
                    <ChevronDown className={`h-4.5 w-4.5 text-slate-400 transition-transform ${expandedSections.verification ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {expandedSections.verification && (
                  <div className="p-5 space-y-4 animate-scaleUp">
                    {isCandidate ? (
                      <>
                        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                          <div className="flex items-start gap-2.5">
                            <User className="h-4.5 w-4.5 text-slate-400 mt-0.5 shrink-0" />
                            <div>
                              <h4 className="text-xs font-extrabold text-slate-800">Identity Verification</h4>
                              <p className="text-[9px] text-slate-450 font-semibold mt-0.5">Government ID check and KYC processing</p>
                            </div>
                          </div>
                          {passport?.identity_verified ? (
                            <span className="px-2 py-0.5 text-[8px] font-black bg-emerald-50 text-emerald-600 rounded border border-emerald-100 flex items-center gap-0.5 uppercase tracking-wider"><CheckCircle className="h-2.5 w-2.5" /> Verified</span>
                          ) : (
                            <span className="px-2 py-0.5 text-[8px] font-black bg-slate-100 text-slate-500 rounded border border-slate-200 uppercase tracking-wider">Pending</span>
                          )}
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                          <div className="flex items-start gap-2.5">
                            <Award className="h-4.5 w-4.5 text-slate-400 mt-0.5 shrink-0" />
                            <div>
                              <h4 className="text-xs font-extrabold text-slate-800">Education Certification</h4>
                              <p className="text-[9px] text-slate-450 font-semibold mt-0.5">Degree records and academic backgrounds</p>
                            </div>
                          </div>
                          {passport?.education_verified ? (
                            <span className="px-2 py-0.5 text-[8px] font-black bg-emerald-50 text-emerald-600 rounded border border-emerald-100 flex items-center gap-0.5 uppercase tracking-wider"><CheckCircle className="h-2.5 w-2.5" /> Verified</span>
                          ) : (
                            <span className="px-2 py-0.5 text-[8px] font-black bg-slate-100 text-slate-500 rounded border border-slate-200 uppercase tracking-wider">Pending</span>
                          )}
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                          <div className="flex items-start gap-2.5">
                            <FileText className="h-4.5 w-4.5 text-slate-400 mt-0.5 shrink-0" />
                            <div>
                              <h4 className="text-xs font-extrabold text-slate-800">Employment Reference</h4>
                              <p className="text-[9px] text-slate-450 font-semibold mt-0.5">Verification from previous hiring managers</p>
                            </div>
                          </div>
                          {passport?.employment_verified ? (
                            <span className="px-2 py-0.5 text-[8px] font-black bg-emerald-50 text-emerald-600 rounded border border-emerald-100 flex items-center gap-0.5 uppercase tracking-wider"><CheckCircle className="h-2.5 w-2.5" /> Verified</span>
                          ) : (
                            <span className="px-2 py-0.5 text-[8px] font-black bg-slate-100 text-slate-500 rounded border border-slate-200 uppercase tracking-wider">Pending</span>
                          )}
                        </div>
                      </>
                    ) : (
                      // Employer Verification milestones
                      <div className="flex items-center justify-between p-4 rounded-xl border border-slate-150 bg-slate-50/50">
                        <div className="flex items-start gap-3">
                          <Building2 className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                          <div>
                            <h4 className="text-xs font-extrabold text-slate-800">Employer Verification</h4>
                            <p className="text-[10px] text-slate-450 font-semibold mt-0.5">Company business registry and authorization check.</p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 text-[9px] font-extrabold bg-emerald-50 text-emerald-600 rounded-lg flex items-center gap-1 border border-emerald-100 shrink-0 uppercase tracking-wider">
                          <CheckCircle className="h-3 w-3" /> Verified Partner
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 2. Documents Section Dropdown */}
              {isCandidate && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  <button 
                    onClick={() => toggleSection('documents')}
                    className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors border-b border-slate-100"
                  >
                    <div className="flex items-center gap-2.5 text-left">
                      <FolderOpen className="h-4.5 w-4.5 text-[#0a5fcc]" />
                      <div>
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">My Documents</h3>
                        <p className="text-[9px] text-slate-400 font-bold mt-0.5">Manage credentials CV and PDF passports</p>
                      </div>
                    </div>
                    <ChevronDown className={`h-4.5 w-4.5 text-slate-400 transition-transform ${expandedSections.documents ? 'rotate-180' : ''}`} />
                  </button>

                  {expandedSections.documents && (
                    <div className="p-5 space-y-4 animate-scaleUp">
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-slate-400 shrink-0" />
                          <div>
                            <p className="text-xs font-black text-slate-800">VELIZO_Career_Passport.pdf</p>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Linked primary matching document</p>
                          </div>
                        </div>
                        <span className="text-[8px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 shrink-0">
                          Active
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. Saved Jobs Section Dropdown */}
              {isCandidate && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  <button 
                    onClick={() => toggleSection('savedJobs')}
                    className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors border-b border-slate-100"
                  >
                    <div className="flex items-center gap-2.5 text-left">
                      <Bookmark className="h-4.5 w-4.5 text-[#0a5fcc]" />
                      <div>
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Saved Placements</h3>
                        <p className="text-[9px] text-slate-400 font-bold mt-0.5">Quickly view bookmarked job openings</p>
                      </div>
                    </div>
                    <ChevronDown className={`h-4.5 w-4.5 text-slate-400 transition-transform ${expandedSections.savedJobs ? 'rotate-180' : ''}`} />
                  </button>

                  {expandedSections.savedJobs && (
                    <div className="p-5 text-center text-slate-400 py-8 animate-scaleUp">
                      <Bookmark className="h-7 w-7 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700">No Saved Placements Yet</p>
                      <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto">Bookmark placement listings to find them saved here later.</p>
                    </div>
                  )}
                </div>
              )}

              {/* 4. Subscription Plan Section Dropdown */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <button 
                  onClick={() => toggleSection('subscription')}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors border-b border-slate-100"
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <CreditCard className="h-4.5 w-4.5 text-[#0a5fcc]" />
                    <div>
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Billing & Plan</h3>
                      <p className="text-[9px] text-slate-400 font-bold mt-0.5">Manage payments and subscription tiers</p>
                    </div>
                  </div>
                  <ChevronDown className={`h-4.5 w-4.5 text-slate-400 transition-transform ${expandedSections.subscription ? 'rotate-180' : ''}`} />
                </button>

                {expandedSections.subscription && (
                  <div className="p-5 space-y-4 animate-scaleUp">
                    <div className="p-4 bg-gradient-to-br from-[#0a5fcc]/5 to-indigo-500/5 border border-blue-100 rounded-xl flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <p className="text-[10px] font-black text-[#0a5fcc] uppercase tracking-wider">Active Plan</p>
                        <h4 className="text-xs font-black text-slate-800 mt-0.5">Free Verification Tier</h4>
                        <p className="text-[9px] text-slate-450 font-semibold mt-1">Upgrade to unlock direct agent verification pitches.</p>
                      </div>
                      <span className="px-2.5 py-1 text-[9px] font-extrabold text-[#0a5fcc] bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors shadow-3xs">
                        Upgrade Tier
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* 5. Help & FAQs Section Dropdown */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <button 
                  onClick={() => toggleSection('help')}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors border-b border-slate-100"
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <HelpCircle className="h-4.5 w-4.5 text-[#0a5fcc]" />
                    <div>
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Help Center</h3>
                      <p className="text-[9px] text-slate-400 font-bold mt-0.5">Get support questions and answers</p>
                    </div>
                  </div>
                  <ChevronDown className={`h-4.5 w-4.5 text-slate-400 transition-transform ${expandedSections.help ? 'rotate-180' : ''}`} />
                </button>

                {expandedSections.help && (
                  <div className="p-5 space-y-3 animate-scaleUp text-xs font-semibold text-slate-600">
                    <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1">
                      <p className="text-slate-800 font-extrabold text-[11px]">How do I verify my education?</p>
                      <p className="text-[10px] text-slate-450 leading-relaxed">Verification occurs automatically when you link your matching credentials CV, or through automated agency screening checks.</p>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1">
                      <p className="text-slate-800 font-extrabold text-[11px]">Is there visa sponsor support?</p>
                      <p className="text-[10px] text-slate-455 leading-relaxed">Yes! Target roles verify visa sponsorship packages directly on their listing specs before you apply.</p>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}
      </main>
    </div>
  );
}
