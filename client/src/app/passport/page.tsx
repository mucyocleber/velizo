'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, User, Mail, Award, FileText, CheckCircle, HelpCircle } from 'lucide-react';

export default function PassportPage() {
  const [profile, setProfile] = useState<any>(null);
  const [passport, setPassport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPassport = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

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
            .single();
          if (passportData) setPassport(passportData);
        }
      }
      setLoading(false);
    };

    fetchPassport();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-0">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8 w-full flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-5.5 w-5.5 text-teal-600" /> Career Passport
            </h1>
            <p className="text-xs text-slate-455 font-bold mt-0.5">
              Verify your professional credentials and identity to fast-track international recruiter applications
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-450 font-semibold text-xs animate-pulse">
            Loading your credentials profile...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Left Sidebar Info Card */}
            <div className="md:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100">
                <div className="h-16 w-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-primary text-xl font-extrabold overflow-hidden mb-3">
                  {profile?.full_name?.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-sm font-extrabold text-slate-800 leading-snug">{profile?.full_name}</h3>
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block mt-0.5">{profile?.role} Portal</span>
              </div>

              <div className="space-y-3 text-xs font-semibold text-slate-655">
                <div className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="truncate">{profile?.email}</span>
                </div>
              </div>
            </div>

            {/* Right Main Passports Card */}
            <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest">Verification Milestones</h3>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-slate-450">Passport Score:</span>
                  <span className="text-sm font-black text-teal-655 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-lg">{passport?.career_score || 0}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-150 bg-slate-50/50">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800">Identity Verification</h4>
                      <p className="text-[10px] text-slate-450 font-semibold mt-0.5">Government ID check and KYC processing</p>
                    </div>
                  </div>
                  {passport?.identity_verified ? (
                    <span className="px-2.5 py-1 text-[9px] font-extrabold bg-emerald-50 text-emerald-600 rounded-lg flex items-center gap-1 border border-emerald-200"><CheckCircle className="h-3 w-3" /> Verified</span>
                  ) : (
                    <span className="px-2.5 py-1 text-[9px] font-extrabold bg-slate-100 text-slate-500 rounded-lg border border-slate-200">Pending</span>
                  )}
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-150 bg-slate-50/50">
                  <div className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800">Education Certification</h4>
                      <p className="text-[10px] text-slate-450 font-semibold mt-0.5">Degree records and academic backgrounds</p>
                    </div>
                  </div>
                  {passport?.education_verified ? (
                    <span className="px-2.5 py-1 text-[9px] font-extrabold bg-emerald-50 text-emerald-600 rounded-lg flex items-center gap-1 border border-emerald-200"><CheckCircle className="h-3 w-3" /> Verified</span>
                  ) : (
                    <span className="px-2.5 py-1 text-[9px] font-extrabold bg-slate-100 text-slate-500 rounded-lg border border-slate-200">Pending</span>
                  )}
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-150 bg-slate-50/50">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800">Employment Reference</h4>
                      <p className="text-[10px] text-slate-450 font-semibold mt-0.5">Verification from previous hiring managers</p>
                    </div>
                  </div>
                  {passport?.employment_verified ? (
                    <span className="px-2.5 py-1 text-[9px] font-extrabold bg-emerald-50 text-emerald-600 rounded-lg flex items-center gap-1 border border-emerald-200"><CheckCircle className="h-3 w-3" /> Verified</span>
                  ) : (
                    <span className="px-2.5 py-1 text-[9px] font-extrabold bg-slate-100 text-slate-500 rounded-lg border border-slate-200">Pending</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
